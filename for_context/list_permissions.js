// list_permissions.js - lists all permissions from the permissions table
const path = require('path');
const { queryReadOnly } = require(path.join(__dirname, '..', 'db'));

async function main() {
  try {
    const rows = await queryReadOnly(`SELECT permission_id, permission_name, description, category FROM permissions ORDER BY permission_id`);
    if (!rows || rows.length === 0) {
      console.log('No permissions found');
      process.exit(0);
    }
    console.log('Permissions:');
    rows.forEach(r => {
      console.log(`[${r.permission_id}] ${r.permission_name} - ${r.description || ''} ${r.category ? '('+r.category+')' : ''}`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Error listing permissions:', err && err.message ? err.message : err);
    process.exit(2);
  }
}

if (require.main === module) main();

module.exports = { main };
