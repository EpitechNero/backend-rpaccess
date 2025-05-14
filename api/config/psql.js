require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect()
  .then(client => {
    console.log('✅ Connecté à la base de données');
    client.release();
  })
  .catch(err => {
    console.error('❌ Erreur de connexion à la base de données', err.stack);
  });

module.exports = {pool};