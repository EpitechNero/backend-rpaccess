const { Client } = require('pg');
const dotenv = require('dotenv').config();

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME || 'rpaproject',
});

module.exports = {client};