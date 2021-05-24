// Update with your config settings.
require('ts-node/register')

const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: "prod",
  },
  pool: {
    min: 2,
    max: 10,
  }
};
