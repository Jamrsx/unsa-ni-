# Faculty Dashboard CRUD Smoke Test Plan
**Date:** December 19, 2025  
**Status:** Ready for Testing  
**Build Status:** ✅ Successful (npm run build)

---

## Test Scenarios

### 1. Edit Account (Self-edit only)
**Socket Event:** `request_update_faculty_profile`
**Expected Behavior:**
- [ ] Faculty can update: first_name, last_name, email, phone
- [ ] No permission check required (self-edit always allowed)
- [ ] Audit trail records change
- [ ] Notification emitted to user: "Profile Updated"
- [ ] Response includes success=true and updated_at timestamp

**Test Steps:**
1. Login as faculty user
2. Navigate to Settings/Account section
3. Update profile field (e.g., first_name)
4. Emit: `socket.emit('request_update_faculty_profile', { token_session, first_name: 'NewName', ... })`
5. Verify response: `response_update_faculty_profile` with success=true
6. Check audit_trail table for entry: action='update_profile'
7. Check notification system

---

### 2. Users Management (View Only)
**Socket Events:** 
- `request_get_faculty_users` - List all users
- `request_view_faculty_user` - Get single user details

**Expected Behavior:**
- [ ] Requires `faculty.manage_users` permission
- [ ] Returns: user_id, username, email, status, first_name, last_name, phone
- [ ] No edit/delete/ban functionality (placeholder for future)
- [ ] Proper permission guards on all endpoints

**Test Steps:**
1. Login as faculty with `faculty_manage_users` permission
2. Emit: `socket.emit('request_get_faculty_users', { token_session })`
3. Verify response: users array with correct fields
4. Emit: `socket.emit('request_view_faculty_user', { token_session, user_id: 123 })`
5. Verify single user details returned
6. Test with faculty WITHOUT permission → should return "Forbidden"

---

### 3. Problems CRUD
**Socket Events:**
- `request_get_faculty_problems` - List problems
- `request_create_faculty_problem` - Create new problem
- `request_update_faculty_problem` - Update problem
- `request_delete_faculty_problem` - Delete (soft-delete)

**Expected Behavior:**

#### Create
 - [ ] Requires `faculty.create_problems` permission
 - [ ] Auto-approval if user has `faculty.auto_approve_problems`
- [ ] Otherwise status='pending' (requires admin approval later)
- [ ] Creates entries in: problems, content_items, content_problems, approvals
- [ ] Audit trail recorded
- [ ] Notifications emitted:
  - Faculty receives: "Problem Created" (status info)
  - Admins receive (if pending): "New Problem Awaiting Approval"
- [ ] Response includes: problem_id, content_item_id, status

#### Update
- [ ] Requires `faculty_create_problems` permission
- [ ] Can only edit own problems (or if has approve permission)
- [ ] Updates: problem_name, description, difficulty, time_limit_seconds, memory_limit_mb, sample_solution
- [ ] Audit trail recorded with updated_fields
- [ ] Notification sent: "Problem Updated"

#### Delete (Soft-Delete)
- [ ] Requires `faculty_create_problems` permission
- [ ] Sets is_deleted=1 (not hard delete)
- [ ] Audit trail recorded
- [ ] Notification sent: "Problem Deleted"

#### Get
- [ ] Returns only problems faculty created or approved
- [ ] Includes status (active, pending, approved, rejected)

**Test Steps:**
1. Create problem: `socket.emit('request_create_faculty_problem', { token_session, problem_name, difficulty, description, ... })`
2. Verify response with problem_id
3. Check audit_trail entry
4. Check if admin user receives pending notification
5. Update: `socket.emit('request_update_faculty_problem', { token_session, problem_id: 1, problem_name: 'Updated' })`
6. Verify update success and audit entry
7. Delete: `socket.emit('request_delete_faculty_problem', { token_session, problem_id: 1 })`
8. Verify soft-delete (is_deleted=1) not hard delete

---

