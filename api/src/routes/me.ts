import { Router } from 'express';
import { HttpError } from '../middlewares/errorHandler.js';
import { Card, User } from '../models/index.js';

const router = Router();

router.get('/', async (req, res) => {
  const user = await User.findByPk(req.userId, {
    attributes: ['id', 'name'],
    include: [{ model: Card, as: 'cards' }],
    order: [[{ model: Card, as: 'cards' }, 'id', 'ASC']],
  });

  // El token es válido pero el usuario ya no existe.
  if (!user) {
    throw new HttpError(401, 'UNAUTHORIZED', 'Tu sesión expiró o no es válida');
  }

  // La respuesta se arma campo por campo: nunca se devuelve el modelo entero.
  res.json({
    user: { id: user.id, name: user.name },
    cards: (user.cards ?? []).map((card) => ({
      id: card.id,
      holderName: card.holderName,
      brand: card.brand,
      last4: card.last4,
      expMonth: card.expMonth,
      expYear: card.expYear,
      currency: card.currency,
      balance: card.balance,
    })),
  });
});

export default router;
