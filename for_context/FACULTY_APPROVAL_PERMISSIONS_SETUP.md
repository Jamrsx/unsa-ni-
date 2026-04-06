# Faculty Approval Permissions Setup Guide

## Overview
This guide will help you add the necessary permissions for faculty to approve/deny pending problems, events, and blogs in the Faculty Dashboard.

## Prerequisites
- Access to your MySQL/MariaDB database
- Admin access to the DuelCode application
- The SQL migration file: `sql/002_add_approval_permissions.sql`

## Installation Steps

### Step 1: Run the SQL Migration

1. Open your MySQL client (phpMyAdmin, MySQL Workbench, or command line)
2. Select the `duelcode_capstone_project` database
3. Run the migration file:

```bash
# From command line:
mysql -u your_username -p duelcode_capstone_project < sql/002_add_approval_permissions.sql

# Or copy the SQL content and execute in phpMyAdmin
```

### Step 2: Verify Permissions Were Added

Run these queries to verify:

```sql
-- Check if permissions were created
SELECT * FROM permissions WHERE permission_id BETWEEN 31 AND 36;

-- Check if faculty role has the permissions
SELECT r.role_name, p.permission_name, p.description
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.role_id
JOIN permissions p ON rp.permission_id = p.permission_id
WHERE r.role_name = 'faculty' AND p.permission_id BETWEEN 31 AND 36;
```

You should see 6 new permissions (normalized names shown):
- `problem.approvals.manage` (ID: 31)
- `problem.approvals.manage` (ID: 32)
- `event.approvals.manage` (ID: 33)
- `event.approvals.manage` (ID: 34)
- `blog.approvals.manage` (ID: 35)
- `blog.approvals.manage` (ID: 36)

### Step 3: Grant Permissions to Faculty Users (Through Admin Dashboard)

1. Log in as an Admin
2. Navigate to **Admin Dashboard > Admin**
3. Find a faculty user and click **Edit**
4. You'll see new toggles under different sections:
   - **Question Set**: "Approve pending problems/questions", "Deny pending problems/questions"
   - **Event**: "Approve pending events", "Deny pending events"
   - **Blog**: "Approve pending blog posts", "Deny pending blog posts"
5. Enable the permissions you want this faculty member to have
6. Click **Save**

### Step 4: Update Backend Permission Checks (Server-side)

The backend needs to check for these permissions. Update your server.js or the relevant socket handler:

```javascript
// In server.js or your socket handlers
socket.on('request_approve_question', async (data) => {
  const { token_session, question_id, approval_id } = data;
  
  // Check if user has 'problem.approvals.manage' permission
  const hasPermission = await checkUserPermission(token_session, 'problem.approvals.manage');
  
  if (!hasPermission) {
    socket.emit('response_approve_question', {
      success: false,
      message: 'Unauthorized: You do not have permission to approve problems'
    });
    return;
  }
  
  // Continue with approval logic...
});
```

Apply similar checks for:
- `request_deny_question` → check `problem.approvals.manage`
- `request_approve_event` → check `event.approvals.manage`
- `request_deny_event` → check `event.approvals.manage`
- `request_approve_blog` → check `blog.approvals.manage`
- `request_deny_blog` → check `blog.approvals.manage`

## Testing

### Test Faculty Approval Permissions

1. Log in as a faculty user who has been granted the approval permissions
2. Navigate to **Faculty Dashboard > Problems > Pending Question**
3. You should see green checkmark and red X buttons next to each pending question
4. Click the checkmark to approve - it should succeed
5. Click the red X to deny - it should prompt for a reason and succeed

Repeat for:
- **Events > Pending Event**
- **Blogs > Pending Blog**

### Test Permission Denial

1. Log in as a faculty user WITHOUT approval permissions
2. Try to approve/deny items - you should see "Unauthorized: You do not have permission to approve..."

## Troubleshooting

### Issue: "Unauthorized: Admin access required"
**Solution**: This means the backend is checking for admin role instead of the specific permission. Update the server-side handler to check for the permission (e.g., `approve_problem`) instead of role.

### Issue: Permissions don't appear in Admin > Edit modal
**Solution**: 
1. Verify permissions exist in database: `SELECT * FROM permissions WHERE permission_id BETWEEN 31 AND 36;`
2. Check the `category` field matches what's expected in `content_admin.vue` (should be 'blog', 'event', 'question set')
3. Restart your Node.js server

### Issue: Buttons don't appear for faculty
**Solution**: 
1. Check if CSS is loaded: inspect element and look for `.pending_table_check_btn`
2. Clear browser cache
3. Verify buttons are in the correct template section (e.g., `#problem_pending`, not `#problem_all`)

## What Was Changed

### Frontend Changes:
1. **content_problems.vue**: Added approve/deny buttons to pending problems section
2. **content_events.vue**: Added approve/deny buttons to pending events section  
3. **content_blogs.vue**: Added approve/deny buttons to pending blogs section
4. **FacultyDashboard.vue**: Wired up handlers for approve/deny actions
5. **dashboard_faculty.css**: Added button icon styling with CSS masks

### Database Changes:
1. Added 6 new permissions (IDs 31-36)
2. Assigned permissions to faculty role by default
3. Assigned permissions to admin role as well

### Backend Changes Needed:
- Update socket handlers to check for specific permissions instead of admin role
- Use permission names: `problem.approvals.manage`, `event.approvals.manage`, `blog.approvals.manage`

## Next Steps

After completing this setup, faculty users will be able to:
- ✅ View pending problems, events, and blogs
- ✅ Approve pending items (if granted `approve_*` permission)
- ✅ Deny pending items (if granted `deny_*` permission)
- ✅ See visual feedback with green/red icon buttons
- ✅ Receive toast notifications on success/failure

All actions are tracked and logged for audit purposes.
