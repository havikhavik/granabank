# Decisiones técnicas

## Arquitectura

**API REST en Express, separada de Next.js** (patrón Backend for Frontend). Separa la lógica de negocio de la capa de presentación y permite que otros clientes (por ejemplo, una app móvil) consuman la misma API. Costo: un salto de red adicional entre el servidor de Next y la API, que suma latencia a cada request.

**Monorepo** con `api/` y `web/`, desplegados de forma independiente.

## Modelo de datos

**El saldo vive en la tarjeta**, modelada como tarjeta prepaga del club. Por eso no hay entidad de cuenta y los movimientos referencian a la tarjeta. Si varias tarjetas tuvieran que compartir saldo, se incorporaría una tabla `accounts`.

**Saldo almacenado (desnormalizado), no calculado**, para evitar agregar todos los movimientos en cada lectura.
<!-- TODO: cómo se mantiene consistente con los movimientos -->

**Montos en `numeric(12,2)`**, nunca `float`, para evitar errores de precisión en punto flotante.

**El monto es siempre positivo; el tipo de movimiento define si suma o resta.** La dirección del movimiento tiene una única fuente de verdad.

**Tipos de movimiento en una tabla propia**, con un `code` estable para el código y un `label` para mostrar. Agregar un tipo no requiere una migración, y cambiar un texto visible no rompe nada.

**No se almacenan datos sensibles de la tarjeta.** Solo últimos 4 dígitos, marca, vencimiento y titular. El número completo (PAN) y el código de seguridad (CVV) no se guardan, según PCI DSS. En producción se usaría tokenización a través del procesador de pagos.

**Claves foráneas con `ON DELETE RESTRICT`.** No se puede borrar un usuario, una tarjeta o un tipo que tenga datos asociados: el historial de movimientos nunca se pierde por un borrado en cascada. Costo: dar de baja algo requiere un proceso explícito (o un borrado lógico).

## Base de datos

**Esquema versionado con migraciones**, nunca con `sync()`. Cada cambio queda en el repo y se puede aplicar o revertir igual en desarrollo y en producción.

**Dos connection strings de Neon:** la app usa la *pooled* (con un pool chico, `max: 5`, porque en serverless cada función abre sus conexiones) y las migraciones usan la directa, porque el pooler no está pensado para cambios de esquema. Costo: una variable de entorno más.

**El seed calcula el saldo a partir de los movimientos**, así los datos de prueba son consistentes desde el inicio. Incluye un segundo usuario para probar que nadie puede ver movimientos ajenos.
