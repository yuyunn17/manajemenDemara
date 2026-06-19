import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
const DB_NAME = process.env.DB_NAME || 'demara_gaji';
const SQL_DUMP_PATH = path.resolve(__dirname, '..', '..', 'demara_gaji.sql');

const adminConfig = {
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  multipleStatements: true,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true
};

const createAndSeedDatabase = async () => {
  const conn = await mysql.createConnection(adminConfig);
  try {
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
    await conn.query(`USE \`${DB_NAME}\``);

    const [tables] = await conn.query(
      'SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = ?',
      [DB_NAME]
    );

    if (tables[0] && tables[0].count === 0) {
      if (!fs.existsSync(SQL_DUMP_PATH)) {
        throw new Error(`SQL seed file not found: ${SQL_DUMP_PATH}`);
      }

      const sqlContent = fs.readFileSync(SQL_DUMP_PATH, 'utf8');
      await conn.query(sqlContent);
      console.log(`✓ Database ${DB_NAME} created and seeded from SQL dump`);
    }
  } finally {
    await conn.end();
  }
};

const createPool = async () => {
  await createAndSeedDatabase();

  const pool = mysql.createPool({
    ...adminConfig,
    database: DB_NAME,
    multipleStatements: false
  });

  const conn = await pool.getConnection();
  conn.release();
  console.log('✓ MySQL database connected');

  return pool;
};

const pool = await createPool();
export default pool;
