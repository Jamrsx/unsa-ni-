# Faculty Dashboard CRUD Wiring Plan
**Date:** December 19, 2025  
**Session:** Final Phase - Complete CRUD + Approvals + Notifications

---

## Architecture Overview

### Frontend Pattern (to match AdminDashboard.vue)
```
FacultyDashboard.vue
├── Import ButtonText from button-text.vue
├── Import modals (create/edit/view)
├── Emit socket events via faculty-dashboard.js
└── Render content_[section].vue (users, problems, events, blogs, approvals)

content_[section].vue
├── Display tables with data
├── Use ButtonText for Create/Edit/Delete actions
├── Emit events to FacultyDashboard on action
└── Pass disabled/readonly based on perms object
```

### Backend Pattern (to match socket handlers)
```
server.js / socket handlers
├── Verify token & session
├── Check permission with ensurePermission()
├── Execute DB transaction
├── Create audit_trail record
├── Emit notification socket event
├── Return response with success/error
└── (Optional) Broadcast update to other clients
```

### Database Pattern
```
Core Tables:
- users, profiles, user_roles, roles, permissions, role_permissions
- problems, events, blogs (main content)
- content_items, content_blogs, approvals (linking & approval tracking)
- audit_trail (all changes logged)
- notifications (notification records)
```

---

## CRUD Endpoints by Resource

### 1. Edit Account (Self-edit only)
**Frontend:** FacultyDashboard.vue → content_edit_account.vue  
**Backend Endpoint:** `request_update_faculty_profile`
- **Method:** POST (socket)
- **Permissions:** None (self-edit always allowed)
- **Payload:** { token_session, first_name, last_name, email, phone }
- **Response:** { success, message, updated_at }
- **Notifications:** Send to user "Your profile was updated"
- **Audit:** Log change in audit_trail with action='update_profile'

---

### 2. Users Management
**Frontend:** content_users.vue (View + Actions)  
**Permission:** `faculty.manage_users` (if false, table shows but actions disabled)
**Buttons:**
- View → view-user modal (read-only, shows profile details)
- Ban → request socket to ban user (not implemented, placeholder)

**Backend Endpoints:**
- `request_get_faculty_users` → List all users
- `request_view_faculty_user` → Get single user details
- (Ban user — PLACEHOLDER: not in scope yet)

---

### 3. Problems Management
**Frontend:** content_problems.vue  
**Modals:** ProblemCreateModal, ProblemEditModal, ProblemViewModal (copy from AdminDashboard)  
**Permission:** `faculty.create_problems` required to manage

**Buttons:**
- Create → Open ProblemCreateModal  
- View → Open ProblemViewModal (read-only)
- Edit → Open ProblemEditModal (if owned or permission)
- Delete → Confirm, emit delete event

**Backend Endpoints:**
- `request_create_faculty_problem` 
  - **Payload:** { token_session, problem_name, description, difficulty, ... }
  - **Auto-approval:** If user has `faculty.auto_approve_problems`, status='Active'; else 'pending'
  - **Notification:** Send to admins if pending approval
- `request_update_faculty_problem`
  - **Payload:** { token_session, problem_id, ... updated fields }
  - **Workflow:** If auto-approve, commit immediately; else pending approval
  - **Notification:** Send to admins if pending
- `request_delete_faculty_problem`
  - **Payload:** { token_session, problem_id }
  - **Notification:** Send to admins if pending deletion
- `request_get_faculty_problems` → List filtered by role

**Modals (Copy from AdminDashboard):**
- Must use same layout: header, form fields, buttons at bottom
- Create/Edit: form fields + submit/cancel
- View: read-only fields + close button
- All buttons: Use ButtonText component

---

### 4. Events Management
**Frontend:** content_events.vue  
**Modals:** EventCreateModal, EventEditModal, EventViewModal, EventParticipantsModal  
**Permission:** `event.approvals.manage`

**Buttons:**
- Create → EventCreateModal
- View → EventViewModal
- Edit → EventEditModal
- Participants → EventParticipantsModal
- Delete → Confirm

**Backend Endpoints:**
- `request_create_faculty_event`
  - **Payload:** { token_session, event_name, description, starts_at, ends_at, ... }
  - **Auto-approval:** Same as problems
  - **Notification:** Admins if pending
