require('dotenv').config();
const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  } 
});

pool.connect()
  .then(client => {
    client.release();
  })
  .catch(err => {
    logger.error('❌ Erreur de connexion à la base de données', err.stack);
  });

module.exports = {pool};