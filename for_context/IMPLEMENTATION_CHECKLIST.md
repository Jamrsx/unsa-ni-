# Faculty Dashboard Implementation Checklist

**Project:** DuelCode Capstone  
**Feature:** Faculty Dashboard with Two-Level Approval Workflow  
**Start Date:** December 19, 2025

---

## 📋 PHASE 1: Database Setup (READY TO EXECUTE)

### 1.1 Run Migration
- [ ] Backup current database (already done - project backed up)
- [ ] Run migration: `mysql -u root duelcode_capstone_project < sql/001_faculty_dashboard_migration.sql`
- [ ] Verify no errors in migration output
- [ ] Check migration completed successfully

### 1.2 Verify Tables Created
```sql
-- Run in MySQL
SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA='duelcode_capstone_project' AND TABLE_NAME='faculty_pending_changes';
```
- [ ] `faculty_pending_changes` table exists
- [ ] Table has all 18 columns (id, faculty_id, change_type, etc.)
- [ ] All indexes created
- [ ] Foreign keys set correctly

### 1.3 Verify Permissions Added
```sql
-- Run in MySQL
SELECT * FROM permissions WHERE permission_id >= 18 ORDER BY permission_id;
 [ ] Check permission: faculty.view_dashboard

### 1.4 Verify Faculty Role Permissions
 [ ] Check permission: faculty.manage_users
WHERE rp.role_id = 2
ORDER BY p.permission_id;
 [ ] Check permission: faculty.create_problems
### 1.5 Create Test Faculty User
```sql
 [ ] Check permission: event.approvals.manage

-- Get user ID and assign role
 [ ] Check permission: blog.approvals.manage
- [ ] Test faculty user created
- [ ] User has faculty role assigned
## 🔧 PHASE 2: Backend Implementation (server.js)
### 2.2 Dashboard Endpoints
- [ ] `GET /api/faculty/profile`
  - [ ] Requires authentication
  - [ ] Allow self-edit only (no approval needed)
- [ ] `POST /api/faculty/users`
- [ ] `PATCH /api/faculty/users/:id`
  - [ ] Check permission: faculty_manage_users
  - [ ] INSERT to faculty_pending_changes (action='delete')

### 2.4 Problem Management Endpoints
- [ ] `GET /api/faculty/problems`
  - [ ] If faculty_auto_approve_problems: INSERT directly
  - [ ] Else: INSERT to faculty_pending_changes

- [ ] `GET /api/faculty/events`
- [ ] `PATCH /api/faculty/events/:id`
- [ ] `DELETE /api/faculty/events/:id`
### 2.6 Blog Management Endpoints
  - [ ] Check permission: faculty_manage_blogs
- [ ] `GET /api/faculty/pending-approvals`
  - [ ] Check permission: faculty_manage_approvals
  - [ ] SET faculty_reviewer_id, faculty_review_date, faculty_review_comment
  - [ ] Return: success

  - [ ] Check admin role
  - [ ] Get change details
  - [ ] Apply to database based on action_type (create/update/delete)

- [ ] `POST /api/admin/reject-change/:changeId`

### 2.9 Testing Backend Endpoints
- [ ] Original_data preserved as JSON
- [ ] Errors handled gracefully
## 🎨 PHASE 3: Frontend Components
### 3.1 Create FacultyDashboard.vue
- [ ] Copy from src/AdminDashboard.vue
- [ ] Save as src/FacultyDashboard.vue
- [ ] `src/components/dashboard/faculty/content_dashboard.vue`
  - [ ] Copy from admin version
  - [ ] Only allow self-edit

  - [ ] Show message "Awaiting approval..." if change pending

- [ ] `src/components/dashboard/faculty/content_events.vue`
  - [ ] Same pattern as problems

- [ ] `src/components/dashboard/faculty/content_blogs.vue`
  - [ ] Same pattern as problems

- [ ] `src/components/dashboard/faculty/content_users.vue`
  - [ ] Show users list
  - [ ] Only show edit/create/delete if has faculty_manage_users
  - [ ] Show approval status

- [ ] `src/components/dashboard/faculty/content_approvals.vue`
  - [ ] NEW COMPONENT - specific to faculty approval workflow
  - [ ] Two tabs:
    - [ ] "Pending Faculty Review" (changes awaiting my approval)
    - [ ] "Awaiting Admin" (my approved changes waiting admin)
### 3.3 Create Faculty API Helper
- [ ] `src/js/faculty-dashboard.js`
  - [ ] `update_faculty_user(id, data, callback)`
  - [ ] `delete_faculty_user(id, callback)`
  - [ ] Similar for events and blogs
  - [ ] `get_pending_faculty_approvals(callback)`
