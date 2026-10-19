import express from 'express';
import { requireAuth } from './middlewares/auth.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import authRouter from './routes/auth.js';
import meRouter from './routes/me.js';
import movementsRouter from './routes/movements.js';

const app = express();

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
