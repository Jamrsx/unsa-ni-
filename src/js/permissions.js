// Lightweight client-side permission helper
// Keeps a local copy of the current user's effective permissions
// and exposes `initPermissions()` and `can()` for UI checks.
import { getSocket } from './socket.js'

// Helper to ask the server for the current user's permissions via the
// shared socket. This avoids importing UI modules and prevents circular
// dependency problems when modules try to re-export socket helpers.
function get_my_permissions(callback) {
  try {
    const socket = getSocket()
    if (!socket) return callback && callback({ success: false, permissions: [] })
    const token_session = localStorage.getItem('jwt_token')
    socket.emit('request_get_my_permissions', { token_session })
    socket.off('response_get_my_permissions')
    socket.on('response_get_my_permissions', (data) => {
      callback && callback(data)
    })
  } catch (e) {
    console.error('get_my_permissions failed', e)
    callback && callback({ success: false, permissions: [] })
  }
}

let _myPermissions = []

function initPermissions(cb) {
  get_my_permissions((data) => {
    _myPermissions = (data && data.permissions) ? data.permissions : []
    if (typeof cb === 'function') cb(_myPermissions)
  })
}

function getPermissions() {
  return _myPermissions.slice()
}

// Ensure permissions are initialized and return a Promise that resolves
// to whether the current user has the given permission.
function ensureCan(permission) {
  return new Promise((resolve) => {
    try {
      initPermissions(() => {
        try {
          resolve(can(permission))
        } catch (e) {
          resolve(false)
        }
      })
    } catch (e) {
      resolve(false)
    }
  })
}

// Listen for permission updates dispatched by `admin-dashboard.js` to avoid circular imports
try {
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('my_permissions_updated', (ev) => {
      try {
        const data = ev && ev.detail
        _myPermissions = (data && data.permissions) ? data.permissions : []
        // permission cache updated
      } catch (e) {
        console.error('failed processing my_permissions_updated', e)
      }
    })
  }
} catch (e) {}

// permission can be exact (e.g. 'roles.manage') or a wildcard suffix (e.g. 'roles.assign.*')
function can(permission) {
  if (!permission) return false
  if (_myPermissions.includes(permission)) return true
  if (permission.endsWith('.*')) {
    const prefix = permission.slice(0, -2)
    return _myPermissions.some(p => p.startsWith(prefix + '.'))
  }
  // also support checking against wildcard patterns in input
  if (permission.includes('*')) {
    const regex = new RegExp('^' + permission.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$')
    return _myPermissions.some(p => regex.test(p))
  }
  return false
}

export { initPermissions, can, getPermissions, ensureCan }

// Development helper: expose functions on `window` for quick console debugging
try {
  if (typeof window !== 'undefined') {
    // namespace to avoid clobbering other globals
    window.__app_permissions = window.__app_permissions || {}
    window.__app_permissions.getPermissions = getPermissions
    window.__app_permissions.can = can
    window.__app_permissions.initPermissions = initPermissions
    // convenience aliases for interactive debugging
    window.getPermissions = getPermissions
    window.can = can
    window.initPermissions = initPermissions
  }
} catch (e) {
  // no-op in non-browser environments
}
