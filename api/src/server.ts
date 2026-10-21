// Solo para desarrollo local. En Vercel se usa directamente la app exportada en app.ts.
// El .env ya lo cargó db.ts, que se evalúa al importar app.
import app from './app.js';

const port = Number(process.env.PORT) || 3001;

app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`);
});
