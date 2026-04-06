Permissions Integration Guide
=============================

Summary
-------
This document explains the root cause of the "modal opens despite roles.manage denied" bug, what we changed to fix it, and a practical checklist and tests to follow when adding dashboard integrations for other permissions.

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

Notes
-----
- The authoritative permission decision must always be server-side; the client-only cache is for UX and gating, not security. Server socket endpoints that perform sensitive updates should still verify the caller's permissions.

---

(Guide generated by assistant; save or tweak as needed.)

## Recent emergency fixes applied (2025-12-23)

- Fixed server startup SyntaxError: a stray `await`/notify block had been accidentally left at top-level inside `server.js`, which produced "await is only valid in async functions". I removed that stray block and restored a proper `getLobbyDetails(lobbyId)` helper to repair the mismatched brace and flow. File: `server.js`.
- Centralized notify logic into `src/js/permissions-service.js` (exports `getEffectivePermissions(userId)` and `notifyUserSockets(io,userId)`) and added a secure admin endpoint `POST /admin/notify-permissions` in `server.js` to allow pushing permission updates to connected sockets.
- Ensured socket handlers (admin socket) call the permissions helper to compute and emit `response_get_my_permissions` after permission/role changes so clients refresh their caches promptly.
- UI guard improvement: added a `requirePermission` prop (default `problem.create`) to `src/components/dashboard/create_question_modal.vue` and passed it into the inner `Modal` so the modal-level guard (`src/components/modal.vue`) will prevent opening when `can('problem.create')` is false (it calls `initPermissions()` to refresh before final decision).

### Quick verification steps
1. Restart server:
```powershell
node server.js
# or
npm run dev
```
2. In the admin console or with an admin token, call the notify endpoint after changing DB manually:
```bash
curl -X POST -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" \
   -d '{"target_user_id":4}' http://localhost:3000/admin/notify-permissions
```
3. On the client: open DevTools console and run:
```javascript
getPermissions(); // view cached perms
initPermissions(); // force refresh from server
getPermissions(); // confirm updated list
can('problem.create'); // should reflect deny/grant
```
4. Click the Create button: if `can('problem.create')` is false, the modal must not open and a toast/error will be shown by the modal guard.

Permissions Toggle (client helper)
----------------------------------
This app exposes a small client permission helper in `src/js/permissions.js` which the UI and components use to decide whether to show guarded actions.

Key API
- `initPermissions(cb)` — refreshes the client's cached effective permissions from the server. Accepts an optional callback called with the permissions array.
- `getPermissions()` — returns a shallow copy of the cached permissions array.
- `can(permission)` — returns `true` if the current cache contains the permission; supports suffix wildcards (`roles.assign.*`) and `*` patterns.

Behavioral notes
- `permissions.js` listens for the `my_permissions_updated` event (dispatched by the socket client when `response_get_my_permissions` is received) and updates the cache automatically.
- Components should call `initPermissions()` when they need a fresh authoritative check (for example, right before opening a guarded modal) — the modal guard implementation already does this as a fallback when permission is initially absent in the cache.

Quick usage examples (browser console)
```
// refresh cache
initPermissions()

// check permission
can('roles.manage') // -> true/false

// inspect the cache
getPermissions()
```

Debug aliases
- During development the helper functions are exposed on `window.__app_permissions` and as convenience aliases `window.getPermissions`, `window.can`, `window.initPermissions`.

Toggle / verify scripts
- Use `scripts/set_user_permission.js` to apply a deterministic grant/deny for a user and `scripts/query_admin_permissions_details.js` to inspect the DB/annotated effective result.

Integration tip
- After applying a change (role/override) from an admin flow, the server now emits the authoritative `response_get_my_permissions` to any sockets belonging to the affected user — that will cause `permissions.js` to receive the `my_permissions_updated` event and refresh the client cache automatically.

Applying problem-topic permissions to Question Set & Approvals
-----------------------------------------------------------
Summary
- The admin Question Set tables (`Admin_question_table`, `User_question_table`, `Pending_question_table`) and the Approvals UI now perform client-side guards that respect per-topic permissions in addition to existing global permissions.

Client changes made
- Edit: requires `problem.edit.any` OR `problem.edit.<topic>` (any topic on the problem) to open edit flows.
- Delete: requires `problem.delete.any` OR `problem.delete.<topic>`.
- Approve / Deny (pending): requires `approvals.manage` OR `roles.manage` OR `problem.approvals.manage.<topic>`.
- Create: `Create New Question` button is shown only when `problem.create` (or `problem.create.*`) or `problem.approvals.manage` is available; the button refreshes reactively when permissions update.
- Topic normalization: client checks map topic names to permission suffixes by lowercasing and replacing non-alphanumeric characters with underscores (e.g. "Dynamic Programming" -> `dynamic_programming`). Adjust `normalizeTopic()` if your permission names use a different convention.

How the guards work (pattern)
- Authoritative guard: component-level modal guard (`src/components/modal.vue`) remains the final gate. It accepts `requirePermission` and `requireAnyPermissions` props and calls `initPermissions()` to refresh before showing.
- Table/button guards: tables perform an early fast-check with `can()` (for UX) and rely on modal guard for final blocking. Server endpoints must still validate permissions.
- Topic permissions: checks use `can('problem.edit.<topic>')` or `can('problem.approvals.manage.<topic>')` (or a wildcard like `problem.edit.*`). The UI accepts either a global permission or any matching topic permission (OR semantics).

