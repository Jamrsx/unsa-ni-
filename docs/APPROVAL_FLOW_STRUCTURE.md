# Approval Flow Structure (Admin & Faculty)

This document captures the intended two-level approval model and how it maps onto the existing UI sections for **problems/questions**, **events**, and **blogs**.

---

## Overview

There are **two approval levels**:

- **Level 1**
  - Primary review step.
  - Can be performed by **faculty** (for faculty-originated content) or **admin** (for any content).
  - Admin actions at Level 1 are **final**: approve/deny here should not require any further Level 2 confirmations.
- **Level 2 (Faculty Change Queue)**
  - Admin-only queue for reviewing **faculty changes** that have already been accepted at Level 1 by faculty.
  - Only admins can see and act on this queue.
  - Admin actions at Level 2 are **final** and must not trigger any more Level 1 confirmations.

Auto-approval permissions (e.g. `problem.auto_approve`, `event.auto_approve`, `blog.auto_approve`) allow certain users to **bypass both levels** for their own new content/changes.

---

## Faculty Level 1 Sources

Faculty Level 1 approvals come from the *faculty dashboard* content tabs.
The behavior is now aligned for **problems**, **events**, and **blogs**.

### Problems (current implementation)

- UI:
  - `FacultyDashboard` → `Problems` section → **Pending Problem** tab.
- Data source (merged):
  - Any problem whose approval row has `approvals.status = 'pending'` (joined
    via `content_items`/`content_problems`). These are the same rows that feed
    the admin **Pending Question** list.
  - Plus any `faculty_pending_changes` rows with:
    - `change_type = 'problem'`
    - `status IN ('pending_faculty_review', 'pending_review')`

  In other words, the faculty **Pending Problem** tab now shows:

  - Shared Level 1 pending items (from the `approvals` table), and
  - Legacy faculty-only pending change rows (creates/updates/deletes) that have
    not yet been forwarded to admin review.

**Faculty actions at Level 1 for Problems:**

- For rows backed by `approvals` (no `change_id`):
  - Faculty can approve/deny exactly like admin by calling the same
    `approve_question` / `deny_question` helpers, which update the
    `approvals` row directly.
  - This is a **shared Level 1 queue**: the same pending item appears in both:
    - Admin → Question Set → **Pending Question**
    - Faculty → Problems → **Pending Problem**.
- For rows backed by `faculty_pending_changes` (`change_id` present):
  - **Approve**
    - Sets `faculty_pending_changes.status = 'pending_admin'`.
    - Creates a corresponding `approvals` row with `status = 'pending'` so the
      item enters the shared admin/faculty Level 1 queue.
  - **Deny**
    - Sets `faculty_pending_changes.status = 'rejected'`.
    - No Level 2 admin review is required after a faculty denial.

### Events & Blogs (aligned with Problems)

- UI:
  - `FacultyDashboard` → `Events` section → **Pending Event** tab.
  - `FacultyDashboard` → `Blogs` section → **Pending Blog** tab.
- Data source (now aligned):
  - Base rows from `events`/`blogs` joined through `content_events` /
    `content_blogs` → `content_items` → `approvals` with:
    - `approvals.status = 'pending'` (shared Level 1 queue with admin), and
    - latest `approval_id` per `content_item_id`.
  - Plus `faculty_pending_changes` rows with:
    - `change_type = 'event'` or `change_type = 'blog'`
    - `status = 'pending_faculty_review'`.
  - The faculty socket layer merges these and hides base rows whose
    `record_id` currently has a pending **create** or **delete** change, so
    creators do not see duplicate rows.
  - The Vue Pending tabs further filter to **other faculty's** uploads
    (`is_mine = false`) and, when both a base row and a
    `faculty_pending_changes`-backed row represent the same logical content,
    they keep a single entry and prefer the change-backed row.

**Faculty actions at Level 1 for Events/Blogs:**

- For rows backed only by `approvals` (no `change_id`):
  - Faculty actions behave like admin Level 1 for that approval
    (approve/deny directly on `approvals`).
