// inspect_user_permissions.js
// Prints effective permissions for a user and highlights approval-related ones.
// Usage:
//   node for_context/inspect_user_permissions.js [user_id]

const path = require('path');
const { pool } = require(path.join(__dirname, '..', 'db'));

async function getUserRoles(conn, userId) {
  const [rows] = await conn.query('SELECT role_id FROM user_roles WHERE user_id = ?', [userId]);
  return rows.map(r => r.role_id);
}

async function getPermissions(conn) {
  const [rows] = await conn.query('SELECT permission_id, permission_name FROM permissions');
  const map = new Map();
  rows.forEach(r => map.set(r.permission_name, r.permission_id));
  return map;
}

async function getRoleGrants(conn, roleIds) {
  if (!roleIds.length) return new Set();
  const placeholders = roleIds.map(() => '?').join(',');
  const [rows] = await conn.query(
    `SELECT DISTINCT permission_id FROM role_permissions WHERE role_id IN (${placeholders})`,
    roleIds
  );
  return new Set(rows.map(r => r.permission_id));
}

async function getUserOverrides(conn, userId) {
  const [rows] = await conn.query(
    'SELECT permission_id, is_granted FROM user_permissions WHERE user_id = ?',
    [userId]
  );
  const overrides = new Map();
  rows.forEach(r => overrides.set(r.permission_id, !!r.is_granted));
  return overrides;
}

function effectiveGrant(permissionId, roleGrants, overrides) {
  if (overrides.has(permissionId)) return overrides.get(permissionId);
  return roleGrants.has(permissionId);
}

async function main() {
  const userId = Number(process.argv[2] || 21);
  const conn = await pool.getConnection();
  try {
    const roleIds = await getUserRoles(conn, userId);
    const permMap = await getPermissions(conn);
    const roleGrants = await getRoleGrants(conn, roleIds);
    const overrides = await getUserOverrides(conn, userId);

    const targetPerms = [
      'problem.approvals.manage','problem.approvals.manage','event.approvals.manage','event.approvals.manage','blog.approvals.manage','blog.approvals.manage',
      'problem.auto_approve','event.auto_approve','blog.auto_approve'
    ];

    console.log(`User ${userId} roles: ${roleIds.join(', ') || '(none)'}`);
    console.log('\nApproval-related permissions:');
    targetPerms.forEach(name => {
      const pid = permMap.get(name);
      if (!pid) {
        console.log(` - ${name}: (missing in permissions table)`);
        return;
      }
      const eff = effectiveGrant(pid, roleGrants, overrides);
      const role = roleGrants.has(pid) ? 'role' : 'no-role';
      const ov = overrides.has(pid) ? `override=${overrides.get(pid)}` : 'no-override';
      console.log(` - ${name} [id=${pid}]: effective=${eff} (${role}, ${ov})`);
    });

    // Print any explicit user overrides present
    if (overrides.size) {
      console.log('\nUser overrides:');
      for (const [pid, val] of overrides.entries()) {
        console.log(` - permission_id=${pid} -> is_granted=${val}`);
      }
    } else {
      console.log('\nUser overrides: none');
    }
  } catch (err) {
    console.error('Error inspecting permissions:', err && err.message ? err.message : err);
    process.exitCode = 1;
  } finally {
    conn.release();
  }
}

if (require.main === module) main();
