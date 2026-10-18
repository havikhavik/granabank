# GranaBank

## Descripción

## Demo

## Cómo correrlo

Requisitos: Node.js 22 y una base PostgreSQL (por ejemplo, una branch de [Neon](https://neon.tech)).

### API

```bash
cd api
npm install
cp .env.example .env   # completar DATABASE_URL, DATABASE_URL_DIRECT y JWT_SECRET
npm run db:migrate     # crea las tablas
npm run db:seed:all    # carga los datos de prueba
npm run dev            # http://localhost:3001/health
```

Para revertir: `npm run db:seed:undo:all` (datos) y `npm run db:migrate:undo:all` (tablas).

## Arquitectura

![Diagrama entidad-relación](docs/DER.png)

## Endpoints

## Decisiones técnicas

Ver [docs/DECISIONS.md](docs/DECISIONS.md).

## Mejoras futuras
