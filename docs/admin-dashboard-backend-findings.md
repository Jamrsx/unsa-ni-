# Admin Dashboard Backend Findings & System Audit

This document summarizes the investigation, root causes, and fixes applied to the Admin Dashboard backend modules: **Edit Account**, **Question Set Management**, and **Question Verification**.

## 1. ROOT CAUSE ANALYSIS

### Why Edit Account Failed
- **Mapping Dismatch**: The frontend was sending `username` updates, but the backend was inconsistently applying them to the `users.username` field while leaving the `profiles.full_name` field empty/stale.
- **Missing Profiles**: Many admin accounts lacked a corresponding entry in the `profiles` table. The backend was not performing an `upsert` (Insert on Duplicate Key Update), leading to failed profile loads.
- **Avatar Pathing**: The backend was saving images to `public/asset/profile` but wasn't correctly returning the relative `/asset/profile/` path, causing broken image icons on the frontend.

### Why Question Set Management Failed
- **Schema Constraints**: The `approvals` table status enum was strictly set to `('pending','approved','denied')`. Any attempt to save as `'draft'` via the UI resulted in a database error or truncated string.
- **Complex Join Failures**: The question list query used an aggressive inner join that would hide questions if they lacked a topic or an approval record.

### Why Role Guards Blocked Admin
- **Legacy Logic**: Some socket handlers used an manual `role_id` check instead of the unified `authHelpers.verifyAdmin` function.
- **Permission Sync**: The `user_permissions` table for `admin_test` was incorrectly mapped to a limited set during initialization.

---

## 2. BROKEN ENDPOINTS

| Route (Socket Event) | Issue | Fix Applied |
| --- | --- | --- |
| `request_get_user_account_profile` | Returned empty strings for name/bio if no profile record existed. | Implemented fallback to `username` and descriptive defaults. |
| `request_change_user_account_profile` | Non-atomic update. Failed if profile missing. | Converted to atomic transaction with upsert. |
| `request_get_admin_questions` | Failed to aggregate topics/results, returning empty list. | Refactored with `LEFT JOIN` and topic aggregation logic. |
| `request_save_draft` | DB Enum Error (missing 'draft'). | Expanded enum values via migration. |
| `request_delete_question` | (Unknown/Missing) | Implemented full cascading deletion logic. |

---

## 3. DATABASE ISSUES + SYNTAX CORRECTIONS

### Correcting the Approval Flow
**Issue**: `approvals.status` did not support the required `draft` state.
**Fix**:
```sql
-- BEFORE
ALTER TABLE approvals MODIFY COLUMN status ENUM('pending','approved','denied');

-- AFTER
ALTER TABLE approvals MODIFY COLUMN status ENUM('pending','approved','denied','draft') DEFAULT 'pending';
```

### Improving User Profile Aggregation
**Issue**: Generic select didn't handle missing profiles.
**Fix**: Refactored to use `COALESCE` for mapping `full_name` and `username`.

---

## 4. AUTH / ROLE GUARD FIXES
- **Admin Elevation**: Verified that `verifyAdmin` correctly identifies the `admin` role in `user_roles`.
- **Global Override**: Refactored handlers to prioritize the global `isAdmin` flag over per-row ownership checks.

---

## 5. FILE UPLOAD (AVATAR) FIX
- **Storage Path**: Standardized on `path.join(__dirname, 'public/asset/profile')`.
- **Handling**: Continued using Base64 for socket efficiency, but improved the write stream reliability.
- **Preview**: Frontend now uses `buildAvatarUrl` with a cache-busting timestamp (e.g., `?t=123`).

---

## 6. DISCOVERED ISSUES
- **Socket initialization race condition**: Fixed by using `getSock()` getter in `admin-dashboard.js`.
- **MIME type error**: Removed non-existent `admin.css` link in `admin-dashboard.html`.
- **Missing CASCADE**: Deleted questions now correctly remove corresponding `test_cases` and `approvals`.

---

## 7. FINAL VALIDATION STATUS
- **Edit Account**: Fully functional ✅
- **Avatar Upload**: Working with preview ✅
- **Question Set CRUD**: Transactional and stable ✅
- **Role Guards**: Admin has full privileges ✅
- **Test cases**: Runner operational ✅
