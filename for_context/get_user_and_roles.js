const path = require('path');
const { queryReadOnly } = require(path.join(__dirname, '..', 'db'));

const userId = Number(process.argv[2] || 21);

(async () => {
  try {
    const users = await queryReadOnly('SELECT user_id, username, email, role, created_at FROM users WHERE user_id = ? LIMIT 1', [userId]);
    if (!users || users.length === 0) {
      console.log('NO_USER', userId);
      return;
    }
    console.log('USER:', JSON.stringify(users[0], null, 2));
    const roles = await queryReadOnly('SELECT role_id FROM user_roles WHERE user_id = ?', [userId]);
    console.log('user_roles:', roles.map(r => r.role_id));
  } catch (err) {
    console.error('ERR', err && err.message ? err.message : err);
    process.exitCode = 1;
  }
})();
