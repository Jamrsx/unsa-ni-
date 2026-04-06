Permissions Integration Guide
=============================

Summary
-------
This document explains the root cause of the "modal opens despite roles.manage denied" bug, what we changed to fix it, and a practical checklist and tests to follow when adding dashboard integrations for other permissions.

For how these permissions plug into the **two-level approvals system**
for Problems/Events/Blogs (faculty + admin), see also:

- `docs/APPROVAL_FLOW_STRUCTURE.md`

Root cause
----------
1. Server-side `get_my_permissions` returned role-granted permissions even when a user had an explicit deny (user_permissions.is_granted = 0). That meant the client could receive a permission list that still included `roles.manage` after navigation or certain UI flows.
2. Client-side stale-cache behavior: the client caches permissions in `_myPermissions`. Without an immediate refresh after server-side changes, the cached list could be out-of-sync with DB state, producing inconsistent UI behavior.
3. A combination of (1) + (2) produced the observed symptom: server sent a permissive list or the client cache stayed permissive, so modals opened even though a user override existed.

Fixes applied
--------------
- Server: `src/js/conn/socket/dashboard-admin-socket.js`
  - `request_get_my_permissions` SQL updated to compute "effective" permissions that honor explicit user denies. (Now returns permissions where `up.is_granted = 1` OR role grants when `up.is_granted IS NULL OR up.is_granted = 1`.)
- Client: `src/js/permissions.js`
  - Added `initPermissions()` re-check usage and exposed helpers for debug (`getPermissions()`, `can()` on `window`).
- Modal guard: `src/components/modal.vue`
  - Added prop-driven guards (`requirePermission`, `requireAnyPermissions`) and calls `initPermissions()` to refresh before final block.
- Admin page: `src/components/dashboard/admin/content_admin.vue`
  - Removed duplicate early toasts and rely on modal guard for authoritative behavior.

Why it sometimes "worked" earlier
----------------------------------
- If the server-side `get_my_permissions` response included `roles.manage` (because the SQL ignored explicit denies), the client would receive that permission on navigation and the modal would open — which looked like "permissions still enabled." Conversely, if the client cache had been refreshed after a change or the server returned a correct effective list, the modal would be blocked.

Why removing `user_permissions` changed behavior
------------------------------------------------
- Removing the `user_permissions` override removes the explicit deny in DB, so role grants become effective again: server will include the role permission in `get_my_permissions` and the modal opens. However the client still uses its cached `_myPermissions` until `initPermissions()` runs or `my_permissions_updated` fires — so the UI may show stale values until a refresh.

Practical checklist for future permission integrations
-----------------------------------------------------
1. Server-side: always compute "effective" permissions for `get_my_permissions` —
   - user override `is_granted = 1` => include
   - user override `is_granted = 0` => exclude (deny overrides role)
   - role grant and (no user override OR user override = 1) => include
2. Client-side cache:
   - Keep a single canonical cache (`src/js/permissions.js` with `initPermissions`, `can`, `getPermissions`).
   - Call `initPermissions()` on app start, on successful auth, after any action that may change current user's permissions (e.g., saving own overrides, role changes), and before showing guarded UI.
   - Emit a `my_permissions_updated` event with the authoritative payload (this is how `permissions.js` listens).
3. UI guards:
   - Prefer component-level prop-driven guards (e.g. `requirePermission`, `requireAnyPermissions`) so callers don't replicate logic. Keep component guard as the authoritative enforcement.
   - If a page offers faster UX (e.g., inline disabled button), that's fine — but don't duplicate enforcement as the only check. The modal/component must always block unsafe shows.
4. Debugging helpers:
   - Expose `getPermissions()` and `can()` on `window.__app_permissions` during development.
   - Add a small debug badge or console logs when developing new permission flows.
5. Tests:
   - Add socket-level tests for `request_get_my_permissions` verifying explicit deny and grant semantics.
   - Add an E2E (or manual test steps) that toggles user override -> refreshes -> checks `can()` and UI guards.

How to verify locally (commands)
---------------------------------
- Check DB state for user `<id>`:
```bash
node scripts/query_admin_permissions_details.js <userId>
```
- Set or remove a user override:
```bash
# grant
node scripts/set_user_permission.js 4 roles.manage 1
# deny
node scripts/set_user_permission.js 4 roles.manage 0
```
- Restart backend (so socket code reloads) and hard-reload client.
- In browser console after sign-in:
```javascript
getPermissions()
can('roles.manage')
```
- Confirm modal behavior: click Edit/Demote; if `can()` is false, modal must not open and toast shown.

Debugging flow when things are inconsistent
-------------------------------------------
1. Run `node scripts/query_admin_permissions_details.js <actorId>` to verify server-side effective state.
2. In the browser, run `getPermissions()` to inspect the client cache.
3. If server shows deny but client shows allow:
   - call `initPermissions()` in console, check `getPermissions()` again.
   - confirm socket connectivity and that `response_get_my_permissions` returns correct payload (use network/socket logs).
4. If server shows allow but you expect deny, inspect `user_permissions` table for an explicit override or missing delete.

Files to reference
------------------
- server permission endpoint: `src/js/conn/socket/dashboard-admin-socket.js`
- client cache: `src/js/permissions.js`
- modal guard: `src/components/modal.vue`
- admin UI: `src/components/dashboard/admin/content_admin.vue`
- debug/query scripts: `scripts/query_admin_permissions_details.js`, `scripts/set_user_permission.js`
 - approvals design & flows: `docs/APPROVAL_FLOW_STRUCTURE.md`

Notes
-----
- The authoritative permission decision must always be server-side; the client-only cache is for UX and gating, not security. Server socket endpoints that perform sensitive updates should still verify the caller's permissions.

---

(Guide generated by assistant; save or tweak as needed.)

## Recent emergency fixes applied (2025-12-23)

- Fixed server startup SyntaxError: a stray `await`/notify block was left at top-level in `server.js`, causing "await is only valid in async functions". I removed the stray block and restored a proper `getLobbyDetails(lobbyId)` helper to fix the mismatched brace and server startup.
- Centralized notify logic into `src/js/permissions-service.js` (exports `getEffectivePermissions(userId)` and `notifyUserSockets(io,userId)`), and added a secure admin endpoint `POST /admin/notify-permissions` in `server.js` to push permission updates to connected sockets.
- Updated admin socket handlers to call the permissions helper so `response_get_my_permissions` is emitted immediately after permission/role changes.
- UI: added `requirePermission` (default `problem.create`) to `src/components/dashboard/create_question_modal.vue` and passed it to the inner `Modal` so the modal-level guard (`src/components/modal.vue`) prevents opening when `can('problem.create')` is false (it calls `initPermissions()` to refresh before final decision).

### Quick verification steps
1. Restart server:
```powershell
node server.js
# or
npm run dev
```
2. After changing DB directly, notify the client (admin token required):
```bash
curl -X POST -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" \
   -d '{"target_user_id":4}' http://localhost:3000/admin/notify-permissions
```
3. In browser console after sign-in:
```javascript
getPermissions(); // inspect cache
initPermissions(); // force refresh
getPermissions(); // confirm updated
can('problem.create'); // should reflect deny/grant
```
4. Click Create: if `can('problem.create')` is false, modal must not open and a toast will be shown by the modal guard.