- For rows backed by `faculty_pending_changes` (`change_id` present):
  - **Approve**
    - Sets `faculty_pending_changes.status = 'pending_admin'`.
    - Ensures a corresponding `approvals` row with `status = 'pending'`
      exists so the item appears in admin pending queues.
  - **Deny**
    - Sets `faculty_pending_changes.status = 'rejected'`.
    - No Level 2 admin review is required after a faculty denial.

---

## Admin Level 1 Sources

Admin Level 1 approvals are the normal pending tables in the **admin dashboard** for problems/questions, events and blogs.

For **admin**, Level 1 includes:

- **Problems / Questions**
  - Admin Dashboard → **Question Set** → **Pending Question** tab.
  - Backed by `approvals` rows where:
    - `content_type = 'problem'` (via `content_items`/`content_problems`)
    - `approvals.status = 'pending'`.
- **Events**
  - Admin Dashboard → **Events** → **Pending Event** tab.
  - Backed by `approvals` rows with:
    - `content_type = 'event'` (`content_items`/`content_events`)
    - `approvals.status = 'pending'`.
- **Blogs**
  - Admin Dashboard → **Blogs** → **Pending Blog** tab.
  - Backed by `approvals` rows with:
    - `content_type = 'blog'` (`content_items`/`content_blogs`)
    - `approvals.status = 'pending'`.
- **Central Approvals Page**
  - Admin Dashboard → **Approvals** view (Problems / Events / Blogs tables).
  - Also driven by `approvals.status = 'pending'` per content type.

**Admin actions at Level 1 (on these tabs):**

- **Approve**
  - Finalizes the content item (question/event/blog) as **approved**.
  - If the item also has a related `faculty_pending_changes` row (for a
    faculty-originated change), that row is updated to
    `faculty_pending_changes.status = 'committed'` so no further Level 2
    confirmation is needed.
- **Deny**
  - Marks the approval as **rejected** in `approvals`.
  - Any related `faculty_pending_changes` row is updated to
    `faculty_pending_changes.status = 'rejected'`.

In both cases, **admin decisions at Level 1 are final** and must *not* require
a second confirmation in Level 2.

For **events** and **blogs**, the admin approve handlers also mark any
matching `faculty_pending_changes` row (same `table_name` and `record_id`)
as `status = 'committed'`, which guarantees that once an admin approves at
Level 1, the item disappears from:

- Faculty A's "My" lists (no more "pending" pill), and
- Faculty B's "Pending" tabs (no lingering pending row).

---

## Admin Level 2 (Faculty Change Queue)

Level 2 is the dedicated **Faculty Change** queue that only admins see.

- UI:
  - Admin Dashboard → Approvals → **Faculty Change** tab (driven by `content_faculty_approvals.vue`).
- Data source:
  - `faculty_pending_changes` rows with:
    - `status = 'pending_admin'` (after a faculty Level 1 approval), and sometimes
    - `status = 'pending_faculty_review'` (when explicitly showing all outstanding faculty changes for admins).

**Admin actions at Level 2:**

- **Commit / Approve**
  - Handled by `request_admin_commit_change` + `commitPendingChange`.
  - Applies the proposed change to the underlying content table
    (problems/events/blogs, plus any test cases/topics/schedules).
  - Sets `faculty_pending_changes.status = 'committed'` and records
    `admin_reviewer_id`, `admin_review_date`, and optional
    `admin_review_comment`.
  - If a matching `approvals` row exists for the same content item, it is
    updated to `approvals.status = 'approved'` with `approved_by` and
    `approved_at` set to the admin.
  - Ensures that no further Level 1 confirmation is required.
- **Reject**
  - Handled by `request_admin_reject_change`.
  - Sets `faculty_pending_changes.status = 'rejected'` and records admin
    reviewer info.
  - If a matching `approvals` row exists, it is updated to
    `approvals.status = 'denied'` with `approved_by`/`approved_at` set.
  - No further faculty or admin approval is expected after this.

Level 2 is therefore **admin-only** and is used exclusively for faculty-originated changes that have already passed faculty Level 1.

---

## Auto-Approve Behavior

Auto-approve permissions allow certain users to bypass the two-level flow for their own actions.

