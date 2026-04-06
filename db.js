// Read-only DB helper using mysql2/promise
// Usage: set DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME in env before running
try { require('dotenv').config(); } catch (e) {}
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'duelcode_capstone_project',
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
});

function isReadOnly(sql) {
  if (!sql || typeof sql !== 'string') return false;
  return /^\s*(SELECT|SHOW|DESCRIBE|EXPLAIN|WITH)\b/i.test(sql.trim());
}

async function queryReadOnly(sql, params) {
  if (!isReadOnly(sql)) {
    throw new Error('Refusing to run non-read-only query via queryReadOnly()');
  }
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(sql, params);
    return rows;
  } finally {
    conn.release();
  }
}

module.exports = { pool, queryReadOnly };
