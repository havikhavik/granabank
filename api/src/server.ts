// Solo para desarrollo local. En Vercel se usa directamente la app exportada en app.ts.
import dotenv from 'dotenv';
import app from './app.js';

dotenv.config({ quiet: true });

const port = Number(process.env.PORT) || 3001;

app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`);
});