### 4. Events CRUD
**Same pattern as Problems with:**
- `request_create_faculty_event` - with starts_at, ends_at
- `request_update_faculty_event`
- `request_delete_faculty_event`
- `request_get_faculty_events`

**Permission:** `faculty.create_events` / `faculty.auto_approve_events`
**Notifications:** Event Create/Update/Delete with status info

**Test Steps:**
1. Create: `socket.emit('request_create_faculty_event', { token_session, event_name, starts_at, ends_at, ... })`
2. Update: `socket.emit('request_update_faculty_event', { token_session, event_id, event_name, ... })`
3. Delete: `socket.emit('request_delete_faculty_event', { token_session, event_id })`
4. Verify all audit trails and notifications

---

### 5. Blogs CRUD
**Same pattern as Problems/Events with:**
- `request_create_faculty_blog` - with blog_title, blog_content
- `request_update_faculty_blog`
- `request_delete_faculty_blog`
- `request_get_faculty_blogs`

**Permission:** `faculty.create_blogs` / `blog.auto_approve`
**Notifications:** Blog Create/Update/Delete with status info

**Test Steps:**
1. Create: `socket.emit('request_create_faculty_blog', { token_session, blog_title, blog_content, ... })`
2. Update: `socket.emit('request_update_faculty_blog', { token_session, blog_id, blog_title, ... })`
3. Delete: `socket.emit('request_delete_faculty_blog', { token_session, blog_id })`
4. Verify all audit trails and notifications

---

### 6. Faculty Approvals (2-Level: Faculty Review)
**Socket Events:**
- `request_faculty_pending_changes` - Get items pending faculty review
- `request_faculty_approve_change` - Faculty approves (moves to pending_admin)
- `request_faculty_reject_change` - Faculty rejects

**Expected Behavior:**

#### Get Pending
 - [ ] Requires `approvals.manage` permission
- [ ] Returns all changes with status='pending_faculty_review'
- [ ] Includes: id, faculty_id, change_type, table_name, record_id, original_data, proposed_data, created_at

#### Approve Change
- [ ] Status changes to 'pending_admin' (next level)
- [ ] Records: faculty_reviewer_id, faculty_review_date, faculty_review_comment
- [ ] Audit trail recorded
- [ ] Notification sent to admins: "Faculty Approved [Item]"
- [ ] Broadcasts 'faculty_change_forwarded' event

#### Reject Change
- [ ] Status changes to 'rejected'
- [ ] Records: faculty_reviewer_id, faculty_review_date, faculty_review_comment
- [ ] Notification sent to submitter: "Your [Item] was rejected: [reason]"
- [ ] Broadcasts 'faculty_change_rejected' event

**Test Steps:**
1. Get pending: `socket.emit('request_faculty_pending_changes', { token_session })`
2. Verify returns pending_faculty_review items
3. Approve: `socket.emit('request_faculty_approve_change', { token_session, change_id: 1, comment: 'Looks good' })`
4. Verify status changed to 'pending_admin'
5. Check admin receives notification
6. Reject: `socket.emit('request_faculty_reject_change', { token_session, change_id: 2, comment: 'Needs revision' })`
7. Verify status changed to 'rejected'
8. Check submitter receives rejection notification

---

### 7. Notification System Integration
**Expected Notifications:**

| Event | Recipients | Format |
|-------|------------|--------|
| Profile Update | Self | "Profile Updated - Your profile was updated successfully" |
| Problem Create (auto-approved) | Self | "Problem Created - Your problem is now active" |
| Problem Create (pending) | Self + Admins | Dual notification with approval request |
| Problem Update | Self | "Problem Updated - Your problem was updated successfully" |
| Problem Delete | Self | "Problem Deleted - Your problem was deleted successfully" |
| Event Create | Self + Admins (if pending) | Same pattern as problems |
| Blog Create | Self + Admins (if pending) | Same pattern as problems |
| Faculty Approve | Admins | "Faculty Approved [Item] - Review in admin panel" |
| Faculty Reject | Submitter | "Your [Item] was rejected: [reason]" |

