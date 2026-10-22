# Decisiones técnicas

## Arquitectura

**API REST en Express, separada de Next.js** (patrón Backend for Frontend). Separa la lógica de negocio de la capa de presentación y permite que otros clientes (por ejemplo, una app móvil) consuman la misma API. Costo: un salto de red adicional entre el servidor de Next y la API, que suma latencia a cada request.

**Monorepo** con `api/` y `web/`, desplegados de forma independiente.

## Modelo de datos

**El saldo vive en la tarjeta**, modelada como tarjeta prepaga del club. Por eso no hay entidad de cuenta y los movimientos referencian a la tarjeta. Si varias tarjetas tuvieran que compartir saldo, se incorporaría una tabla `accounts`.

**Saldo almacenado (desnormalizado), no calculado**, para evitar agregar todos los movimientos en cada lectura.
Hoy la app no crea movimientos: el seed carga los movimientos y el saldo ya coherentes entre sí. Si en el futuro se pudieran crear movimientos, el registro del movimiento y la actualización del saldo se harían juntos, en una misma transacción.

**Montos en `numeric(12,2)`**, nunca `float`, para evitar errores de precisión en punto flotante.

**El monto es siempre positivo; el tipo de movimiento define si suma o resta.** La dirección del movimiento tiene una única fuente de verdad.

**Tipos de movimiento en una tabla propia**, con un `code` estable para el código y un `label` para mostrar. Agregar un tipo no requiere una migración, y cambiar un texto visible no rompe nada.

**No se almacenan datos sensibles de la tarjeta.** Solo últimos 4 dígitos, marca, vencimiento y titular. El número completo (PAN) y el código de seguridad (CVV) no se guardan, según PCI DSS. En producción se usaría tokenización a través del procesador de pagos.

**Claves foráneas con `ON DELETE RESTRICT`.** No se puede borrar un usuario, una tarjeta o un tipo que tenga datos asociados: el historial de movimientos nunca se pierde por un borrado en cascada. Costo: dar de baja algo requiere un proceso explícito (o un borrado lógico).

## Base de datos

**Esquema versionado con migraciones**, nunca con `sync()`. Cada cambio queda en el repo y se puede aplicar o revertir igual en desarrollo y en producción.

**Dos connection strings de Neon:** la app usa la *pooled* (con un pool chico, `max: 5`, porque en serverless cada función abre sus conexiones) y las migraciones usan la directa, porque el pooler no está pensado para cambios de esquema. Costo: una variable de entorno más.

**El seed calcula el saldo a partir de los movimientos**, así los datos de prueba son consistentes desde el inicio. Incluye un segundo usuario para probar que nadie puede ver movimientos ajenos.

## API

**Autenticación con JWT stateless** (7 días), enviado como `Authorization: Bearer`. La API no guarda sesiones y escala sin estado compartido. Costo: un token no se puede revocar antes de que venza sin agregar una lista negra.

**La pertenencia se verifica en la consulta.** Los movimientos se buscan con un JOIN a la tarjeta filtrado por el usuario autenticado, así nunca se lee un dato ajeno. Un movimiento de otro usuario responde 404, igual que uno inexistente, para no revelar que existe.

**Sin capas de controllers ni services.** Cada ruta valida con Zod, consulta con Sequelize y arma la respuesta. Los endpoints son lecturas, así que un service sería un pasamanos. Si apareciera lógica de dominio (por ejemplo, una transferencia con transacción), se extraería a un service.

**Errores centralizados.** Las rutas lanzan un `HttpError` y un único middleware arma la respuesta `{ error: { code, message } }`; los errores inesperados devuelven 500 sin detalles internos.

**Validación estricta con Zod.** Un `type` o un `limit` fuera de rango responde 400 en lugar de corregirse en silencio, para que el cliente detecte el error.

**Topes de longitud en los inputs.** La búsqueda acepta hasta 100 caracteres (el largo de `counterparty`), el email 255 y la contraseña 128, así no se procesan textos arbitrarios.

**La API no arranca sin `JWT_SECRET`.** Es preferible un error explícito al desplegar que una API que responde `/health` pero falla en cada login.

**El login tarda lo mismo exista o no el email.** Si el email no existe, igual se compara la contraseña contra un hash fijo con bcrypt; si no, la diferencia de tiempo (~70 ms) revelaría qué emails están registrados. Costo: cada intento fallido usa CPU de bcrypt.

**Sin rate limiting en el login.** En producción se limitarían los intentos por IP y por email para frenar ataques de fuerza bruta; queda fuera del alcance del challenge.

**Sin el header `X-Powered-By`** en la API ni en la web, para no anunciar el stack.

## Web

**El JWT vive en una cookie `httpOnly` y solo lo usa el servidor de Next.** Los datos se piden desde Server Components y el login y el logout son Server Actions, así que el token nunca queda expuesto al JavaScript del navegador (protege contra XSS) y la API no necesita CORS. Costo: cada interacción pasa por el servidor de Next antes de llegar a la API.

