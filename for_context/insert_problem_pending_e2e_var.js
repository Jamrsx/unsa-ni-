const mysql = require('mysql2/promise');

(async function(){
  try {
    const db = await mysql.createPool({ host: process.env.DB_HOST || '127.0.0.1', user: process.env.DB_USER || 'root', password: process.env.DB_PASS || '', database: process.env.DB_NAME || 'duelcode_capstone_project', waitForConnections:true, connectionLimit:5 });

    const proposed = {
      problem_name: 'E2E Problem Variation by Faculty',
      difficulty: 'Medium',
      time_limit_seconds: 2,
      memory_limit_mb: 128,
      description: 'End-to-end variation test problem',
      sample_solution: "print('variant')",
      test_cases: [
        { InputData: '10', ExpectedOutput: '10', IsSample: true, Score: 1, TestCaseNumber: 1 },
        { InputData: '20', ExpectedOutput: '20', IsSample: false, Score: 0, TestCaseNumber: 2 },
        { InputData: '30', ExpectedOutput: '30', IsSample: false, Score: 0, TestCaseNumber: 3 }
      ],
      topics: [1,2]
    };

    const [res] = await db.query(
      `INSERT INTO faculty_pending_changes (faculty_id, change_type, table_name, record_id, action_type, original_data, proposed_data, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [21, 'problem', 'problems', 0, 'create', null, JSON.stringify(proposed), 'pending_faculty_review']
    );

    console.log('inserted_pending_id=', res.insertId);
    await db.end();
    process.exit(0);
  } catch (e) {
    console.error('ERR', e && e.message ? e.message : e);
    process.exit(1);
  }
})();
