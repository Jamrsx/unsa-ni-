const mysql = require('mysql2/promise');

(async () => {
  const cfg = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'duelcode_capstone_project'
  };

  const roleId = Number(process.argv[2] || 2); // default to role_id 2 (faculty)
  const permissions = [
    'problem.approvals.manage',
    'event.approvals.manage',
    'blog.approvals.manage'
  ];

  const conn = await mysql.createConnection(cfg);
  try {
    for (const name of permissions) {
      const [prows] = await conn.query('SELECT permission_id FROM permissions WHERE permission_name = ? LIMIT 1', [name]);
      if (!prows || prows.length === 0) {
        console.log(`Permission not found: ${name}, skipping`);
        continue;
      }
      const pid = prows[0].permission_id;
      // check exists
      const [exists] = await conn.query('SELECT 1 FROM role_permissions WHERE role_id = ? AND permission_id = ? LIMIT 1', [roleId, pid]);
      if (exists && exists.length) {
        console.log(`role_permissions already has ${name} for role ${roleId}`);
        continue;
      }
      await conn.query('INSERT INTO role_permissions (role_id, permission_id, is_granted) VALUES (?, ?, 1)', [roleId, pid]);
      console.log(`Granted ${name} to role ${roleId}`);
    }
  } catch (err) {
    console.error('ERR', err && err.message ? err.message : err);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
})();
