# Question Management — Developer Guide

This guide documents the question lifecycle implemented in the project: creation, drafts, submitting to pending, review (approve/deny), and key implementation notes (socket events, SQL examples, UI patterns, and QA steps).

## Table of contents
- Overview
- Socket events & payloads
- Database: status model, constraints, and example SQL
- Backend logic recommendations
- Frontend UI patterns and payloads
- QA / verification steps
- Troubleshooting checklist

## Overview
Questions move through these canonical states:
- `draft` — saved by owner for later editing
- `pending` — submitted for admin review
- `approved` — visible/available to end users
- `denied` — rejected by admin (may be editable by owner)

Use a single authoritative `status` column on the primary `problems` (or `content_problems`) table to represent these states. Avoid separate tables for each state unless your application needs archival behavior.

## Socket events & payload shapes
Use consistent socket event names across frontend and backend. Representative events used in the project:
- `create_question` — payload: `{ owner_id, title, description, topics: [topic_id], saveAs: 'draft'|'pending' }`
- `update_question` — payload: `{ problem_id, owner_id, title?, description?, topics?, status? }`
- `delete_question` — payload: `{ problem_id, requester_id }`
- `request_move_to_draft` — payload: `{ problem_id, requester_id }` (move from pending/denied → draft)
- `request_move_to_pending` — payload: `{ problem_id, requester_id }` (move from draft/denied → pending)
- `request_submit_draft` — payload: `{ problem_id, requester_id }` (submit a draft to pending)
- `approve_question` — payload: `{ problem_id, admin_id }`
- `deny_question` — payload: `{ problem_id, admin_id, reason? }`
- `fetch_user_questions` — payload: `{ user_id, filter?: 'all'|'draft'|'pending'|'approved'|'denied' }`
- `fetch_admin_approvals` — payload: `{ filter?: 'pending'|... }`

Responses should include a standard envelope: `{ success: boolean, error?: string, data?: {...} }`.

Frontend should generally use `socket.once(event, handler)` for modal-initiated flows to avoid double handlers when the modal is opened multiple times.

## Database: status model, constraints, and example SQL
Recommended minimal schema design snippets (adjust names to match actual schema):

1) `problems` table (status column):

```sql
CREATE TABLE problems (
  problem_id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('draft','pending','approved','denied') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_problems_owner FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
);
CREATE INDEX idx_problems_status_owner ON problems(status, owner_id);
```

2) Topics join table:

```sql
CREATE TABLE problems_topics (
  problem_id INT NOT NULL,
  topic_id INT NOT NULL,
  PRIMARY KEY (problem_id, topic_id),
  CONSTRAINT fk_pt_problem FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE,
  CONSTRAINT fk_pt_topic FOREIGN KEY (topic_id) REFERENCES topics(topic_id) ON DELETE RESTRICT
);
```

3) Approvals/history (optional):

```sql
CREATE TABLE problem_status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  problem_id INT NOT NULL,
  old_status ENUM('draft','pending','approved','denied'),
  new_status ENUM('draft','pending','approved','denied'),
  changed_by INT,
  reason TEXT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_hist_problem FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE
);
```

Notes:
- Use `ON DELETE CASCADE` for problem -> topic join and history so deletions don't leave orphans (but be careful with topics table `ON DELETE RESTRICT` to avoid losing shared topic info).
- Index `status` and `owner_id` for fast UI queries filtering by user and state.
- Make state transitions inside a transaction when updating multiple tables (e.g., update `problems.status` and insert into `problem_status_history`).

## Backend logic recommendations
- Authorize by role and ownership: admin OR owner should be able to edit/delete their questions. Deny others.
- Use transactions for multi-step operations such as: updating `problems` status + writing `problem_status_history` + updating related content rows.
- Avoid duplicate records: when transitioning state, `UPDATE` the existing record instead of inserting a copy.
- Keep socket handlers idempotent where possible; validate incoming payloads and user permissions before executing state changes.
- Example approve flow (pseudocode):
  1. Verify requester is admin.
  2. Begin transaction.
  3. UPDATE problems SET status = 'approved' WHERE problem_id = ? AND status = 'pending'.
  4. INSERT INTO problem_status_history(...) values(...).
  5. Commit transaction.
  6. Emit success to frontends, refresh lists.

## Frontend UI patterns and payloads
- Modal lifecycle: when opening the create/edit modal, attach `socket.once('response_event', handler)` so the handler runs only once; remove listeners on modal close.
- Button semantics in edit modal on approvals page:
  - `Save Draft` — `request_move_to_draft` (if question is in approvals table) or `update_question` with status='draft'
  - `Update Question` — apply update and move to `pending` (if from approvals) — `request_move_to_pending` or `update_question` with status='pending'
- Example `create_question` payload from frontend:

```js
socket.emit('create_question', {
  owner_id: currentUser.id,
  title: form.title,
  description: form.description,
  topics: form.topics.map(t=>t.id),
  saveAs: isDraft ? 'draft' : 'pending'
});
```

- After successful create/update/move/approve/deny operations, explicitly refresh the affected UI tables (owner's `My Questions`, admin `Approvals`, approved list) rather than relying on optimistic local state only.

## QA / verification steps
1. Create a new question and save as draft. Verify it shows in `My Questions` under Drafts and not in Pending.
2. Edit the draft, then submit to pending — verify it disappears from Drafts and appears in Pending.
3. As admin, open the pending item, approve it — verify status becomes `approved` and it's removed from Pending.
4. Deny a pending question — verify status `denied` and that the owner can move it back to draft/pending as intended.
5. Delete a question as owner and check related tables (`problems_topics`, `problem_status_history`) for orphans.
6. Re-run queries for lists (My Questions, Admin Approvals) and ensure UI reflects DB state immediately after operations.

## Troubleshooting checklist
- If items appear duplicated across lists, search for multiple rows with the same `problem_id` or duplicate content in `approvals` tables. Prefer `UPDATE` on single `problems` table.
- If modals don’t open or handlers fire multiple times: ensure `socket.once` is used for modal-responses and listeners are removed on unmount.
- If a transition fails partially: check if transactions roll back properly; add logging around DB errors.
- If non-admin owners cannot edit/delete: inspect authorization middleware logic to confirm owner check uses the `owner_id` field from `problems`.

---