**Test Steps:**
1. Create a pending problem → Check notification appears for self and admins
2. Update profile → Check self notification
3. Faculty approve change → Check admin notification
4. Faculty reject change → Check submitter notification
5. Verify audit_trail records all operations

---

### 8. Permission Guards
**Expected Behavior:**

| Action | Permission | Without Permission |
|--------|-----------|-------------------|
| Create Problem | faculty.create_problems | Return 403 Forbidden |
| Create Event | faculty.create_events | Return 403 Forbidden |
| Create Blog | faculty.create_blogs | Return 403 Forbidden |
| Manage Users | faculty.manage_users | Return 403 Forbidden |
| Manage Approvals | approvals.manage | Return 403 Forbidden |
| Auto-approve | faculty.auto_approve_* | Status='pending' instead of auto-approve |

**Test Steps:**
1. Try to create problem WITHOUT permission → Should fail with 403
2. Try to create event WITHOUT permission → Should fail with 403
3. Try to manage users WITHOUT permission → Should fail with 403
4. Try to manage approvals WITHOUT permission → Should fail with 403
5. Create item WITHOUT auto_approve permission → Verify status='pending'
6. Create item WITH auto_approve permission → Verify status='approved'

---

### 9. Audit Trail Validation
**Expected Audit Records:**

Each operation should create entry in `audit_trail`:
```
INSERT INTO audit_trail (
  user_id,           -- Faculty user ID
  action,            -- 'create_problem', 'update_problem', 'delete_problem', etc.
  resource_type,     -- 'problem', 'event', 'blog', 'profile'
  resource_id,       -- ID of the resource
  details,           -- JSON of changes (e.g., {status: 'pending'})
  created_at         -- NOW()
)
```

**Test Steps:**
1. Create, update, delete items
2. Query audit_trail: `SELECT * FROM audit_trail WHERE action IN ('create_problem', 'update_problem', 'delete_problem', ...) ORDER BY created_at DESC`
3. Verify all operations are recorded with correct details

---

### 10. Database Transaction Integrity
**Expected Behavior:**

When creating Problems/Events/Blogs:
- [ ] All-or-nothing: If any INSERT fails, entire transaction rolls back
- [ ] Tables updated: problems, content_items, content_problems, approvals all updated
- [ ] Relationships intact: content_item_id correctly linked
- [ ] No orphaned records

**Test Steps:**
1. Create problem successfully → Verify all 4 tables have entries
2. Trigger error during create (e.g., invalid difficulty) → Verify NO entries created
3. Query relationships: content_items.content_item_id should exist in content_problems and approvals

---

## Test Results Template

### Test Case: [Name]
- **Status:** ✅ PASS / ❌ FAIL / ⏳ PENDING
- **Expected:** [Expected result]
- **Actual:** [What actually happened]
- **Notes:** [Any observations]

---

## Known Limitations

1. **Events Participants Management** - `request_manage_faculty_event_participants` not yet implemented (placeholder)
2. **Admin Level 2 Approvals** - AdminDashboard enhancement for admin approval not yet implemented
3. **Modal Components** - Frontend modals use ButtonText but full form fields need to be wired in frontend components
4. **Socket Listener Cleanup** - Socket listeners don't unsubscribe after response (should improve in next phase)

---

## Success Criteria

✅ **All CRUD operations work without errors**
✅ **Permission guards enforce correctly**
✅ **Notifications delivered to appropriate users**
✅ **Audit trail records all changes**
✅ **Database transactions maintain integrity**
✅ **Two-level approvals workflow functions (faculty → pending_admin)**
✅ **No compilation errors (npm run build succeeds)**

---

## Next Steps After Smoke Test

1. Wire frontend components with socket helpers
2. Implement AdminDashboard level 2 approvals
3. Add modal form validation
4. Test complete 2-level workflow (faculty → admin)
5. Performance testing and optimization
6. Production deployment

