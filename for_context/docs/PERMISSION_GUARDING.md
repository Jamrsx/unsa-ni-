# Permission Guarding — Beginner Guide

Purpose
- Short, practical guide for wiring permission guards on interactive components (client + server).
- Friendly for front-end and back-end beginners; includes concrete snippets and a testing checklist.

Principles
- Client checks are UX-only (enable/disable controls, show/hide). The server is authoritative.
- Explicit per-user denies must override any role-based grant.
- Use a two-layer approach on the client:
  - `can(permission)` — synchronous, used for rendering and disabling controls.
  - `ensureCan(permission)` — async, used immediately before performing an action (open modal / call endpoint).
- Always call server-side `hasPermission(userId, permission)` on endpoints and socket handlers.

Where this repo keeps helpers
- Client permission helpers: `src/js/permissions.js`
- Example guarded component: `src/components/dashboard/admin/content_user.vue`
- Server main routes and permission checks: `server.js`

Quick start (client)
1. Initialize permission cache early (app bootstrap/top-level component):

```js
import { initPermissions } from './src/js/permissions.js'
initPermissions().catch(e => console.error('initPermissions failed', e))
```

2. Render-time guard (sync)

```html
<button :disabled="!can('admin.ban_users')">Ban</button>
```

3. Action-time guard (async, required)

```js
import { ensureCan } from './src/js/permissions.js'
import { toastError } from '../../components/Toast.vue'

async function openViewUser(user) {
  try {
    const allowed = await ensureCan('users.view')
    if (!allowed) {
      toastError('You are not authorized to view user details.')
      return
    }
  } catch (err) {
    console.error('Permission check failed', err)
    toastError('Unable to verify permissions; please refresh the page.')
    return
  }

  // prepare state (example: ensure role selection is populated)
  try { ensureRoleSelection(user) } catch (e) { console.error(e) }

  // show modal (Bootstrap instance or fallback)
  // ...modal show code...
}
```

Notes:
- Use `can()` for UI state to avoid flicker; `ensureCan()` is the last check before doing anything.
- Always `return` when permission is denied so subsequent UI code won't run (prevents modal showing).

Modal fallback tips
- Verify `user` and `user.UserID` before querying DOM.
- If adding a backdrop manually, remove any existing backdrop element with the same id first to avoid duplicates:

```js
const existing = document.getElementById(`backdrop-${modalEl.id}`)
if (existing && existing.parentNode) existing.parentNode.removeChild(existing)
// then append new backdrop
```

Server: authoritative pattern
- Core rules:
  1. Check explicit per-user denies (highest priority).
  2. Check explicit per-user grants.
  3. Check role grants (user -> roles -> role_permissions).
  4. Default: deny.

Pseudocode (MySQL style, adapt to your DB wrapper):

```js
async function hasPermission(userId, permissionName) {
  // 1) explicit deny
  const deny = await db.query(
    'SELECT 1 FROM user_permissions WHERE user_id=? AND permission=? AND is_granted=0',
    [userId, permissionName]
  )
  if (deny.length) return false

  // 2) explicit grant
  const grant = await db.query(
    'SELECT 1 FROM user_permissions WHERE user_id=? AND permission=? AND is_granted=1',
    [userId, permissionName]
  )
  if (grant.length) return true

  // 3) role grants (example join)
  const roleGrant = await db.query(
    `SELECT 1 FROM user_roles ur
     JOIN role_permissions rp ON rp.role_id = ur.role_id
     WHERE ur.user_id = ? AND rp.permission = ? AND rp.is_granted = 1`,
    [userId, permissionName]
  )
  if (roleGrant.length) return true

  return false
}
```

Enforce in HTTP endpoints

```js
app.post('/api/admin/ban-user', async (req, res) => {
  const caller = req.user.id
  if (!await hasPermission(caller, 'admin.ban_users')) {
    return res.status(403).json({ success: false, message: 'Unauthorized' })
  }
  // perform ban
})
```

Enforce in socket handlers

```js
socket.on('request_ban_user', async (data, ack) => {
  if (!await hasPermission(socket.userId, 'admin.ban_users')) {
    return ack({ success: false, message: 'Unauthorized' })
  }
  // proceed
})
```

Common pitfalls
- Checking role grants before explicit user deny — always check explicit denies first.
- Relying only on `can()` — `can()` is only for UI. `ensureCan()` + server checks are required.
- Race between page load and permission cache — call `initPermissions()` early.

Testing checklist
- Manual tests:
  - User without roles: buttons disabled, clicking shows unauthorized toast and modal does not open.
  - User with explicit deny: server returns 403 and UI shows unauthorized toast.
  - Admin user: UI and server actions succeed.
- Automated tests:
  - Unit test `hasPermission` to verify deny -> grant precedence.
  - E2E: clicking guarded UI when unauthorized should not open modal and should show toast; server should respond 403 for forbidden calls.

Migration checklist (apply to each interactive component)
- Use `can()` for rendering/disabled state.
- Add `ensureCan()` immediately before any modal open or server call.
- Show a friendly toast on denial and `return` early.
- Ensure server endpoint/socket calls `hasPermission()`.

UI components: emit-only pattern
- Prefer keeping small UI components (buttons, toggles, image-buttons) permission-agnostic and emit-only.
- The parent (page or container) should perform `ensureCan()` and any API calls. This keeps components reusable across pages with different permission needs.

Example: `toggle-button` (child)

```vue
<toggle-button :name="'problem.publish'" @change="onTogglePublish" />
```

Parent usage with permission guard:

```js
import { ensureCan } from '../src/js/permissions.js'
import { toastError } from '../src/components/Toast.vue'

async function onTogglePublish(value, meta) {
  const allowed = await ensureCan('problem.publish')
  if (!allowed) {
    toastError('Not authorized to change publish state.')
    return
  }

  // Parent performs the API call or socket emit
  // e.g., socket.emit('request_update_publish', { id, publish: value })
}
```

Reasoning:
- Keeps small components decoupled from auth logic.
- Avoids duplicated network calls and makes permission handling centralized.

Modal example (parent performs permission check and shows modal)

```js
import { ensureCan } from '../src/js/permissions.js'
import { toastError } from '../src/components/Toast.vue'

// Example parent method that opens a Bootstrap modal with id 'edit-problem-modal'
async function openEditProblemModal(problemId) {
  // 1) Action-time guard (server-backed)
  const allowed = await ensureCan('problem.edit.own')
  if (!allowed) {
    toastError('You are not authorized to edit this problem.')
    return
  }

  // 2) Prepare modal state (load problem details)
  // e.g., socket.emit('request_get_problem_details', { id: problemId }, (resp) => { /* populate form */ })

  // 3) Programmatically show the modal (Bootstrap 5)
  const el = document.getElementById('edit-problem-modal')
  if (!el) {
    console.error('Modal element not found: edit-problem-modal')
    return
  }
  const bs = window.bootstrap?.Modal.getInstance(el) || new window.bootstrap.Modal(el)
  bs.show()
}
```

Troubleshooting tips
- Add temporary server logs like `[perm-debug]` to print deny/grant results while validating.
- If unauthorized toast shows but modal opens, ensure your action handler `returns` right after denial (common cause).

Where to put these changes in this repo
- Client: update `src/components/...` components to call `ensureCan()` before actions; `content_user.vue` already follows this pattern.
- Server: ensure `hasPermission` functions are used in `server.js` endpoints and socket files under `src/js/conn`.

If you want I can:
- Add more examples tailored to specific components in the repo (view users, ban, role assignment).
- Run a quick scan and output components that likely need `ensureCan()` wired.
