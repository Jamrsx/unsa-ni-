# Faculty Dashboard Guide

This document explains how the Faculty Dashboard works, what configuration it expects (DB, permissions, sockets), and how to validate it end‑to‑end.

It complements:
- `docs/PERMISSIONS_INTEGRATION_GUIDE.md`
- `docs/APPROVAL_FLOW_STRUCTURE.md`
- `docs/PERMISSION_GUARDING.md`

---

## 1. Overview

The Faculty Dashboard is a Vue 3 SPA screen rendered by `src/FacultyDashboard.vue`. It exposes these main sections via `SplitMainWindow`:

- **Dashboard** – totals for users, problems, events.
- **Users** – read‑only list of users (with optional ban/view actions if permitted).
- **Problems / Events / Blogs** – faculty content management with two‑level approvals.
- **Approvals** – faculty view of their own pending changes plus shared approval queues.
- **Edit Account** – profile + avatar management for the signed‑in faculty user.

The dashboard communicates with the backend using Socket.IO helpers from `src/js/faculty-socket-helpers.js` and, for some approval flows, admin helpers from `src/js/admin-dashboard.js`.

---

## 2. Prerequisites

### 2.1 Environment

- Backend Node server running via `node server.js` (listening on `http://localhost:3000`).
- Frontend served by Vite on `http://localhost:5173`.
- Browser has a valid JWT stored in `localStorage` as `token` or `jwt_token` with payload containing:
  - `id` – user ID
  - `username` – display name
  - `email`
  - `role` – must be `faculty` or `admin` to pass RBAC in `FacultyDashboard.vue`.

When the dashboard mounts, `FacultyDashboard.vue` does:

- Reads token via `getToken()`.
- Decodes JWT to verify `role` is `faculty` or `admin`.
- Initializes a socket.io client and passes it to `faculty-socket-helpers.initSocket`.
- Calls various loaders: `loadDashboard`, `loadUsers`, `loadProblems`, `loadEvents`, `loadBlogs`, `loadPendingApprovals`, `loadApprovedApprovals`.

If no token is present or role is not allowed, the faculty dashboard either loads anonymously (with actions disabled) or redirects to `/home.html`.

### 2.2 Database schema requirements

The faculty dashboard relies on the canonical tables used elsewhere:

- `users` – minimal required columns:
  - `user_id` (PK)
  - `username`
  - `email`
  - `created_at`
- `user_roles` – maps users to roles.
- `roles` – provides `role_name` (e.g., `admin`, `faculty`, `user`).
- Content and approvals tables described in `APPROVAL_FLOW_STRUCTURE.md`:
  - `content_items`, `content_problems`, `content_events`, `content_blogs`.
  - `problems`, `events`, `blogs`.
  - `approvals` (Level 1 queue).
  - `faculty_pending_changes` (faculty draft/pending changes).

**Important:** The faculty users socket handlers do **not** rely on a `profiles` table. If a `profiles` table exists in your DB, it is not required for the dashboard to function.

---

## 3. Permissions

Permission checks are enforced server‑side in `src/js/conn/socket/dashboard-faculty-socket.js`.

### 3.1 Users list / view

For `request_get_faculty_users` and `request_view_faculty_user`, the server allows access if **any** of the following is true for the current user:

- `faculty.view_users`
- `users.view`
- `users.manage`

This means you can grant either the legacy `users.view`/`users.manage` permissions or the more specific `faculty.view_users` permission and the endpoint will work.

The permission evaluation is logged as:

```text
[faculty:get_users] request by user=<id> faculty.view_users=<bool> users.view=<bool> users.manage=<bool>
```

If none of these is true, the server returns:

```json
{ "success": false, "message": "Forbidden" }
```

and the Users table in the faculty dashboard will show an empty state.

### 3.2 Approvals

For faculty approvals, permissions are split:

- **Faculty pending changes** (Level 2) use `faculty_pending_changes` and the faculty socket helpers in `faculty-socket-helpers.js`.
- **Shared Level 1 approvals queue** uses the `approvals` table and the admin socket handlers.

Faculty users generally need the `approvals.manage` permission or an equivalent role‑based override to:

- Approve/deny/forward pending changes.
- See the Approvals tab behave like the admin queue when they have elevated rights.

See `APPROVAL_FLOW_STRUCTURE.md` for full details.

---

## 4. Backend socket handlers

### 4.1 Users list (fixed implementation)

Handler in `src/js/conn/socket/dashboard-faculty-socket.js`:

- Event: `request_get_faculty_users`
- Response: `response_get_faculty_users`

Query (after fix):

```sql
SELECT 
  u.user_id,
  u.username,
  u.email,
  u.created_at,
  SUBSTRING_INDEX(
    GROUP_CONCAT(DISTINCT r.role_name ORDER BY r.role_name ASC), ',', 1
  ) AS role
FROM users u
LEFT JOIN user_roles ur ON u.user_id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.role_id
GROUP BY u.user_id
ORDER BY u.created_at DESC;
```

Key points:

