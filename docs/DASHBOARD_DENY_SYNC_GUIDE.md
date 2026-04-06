**Admin & Faculty Dashboard — Deny Sync Guide**

**Overview**:
- **Purpose**: Describe recent changes that synchronize deny actions between admin and faculty dashboards, explain why they were made, and provide steps to test and fix common inconsistencies.

**Files Changed**:
- **Server (admin socket)**: [src/js/conn/dashboard_admin_and_user_socket.js](src/js/conn/dashboard_admin_and_user_socket.js)
- **Server (faculty socket)**: [src/js/conn/dashboard-faculty-socket.js](src/js/conn/dashboard-faculty-socket.js)
- **Faculty UI orchestration**: [src/FacultyDashboard.vue](src/FacultyDashboard.vue)
- **Admin helpers (frontend)**: [src/js/admin-dashboard.js](src/js/admin-dashboard.js)
- **Faculty helpers (frontend)**: [src/js/faculty-socket-helpers.js](src/js/faculty-socket-helpers.js)

**What Changed**:
- **Admin denies for Events/Blogs**: When an admin denies an event or blog from the admin "Pending" lists, the server now:
  - Sets the `approvals` row to `status = 'denied'`.
  - Sets the content row (`events`/`blogs`) to `status = 'denied'`.
  - ALSO updates any matching `faculty_pending_changes` rows (for the same record) to `status = 'rejected'` and records admin reviewer info. This prevents faculty dashboards from needing a second deny.
- **Faculty rejects**: Faculty rejection flow (`request_faculty_reject_change`) was extended to update related `approvals` rows when a faculty change is rejected, making a single faculty deny authoritative for that change.
- **Socket broadcasts/listeners**: Admin deny handlers emit broadcast events and FacultyDashboard listens for them and reloads lists, reducing the need for manual page refresh.
- **Frontend param fixes**: Faculty calls into admin `deny_*` helpers now pass the reason parameter correctly so callbacks run reliably.

**Why**:
- The system has two pipelines: `faculty_pending_changes` (faculty change workflow) and `approvals` (approval workflow). Previously only one side was updated in some deny flows, causing a double-deny requirement. Updates ensure both sides are synchronized in a single action.

**How To Restart**:
- From project root, run the usual dev/start command. Example (PowerShell):

```powershell
npm run dev
# or for production-ish run
node server.js
```

**How To Test (recommended steps)**:
- 1) Create a pending Event and Blog as a faculty user (Faculty A). Confirm they appear in:
  - Faculty A "My Pending" / "Pending" lists
  - Admin "Pending Events" / "Pending Blogs"
- 2) From Admin dashboard, deny the Event (supply a reason). Expected:
  - Admin Pending no longer shows the item.
  - Faculty A and Faculty B Pending lists no longer show it as pending (item is marked rejected/denied).
- 3) From Faculty dashboard, deny a pending Event/Blog. Expected:
  - The corresponding `approvals` row is marked `denied` and Admin lists update accordingly.
- 4) Test Problems the same way — faculty deny should still be authoritative and Admin views synced.

**Troubleshooting & Quick Fixes**:
- If an item still appears pending in faculty after an admin deny, check these things in order:
  - Confirm the admin deny request returned success in server logs.
  - Confirm connected sockets: faculty dashboards must have an active socket to receive broadcasts.
  - Check DB rows (examples below) to find mismatches.

**Useful SQL checks / fixes** (run from your DB client):
- Find approvals still pending for a given content item (replace ? with the id):

```sql
SELECT * FROM approvals WHERE content_item_id = ? AND status = 'pending';
```

- Mark an approval denied (if you intend to force it):

```sql
UPDATE approvals
SET status = 'denied', approved_by = 1, approved_at = NOW(), reason = 'manual-sync'
WHERE approval_id = ?;
```

- Force faculty pending change rows for an event/blog to rejected (replace ids as needed):

```sql
UPDATE faculty_pending_changes
SET status = 'rejected', admin_reviewer_id = 1, admin_review_date = NOW(), admin_review_comment = 'manual-sync'
WHERE table_name = 'events' AND record_id = ? AND status IN ('pending_faculty_review','pending_admin');

UPDATE faculty_pending_changes
SET status = 'rejected', admin_reviewer_id = 1, admin_review_date = NOW(), admin_review_comment = 'manual-sync'
WHERE table_name = 'blogs' AND record_id = ? AND status IN ('pending_faculty_review','pending_admin');
```

- If socket broadcasts are sent but clients do not refresh, check browser console for socket reconnects and errors.

**Notes & Cautions**:
- The two-step delete/cancel-change behavior was intentionally preserved. This guide does NOT change the delete flow that relies on explicit user delete confirmation — only deny synchronization was added.
- Be careful when running manual SQL fixes; prefer testing through the UI first.

**If Something Still Fails**:
- Capture these details and open an issue or message the team:
  - Content type (problem/event/blog)
  - Who performed the action (Admin/Faculty A/B)
  - Which dashboard and tab (Admin Pending / Faculty Pending / Faculty My)
  - Exact server log lines around the request (search for `request_deny_event`, `request_deny_blog`, or `request_faculty_reject_change`).

--
Generated on 2026-01-05 to document deny/approval sync between admin and faculty dashboards.
