# Faculty Dashboard Implementation Session
**Date:** December 19, 2025  
**Project:** DuelCode Capstone - Faculty Dashboard Feature

---

## Project Context
- **Workspace:** `DuelCode-Capstone-Project/`
- **Database:** `duelcode_capstone_project` (MySQL)
- **Main Files:**
  - Server: `server.js` (Node port 3000)
  - Frontend: `npm run dev` (Vite port 5173)
  - DB Helper: `db.js` (mysql2/promise pool, read-only queries)
  - Reference Helper: `for_context/db_get_tables.js`
  - Reference Component: `src/components/AdminDashboard.vue`

### Current Database (43 tables)
**Key Tables for Faculty:**
- `users`, `profiles`, `roles`, `user_roles`
- `permissions`, `role_permissions`, `user_permissions`
- `problems`, `problem_submissions`, `test_cases`
- `events`, `event_participants`, `event_schedule`
- `blogs`, `blog_likes`, `content_blogs`
- `approvals` (existing, will extend)
- `notifications`, `audit_trail`, `active_sessions`

---

## Requirements - Faculty Dashboard Features

### 1. **Dashboard View** (Read-only analytics)
   - View system statistics
   - View assigned events/problems/blogs
   - View approval status of submitted changes

### 2. **Edit Own Account**
   - Update profile information
   - Change password/settings
   - No permission checks needed (self-edit)

### 3. **View Users & Admin Tables**
   - Read: `users`, `profiles`, `user_roles`, `roles`
   - Edit: Only if permission `faculty_manage_users` is granted
   - Role-based restrictions apply

### 4. **Create Questions (Problems)**
   - Create new problems
   - Auto-submit to pending approval if no permission `faculty_auto_approve_problems`
   - If has permission, goes live immediately
   - Require permission: `faculty_create_problems`

### 5. **Manage Events**
   - View: All events
   - Create/Edit/Delete: If permission `faculty_manage_events`
   - Pending approval if no `faculty_auto_approve_events`
   - Requires audit trail in `audit_trail` table

### 6. **Manage Blogs**
   - View: All blogs
   - Create/Edit/Delete: If permission `faculty_manage_blogs`
   - Pending approval if no `faculty_auto_approve_blogs`
   - Requires audit trail

### 7. **Manage Approvals**
   - View pending faculty submissions (events, blogs, problems, user edits)
   - Approve/Deny changes with comments
   - Requires permission: `faculty_manage_approvals`
   - Admin must also approve before database commit

### 8. **Two-Level Approval System** (NEW FEATURE)
   - **Level 1 (Faculty Review):** Faculty with `faculty_manage_approvals` reviews pending items
   - **Level 2 (Admin Approval):** Admin reviews faculty-approved items and commits to DB
   - Audit trail tracks both approval levels
   - Workflow: Faculty Change → Pending → Faculty Approval → Pending Admin → Committed/Rejected

---

## Database Schema Changes

### 1. New Table: `faculty_pending_changes`
Stores all faculty submissions requiring approval before database commit.

**Columns:**
- `id` - Primary key
- `faculty_id` - Who submitted (FK → users)
- `change_type` - Type: problem, event, blog, user_edit, admin_edit
- `action_type` - Type: create, update, delete
- `table_name` - Target DB table
- `record_id` - Target record ID
- `original_data` - JSON snapshot before change
- `proposed_data` - JSON of requested changes
- `status` - Flow: pending_faculty_review → faculty_approved → pending_admin → committed/rejected
- `faculty_reviewer_id` - Faculty who reviewed (FK → users)
- `faculty_review_date` - When faculty reviewed
- `faculty_review_comment` - Faculty review notes
- `admin_reviewer_id` - Admin who reviewed (FK → users)
- `admin_review_date` - When admin reviewed
- `admin_review_comment` - Admin review notes
- Timestamps: `created_at`, `updated_at`

**Indexes:** status, faculty_id, change_type, created_at, pending_faculty_review

