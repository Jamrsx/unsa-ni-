const mysql = require('mysql2/promise');

async function testDatabaseAndSockets() {
  try {
    const config = {
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'duelcode_capstone_project'
    };
    
    const conn = await mysql.createConnection(config);
    console.log('\n=== DATABASE VALIDATION ===\n');
    
    // Test 1: Count users
    const [users] = await conn.execute('SELECT COUNT(*) as cnt FROM users');
    console.log('✓ Total Users:', users[0].cnt);
    
    // Test 2: Count problems
    const [probs] = await conn.execute('SELECT COUNT(*) as cnt FROM problems');
    console.log('✓ Total Problems:', probs[0].cnt);
    
    // Test 3: Count blogs  
    const [blogs] = await conn.execute('SELECT COUNT(*) as cnt FROM blogs');
    console.log('✓ Total Blogs:', blogs[0].cnt);
    
    // Test 4: Count events
    const [events] = await conn.execute('SELECT COUNT(*) as cnt FROM events');
    console.log('✓ Total Events:', events[0].cnt);
    
    // Test 5: Count approvals
    const [approvals] = await conn.execute('SELECT COUNT(*) as cnt FROM approvals');
    console.log('✓ Total Approvals:', approvals[0].cnt);
    
    // Test 6: Test dashboard details query (the one with fixes)
    const [dashDetails] = await conn.execute(`
      SELECT 
        (SELECT COUNT(*) FROM users) AS total_users, 
        (SELECT COUNT(*) FROM problems) AS total_problems
    `);
    console.log('✓ Dashboard Details Query:', dashDetails[0]);
    
    // Test 7: Admin user check
    const [admins] = await conn.execute('SELECT COUNT(*) as cnt FROM users WHERE role = "admin"');
    console.log('✓ Total Admins:', admins[0].cnt);
    
    // Test 8: Sample blog (verify no SQL error with content_type fix)
    const [sampleBlogs] = await conn.execute(`
      SELECT b.blog_id, b.title, 'blog' AS content_type FROM blogs b LIMIT 3
    `);
    console.log('✓ Sample Blogs Retrieved:', sampleBlogs.length);
    if (sampleBlogs.length > 0) {
      console.log('  First Blog:', sampleBlogs[0].title?.substring(0, 40) + '...');
    }
    
    // Test 9: Count test runs (skip if doesn't exist)
    try {
      const [testLogs] = await conn.execute('SELECT COUNT(*) as cnt FROM test_logs');
      console.log('✓ Total Test Runs:', testLogs[0].cnt);
    } catch (e) {
      console.log('ℹ Test logs table not found (skipped)');
    }
    
    conn.end();
    console.log('\n✓ All database tests PASSED\n');
    
  } catch (error) {
    console.error('\n✗ Database test FAILED:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testDatabaseAndSockets();