- Permissions:
  - `problem.auto_approve`
  - `event.auto_approve`
  - `blog.auto_approve`

**Faculty with auto-approve**

- Creates/updates for Problems/Events/Blogs:
  - Directly write to the base tables (`problems`, `events`, `blogs`, etc.).
  - Create `content_items` + mapping (`content_problems`, `content_events`, `content_blogs`).
  - Insert `approvals` row with `status = 'approved'` and `approved_by = faculty_user_id`.
  - **Do not** create `faculty_pending_changes` rows in this case.

**Admins with auto-approve**

- Admin create flows for Problems/Events/Blogs work similarly:
  - With `*.auto_approve`: create as **approved** immediately (no pending rows).
  - Without `*.auto_approve`: create with `approvals.status = 'pending'` so the usual Level 1 admin queues handle them.

Auto-approve therefore lets both admins and faculty **skip** Level 1 and Level 2 for their own content, while still allowing the admin to control who has these privileges.

---

## Summary

- **Faculty Level 1**: Pending tabs under Faculty Problems/Events/Blogs (`faculty_pending_changes.status = 'pending_faculty_review'`).
- **Admin Level 1**: Pending Question/Event/Blog tabs and central Approvals tables (`approvals.status = 'pending'`).
- **Admin Level 2**: Faculty Change tab (admin-only queue over `faculty_pending_changes.status = 'pending_admin'`).
- **Admin decisions at either Level 1 or Level 2 are final** and must close any related `faculty_pending_changes` rows so that no second approval is required.
- **Auto-approve** permissions bypass both levels for the creator’s own actions, while still following the shared content/approvals pipeline.

---

## Troubleshooting & Regression Checklist

Use this section when approvals behavior regresses (duplicates, stuck
"pending" pills, mismatched admin/faculty views).

### Symptom: Creator sees duplicate pending rows (Faculty A)

- Check faculty socket merge for each type:
  - Problems: `request_get_faculty_problems` in
    `src/js/conn/socket/dashboard-faculty-socket.js`.
  - Events: `request_get_faculty_events` in the same file.
  - Blogs: `request_get_faculty_blogs` in the same file.
- Confirm that these handlers:
  - Only include `faculty_pending_changes` with
    `status = 'pending_faculty_review'` for the current faculty, and
  - Build a `hiddenIds` set that hides base rows when there is a pending
    **create** or **delete** for the same `record_id`.

### Symptom: Admin approves, but faculty Pending still shows row

- Verify admin approve handlers:
  - Problems: question approval handlers in
    `src/js/conn/dashboard_admin_and_user_socket.js`.
  - Blogs: `request_approve_blog` in that file.
  - Events: `request_approve_event` in that file.
- Confirm that after updating `approvals.status = 'approved'` and the
  underlying content table, they also:
  - `UPDATE faculty_pending_changes SET status = 'committed'` for the
    matching `table_name` and `record_id` (blogs/events), and
  - For problems, either call `commitPendingChange` via the Level 2 flow or
    perform an equivalent status update.

### Symptom: Faculty B sees own uploads in Pending

- Check Vue Pending tab filters in:
  - Problems: `content_problems.vue`.
  - Events: `content_events.vue`.
  - Blogs: `content_blogs.vue`.
- Ensure `pending*` computed lists:
  - Filter out `is_mine === true` for the current user when building the
    shared Level 1 pending list, and
  - Deduplicate by base ID, preferring rows with `change_id` over pure
    `approvals` rows when both exist.

### Symptom: Faculty approval never reaches Admin

- Confirm that faculty-level approve uses the faculty-change helpers from
  `src/js/faculty-socket-helpers.js`:
  - `approveFacultyChange` → `request_faculty_approve_change` socket event.
- Check that `request_faculty_approve_change` in
  `dashboard-faculty-socket.js`:
  - Sets `faculty_pending_changes.status = 'pending_admin'`, and
  - Calls `syncFacultyChangeToApprovals(db, changeId)` so a corresponding
    `approvals.status = 'pending'` row exists for the admin queues.

### Symptom: Faculty/Admin still see resolved changes in pending queues

