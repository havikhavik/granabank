import { Router } from 'express';
import { Op } from 'sequelize';
import { z } from 'zod';
import { HttpError } from '../middlewares/errorHandler.js';
import { Card, Movement, MovementType } from '../models/index.js';

const router = Router();

const listQuerySchema = z.object({
  // 100 es el largo de la columna counterparty: más largo no puede coincidir.
  q: z.string().trim().max(100).optional(),
  type: z.enum(['SUBSCRIPTION', 'CASH_IN', 'CASH_OUT']).optional(),
  // Los query params llegan como string: coerce los convierte a número.
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

const idParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Forma de un movimiento en las respuestas (lista y detalle).
function toItem(movement: Movement) {
  return {
    id: movement.id,
    counterparty: movement.counterparty,
    amount: movement.amount,
    occurredAt: movement.occurredAt,
    type: {
      code: movement.type!.code,
      label: movement.type!.label,
      isNegative: movement.type!.isNegative,
    },
  };
}

router.get('/', async (req, res) => {
  const filters = listQuerySchema.parse(req.query);
  const { rows, count } = await listUserMovements(req.userId, filters);
  res.json({ items: rows.map(toItem), total: count });
});

router.get('/:id', async (req, res) => {
  const { id } = idParamsSchema.parse(req.params);

  const movement = await findUserMovement(id, req.userId);

  // 404 tanto si no existe como si es de otro usuario: no se revela que existe.
  if (!movement) {
    throw new HttpError(404, 'MOVEMENT_NOT_FOUND', 'No encontramos el movimiento');
  }

  res.json({
    ...toItem(movement),
    description: movement.description,
    card: { brand: movement.card!.brand, last4: movement.card!.last4 },
  });
});

function listUserMovements(userId: number, { q, type, limit, offset }: z.infer<typeof listQuerySchema>) {
  return Movement.findAndCountAll({
    // Escapa % y _ para que se busquen como texto y no como comodines de LIKE.
    where: q ? { counterparty: { [Op.iLike]: `%${q.replace(/[\\%_]/g, '\\$&')}%` } } : {},
    include: [
      // Un include con where es un INNER JOIN: solo quedan los movimientos
      // de tarjetas del usuario autenticado.
      { model: Card, as: 'card', attributes: [], where: { userId } },
      { model: MovementType, as: 'type', where: type ? { code: type } : undefined },
    ],
    // El id desempata movimientos con la misma fecha, así la paginación es estable.
    order: [
      ['occurredAt', 'DESC'],
      ['id', 'DESC'],
    ],
    limit,
    offset,
  });
}

// Devuelve null si el movimiento no existe o si es de otro usuario.
async function findUserMovement(id: number, userId: number): Promise<Movement | null> {
  return Movement.findOne({
    where: { id },
    include: [
      { model: MovementType, as: 'type' },
      { model: Card, as: 'card', where: { userId } },
    ],
  });
}

export default router;