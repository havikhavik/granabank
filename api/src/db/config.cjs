// Config de sequelize-cli (migraciones y seeders). Usa la conexión directa
// de Neon: las migraciones no deben pasar por el pooler.
require('dotenv').config({ quiet: true });

const config = {
  use_env_variable: 'DATABASE_URL_DIRECT',
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true } },
};

module.exports = { development: config, production: config };
