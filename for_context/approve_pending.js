const path = require('path');
const mysql = require('mysql2/promise');

(async () => {
  const cfg = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'duelcode_capstone_project'
  };

  const changeId = Number(process.argv[2] || 14);
  const reviewerId = Number(process.argv[3] || 21); // faculty id performing the approval

  const conn = await mysql.createConnection(cfg);
  try {
    // only approve if status is pending_faculty_review
    const [rows] = await conn.query('SELECT id, status FROM faculty_pending_changes WHERE id = ? LIMIT 1', [changeId]);
    if (!rows || rows.length === 0) {
      console.log('NO_ROW');
      return;
    }
    const row = rows[0];
    console.log('CURRENT_STATUS=' + row.status);
    if (row.status !== 'pending_faculty_review') {
      console.log('Row is not pending_faculty_review; aborting.');
      return;
    }

    const [res] = await conn.query(
      `UPDATE faculty_pending_changes
       SET status = 'pending_admin',
           faculty_review_date = NOW(),
           faculty_reviewer_id = ?,
           faculty_review_comment = CONCAT('Approved via script by user ', ?),
           updated_at = NOW()
       WHERE id = ? AND status = 'pending_faculty_review'`,
      [reviewerId, reviewerId, changeId]
    );

    console.log('UPDATED_ROWS=' + res.affectedRows);

    // show new row
    const [newRows] = await conn.query('SELECT id, faculty_id, status, faculty_review_date, faculty_reviewer_id, faculty_review_comment FROM faculty_pending_changes WHERE id = ? LIMIT 1', [changeId]);
    console.log('NEW:', newRows[0]);
  } catch (err) {
    console.error('ERR', err && err.message ? err.message : err);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
})();
