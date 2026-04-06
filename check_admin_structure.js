const mysql = require('mysql2/promise');

async function checkAdmins() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'duelcode_capstone_project'
    });
    
    // Check admins table
    const [admins] = await conn.execute('SELECT * FROM admins LIMIT 10');
    console.log('\n=== ADMINS TABLE ===');
    console.log(admins);
    
    // Check staff table
    const [staff] = await conn.execute('SELECT * FROM staff LIMIT 10');
    console.log('\n=== STAFF TABLE ===');
    console.log(staff);
    
    // Check if there's a specific admin role or permission system
    const [roleUsers] = await conn.execute(`
      SELECT DISTINCT role FROM users
    `);
    console.log('\n=== ROLES FOUND ===');
    console.log(roleUsers);
    
    // Check tables list
    const [tables] = await conn.execute(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'duelcode_capstone_project'
      ORDER BY TABLE_NAME
    `);
    console.log('\n=== ALL TABLES ===');
    tables.forEach(t => console.log('  -', t.TABLE_NAME));
    
    conn.end();
  } catch (e) {
    console.error('Error:', e.message);
  }
}

checkAdmins();
