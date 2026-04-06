const path = require('path');
const { queryReadOnly } = require(path.join(__dirname, '..', 'db'));

(async () => {
  try {
    const cols = await queryReadOnly('DESCRIBE faculty_pending_changes');
    console.log('FACULTY_PENDING_CHANGES_COLUMNS:');
    cols.forEach(c => console.log(' - ' + c.Field + ' (' + c.Type + ')'));
  } catch (err) {
    console.error('ERR', err && err.message ? err.message : err);
    process.exitCode = 1;
  }
})();