- `request_update_faculty_event`
- `request_delete_faculty_event`
- `request_get_faculty_events`
- `request_manage_faculty_event_participants` (add/remove)

---

### 5. Blogs Management
**Frontend:** content_blogs.vue  
**Modals:** BlogCreateModal, BlogEditModal, BlogViewModal  
**Permission:** `blog.approvals.manage`

**Backend Endpoints:**
- `request_create_faculty_blog`
- `request_update_faculty_blog`
- `request_delete_faculty_blog`
- `request_get_faculty_blogs`

**Same pattern as Problems/Events**

---

### 6. Approvals (2-Level Workflow)
**Frontend:** content_approvals.vue  
**Permission:** `approvals.manage`

**Level 1 (Faculty Review):**
- Tab 1: Pending Approvals (Events, Blogs, Problems submitted by any faculty)
  - Tables show: Content Name, Submitter, Status, Date
  - Buttons: View, Approve, Reject
  - Modal: Shows content + form for reason/comment
- Tab 2: Approved Items (items faculty approved, awaiting admin)

**Backend Endpoints:**
- `request_get_pending_faculty_approvals`
  - **Query:** Items where status='pending_faculty_review'
  - **Return:** { events: [...], blogs: [...], problems: [...] }
- `request_approve_faculty_change`
  - **Payload:** { token_session, change_id, comment }
  - **Update:** Set status='faculty_approved', faculty_reviewer_id, faculty_review_date/comment
  - **Notification:** Send to admins "Faculty approved [item]"
  - **Audit:** Log approval
- `request_deny_faculty_change`
  - **Payload:** { token_session, change_id, reason }
  - **Update:** Set status='rejected', reason
  - **Notification:** Send to submitter "Your [item] was rejected: [reason]"
  - **Audit:** Log rejection

**Admin Dashboard Enhancement (NEW):**
- Add new section: "Pending Faculty Approvals" (or extend existing Approvals)
- Tabs: Events, Blogs, Problems (items pending admin approval after faculty approved)
- Admin can: View, Approve (commit to DB), Reject (notify faculty)
- **Endpoints:**
  - `request_get_admin_pending_faculty_approvals`
  - `request_approve_admin_faculty_change` (commits to DB, creates content record)
  - `request_deny_admin_faculty_change` (rejects, notifies faculty)

---

## Notification Integration

**Events to emit (Socket):**
1. `notification` - General notification (title, message, type, data)
2. `approval_pending_faculty` - Item awaiting faculty approval
3. `approval_pending_admin` - Item awaiting admin approval (after faculty approved)
4. `problem_created`, `event_created`, `blog_created`
5. `problem_updated`, `event_updated`, `blog_updated`
6. `problem_deleted`, `event_deleted`, `blog_deleted`

**Notification payload:**
```javascript
{
  notification_id: UUID,
  user_id: target user,
  type: 'approval' | 'create' | 'update' | 'delete',
  title: "Problem created: My Problem",
  message: "Your problem 'My Problem' was successfully created",
  data: {
    resource_type: 'problem' | 'event' | 'blog' | 'user_edit',
    resource_id: ID,
    status: 'pending' | 'approved' | 'rejected',
    action_url: '#problems' or '#events', etc
  }
}
```

**Database:** Store in `notifications` table via `/api/notifications/create`

---

## Security & Permissions

**Permission Checks (on every endpoint):**
1. Verify token via middleware `authMiddleware`
2. Check specific permission via `requirePermission('faculty.create_problems')`
3. Verify ownership (faculty can only edit their own items OR has `faculty_*` permission)
4. Return 403 if unauthorized

**Example Middleware:**
```javascript
app.post('/api/faculty/create-problem', authMiddleware, requirePermission('faculty_create_problems'), async (req, res) => {
  // code
})
```

**Socket Handler Pattern:**
```javascript
socket.on('request_create_faculty_problem', async ({ token_session, problem_data }) => {
  try {
    const session = await verifySession(token_session);
    const allowed = await ensurePermission(session.userId, 'faculty_create_problems');
    if (!allowed) {
      socket.emit('response_create_faculty_problem', { success: false, message: 'Unauthorized' });
      return;
    }
    // Create logic
    socket.emit('response_create_faculty_problem', { success: true, problem_id, ... });
    // Emit notification
    io.to(adminRoom).emit('notification', { ... });
  } catch (err) {
    socket.emit('response_create_faculty_problem', { success: false, message: err.message });
  }
});
```

