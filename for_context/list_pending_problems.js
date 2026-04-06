const mysql = require('mysql2/promise');

(async ()=>{
  const cfg = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'duelcode_capstone_project'
  };

  const conn = await mysql.createConnection(cfg);
  try {
    const [rows] = await conn.query(
      `SELECT id, faculty_id, status, created_at FROM faculty_pending_changes
       WHERE table_name = 'problems' AND status IN ('pending_faculty_review','pending_admin') ORDER BY id ASC`);
    if (!rows || rows.length === 0) {
      console.log('No pending problem changes found');
    } else {
      console.log('Pending problem change rows:');
      for (const r of rows) console.log(JSON.stringify(r));
    }
  } catch (e) {
    console.error('Error listing pending problems:', e && e.message ? e.message : e);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
})();
