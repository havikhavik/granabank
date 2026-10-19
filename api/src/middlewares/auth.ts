import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { HttpError } from './errorHandler.js';

// Agrega userId al tipo Request de Express. Solo tiene valor en las rutas
// que pasan por requireAuth.
declare global {
  namespace Express {
    interface Request {
      userId: number;
    }
  }
}

// Verifica el header "Authorization: Bearer <token>" y deja el id del
// usuario en req.userId para las rutas siguientes.
export const requireAuth: RequestHandler = (req, _res, next) => {
  const [scheme, token] = req.headers.authorization?.split(' ') ?? [];
  if (scheme !== 'Bearer' || !token) {
    throw new HttpError(401, 'UNAUTHORIZED', 'Necesitás iniciar sesión');
  }

  let payload: string | jwt.JwtPayload;
  try {
    // Fijar el algoritmo evita aceptar tokens firmados con otro.
    payload = jwt.verify(token, process.env.JWT_SECRET!, { algorithms: ['HS256'] });
  } catch {
    // Firma inválida, token mal formado o vencido.
    throw new HttpError(401, 'UNAUTHORIZED', 'Tu sesión expiró o no es válida');
  }

  if (typeof payload === 'string' || !payload.sub) {
    throw new HttpError(401, 'UNAUTHORIZED', 'Tu sesión expiró o no es válida');
  }

  req.userId = Number(payload.sub);
  next();
};