Local verification checklist (what to test and expected behavior)
- Setup (grant/revoke test):
   - Grant per-topic approval: `node scripts/set_user_permission.js <userId> problem.approvals.manage.dynamic_programming 1`
   - Revoke: `node scripts/set_user_permission.js <userId> problem.approvals.manage.dynamic_programming 0`
- In browser console (after sign-in):
   - Run `getPermissions()` and `can('problem.approvals.manage.dynamic_programming')` to inspect effective permissions.
   - Call `initPermissions()` to force refresh if needed.
- Behavior expectations:
   - Create button: visible only when `can('problem.create')` or `can('problem.approvals.manage')` (or wildcard). After changing permissions via scripts, run `initPermissions()` and the button visibility should update without a full reload.
   - Edit/Delete in Admin table: clicking Edit or Delete opens the modal or performs the action only if the user has `problem.edit.any` / `problem.delete.any` or `problem.edit.<topic>` / `problem.delete.<topic>` for at least one topic on the problem; otherwise a toast error appears and the action is blocked.
   - Pending Approvals: Approve/Deny buttons require `approvals.manage` or `roles.manage` OR a per-topic `problem.approvals.manage.<topic>`; if not permitted, clicking shows an authorization toast and no socket emit occurs.
   - Modal guard: even if a table button is visible, `Modal` will refresh permissions on show and block the modal if the user lacks the required permission (authoritative enforcement).
- Verify server-side enforcement:
   - For each guarded socket endpoint (e.g., `request_create_problem`, `request_update_problem`, `request_approve_problem`), ensure the server re-checks permissions (deny in DB overrides role). Use `node scripts/query_admin_permissions_details.js <userId>` to confirm server-side state.

Potential mismatches to watch for
- Topic name normalization mismatch between how you name permissions in DB and the client normalization rule will cause missed checks. If your DB stores topic-based permissions differently (hyphens, spaces, topic IDs), update the client `normalizeTopic()` function accordingly.
- The client-only `can()` checks are UX gating only — server endpoints must still validate permissions.

Files changed as part of this integration (client)
- `src/components/dashboard/admin/admin_question_set/admin_question_table.vue` — guarded Edit/Delete with per-topic checks
- `src/components/dashboard/admin/admin_question_set/user_question_table.vue` — guarded Edit/Delete with per-topic checks
- `src/components/dashboard/admin/admin_question_set/pending_question_table.vue` — guarded Approve/Deny with per-topic fallback
- `src/components/dashboard/admin/content_question_set.vue` — reactive Create button visibility
- `src/components/dashboard/admin/content_faculty_approvals.vue` — topic-aware approvals checks for faculty pending changes

Quick debugging tips
- Console helpers: `getPermissions()`, `can('<perm>')`, `initPermissions()` are exposed on the window for quick checks.
- If UI still shows permissive behavior after server changes: call `initPermissions()` in the browser console to force a refresh and re-check caches.

Button / Modal UX behavior (policy)
- Buttons that open modals now use programmatic opens rather than Bootstrap's automatic `data-bs-toggle` behavior. This means:
   - Buttons remain visible and pressable for consistent UX.
   - If the user lacks the required permission, clicking the button displays an authorization toast (via `toastError`) and the modal is NOT opened.
   - If the user has permission, the click handler will perform any needed checks then programmatically open the modal (so the modal guard still runs a final authoritative check).
This keeps the UI responsive while ensuring the modal never appears without an authoritative permission check.

Faculty dashboard note
---------------------
- The faculty dashboard will follow the same ModalButton programmatic-open policy. Before adding faculty-specific modals, ensure the following:
   - All `ModalButton` usages should include `:auto="false"` so clicks can be intercepted by permission checks and toasts.
   - Update any faculty flow that previously relied on Bootstrap's `data-bs-toggle` to call the modal programmatically (e.g., via the `Modal` component's open method) after `can()` verifies permission and `initPermissions()` is called when necessary.
   - Document any topic-based permission naming conventions you expect faculty permissions to use (the client normalizes topics to lowercased underscore-separated suffixes by default).

Why this matters for faculty
---------------------------
- Faculty flows often mix role-level and per-topic permissions (e.g., `roles.assign.faculty` vs `problem.approvals.manage.<topic>`). Keeping buttons pressable but blocked by toast messages avoids confusing UI where a modal suddenly opens and then fails later. It also provides a clear, consistent feedback path for faculty users when they lack permissions.

Checklist before merging faculty dashboard changes

1. Replace `ModalButton` auto-opens with `:auto="false"` across faculty components.
2. Ensure each modal usage has matching guarded click handlers that call `can()` and `toastError()` on denial.
3. Run `initPermissions()` where needed (on mount or before opening modals that depend on up-to-date permissions).
4. Add a short E2E that toggles a faculty permission and verifies the toast prevents modal opening.

Add this note to the faculty onboarding docs so integrators follow the same UX/security pattern.
