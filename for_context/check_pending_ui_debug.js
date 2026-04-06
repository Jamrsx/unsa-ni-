const path = require('path');
const { queryReadOnly } = require(path.join(__dirname, '..', 'db'));

(async () => {
  try {
    const pending = await queryReadOnly(`
      SELECT id, faculty_id, status, proposed_data, created_at
      FROM faculty_pending_changes
      WHERE table_name = 'problems'
      ORDER BY id DESC
      LIMIT 5
    `);

    if (!pending || pending.length === 0) {
      console.log('NO_PENDING_ROWS');
      return;
    }

    console.log('LATEST_PENDING_ROWS:');
    pending.forEach(r => {
      console.log('---');
      console.log('id=' + r.id);
      console.log('faculty_id=' + r.faculty_id);
      console.log('status=' + r.status);
      console.log('created_at=' + r.created_at);
      console.log('proposed_data=' + JSON.stringify(r.proposed_data));
    });

    const facultyId = pending[0].faculty_id;
    const users = await queryReadOnly(`SELECT id, username, email, role_id FROM users WHERE id = ? LIMIT 1`, [facultyId]);
    console.log('\nUSER_RECORD:');
    if (!users || users.length === 0) {
      console.log('User not found for id=' + facultyId);
    } else {
      console.log(JSON.stringify(users[0], null, 2));
    }

    const count = await queryReadOnly(`SELECT COUNT(*) as c FROM faculty_pending_changes WHERE table_name='problems' AND faculty_id = ?`, [facultyId]);
    console.log('\nPENDING_COUNT_FOR_CREATOR: ' + (count && count[0] ? count[0].c : 0));

  } catch (err) {
    console.error('ERR', err && err.message ? err.message : err);
    process.exitCode = 1;
  }
})();