- [ ] Show permission-based UI (hide/show buttons based on hasPermission)
- [ ] Handle both auto-approve and pending flows
- [ ] Toast notifications for success/error
- [ ] Loading states for async operations


## 🔗 PHASE 4: Integration & Routing
### 4.1 Update Router
  - [ ] Path: `/faculty-dashboard`
  - [ ] Requires: authentication + faculty role
### 4.2 Update Navigation
  - [ ] Only show for faculty users
  - [ ] Position: after admin dashboard or in user menu

### 4.3 Role-Based Access Control

### 4.4 Update Main App Component
---
## ✅ PHASE 5: Testing & Validation

### 5.1 Database Tests

### 5.2 Backend API Tests
- [ ] GET /api/faculty/dashboard returns data
- [ ] Permission checks reject unauthorized access
- [ ] POST /api/faculty/problems creates entry in faculty_pending_changes
- [ ] POST /api/faculty/approve-change updates status correctly
- [ ] POST /api/admin/commit-change applies changes to database
- [ ] Audit trail entries created

### 5.3 Frontend Component Tests
- [ ] FacultyDashboard loads without errors
### 5.4 End-to-End Workflow Test
2. [ ] Navigate to faculty dashboard
3. [ ] Create a blog post WITHOUT auto-approve permission
12. [ ] Verify blog actually created in blogs table
14. [ ] Verify status changed to committed

### 5.5 Permission Tests
- [ ] Network errors handled gracefully
- [ ] Invalid JSON data handled
- [ ] No N+1 query problems
### 5.8 Security Tests
- [ ] SQL injection attempts blocked
- [ ] XSS attempts blocked
- [ ] CSRF protection in place
- [ ] Only own profile can be edited
- [ ] Only authorized users can approve

---

## 📊 Verification Checklist
### Database Verification
```sql
-- Check migration
SHOW TABLES LIKE 'faculty_pending_changes';
SELECT * FROM faculty_pending_changes LIMIT 1;
```

### Backend Verification
- [ ] All routes defined and working
- [ ] No console errors on server startup
- [ ] Permission helper function tested
- [ ] Sample request/response logged correctly

### Frontend Verification
- [ ] No Vue compilation errors
- [ ] Components load without errors
- [ ] Network requests successful (200/201 status)
- [ ] UI reflects backend data

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All tests pass
- [ ] Code reviewed and approved
- [ ] Database backup created
- [ ] Migration tested on staging
- [ ] Performance acceptable

### Deployment Steps
1. [ ] Backup production database
2. [ ] Run migration on production
3. [ ] Deploy backend changes
4. [ ] Deploy frontend changes
5. [ ] Verify routes accessible
6. [ ] Test with real data
7. [ ] Monitor for errors

### Post-Deployment
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify approvals working
- [ ] Test end-to-end workflow
- [ ] Get user feedback

---

## 📝 Documentation Checklist

- [ ] Code comments added for complex logic
- [ ] README updated with new endpoints
- [ ] API documentation created
- [ ] Permission list documented
- [ ] Database schema documented
- [ ] Testing procedures documented
- [ ] User guide created for faculty
- [ ] Admin guide for commit process

---

## 🎯 Success Criteria

✅ All requirements met:
- [ ] Faculty can view dashboard
- [ ] Faculty can edit own account
- [ ] Faculty can view users/admins
- [ ] Faculty can create questions
- [ ] Faculty can create/edit/delete events
- [ ] Faculty can create/edit/delete blogs
- [ ] Faculty can manage approvals
- [ ] Two-level approval working
- [ ] Permission model working
- [ ] Audit trail logging

✅ System stability:
- [ ] No breaking changes
- [ ] All tests passing
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Backup/rollback ready

---

## 📞 Support & Questions

If issues arise:
1. Check FACULTY_DASHBOARD_SESSION.md for detailed info
2. Review SETUP_COMPLETE.md for overview
3. Check migration file syntax
4. Verify permissions assigned
5. Check browser console for errors
6. Review server logs for backend errors

---

## ✨ Completion Checklist

Final verification before marking complete:

- [ ] All database tests pass
- [ ] All API endpoints working
- [ ] All components loading
- [ ] Full workflow tested
- [ ] Approvals working as expected
- [ ] Audit trail logging
- [ ] No breaking changes
- [ ] Documentation complete
- [ ] Team sign-off received
- [ ] Ready for production

---

**Project Status:** Ready for implementation  
**Estimated Duration:** 2-3 days for experienced developer  
**Risk Level:** Low (non-destructive, two-level approval)  
**Rollback Plan:** Backup exists, migration reversible

**Start Phase 1 with:** `mysql -u root duelcode_capstone_project < sql/001_faculty_dashboard_migration.sql`
