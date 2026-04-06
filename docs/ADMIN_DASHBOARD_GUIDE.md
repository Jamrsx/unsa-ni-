**Admin Dashboard Guide — Approvals & Deny Flow**

**Scope**:
- Problems, Events, Blogs: Level 1 (admin) and Level 2 (faculty) approval flows.
- How admin denies/approvals interact with `approvals` and `faculty_pending_changes`.

**Files of interest**:
- Server socket: `src/js/conn/dashboard_admin_and_user_socket.js`
- Faculty socket sync: `src/js/conn/dashboard-faculty-socket.js`
- Admin helpers (frontend): `src/js/admin-dashboard.js`
- Admin UI components: `src/components/dashboard/admin/**` (see content_event, content_blog, content_approval)
- Approval flow spec: `docs/APPROVAL_FLOW_STRUCTURE.md`
- Deny sync guide: `docs/DASHBOARD_DENY_SYNC_GUIDE.md`

**Design summary**:
- Two pipelines coexist:
  - `approvals` table (Level 1): authoritative admin-reviewed approvals for content items (events/blogs/problems).
  - `faculty_pending_changes` (Level 2): faculty-created drafts/changes that may be committed into content and result in approvals rows.
- A single deny should be authoritative. To achieve that:
  - Admin denies set `approvals.status = 'denied'` and content status to `'denied'`.
  - Admin denies now also update any `faculty_pending_changes` rows for the same content (mark `status = 'rejected'` and record admin reviewer info).
  - Faculty rejects (`rejectFacultyChange`) update both `faculty_pending_changes` and the associated `approvals` row where applicable.
  - The central **Approvals** tab in the Admin dashboard now uses the same
    generic handlers for Problems/Events/Blogs as the per‑type pending
    sections, including proper sync into `faculty_pending_changes` for
    all three content types.

**Typical admin deny flow (events/blogs/problems)**:
1. Admin clicks Deny on a pending approval.
2. Server handler (`request_deny_event` / `request_deny_blog` / `request_deny_item`) validates permissions and sets:
   - `approvals.status = 'denied'`, `approved_by`, `approved_at`, `reason`
   - `events.status = 'denied'` or `blogs.status = 'denied'`
3. Server then updates matching `faculty_pending_changes` rows (if any) to `status = 'rejected'` with `admin_reviewer_id`, `admin_review_date`, and `admin_review_comment`.
4. Server emits the appropriate `response_deny_*` and, for events/blogs,
   broadcasts `approval_event_denied` / `approval_blog_denied` so connected
   faculty dashboards reload their lists.

**Typical faculty deny flow**:
1. Faculty clicks Deny on a change-backed row (has `change_id`).
2. Server handler `request_faculty_reject_change` updates `faculty_pending_changes.status = 'rejected'` and records faculty reviewer info and comment.
3. If the change maps to a content item (problems/events/blogs) the server also updates any `approvals` rows for the content item to `status = 'denied'` and sets `approved_by`/`approved_at`/`reason`.
4. Server broadcasts `faculty_change_rejected` to connected dashboards.

**Testing checklist for admins**:
  - Verify `approvals` row status becomes `denied`.
  - Verify `events`/`blogs` row status becomes `denied`.
  - Verify any `faculty_pending_changes` rows for the same record are set to `rejected`.
  - Open connected faculty dashboards to ensure the item is removed from Pending lists without manual refresh.

**Troubleshooting**:
  - Confirm server emitted `approval_*_denied` broadcast (check server logs).
  - Confirm faculty clients are connected via sockets and listening for `approval_event_denied` / `approval_blog_denied` events.
  - Use SQL queries (see `docs/DASHBOARD_DENY_SYNC_GUIDE.md`) to inspect `approvals` and `faculty_pending_changes`.


## Recent Implementation Notes (2026-01-06)

- Admin-level handlers were extended so that when a faculty-originated change is submitted or re-pended, an `approvals` row is created/updated (via `syncFacultyChangeToApprovals`) to surface the item immediately to admin pending queues.
- Move-to-draft performed by admins now also marks related `faculty_pending_changes` rows as `draft`, ensuring items disappear from faculty pending lists when moved back to draft.
- Recommended admin test: as Admin, move an item to Draft and confirm it is removed from Faculty Pending lists; then as Faculty re-pend the same item and confirm it appears in Admin → Pending Approvals.
**Notes**:
- The two-step delete (cancel change -> delete) behavior is preserved. This guide does not alter the delete semantics.
- If you change approval flows, update `docs/APPROVAL_FLOW_STRUCTURE.md` first, then implement server sync and client listeners.

Generated on 2026-01-05.
