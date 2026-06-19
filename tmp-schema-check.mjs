import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const conn = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'demara_gaji'
});

const [rows] = await conn.query('DESCRIBE karyawan');
console.log(JSON.stringify(rows, null, 2));
await conn.end();
