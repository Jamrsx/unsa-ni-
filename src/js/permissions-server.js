const db = require('../../db');

// Returns array of permission_name strings representing effective permissions
// for the given userId, honoring explicit user denies.
async function getEffectivePermissions(userId) {
  if (!userId) throw new Error('userId required');
  const sql = `
    SELECT DISTINCT p.permission_name
    FROM permissions p
    LEFT JOIN role_permissions rp ON rp.permission_id = p.permission_id
    LEFT JOIN user_roles ur ON ur.role_id = rp.role_id AND ur.user_id = ?
    LEFT JOIN user_permissions up ON up.permission_id = p.permission_id AND up.user_id = ?
    WHERE (up.is_granted = 1)
      OR (ur.user_id IS NOT NULL AND (up.is_granted IS NULL OR up.is_granted = 1))
  `;
  const rows = await db.queryReadOnly(sql, [userId, userId]);
  return (rows || []).map(r => r.permission_name);
}

// Compute effective permissions for `userId` and emit the
// `response_get_my_permissions` event to any connected sockets
// belonging to that user. Returns the computed permissions array.
async function notifyUserSockets(io, userId) {
  if (!io) throw new Error('io instance required');
  const perms = await getEffectivePermissions(userId).catch((e) => { throw e });
  try {
    if (io && io.sockets && io.sockets.sockets) {
      for (const [sid, s] of io.sockets.sockets) {
        try {
          if (s.user && (s.user.userId === Number(userId) || s.user.user_id === Number(userId))) {
            s.emit('response_get_my_permissions', { success: true, permissions: perms });
          }
        } catch (e) {
          // ignore per-socket emit errors
        }
      }
    }
  } catch (e) {
    // swallow emits errors (caller can log)
    console.error('notifyUserSockets error', e && e.message ? e.message : e);
  }
  return perms;
}

module.exports = { getEffectivePermissions, notifyUserSockets };
