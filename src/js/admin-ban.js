// Admin ban helper module
// Purpose: keep the ban implementation separate from `server.js` so it can be
// enabled/implemented later without modifying server core logic.
//
// Usage:
// const { performBan } = require('./src/js/admin-ban')
// const result = await performBan({ db, io }, userId)
// if (result.success) { ... }
//
// By default this module is safe: it will NOT update the database unless the
// environment variable `ENABLE_BAN` is explicitly set to the string 'true'.

async function performBan(/* { db, io }, userId */) {
  // Ban implementation intentionally removed for toast testing.
  // Always return failure so callers receive a server-side message and
  // UI toasts can be verified without any DB or socket side-effects.
  console.log('[admin-ban] performBan called — implementation removed for toast testing')
  return { success: false, message: 'Ban disabled for toast testing' }
}

module.exports = { performBan }
