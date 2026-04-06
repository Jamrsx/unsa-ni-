const mysql = require('mysql2/promise');

(async () => {
  const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'duelcode_capstone_project'
  });

  const userId = 21; // faculty test user

  // Check if user has auto_approve permissions
  const [perms] = await db.query(`
    SELECT p.permission_name 
    FROM permissions p 
    INNER JOIN role_permissions rp ON p.permission_id = rp.permission_id 
    INNER JOIN user_roles ur ON rp.role_id = ur.role_id 
    WHERE ur.user_id = ? 
    AND p.permission_name LIKE '%auto_approve%'
  `, [userId]);

  console.log('Auto-approve permissions for user', userId);
  console.log(JSON.stringify(perms, null, 2));

  await db.end();
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
