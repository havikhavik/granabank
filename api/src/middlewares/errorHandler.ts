import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';

// Error con status HTTP y código. Las rutas lo lanzan (throw) y el
// errorHandler lo convierte en la respuesta de error del contrato.
export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

// Rutas que no existen. Va después de todas las rutas.
export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Ruta no encontrada' } });
};

// Middleware de errores centralizado: Express lo reconoce por tener 4 parámetros.
// En Express 5, los errores de handlers async también llegan acá.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message } });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Los datos enviados no son válidos' } });
    return;
  }

  // express.json() lanza este error cuando el body no es un JSON válido.
  if (err.type === 'entity.parse.failed') {
    res.status(400).json({ error: { code: 'INVALID_JSON', message: 'El cuerpo de la solicitud no es un JSON válido' } });
    return;
  }

  // Error inesperado: se registra en el servidor, pero al cliente no se le
  // muestran detalles internos.
  console.error(err);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Ocurrió un error inesperado' } });
};