- Faculty pending views (`content_approvals.vue`, Problems/Events/Blogs tabs):
  - Backed by `faculty_pending_changes.status = 'pending_faculty_review'` only.
  - Socket handler `request_faculty_pending_changes` now filters strictly on
    `status = 'pending_faculty_review'`, so items that were forwarded to
    admin (`pending_admin`), committed, or rejected no longer appear as
    "pending" for faculty.
- Admin Faculty Change queue (`content_faculty_approvals.vue`):
  - Backed by `faculty_pending_changes.status = 'pending_admin'` only.
  - Socket + HTTP admin endpoints now agree on this filter, so once an
    admin commits or rejects a change, it disappears from the Faculty
    Change tab.
- Denials at Level 1 or Level 2:
  - Set `faculty_pending_changes.status = 'rejected'` and update any
    related `approvals` row to `status = 'denied'`, so no leftover items
    remain in either admin or faculty pending lists.

### Symptom: Duplicate rows after editing approved content (faculty side)

- Source:
  - When a faculty member edits an approved problem/event/blog without
    auto-approve, a new `faculty_pending_changes` row (action `update`)
    is created while the base row remains visible, producing two entries
    for the same logical content.
- Fix:
  - The faculty merge handlers in
    `src/js/conn/socket/dashboard-faculty-socket.js` now:
    - Hide base rows whenever there is a pending `create`, `update`, or
      `delete` for the same `record_id` in `faculty_pending_changes` for
      that faculty member.
    - Prefer the change-backed row (with `change_id`) in the merged
      lists, so faculty see a single row representing the in-review
      version of their content.
- Effect:
  - Editing approved Problems/Events/Blogs no longer shows a duplicate
    base row plus a pending row in faculty dashboards; "Cancel Change"
    still removes the pending row as before.

### Symptom: Home page appears empty despite approvals

- Home page (root Vue app) loads blogs and events via
  `src/js/conn/public_content_socket.js` → `request_get_home_content`.
- That handler now selects items whose **latest** `approvals` row is
  `status = 'approved'` by joining `content_*` and `approvals`, instead
  of relying solely on raw `status` fields on `blogs`/`events`.
- This keeps the home "Featured Blogs" and "Upcoming Events" sections
  aligned with the same approval decisions that drive admin/faculty
  queues, regardless of how the underlying row status strings are
  normalized.

### Recent faculty/admin dashboard UX notes

- Admin Approvals view (AdminDashboard.vue):
  - "View" buttons for Problems/Events/Blogs now explicitly open their
    Bootstrap modals via DOM ids, so admins always see the full
    approval context when reviewing items.
- Faculty Problems pending topics (content_problems.vue):
  - Pending problems now resolve numeric topic IDs to human-readable
    names using the shared problem-topics socket, so faculty see topic
    pills instead of raw ids.
- Faculty delete vs cancel labels (content_problems.vue,
  content_events.vue, content_blogs.vue):
  - Buttons attached to `change_id` rows (pending faculty changes) are
    labeled **Cancel Change** and route to the faculty change rejection
    helpers, while buttons on committed rows remain **Delete** and hit
    the normal delete flows; behavior is unchanged, but the labels now
    match the underlying semantics.

## Recent Implementation Notes (2026-01-06)

- Restored faculty central pending-list exclusivity: `request_faculty_pending_changes` now excludes rows created by the requesting faculty member so creators don't see their own items in peer-review central lists.
- Re-pend / submit flows for Problems now create/refresh `faculty_pending_changes` rows when a faculty member moves an item to pending; this ensures peer faculty see re-pended items from My → Edit → Update flows.
- Event/Blog updates that create faculty pending changes now also call `syncFacultyChangeToApprovals()` so an `approvals` row is created/updated and admins see re-pended events/blogs immediately.
- Move-to-draft actions update both `approvals.status='draft'` and mark related `faculty_pending_changes` rows as `draft` so drafts are hidden from pending lists.
- Recommended verification: run the My→Edit→Update→Move-to-Pending flows for Problems/Events/Blogs as Faculty A and confirm visibility for Faculty B and Admin.
