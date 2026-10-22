# GranaBank

## Descripción

Web app de una billetera prepaga del club. Después de iniciar sesión, el socio ve su saldo y sus últimos movimientos, puede buscar y filtrar todos sus movimientos y abrir el detalle de cada uno.

- **Login** con "Recordarme" y mensajes de error.
- **Home:** saludo, tarjeta con saldo y "Últimos movimientos".
- **Movimientos:** búsqueda por contraparte y filtros rápidos (Todos, Débito Aut., Recibido, Enviado), combinables.
- **Detalle de un movimiento:** tipo, monto, fecha y hora, tarjeta usada y descripción.
- **Estados** de carga (skeletons), error (con "Reintentar"), vacío y no encontrado.

Stack: Next.js 16 (App Router) + TypeScript + Tailwind en la web; Node.js + Express + TypeScript + Sequelize en la API; PostgreSQL en Neon.

## Demo

**https://granabank-eta.vercel.app**

Credenciales: `soygranate@clublanus.com` / `GRANATE1@`

La API está en `https://granabank-api.vercel.app` (por ejemplo, [`/health`](https://granabank-api.vercel.app/health)).

## Cómo correrlo

Requisitos: Node.js 22 y una base PostgreSQL (por ejemplo, una branch de [Neon](https://neon.tech)).

### 1. API

```bash
cd api
npm install
cp .env.example .env   # completar DATABASE_URL, DATABASE_URL_DIRECT y JWT_SECRET
npm run db:migrate     # crea las tablas
npm run db:seed:all    # carga los datos de prueba
npm run dev            # http://localhost:3001/health
```

- La conexión exige SSL (como Neon). En una branch de Neon, `DATABASE_URL` es la connection string *pooled* y `DATABASE_URL_DIRECT` la directa.
- Para revertir: `npm run db:seed:undo:all` (datos) y `npm run db:migrate:undo:all` (tablas).
- Para probar los endpoints: `api/requests.http` (extensión REST Client de VS Code), con casos de éxito y de error.
- Tests: `npm test` (3 tests de integración con vitest + supertest: login correcto, 401 sin token y 404 en un movimiento ajeno; usan la base del `.env`, con el seed cargado).

### 2. Web

Con la API corriendo, en otra terminal:

```bash
cd web
npm install
cp .env.example .env.local   # API_URL=http://localhost:3001
npm run dev                  # http://localhost:3000
```

Entrar con las credenciales de la demo.

### Deploy

Dos proyectos de Vercel conectados a este repo, con Root Directory `api` y `web`, y funciones en São Paulo (`gru1`, ver `vercel.json`), igual que la base de Neon.

- API: variables `DATABASE_URL` (pooled de la branch de producción) y `JWT_SECRET`.
- Web: variable `API_URL` (URL de la API, sin barra final).
- Base de producción, desde `api/` (una variable exportada tiene prioridad sobre el `.env`):

  ```bash
  export DATABASE_URL_DIRECT='<url directa de producción>'
  npm run db:migrate && npm run db:seed:all
  unset DATABASE_URL_DIRECT
  ```

## Arquitectura

```
Navegador ──▶ Next.js (web/) ──▶ API Express (api/) ──▶ PostgreSQL (Neon)
              Server Components     JWT + Zod + Sequelize
              y Server Actions
```

- **`web/`** renderiza en el servidor: las páginas piden los datos a la API desde Server Components, y el login y el logout son Server Actions. El JWT se guarda en una cookie `httpOnly`, así que el navegador nunca lo ve.
- **`api/`** es una API REST: valida cada request con Zod, verifica el JWT en un middleware, consulta con Sequelize y centraliza los errores en un único formato.
- **Base de datos:** usuarios, tarjetas (con el saldo), tipos de movimiento y movimientos. El esquema se versiona con migraciones y los datos de prueba con seeders.
- Las dos apps viven en el mismo repo sin herramientas de monorepo y se despliegan por separado en Vercel.

![Diagrama entidad-relación](docs/DER.png)

## Endpoints

Todas las rutas, salvo `/health` y `/auth/login`, requieren `Authorization: Bearer <token>`. Los errores tienen siempre la forma `{ "error": { "code": "...", "message": "..." } }`.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Estado de la API. |
| POST | `/auth/login` | Body `{ email, password }` → `{ token, user }`. `400` body inválido, `401` credenciales incorrectas. |
| GET | `/me` | Usuario y sus tarjetas con saldo. |
| GET | `/movements` | Movimientos del usuario, del más reciente al más antiguo. Query: `q` (busca en la contraparte), `type` (`SUBSCRIPTION`, `CASH_IN`, `CASH_OUT`), `limit` (1 a 50, default 20), `offset`. → `{ items, total }`. |
| GET | `/movements/:id` | Detalle de un movimiento con descripción y tarjeta. `404` si no existe o si es de otro usuario. |

Los montos viajan como string (`"125.00"`) para no perder precisión y las fechas en ISO 8601.

## Decisiones técnicas

Ver [docs/DECISIONS.md](docs/DECISIONS.md): modelo de datos, autenticación, manejo de errores, caché, deploy y los costos de cada decisión.

## Mejoras futuras

- Paginación o scroll infinito en Movimientos (hoy se muestran los 50 más recientes).
- Filtrar "Últimos movimientos" por la tarjeta seleccionada en el carrusel.
- Rate limiting en el login, por IP y por email.
- Revocación de tokens antes de que venzan (lista negra o sesiones cortas con refresh token).
- Tipos compartidos entre API y web generados desde un esquema OpenAPI.
- Tests de la web (componentes y un flujo end-to-end) y una base de datos aislada para los tests de la API.
- Oscurecer los textos secundarios para cumplir el contraste WCAG AA.

## Cómo trabajé

- **Backlog en GitHub Issues**, con criterios de aceptación y dos milestones: `Sprint 1 - API` y `Sprint 2 - Web y entrega`.
- **Una rama por issue** y commits con Conventional Commits. Cada rama se integró con un PR que cierra su issue (squash merge).
- Empecé por el modelo de datos y el contrato de la API, y después construí la web sobre ese contrato.
- Usé un asistente de IA para acelerar la implementación. Las decisiones técnicas las tomé yo, revisé todo el código y escribí las partes críticas de seguridad: la comparación de contraseñas con bcrypt, la firma del JWT y la verificación de que un movimiento pertenezca al usuario.