### 2. New Permissions (IDs 18-30) (normalized names)
```
18. faculty.view_dashboard                      - View faculty dashboard
19. faculty.edit_own_profile                    - Edit own profile
20. faculty.view_users                          - View users/profiles
21. faculty.manage_users                        - Create/edit/delete users (requires approval)
22. faculty.create_problems                     - Create problems
23. faculty.auto_approve_problems               - Auto-approve problems (no pending)
24. faculty.manage_events                       - Create/edit/delete events (requires approval if no auto)
25. faculty.auto_approve_events                 - Auto-approve events (no pending)
26. blog.approvals.manage                       - Create/edit/delete blogs (requires approval if no auto)
27. blog.auto_approve                           - Auto-approve blogs (no pending)
28. approvals.manage                            - Review/approve/deny faculty submissions
29. faculty.submit_for_review                   - Submit changes for review
30. faculty.can_request_user_admin_changes      - Request user/admin changes (requires two-level approval)
```

### 3. Migration File
**Location:** `sql/001_faculty_dashboard_migration.sql`
- Creates `faculty_pending_changes` table
- Inserts new permissions
- Assigns default faculty role permissions
- Adds necessary indexes and FKs
- Can be run independently (uses IF NOT EXISTS)

---

## Implementation Architecture

### Frontend: `FacultyDashboard.vue`
**Location:** `src/FacultyDashboard.vue`
**Base:** Copy from `src/AdminDashboard.vue` then modify sections

**Structure:**
```
FacultyDashboard.vue
├── Sections (SplitMainWindow)
│   ├── dashboard          (Read-only analytics)
│   ├── edit_account       (Self-edit only)
│   ├── users              (View/Edit if permission)
│   ├── problems           (Create/manage if permission)
│   ├── events             (Create/manage if permission)
│   ├── blogs              (Create/manage if permission)
│   └── approvals          (Review pending if permission)
├── Data Refs (reactive)
│   ├── dashboard_stats
│   ├── user_profile
│   ├── users_list
│   ├── problems_list
│   ├── events_list
│   ├── blogs_list
│   ├── pending_changes (from faculty_pending_changes)
│   └── my_approvals (changes awaiting faculty review)
└── Event Handlers
    ├── Permission checks before UI rendering
    ├── Form submissions to /api/faculty/* endpoints
    ├── Approval workflow handlers
    └── Two-level approval tracking
```

**Key Differences from AdminDashboard:**
1. Show only sections user has permission for
2. Create/Edit/Delete forms submit to `faculty_pending_changes` first
3. Separate approval UI for "Awaiting Faculty Review" vs "Awaiting Admin"
4. Read-only mode if no permission
5. Dashboard shows faculty-specific metrics

### Backend: Server Endpoints

**Location:** `server.js` (or dedicated `routes/faculty.js`)

**Permission Check Helper (reusable):**
```javascript
async function checkFacultyPermission(userId, permissionName) {
  // 1. Get user roles
  // 2. Get role_permissions for each role
  // 3. Get user-specific permissions override
  // 4. Return: { hasPermission: bool, permissionId: int }
}
```

**Endpoint Groups:**

#### Dashboard & Profile
```
GET /api/faculty/dashboard
  - Returns: total_users, total_problems, total_events, total_blogs
  - Requires: faculty_view_dashboard
  
GET /api/faculty/profile
  - Returns: logged-in faculty user profile
  - Requires: authentication only
  
PATCH /api/faculty/profile
  - Updates own profile
  - Requires: faculty_edit_own_profile
  - No approval needed (direct update)
```

#### User Management
```
GET /api/faculty/users
  - Returns: list of users (filtered by role if applicable)
  - Requires: faculty_view_users
  
POST /api/faculty/users
  - Submit new user for approval
  - Creates entry in faculty_pending_changes with action=create
  - Requires: faculty_manage_users + faculty_submit_for_review
  
PATCH /api/faculty/users/:id
  - Submit user edit for approval
  - Creates entry in faculty_pending_changes with action=update
  - Requires: faculty_manage_users + faculty_submit_for_review
  
DELETE /api/faculty/users/:id
  - Submit user delete for approval
  - Requires: faculty_manage_users + faculty_submit_for_review
```

