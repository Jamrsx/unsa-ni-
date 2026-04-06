duelcode_capstone_project — database brief

Purpose
- This file accompanies `duelcode_capstone_project.sql` and documents the main schema used by the DuelCode Capstone project.

Quick import
- Import with the MySQL client (includes routines/triggers/FKs):
  mysql -u <user> -p < duelcode_capstone_project.sql

Contents (high-level)
- Core user model
  - `users` (PK `user_id`) — central user table
  - `profiles` references `users`
  - `roles`, `user_roles` (many-to-many between `users` and `roles`)
  - `permissions`, `role_permissions`, `user_permissions`
- Content subsystem
  - `content_items` (generic), `blogs`, `content_blogs`, `content_events`, `content_problems`
  - `approvals` references `content_items` and `users`
- Problem / judge subsystem
  - `problems` (PK `problem_id`), `test_cases`, `problem_submissions`, `solution_submissions`
  - `problem_user_progression`, `problem_user_progression_draft_code`
  - `problems_have_topics` and `problem_topics`
- Duel / Match subsystem
  - `duel_matches` (players, winner_id -> `users`), `match_records` (records per match)
  - `duel_lobby_rooms`, `duel_lobby_players`, `duel_lobby_messages`
- Events & Rooms
  - `events`, `event_participants`, `event_schedule`, `rooms`, `room_players`, `room_activity_log`
- Admin / System tables
  - `active_sessions`, `audit_trail`, `statistic`, `system_backup`

Foreign keys & integrity
- The dump includes the original foreign key constraints (names preserved, e.g., `*_ibfk_*`, `fk_*`), indexes, and AUTO_INCREMENT settings.
- An FK orphan-check was executed during export; no unresolved orphans were found for the restored constraints.

Notes for developers
- The dump contains data and schema; to create a fresh DB with the same name, use the import command above. If importing under a different DB name, edit the `CREATE DATABASE` / `USE` lines in the SQL file.
- If you run into import errors about binary content, use the MySQL client with `--binary-mode=1`.

Contact
- If anything in the schema seems wrong or missing, open an issue and include the failing SQL/command and server version.