- **No dependency on a `profiles` table** – earlier versions attempted to select `p.first_name`/`p.last_name` from `profiles`, causing `ER_BAD_FIELD_ERROR` on DBs without that table.
- The first role alphabetically is surfaced as `role` for display in the Users table.

### 4.2 View single user

Handler in `dashboard-faculty-socket.js`:

- Event: `request_view_faculty_user`
- Response: `response_view_faculty_user`

Query (after fix):

```sql
SELECT u.user_id, u.username, u.email, u.created_at
FROM users u
WHERE u.user_id = ?
LIMIT 1;
```

This powers the "View" button in the Users table and the modal defined in `src/components/dashboard/faculty/modals/user-view-modal.vue`.

### 4.3 Pending approvals (faculty)

Faculty‑specific pending approvals are served by:

- Event: `request_faculty_pending_changes`
- Response: `response_faculty_pending_changes`

The response shape is:

```json
{
  "success": true,
  "pending": [
    {
      "id": 123,
      "table_name": "events" | "blogs" | "problems",
      "change_type": "create" | "update" | "delete",
      "proposed_data": { ... },
      "status": "pending_faculty_review" | "pending_admin" | ...,
      "faculty_owner_id": <user_id>,
      ...
    }
  ]
}
```

These rows are consumed by both the Problems/Events/Blogs tabs and the Approvals tab.

---

## 5. Frontend wiring

### 5.1 Socket helpers

Faculty socket helpers live in `src/js/faculty-socket-helpers.js`:

- `initSocket(io)` – set the global socket instance.
- `getFacultyUsers({ token_session }, cb)` – emits `request_get_faculty_users` and listens for `response_get_faculty_users`.
- `viewFacultyUser({ token_session, user_id }, cb)`.
- `getFacultyProblems`, `getFacultyEvents`, `getFacultyBlogs`.
- `getFacultyPendingApprovals({ token_session }, cb)`.
- `approveFacultyChange`, `rejectFacultyChange`, etc.

`FacultyDashboard.vue` calls these helpers after initializing the socket in `onMounted()`.

### 5.2 Users tab

- Parent component: `src/FacultyDashboard.vue`
  - `user_rows` is populated by `loadUsers()`:

  ```js
  async function loadUsers() {
    const token = getToken()
    try {
      console.log('[Faculty] loadUsers: requesting faculty users')
      facultySocket.getFacultyUsers({ token_session: token }, (res) => {
        console.log('[Faculty] response_get_faculty_users', res)
        if (res && res.success) {
          user_rows.value = res.users || []
        } else {
          user_rows.value = []
          if (res && res.message) {
            try { toastError(res.message) } catch (e) {}
          }
        }
      })
    } catch (e) {
      console.warn('[Faculty] loadUsers failed', e)
      user_rows.value = []
    }
  }
  ```

- Child component: `src/components/dashboard/faculty/content_users.vue`
  - Receives `user_rows`, `perms`, `sessionToken`, `socket` as props.
  - Filters/searches/sorts `user_rows` into `filteredUsers`.
  - Uses `facultySocket.viewFacultyUser` and `facultySocket.banUser` when appropriate.

If the backend returns `success: true` and the user has the right permissions, the Users table is populated and the View/Ban actions work.

### 5.3 Approvals tab (faculty pending changes)

- Parent: `FacultyDashboard.vue`
  - Uses `loadPendingApprovals()` to hydrate `pending_approvals` from the
    faculty socket endpoint instead of the admin‑only approvals API:

  ```js
  async function loadPendingApprovals() {
    try {
      const token = sessionToken.value || getToken()
      if (!token) {
        pending_approvals.value = []
        return
      }

      await new Promise((resolve, reject) => {
        try {
          facultySocket.getFacultyPendingApprovals({ token_session: token }, (resp) => {
            if (!resp || !resp.success) {
              return reject(new Error(resp?.message || 'Failed to load pending approvals'))
            }

            const pending = Array.isArray(resp.pending) ? resp.pending : []
            pending_approvals.value = pending
            resolve()
          })
        } catch (e) {
          reject(e)
        }
      })
    } catch (e) {
      console.warn('[Faculty] loadPendingApprovals failed', e)
      pending_approvals.value = []
    }
  }
  ```

- Child: `src/components/dashboard/faculty/content_approvals.vue`
  - On mount, also calls `facultySocket.getFacultyPendingApprovals` and
    emits `refresh-pending-approvals` so the parent can sync its
    `pending_approvals` array.
  - Splits rows into events/blogs/problems based on `content_type` /
    `table_name` / `change_type`.
  - Delegates approve/deny/forward actions back up to `FacultyDashboard.vue`.
  - Uses per‑type tables in
    `src/components/dashboard/faculty/faculty_approval_set/` for
    Problems/Events/Blogs with **View**, **Accept**, **Deny**, and
    **Forward** buttons. Permission guards mirror the rest of the faculty
    dashboard (see `docs/PERMISSION_GUARDING.md`):
    - Actions are disabled unless `perms.canManageApprovals` is true.
    - This flag is set via a lightweight permission probe in
      `refreshPermissions()`.

  - The Approvals tab is an **alternative front‑door** to the same
    Level 1 faculty approval flows already wired in the Problems/Events/Blogs
    tabs:
    - For **faculty_pending_changes‑backed rows** (`change_id` present):
      - Approve → `approveFacultyChange` (moves the change into
        `status = 'pending_admin'` and, when appropriate, creates/links an
        `approvals` row so admins see it in their queues).
      - Deny → `rejectFacultyChange` (`status = 'rejected'` in
        `faculty_pending_changes`; no further Level 2 review required).
    - For **approvals‑backed rows** (no `change_id`, but have
      `approval_id` + content id):
      - Problems: delegate to `approve_question` / `deny_question`.
      - Events: delegate to the event approve/deny helpers.
      - Blogs: delegate to the blog approve/deny helpers.
    - These helpers are the same ones used by the per‑type Pending tabs on
      the faculty dashboard, so behavior is consistent regardless of
      which route the faculty user takes.