#### Problem Management
```
GET /api/faculty/problems
  - Returns: problems created by faculty or all (based on permission)
  - Requires: faculty_create_problems
  
POST /api/faculty/problems
  - Create new problem
  - If has faculty_auto_approve_problems → create directly
  - Else → submit to faculty_pending_changes with status=pending_faculty_review
  - Requires: faculty_create_problems
  
PATCH /api/faculty/problems/:id
  - Update problem (similar approval logic)
  
DELETE /api/faculty/problems/:id
  - Delete problem (requires approval)
```

#### Event Management
```
GET /api/faculty/events
POST /api/faculty/events
PATCH /api/faculty/events/:id
DELETE /api/faculty/events/:id
  - Same flow as problems
  - Requires: faculty_manage_events (+ faculty_auto_approve_events for auto)
```

#### Blog Management
```
GET /api/faculty/blogs
POST /api/faculty/blogs
PATCH /api/faculty/blogs/:id
DELETE /api/faculty/blogs/:id
  - Same flow as problems
  - Requires: faculty_manage_blogs (+ faculty_auto_approve_blogs for auto)
```

#### Approval Workflow
```
GET /api/faculty/pending-approvals
  - Returns: faculty_pending_changes where status='pending_faculty_review'
  - Requires: faculty_manage_approvals
  
POST /api/faculty/approve-change/:id
  - Faculty approves a pending change
  - Updates faculty_pending_changes.status → 'pending_admin'
  - Sets faculty_reviewer_id, faculty_review_date, faculty_review_comment
  - Requires: faculty_manage_approvals
  
POST /api/faculty/deny-change/:id
  - Faculty denies a pending change
  - Updates faculty_pending_changes.status → 'rejected'
  - Sets faculty_review_comment
  - Requires: faculty_manage_approvals
  
GET /api/admin/pending-faculty-approvals
  - Admin endpoint: returns faculty_pending_changes with status='pending_admin'
  - Requires: admin role + problem.approvals.manage/event.approvals.manage/blog.approvals.manage
  
POST /api/admin/commit-change/:id
  - Admin approves and commits to database
  - Handles actual INSERT/UPDATE/DELETE based on change_type + action_type
  - Updates faculty_pending_changes.status → 'committed'
  - Updates audit_trail with admin approval
  - Requires: admin role
  
POST /api/admin/reject-change/:id
  - Admin rejects change permanently
  - Updates faculty_pending_changes.status → 'rejected'
```

### Data Flow: Two-Level Approval

**Scenario: Faculty creates a blog**

1. **User Submits (Frontend)**
   ```javascript
   POST /api/faculty/blogs
   {
     title: "My Blog",
     content: "...",
     status: "pending"
   }
   ```

2. **Backend Logic (server.js)**
   ```javascript
  // Check permission
  if (!hasPermission(userId, 'blog.approvals.manage')) return error
   
  // Check if auto-approve
  if (hasPermission(userId, 'blog.auto_approve')) {
     // Direct insert + return success
     INSERT INTO blogs (...)
   } else {
     // Create pending entry
     INSERT INTO faculty_pending_changes (
       faculty_id, change_type='blog', action_type='create',
       proposed_data={...}, status='pending_faculty_review'
     )
     return { success: true, status: 'pending_faculty_review', changeId: ... }
   }
   ```

3. **Faculty Reviews (Approval Tab)**
  - Faculty with `approvals.manage` sees pending changes
   - Can approve/deny with comment
   - POST /api/faculty/approve-change/:changeId
   - Status → 'pending_admin'

4. **Admin Reviews (Admin Dashboard)**
   - Admin sees faculty-approved changes in approval queue
   - Can commit/reject with comment
   - POST /api/admin/commit-change/:changeId
   - On commit: INSERT INTO blogs (...) + status → 'committed'
   - On reject: status → 'rejected'

5. **Result in Frontend**
   - Faculty sees "Awaiting Faculty Review" → "Approved, Awaiting Admin" → "Live"
   - Admin sees queue and acts on it
   - Audit trail logs all steps

---

## File Mapping

