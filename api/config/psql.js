import { Client } from 'pg'; // TODO : importation différente 
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME || 'rpaproject',
});

export { client };