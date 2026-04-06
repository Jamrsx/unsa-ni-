# Notification Feature — Context & How-to

This document summarizes the notification feature implemented in the project and provides the minimal steps and artifacts retained for future AI-assisted sessions.

What this covers
- Persistent notifications stored in MySQL (`notifications` table).
- Real-time delivery via Socket.IO (`notification`, `approval_approved`, `approval_denied` events).
- Admin approval flows persist notifications and emit events including `notification_id` to avoid duplicate client toasts.
- Soft-delete + archival: DELETE operations mark `is_deleted=1` and copy rows into `notifications_archieved`.
- Frontend: a header notification bell, dropdown/modal, toasts, click-to-navigate, and delete-on-click behaviour.

Files kept in repository root (summary)
- `src/js/notifications.js` — backend endpoints for list/create/mark-read/delete (soft-delete + archive).
- `src/js/conn/dashboard_admin_and_user_socket.js` — emits notification events when admin approves/denies.
- `src/components/ToastContainer.vue`, `src/components/Toast.vue` — global toast system.
- `src/Header.vue` — header UI and notification modal/handlers.
- `src/UserDashboard.vue` — reads `location.hash` to open `#my_questions` when navigated from a notification.

Database migration(s)
- A migration was added to add `is_deleted`/`deleted_at` to `notifications` and create `notifications_archieved`.
- If you apply migrations manually, run the SQL in the migration file prior to testing soft-delete behaviour.

How to test locally
1. Apply the migration SQL to the database (if not already applied).
2. Restart the server: `node server.js`.
3. Open two browser windows: one signed in as an admin, one as the target user.
4. From admin UI, approve/deny a request that targets the user — verify the user receives a toast and a notification appears in header.
5. Open the Notifications modal and click a notification card — it should close the modal, perform a soft-delete via the DELETE API, and navigate to the appropriate dashboard hash.
6. Click Clear in the modal — rows should be archived and marked `is_deleted=1` in the `notifications` table.

Notes for future AI sessions
- This `for_context` folder now contains only minimal context files for the assistant: `context_session.txt`, `db_get_tables.js`, and this documentation.
- If you need broadcasts to open tabs after soft-delete, I can add a server socket broadcast for the `notifications_cleared` event.
 - Server now emits `notifications_deleted` socket event when notifications are soft-deleted (either specific ids or `all: true`).
	 Frontend listens for this event and will remove matching notification cards from other open sessions.

Maintainer: assistant (follow-up changes by project owner are expected).
