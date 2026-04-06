(async ()=>{
  try {
    const mysql = require('mysql2/promise');
    const db = await mysql.createPool({ host: 'localhost', user: 'root', password: '', database: 'duelcode_capstone_project' });
    const sql = `SELECT p.problem_id, p.problem_name, GROUP_CONCAT(pt.topic_name) AS topics FROM problems p LEFT JOIN problems_have_topics pht ON p.problem_id = pht.problem_id LEFT JOIN problem_topics pt ON pht.topic_id = pt.topic_id GROUP BY p.problem_id ORDER BY p.problem_id DESC LIMIT 20`;
    const [rows] = await db.query(sql);
    console.log('Recent problems (id | name | topics):');
    rows.forEach(r => console.log(r.problem_id, '|', r.problem_name, '|', r.topics));
    await db.end();
    process.exit(0);
  } catch (e) {
    console.error('Error:', e && e.message);
    process.exit(2);
  }
})();
