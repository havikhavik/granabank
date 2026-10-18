import dotenv from 'dotenv';
import pg from 'pg';
import { Sequelize } from 'sequelize';

dotenv.config({ quiet: true });

if (!process.env.DATABASE_URL) {
  throw new Error('Falta la variable de entorno DATABASE_URL');
}

// Instancia única de Sequelize. Usa la URL pooled de Neon y un pool chico,
// porque en Vercel cada función serverless abre sus propias conexiones.
export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  // Pasar el driver explícito evita que el bundler de Vercel lo deje afuera
  // (Sequelize lo carga con un require dinámico).
  dialectModule: pg,
  dialectOptions: { ssl: { require: true } },
  pool: { max: 5 },
  logging: false,
});