**`proxy.ts` solo verifica que exista la cookie.** Es un chequeo rápido para redirigir a `/login`; la validación real del token la hace la API, y si responde 401 la web redirige al login. Costo: con un token vencido, la página empieza a renderizarse antes de redirigir.

**Con sesión, `/login` redirige a la Home.** Para no generar un bucle cuando la cookie existe pero el token ya no sirve (`/` → `/login` → `/`...), `apiGet` redirige a `/login?expired=1` ante un 401 y el proxy borra la cookie en ese caso, porque un Server Component no puede modificar cookies.

**Sin caché de datos.** Las páginas se renderizan en cada request y los `fetch` usan `cache: 'no-store'`, porque son datos personales que cambian. Costo: cada visita consulta la API.

**La búsqueda y el filtro viven en la URL** (`?q=&type=`). La lista se arma en el servidor leyendo `searchParams`, así que se puede compartir, sobrevive a un refresh y el botón "atrás" funciona; el buscador solo actualiza la URL, con un debounce de 300 ms para no consultar la API en cada tecla.

**Solo la lista espera a la API.** Está dentro de un `<Suspense>` con `key` según la búsqueda y el filtro: al cambiarlos se muestra el skeleton de la lista, pero el buscador no se vuelve a montar y no pierde el foco.

**Un 404 de la API se traduce en la página "no encontrado".** `apiGet` llama a `notFound()`, así un movimiento inexistente y uno ajeno se ven igual, como en la API.

**Sin paginación en Movimientos.** Se piden los 50 más recientes (el máximo de la API) y se avisa si hay más. Alcanza para los datos actuales; con más volumen se agregaría paginación o scroll infinito usando `offset`.

**Las fechas se formatean con la zona horaria de Argentina fija**, porque se formatean en el servidor y en producción el servidor corre en UTC.

**"Últimos movimientos" muestra los de todas las tarjetas del usuario**, ordenados por fecha. Filtrarlos por la tarjeta seleccionada en el carrusel queda como mejora.

**En pantallas grandes se muestra la misma interfaz mobile**, en una columna centrada de 430 px sobre un fondo neutro. El diseño es para celular: así se respeta tal cual, sin mantener un segundo layout. Costo: en escritorio se desaprovecha el ancho.

**Los filtros rápidos se muestran completos** (sin scroll horizontal) para que sean accesibles sin el gesto de deslizar: con mouse, el scroll horizontal no es evidente.

**El login se valida en la Server Action, no con la validación nativa del navegador** (`noValidate`). El aviso nativo es poco visible y depende del navegador, así que el botón parecía no responder; ahora el formulario siempre se envía y el error se muestra en el mismo lugar que "Email o contraseña incorrectos". La API sigue validando con Zod. Costo: un viaje al servidor para detectar un error de formato.

**`proxy.ts` protege todo salvo `/login` y los archivos estáticos.** Una página nueva queda protegida sin agregarla a una lista. Además, `apiGet` redirige al login ante un 401, así que la protección no depende solo del proxy.

**Un tipo de movimiento que la web no conoce se muestra con un estilo neutro** y el `label` que manda la API, sin suponer si es un ingreso o un egreso. La lista no se rompe si se agrega un tipo en la tabla; para filtrar por él sí hay que sumarlo al filtro de la API y a los filtros rápidos.

**Las llamadas a la API se cortan a los 10 segundos.** Si la API no responde, se muestra el error con "Reintentar" en lugar de dejar la página cargando.

**Un movimiento inexistente muestra la página "no encontrado" con status HTTP 200.** Con `loading.tsx` la respuesta empieza a enviarse antes de saber si el movimiento existe, y el status ya no se puede cambiar; Next agrega `noindex`.

**Los textos secundarios usan el gris del diseño (`#aaa`)**, con un contraste de ~2.3:1, por debajo del 4.5:1 que pide WCAG AA. Se respeta el diseño; para cumplir AA habría que oscurecerlo.

**Los tipos de la API se repiten en `web/lib/api.ts`.** Sin workspaces no hay un paquete compartido entre `api/` y `web/`; con un esquema OpenAPI se podrían generar.

## Deploy

**API y web en dos proyectos de Vercel**, cada uno con su Root Directory (`api` y `web`). La API se despliega con la detección automática de Express, que usa la app exportada en `src/app.ts`, y queda como una única función serverless.

**Funciones en São Paulo (`gru1`)**, la misma región que la base de Neon (`sa-east-1`). Cada request de la web hace al menos un viaje a la API y otro a la base, así que tenerlos cerca reduce la latencia. Se configura en un `vercel.json` de una línea por proyecto, versionado junto al código.

**Dos branches de Neon:** `dev` para desarrollo y `main` para producción. Las migraciones y el seed se corren con la misma CLI apuntando a cada una, así los datos de prueba nunca se mezclan con los de la demo.

**Panel de notificaciones con la Popover API nativa** (`popover` + `popoverTarget`): abre y cierra sin JavaScript propio, se cierra con Esc o tocando afuera y se dibuja encima del resto sin moverlo, así la Home sigue siendo un Server Component. Como el diseño no lo define, solo muestra "No hay notificaciones".