```
src/
├── FacultyDashboard.vue (NEW)
├── components/
│   └── dashboard/
│       └── faculty/
│           ├── content_dashboard.vue (NEW - copy from admin)
│           ├── content_edit_account.vue (NEW - copy from admin)
│           ├── content_problems.vue (NEW - copy & modify from admin)
│           ├── content_users.vue (NEW - copy & modify from admin)
│           ├── content_events.vue (NEW - copy & modify from admin)
│           ├── content_blogs.vue (NEW - copy & modify from admin)
│           └── content_approvals.vue (NEW - two-level approval UI)
├── js/
│   └── faculty-dashboard.js (NEW - API calls for faculty endpoints)
│
server.js (MODIFY)
├── Add /api/faculty/* routes
├── Add /api/admin/commit-change routes
├── Add checkFacultyPermission() helper
├── Add faculty approval logic

sql/
└── 001_faculty_dashboard_migration.sql (NEW - already created)
```

---

## Quick Reference: Steps to Implement

### Step 1: Database Migration
```bash
# In terminal, run migration
mysql -u root duelcode_capstone_project < sql/001_faculty_dashboard_migration.sql
```
✓ Creates `faculty_pending_changes` table
✓ Adds 13 new permissions (IDs 18-30)
✓ Assigns default permissions to faculty role

### Step 2: Backend Setup (server.js)
1. Add helper function: `checkFacultyPermission(userId, permissionName)`
2. Add routes group: `/api/faculty/*` (dashboard, users, problems, events, blogs, approvals)
3. Add routes group: `/api/admin/*` (pending-faculty-approvals, commit-change)
4. Implement approval logic: INSERT→faculty_pending_changes→faculty_review→admin_commit

### Step 3: Frontend Components
1. Copy `src/AdminDashboard.vue` → `src/FacultyDashboard.vue`
2. Replace data sources with faculty-specific endpoints
3. Add permission checks before showing sections
4. Add approval workflow UI (awaiting faculty, awaiting admin, committed, rejected tabs)

### Step 4: API Integration (src/js/faculty-dashboard.js)
1. Implement GET endpoints (dashboard, users, problems, etc.)
2. Implement POST endpoints (create with approval logic)
3. Implement approval endpoints (approve/deny changes)
4. Handle approval status display in frontend

### Step 5: Testing
1. Login as faculty user
2. Create problem/event/blog without auto-approve permission
3. Verify entry in faculty_pending_changes table
4. Login as faculty with manage_approvals → approve
5. Login as admin → see pending admin approvals → commit
6. Verify final change committed to database

---

## Key Code Patterns

### Permission Check in Backend
```javascript
const hasPermission = async (userId, permissionName) => {
  // Get user roles
  const [userRoles] = await pool.query(
    'SELECT role_id FROM user_roles WHERE user_id = ?', [userId]
  );
  
  // Get permission ID
  const [permData] = await pool.query(
    'SELECT permission_id FROM permissions WHERE permission_name = ?',
    [permissionName]
  );
  if (!permData.length) return false;
  
  const permId = permData[0].permission_id;
  
  // Check user-specific override
  const [userPerm] = await pool.query(
    'SELECT is_granted FROM user_permissions WHERE user_id = ? AND permission_id = ?',
    [userId, permId]
  );
  if (userPerm.length) return userPerm[0].is_granted;
  
  // Check role permissions
  const [rolePerm] = await pool.query(
    'SELECT permission_id FROM role_permissions WHERE role_id IN (?) AND permission_id = ?',
    [userRoles.map(r => r.role_id), permId]
  );
  return rolePerm.length > 0;
};
```

### Create with Approval Logic
```javascript
app.post('/api/faculty/blogs', async (req, res) => {
  const userId = req.user.id;
  const { title, content, status } = req.body;
  
  // Check permission
  if (!await hasPermission(userId, 'blog.approvals.manage')) {
    return res.status(403).json({ success: false, message: 'No permission' });
  }
  
  // Check if auto-approve
  const hasAutoApprove = await hasPermission(userId, 'faculty_auto_approve_blogs');
  
  if (hasAutoApprove) {
    // Direct insert
    const result = await pool.query(
      'INSERT INTO blogs (title, content, user_id, status, created_at) VALUES (?, ?, ?, ?, NOW())',
      [title, content, userId, 'published']
    );
    return res.json({ success: true, status: 'approved', blogId: result.insertId });
  } else {
    // Submit for approval
    const result = await pool.query(
      'INSERT INTO faculty_pending_changes (faculty_id, change_type, action_type, table_name, proposed_data, status) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, 'blog', 'create', 'blogs', JSON.stringify({ title, content, status }), 'pending_faculty_review']
    );
    return res.json({ success: true, status: 'pending_faculty_review', changeId: result.insertId });
  }
});
```

