import { Router } from 'express';
import { z } from 'zod';
import { HttpError } from '../middlewares/errorHandler.js';
import { User } from '../models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

const router = Router();

// Hash bcrypt de un texto aleatorio que nadie conoce, con el mismo costo (10)
// que las contraseñas reales. Ver su uso en el login.
const DUMMY_HASH = '$2b$10$CML1xQCn5hOd14nLSWGqo.5bEBuWpIP7btEU6w9QPxsuRN9HvkQry';

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

router.post('/login', async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await User.findOne({ where: { email: email.toLowerCase() } });
  // Si el email no existe, igual se corre bcrypt (contra un hash que no coincide):
  // así la respuesta tarda lo mismo y el tiempo no revela qué emails existen.
  if (!user) await bcrypt.compare(password, DUMMY_HASH);
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
  const passwordMatches= await bcrypt.compare(password, user.passwordHash)
  
  if(!passwordMatches){
      return null;

  }else{
    return jwt.sign({ sub: String(user.id) }, process.env.JWT_SECRET!, {
    algorithm: 'HS256',
    expiresIn: '7d',
  });
  }
}

export default router;
