const { Client } = require('pg');
const dotenv = require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = {client};