# for_context — Helper scripts and E2E verification

This folder contains utilities used during end-to-end testing and database verification for the DuelCode project.

Prerequisites
- Node.js (v16+ recommended)
- MySQL / MariaDB running and the project DB available (default `duelcode_capstone_project`)
- If you want to run `e2e_test_verify.bat` on Windows, ensure `C:\xampp\mysql\bin` (or your MySQL client folder) is on `PATH`.

Environment
- Scripts use `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` from environment or defaults in `db.js`.
  Example (PowerShell):

```powershell
$env:DB_HOST = '127.0.0.1'
$env:DB_USER = 'root'
$env:DB_PASS = ''
$env:DB_NAME = 'duelcode_capstone_project'
```

Scripts
- `verify_post_commit.js` — read-only verification for a committed problem (checks `faculty_pending_changes`, `problems`, `test_cases`, and `problems_have_topics`).
  Usage: `node for_context/verify_post_commit.js`

- `get_problem_topics.js` — shows topic names for a given `problem_id`.
  Usage: `node for_context/get_problem_topics.js 116`

- `get_latest_pending.js` / `check_pending_ui_debug.js` — helpers to inspect latest pending rows and related user records.

- `inspect_user_permissions.js` / `get_user_and_roles.js` — inspect effective permissions and roles for a user.

- `grant_approval_permissions.js` — grants approval permissions (`problem.approvals.manage`, `event.approvals.manage`, `blog.approvals.manage`) to a role (default `role_id = 2`).
  Usage: `node for_context/grant_approval_permissions.js 2`

- `admin_commit_changes.js` — admin helper to commit pending rows into `events` and `blogs` (safe insertion: only inserts columns that exist on the target table).
  Usage: `node for_context/admin_commit_changes.js 10 12 4`
  - first args: pending change ids to commit
  - last arg: admin id performing the commit

- `approve_pending.js` — convenience script to mark a pending row as faculty-approved (used when you want to simulate faculty approval).
  Usage: `node for_context/approve_pending.js <change_id> <faculty_id>`

- `verify_events_blogs.js` — read-only script that lists pending/committed rows for `events` and `blogs` and prints sample records.
  Usage: `node for_context/verify_events_blogs.js`

- `e2e_test_verify.bat` — Windows batch that runs a set of SQL checks using the `mysql` client. Requires MySQL client on PATH.

Safety & notes
- Most scripts are read-only. The scripts `admin_commit_changes.js`, `grant_approval_permissions.js`, and `approve_pending.js` modify the database — run them only when you intend to change DB state.
- `admin_commit_changes.js` performs naive inserts from `proposed_data` and sets `faculty_pending_changes.status = 'committed'`. It does not run application-level hooks; prefer using the Admin UI in production.
- If you want the batch to run automatically, add MySQL client to PATH in PowerShell:

```powershell
$env:Path += ';C:\xampp\mysql\bin'
.\for_context\e2e_test_verify.bat
```

If you want additional automation (e.g., committing problems with test cases/topics via the admin helper), say which pending IDs you want processed and I can extend the script.

README last updated: 2025-12-21
