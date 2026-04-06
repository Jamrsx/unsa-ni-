const mysql = require('mysql2/promise');

(async ()=>{
  const cfg = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'duelcode_capstone_project'
  };

  const changeId = Number(process.argv[2]);
  if (!changeId) {
    console.error('Usage: node verify_commit_for_change.js <changeId>');
    process.exit(1);
  }

  const conn = await mysql.createConnection(cfg);
  try {
    const [[pending]] = await conn.query('SELECT * FROM faculty_pending_changes WHERE id = ? LIMIT 1', [changeId]);
    console.log('PENDING:', pending);
    if (!pending || !pending.record_id) {
      console.log('No record_id set for pending change', changeId);
      return;
    }
    const pid = pending.record_id;
    const [probs] = await conn.query('SELECT * FROM problems WHERE problem_id = ? LIMIT 1', [pid]);
    console.log('PROBLEM:', probs);

    const [tcs] = await conn.query('SELECT * FROM test_cases WHERE problem_id = ? ORDER BY test_case_number', [pid]);
    console.log('TEST_CASES_COUNT:', tcs.length);

    const [pht] = await conn.query('SELECT * FROM problems_have_topics WHERE problem_id = ?', [pid]);
    console.log('TOPICS:', pht);

  } catch (e) {
    console.error('ERR', e && e.message ? e.message : e);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
})();
