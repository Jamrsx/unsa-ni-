(async ()=>{
  try {
    const mysql = require('mysql2/promise');
    const db = await mysql.createPool({ host: 'localhost', user: 'root', password: '', database: 'duelcode_capstone_project' });
    const sql = `SELECT p.problem_id, p.problem_name, pt.topic_id, pt.topic_name
      FROM problems p
      JOIN content_problems cp ON p.problem_id = cp.problem_id
      JOIN content_items ci ON cp.content_item_id = ci.content_item_id
      JOIN approvals a ON ci.content_item_id = a.content_item_id
      LEFT JOIN problems_have_topics pht ON p.problem_id = pht.problem_id
      LEFT JOIN problem_topics pt ON pht.topic_id = pt.topic_id
      WHERE a.requested_by = ?
      ORDER BY p.problem_id DESC
      LIMIT 20`;
    const [rows] = await db.query(sql, [21]);
    console.log('Found rows:', rows.length);
    rows.forEach(r => console.log(r));
    await db.end();
    process.exit(0);
  } catch (e) {
    console.error('Error:', e && e.message);
    process.exit(2);
  }
})();
