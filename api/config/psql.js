require('dotenv').config();
const { Client } = require('pg');

console.log("DATABASE_URL:", process.env.DATABASE_URL);

const client = new Client({
    connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = {client};