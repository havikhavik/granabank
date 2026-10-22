import bcrypt from 'bcrypt';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { HttpError } from '../middlewares/errorHandler.js';
import { User } from '../models/index.js';

const router = Router();

// Hash bcrypt de un texto aleatorio que nadie conoce, con el mismo costo (10)
// que las contraseñas reales. Ver su uso en el login.
const DUMMY_HASH = '$2b$10$CML1xQCn5hOd14nLSWGqo.5bEBuWpIP7btEU6w9QPxsuRN9HvkQry';

const loginSchema = z.object({
  // Topes de largo: email como la columna (255); password generoso, pero acotado
  // para no procesar bodies arbitrarios.
  email: z.email().max(255),
  password: z.string().min(1).max(128),
});

router.post('/login', async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await User.findOne({ where: { email: email.toLowerCase() } });
  // Si el email no existe, igual se corre bcrypt (contra un hash que no coincide):
  // ni el tiempo ni el error revelan qué emails están registrados.
  if (!user) await bcrypt.compare(password, DUMMY_HASH);
  const token = user && (await createTokenIfPasswordMatches(user, password));

  if (!user || !token) {
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'Email o contraseña incorrectos');
  }

  res.json({ token, user: { id: user.id, name: user.name } });
});

// Devuelve el JWT (id del usuario en `sub`, 7 días) o null si la contraseña no coincide.
async function createTokenIfPasswordMatches(user: User, password: string): Promise<string | null> {
  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) return null;

  // El ! es seguro: app.ts no deja arrancar la API sin JWT_SECRET.
  return jwt.sign({ sub: String(user.id) }, process.env.JWT_SECRET!, {
    algorithm: 'HS256',
    expiresIn: '7d',
  });
}

export default router;
