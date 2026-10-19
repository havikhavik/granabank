import { Router } from 'express';
import { z } from 'zod';
import { HttpError } from '../middlewares/errorHandler.js';
import { User } from '../models/index.js';

const router = Router();

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

router.post('/login', async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await User.findOne({ where: { email: email.toLowerCase() } });
  const token = user && (await createTokenIfPasswordMatches(user, password));

  // Mismo error si el email no existe o si la contraseña es incorrecta:
  // así no se revela qué emails están registrados.
  if (!user || !token) {
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'Email o contraseña incorrectos');
  }

  res.json({ token, user: { id: user.id, name: user.name } });
});

// Compara la contraseña con el hash guardado y, si coincide, firma el JWT.
// Devuelve el token, o null si la contraseña es incorrecta.
// El token tiene que llevar el id del usuario en `sub` (como string), firmado
// con process.env.JWT_SECRET y con vencimiento de 7 días: requireAuth lo lee así.
async function createTokenIfPasswordMatches(user: User, password: string): Promise<string | null> {
  // TODO (yo): comparar la contraseña con bcrypt y firmar el JWT.
  return null;
}

export default router;
