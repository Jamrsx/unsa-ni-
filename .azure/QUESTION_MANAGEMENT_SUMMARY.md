**Question Management — Summary**

- **Purpose:** Brief reference for the question lifecycle implemented in the project: creating questions, solo creation and adding to pending, approving/denying, and draft workflows.

**Overview:**
- Questions move through states: draft → pending → approved or denied. Users may create drafts, edit them, submit drafts to pending, and admins can approve/deny pending items. Owners and admins have appropriate CRUD permissions.

**Core Flows:**
- **Create (solo / normal):** User creates a question (via UI modal). The server persists it either as a draft or directly to pending depending on the user action.
- **Add to Pending:** When a draft is submitted, the backend updates the question status from `draft` to `pending` and ensures related data (topics, content items) remain linked.
- **Approve / Deny:** Admins review pending questions and can approve (moves to `approved` status) or deny (moves to `denied`). Approve/deny should update only the status field and refresh any frontend tables.
- **Drafts:** Users (and admins acting as owners) can save and update drafts. Submitting a draft to pending should remove the question from the drafts view and make it visible in pending.

**Backend / Socket Notes (examples):**
- Common socket/event patterns used: `create_question`, `update_question`, `delete_question`, `request_move_to_draft`, `request_move_to_pending`, `request_submit_draft`, `approve_question`, `deny_question`. (Event names may vary slightly; these are representative.)
- Use `socket.once` for modal-driven single-response flows to avoid duplicate handlers.

**Database Considerations:**
- Use a single authoritative `status` column (e.g., `draft`, `pending`, `approved`, `denied`) to avoid duplicates and inconsistencies.
- Ensure foreign key relations (topics, content_items, approvals) have appropriate `ON DELETE`/`ON UPDATE` behavior to prevent orphaned rows.
- Add indexes on `status` and any columns frequently filtered by role or owner (e.g., `owner_id`, `status`) to keep queries fast.
- Ensure transitions are atomic: update the status and any related pointers/rows in a single transaction where possible.

**Common Pitfalls & Checks:**
- Avoid creating duplicate problem/approval rows when moving between states—update existing rows rather than inserting new ones.
- Confirm owner authorization checks are applied consistently on update/delete endpoints so non-admin owners can operate on their own questions.
- After approve/deny/move operations, explicitly refresh the frontend tables to avoid stale UI state.

**QA / Manual Verification Steps:**
1. Create a draft, edit it, and submit to pending — verify it appears only in pending.
2. Approve a pending question — verify status becomes `approved` and it is removed from pending view.
3. Deny a pending question — verify status becomes `denied`.
4. Delete a question as owner (not admin) — verify authorization behavior and that related rows are handled.

**Where to find this file:**
- [DuelCode-Capstone-Project/.azure/QUESTION_MANAGEMENT_SUMMARY.md](DuelCode-Capstone-Project/.azure/QUESTION_MANAGEMENT_SUMMARY.md)

---