This separation avoids faculty accidentally calling the admin‑only `get_pending_approvals` helper (which would return `Unauthorized: Admin access required`).

---

## 6. How to enable a new faculty account

To make a new user fully functional in the Faculty Dashboard:

1. **Create the user record** in `users` (and `user_roles`) with role `faculty`.
2. **Ensure JWT payload** (used for `token` / `jwt_token`) includes `role: "faculty"`.
3. **Grant permissions** (via your existing permissions system) so that at minimum:
   - `users.view` **or** `faculty.view_users` is true – to list/view users.
   - `approvals.manage` (or equivalent) – if the user should manage approvals.
4. **Sign in** through the normal login flow so the browser’s `localStorage` has the correct token.
5. **Open the Faculty Dashboard** route.

Validation checklist:

- Console shows:
  - `[Faculty] FacultyDashboard.vue loaded`
  - `[Faculty] RBAC check passed, user role: faculty`
  - `[Faculty] Socket initialized for faculty dashboard`
- Network/server logs show successful socket authentication for the faculty user ID.
- `response_get_faculty_users` in the console is `{ success: true, users: [...] }`.
- Approvals tab loads without an "Admin access required" message and shows any relevant pending rows.

---

## 7. Troubleshooting

### 7.1 Users tab is empty

Check:

- Browser console for `response_get_faculty_users`:
  - If `success: false` and `message: "Forbidden"`:
    - Ensure the user has at least one of: `faculty.view_users`, `users.view`, `users.manage`.
  - If `success: false` and `message: "Failed to load users"`:
    - Check server logs for SQL errors.
    - Confirm the `users`, `user_roles`, and `roles` tables exist and match the query in this guide.

### 7.2 "Admin access required" appears in faculty dashboard

- Ensure `FacultyDashboard.vue` is **not** calling admin‑only helpers such as `get_pending_approvals` from `admin-dashboard.js`.
- After the current fixes, the dashboard uses `facultySocket.getFacultyPendingApprovals` instead.
- If you reintroduce admin helpers, guard them behind a role check or limit them to the admin dashboard only.

### 7.3 Socket not initializing

If you do not see `[Faculty] Socket initialized for faculty dashboard`:

- Ensure `io` is imported from `socket.io-client` in `FacultyDashboard.vue`.
- Confirm `apiBase` resolves to `http://localhost:3000` when running via Vite.
- Check server logs for handshake errors; the token must be present and recognized in `active_sessions`.

---

This guide should give you everything needed to:

- Understand how the Faculty Dashboard interacts with the backend.
- Configure DB and permissions correctly.
- Debug missing users or approvals in the faculty‑side UI.

---

## 8. Recent deny/approval sync update

- A recent fix synchronizes deny actions across the Admin and Faculty pipelines so a single deny now marks both the `approvals` row and any related `faculty_pending_changes` row as rejected/denied where applicable. See `docs/DASHBOARD_DENY_SYNC_GUIDE.md` for full details and SQL snippets to diagnose or manually sync rows.
- Faculty-level rejections (`rejectFacultyChange`) also update the corresponding `approvals` row so a second deny is no longer required.
- Admin-level denies for Events and Blogs now mirror the denial into `faculty_pending_changes`, and emit broadcasts so connected faculty dashboards refresh pending lists.

- Recent Implementation Notes (2026-01-06):

- Core approval transitions were synchronized across the faculty and admin pipelines so status changes are reflected in both `faculty_pending_changes` and `approvals` where applicable.
- Re-pend flows initiated from the faculty "My" screens (My Problem/My Event/My Blog → Edit → Update → Move to Pending) were wired to create or refresh `faculty_pending_changes` rows and, when necessary, call the approvals sync helper so peer faculty and admins immediately see re-pended items.
- The faculty central pending list now excludes items created by the requesting faculty user.
- Recommended verification: perform end-to-end tests across three roles (Faculty A, Faculty B, Admin) for Problems/Events/Blogs using the exact UI flows and verify no duplicates and correct visibility.

See `docs/APPROVAL_FLOW_STRUCTURE.md` and `docs/DASHBOARD_DENY_SYNC_GUIDE.md` for implementation details and troubleshooting steps.
