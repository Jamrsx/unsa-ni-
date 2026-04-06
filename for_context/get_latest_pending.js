const path = require('path');
const { queryReadOnly } = require(path.join(__dirname, '..', 'db'));

(async () => {
  try {
    const rows = await queryReadOnly(`
      SELECT id, faculty_id, status, proposed_data
      FROM faculty_pending_changes
      WHERE table_name = 'problems'
      ORDER BY id DESC
      LIMIT 1
    `);
    if (!rows || rows.length === 0) {
      console.log('NO_PENDING_ROWS');
      return;
    }
    const r = rows[0];
    console.log('PENDING_ROW_ID=' + r.id);
    console.log('FACULTY_ID=' + r.faculty_id);
    console.log('STATUS=' + r.status);
    console.log('PROPOSED_DATA=' + JSON.stringify(r.proposed_data));
  } catch (err) {
    console.error('ERR', err && err.message ? err.message : err);
    process.exitCode = 1;
  }
})();
