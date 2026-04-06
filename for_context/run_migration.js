// run_migration.js - Executes a SQL migration file (be careful, it's write-enabled)
const path = require('path');
const fs = require('fs');
try { require('dotenv').config(); } catch (e) {}
const mysql = require('mysql2/promise');

async function main() {
  const sqlFile = path.join(__dirname, '..', 'sql', '2025_12_20_normalize_permissions.sql');
  if (!fs.existsSync(sqlFile)) {
    console.error('Migration SQL file not found at', sqlFile);
    process.exit(2);
  }

  const sql = fs.readFileSync(sqlFile, 'utf8');

  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'duelcode_capstone_project',
    waitForConnections: true,
    connectionLimit: 5,
    multipleStatements: true
  });

  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Running migration file:', sqlFile);
    const [result] = await connection.query(sql);
    console.log('Migration executed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err && err.message ? err.message : err);
    process.exit(3);
  } finally {
    try { if (connection) connection.release(); } catch (e) {}
    try { await pool.end(); } catch (e) {}
  }
}

if (require.main === module) main();

module.exports = { main };
