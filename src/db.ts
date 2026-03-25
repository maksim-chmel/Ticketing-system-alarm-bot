import { Pool } from 'pg';
import dotenv from 'dotenv';


dotenv.config();

export const pool = new Pool({
    
    connectionString: process.env.DATABASE_URL,
    
    connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
    console.log('DB Connected!');
});

pool.on('error', (err) => {
    console.error('DB error', err);
});