### Faculty Approval Endpoint
```javascript
app.post('/api/faculty/approve-change/:changeId', async (req, res) => {
  const changeId = req.params.changeId;
  const userId = req.user.id;
  const { comment } = req.body;
  
  // Check permission
  if (!await hasPermission(userId, 'approvals.manage')) {
    return res.status(403).json({ success: false, message: 'No permission' });
  }
  
  // Update status to pending_admin
  await pool.query(
    'UPDATE faculty_pending_changes SET status = ?, faculty_reviewer_id = ?, faculty_review_date = NOW(), faculty_review_comment = ? WHERE id = ?',
    ['pending_admin', userId, comment, changeId]
  );
  
  res.json({ success: true, message: 'Change approved and sent to admin' });
});
```

### Admin Commit Endpoint
```javascript
app.post('/api/admin/commit-change/:changeId', async (req, res) => {
  const changeId = req.params.changeId;
  const userId = req.user.id;
  const { comment } = req.body;
  
  // Verify admin
  if (!await hasPermission(userId, 'approve_problem')) {
    return res.status(403).json({ success: false, message: 'Admin only' });
  }
  
  // Get change details
  const [change] = await pool.query(
    'SELECT * FROM faculty_pending_changes WHERE id = ?', [changeId]
  );
  if (!change.length) return res.status(404).json({ success: false });
  
  const ch = change[0];
  
  try {
    // Apply change to database
    const proposed = JSON.parse(ch.proposed_data);
    
    if (ch.action_type === 'create') {
      await pool.query(
        `INSERT INTO ${ch.table_name} (...) VALUES (...)`,
        [...]
      );
    } else if (ch.action_type === 'update') {
      await pool.query(
        `UPDATE ${ch.table_name} SET ... WHERE id = ?`,
        [ch.record_id]
      );
    } else if (ch.action_type === 'delete') {
      await pool.query(
        `DELETE FROM ${ch.table_name} WHERE id = ?`,
        [ch.record_id]
      );
    }
    
    // Mark as committed
    await pool.query(
      'UPDATE faculty_pending_changes SET status = ?, admin_reviewer_id = ?, admin_review_date = NOW(), admin_review_comment = ? WHERE id = ?',
      ['committed', userId, comment, changeId]
    );
    
    res.json({ success: true, message: 'Change committed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

---

## Testing Checklist

- [ ] Database migration runs without errors
- [ ] Faculty role has correct default permissions
- [ ] Faculty user can login and access FacultyDashboard
- [ ] Dashboard shows only sections user has permission for
- [ ] Faculty can create problem → goes to faculty_pending_changes
- [ ] Faculty with manage_approvals can approve → status changes to pending_admin
- [ ] Admin sees pending admin approvals
- [ ] Admin can commit → change applied to database
- [ ] Audit trail logs all actions
- [ ] Permission override in user_permissions works correctly
- [ ] Auto-approve permission bypasses approval workflow

---

## Important Notes

1. **Non-Destructive:** All changes stored in JSON before commit
2. **Audit Trail:** Every change tracked with who, when, status
3. **Two-Level:** Faculty reviews first, admin commits to DB
4. **Permissions:** Role + User-level overrides work together
5. **Status Flow:** pending_faculty_review → faculty_approved → pending_admin → committed/rejected
6. **Original Data:** Preserved for auditing and potential rollbacks
7. **AI Model Safety:** No breaking changes to existing AdminDashboard or system

---

## Progress Tracking
- [x] Read AdminDashboard.vue
- [x] Analyze current roles/permissions schema
- [x] Design faculty approval schema
- [x] Create DB migrations (001_faculty_dashboard_migration.sql)
- [ ] Build FacultyDashboard.vue
- [ ] Implement backend endpoints
- [ ] Test full workflow
- [ ] Deploy to production

