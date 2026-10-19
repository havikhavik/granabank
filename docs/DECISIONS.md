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

## Web

**El JWT vive en una cookie `httpOnly` y solo lo usa el servidor de Next.** Los datos se piden desde Server Components y el login y el logout son Server Actions, así que el token nunca queda expuesto al JavaScript del navegador (protege contra XSS) y la API no necesita CORS. Costo: cada interacción pasa por el servidor de Next antes de llegar a la API.

**`proxy.ts` solo verifica que exista la cookie.** Es un chequeo rápido para redirigir a `/login`; la validación real del token la hace la API, y si responde 401 la web redirige al login. Costo: con un token vencido, la página empieza a renderizarse antes de redirigir.

**Sin caché de datos.** Las páginas se renderizan en cada request y los `fetch` usan `cache: 'no-store'`, porque son datos personales que cambian. Costo: cada visita consulta la API.