---

## Modal Interface Requirements

**Copy from AdminDashboard modals:**
- Header with title + close button
- Body with form fields or read-only display
- Footer with buttons (Cancel, Save/Approve/Reject)
- Use ButtonText for all buttons
- Modal IDs: `createProblemModal`, `editProblemModal`, `viewProblemModal`, etc.
- Trigger: `data-bs-toggle="modal" data-bs-target="#createProblemModal"`

**Example Structure:**
```vue
<template>
  <div class="modal" id="createProblemModal">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Create Problem</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="onSubmit">
            <div class="mb-3">
              <label class="form-label">Problem Name</label>
              <input v-model="form.name" type="text" class="form-control" required />
            </div>
            <!-- more fields -->
          </form>
        </div>
        <div class="modal-footer">
          <ButtonText title="Cancel" data-bs-dismiss="modal" />
          <ButtonText title="Create" @click="onSubmit" />
        </div>
      </div>
    </div>
  </div>
</template>
```

---

## Implementation Checklist

### Phase 1: Backend Socket Handlers
- [ ] `request_update_faculty_profile` (Edit Account)
- [ ] `request_get_faculty_users`, `request_view_faculty_user` (Users)
- [ ] `request_create_faculty_problem`, `request_update_faculty_problem`, `request_delete_faculty_problem`, `request_get_faculty_problems` (Problems)
- [ ] `request_create_faculty_event`, `request_update_faculty_event`, `request_delete_faculty_event`, `request_get_faculty_events`, `request_manage_faculty_event_participants` (Events)
- [ ] `request_create_faculty_blog`, `request_update_faculty_blog`, `request_delete_faculty_blog`, `request_get_faculty_blogs` (Blogs)
- [ ] `request_get_pending_faculty_approvals`, `request_approve_faculty_change`, `request_deny_faculty_change` (Approvals L1)
- [ ] `request_get_admin_pending_faculty_approvals`, `request_approve_admin_faculty_change`, `request_deny_admin_faculty_change` (Approvals L2 - AdminDashboard)

### Phase 2: Frontend JavaScript Helpers
- [ ] `src/js/faculty-dashboard.js` - Socket wrapper functions for all CRUD operations

### Phase 3: Frontend UI Components
- [ ] Update modals in `src/components/dashboard/faculty/` to match AdminDashboard layout
- [ ] Replace create buttons with ButtonText + modal-button.vue
- [ ] Wire modal open/close events
- [ ] Add form validation

### Phase 4: Notification & Audit Integration
- [ ] Add notification socket emissions to all CRUD handlers
- [ ] Ensure audit_trail records all changes
- [ ] Test notification delivery to multiple users

### Phase 5: AdminDashboard Enhancement
- [ ] Add "Pending Faculty Approvals" section (or extend Approvals)
- [ ] Wire admin approval handlers
- [ ] Test 2-level workflow end-to-end

### Phase 6: Smoke Testing
- [ ] Test each CRUD operation as faculty
- [ ] Verify permission guards work
- [ ] Test notification delivery
- [ ] Test approvals workflow (faculty → admin)
- [ ] Verify audit trail records
- [ ] Test modal open/close, form validation

---

## Notes for Implementation

1. **Ownership Checks:** Faculty can only edit/delete their own items UNLESS they have `faculty_*_manage` permissions
2. **Auto-approval:** If faculty has `faculty_auto_approve_*`, set status='Active' immediately; else 'pending'
3. **Notifications:** Always emit to relevant audience:
   - Create: Admins (if pending), Faculty (success notification)
   - Update: Same as Create
   - Delete: Admins (if pending), Faculty (success)
   - Approve/Deny: Submitter + relevant admins
4. **Modal-button.vue:** Replaces `<button>` in tables; triggers modal + passes data
5. **Copy AdminDashboard patterns:** Use same modal structure, button styles, error handling
6. **Database Transactions:** Use transactions for multi-table changes (e.g., create problem + create approval record)

---

## Session Output
This plan will be executed incrementally in order:
1. Backend handlers (socket)
2. Frontend helpers (JS)
3. UI updates (modals + buttons)
4. Notifications
5. AdminDashboard enhancement
6. Full smoke test

