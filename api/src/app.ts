import express from 'express';
import { requireAuth } from './middlewares/auth.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import authRouter from './routes/auth.js';
import meRouter from './routes/me.js';
import movementsRouter from './routes/movements.js';

// Sin secreto no se pueden firmar ni verificar tokens: mejor no arrancar que
// fallar en cada login. Va acá y no en middlewares/auth.ts porque los imports
// se evalúan antes que este código, y db.ts ya cargó el .env.
if (!process.env.JWT_SECRET) {
  throw new Error('Falta la variable de entorno JWT_SECRET');
}

const app = express();

// Express manda "X-Powered-By: Express" por defecto: no hace falta anunciar el stack.
app.disable('x-powered-by');
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRouter);
app.use('/me', requireAuth, meRouter);
app.use('/movements', requireAuth, movementsRouter);

// El orden importa: primero las rutas, después el 404 y al final los errores.
app.use(notFound);
app.use(errorHandler);

export default app;
