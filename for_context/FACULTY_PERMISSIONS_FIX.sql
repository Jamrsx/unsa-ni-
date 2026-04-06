-- ============================================================================
-- FACULTY DASHBOARD PERMISSIONS FIX
-- ============================================================================
-- This script ensures faculty_test_user has all required permissions.
-- Run this in your MySQL client or via phpMyAdmin:
--   mysql -u root duelcode_capstone_project < for_context/FACULTY_PERMISSIONS_FIX.sql
--
-- What it does:
-- 1. Creates missing permissions in the `permissions` table
-- 2. Assigns them to the 'Faculty' role via `role_permissions`
-- 3. Verifies faculty_test_user gets them through role inheritance
--
-- ============================================================================

-- Step 1: Ensure all required permissions exist
INSERT IGNORE INTO permissions (permission_name, description) VALUES
('faculty.view_dashboard', 'View faculty dashboard overview'),
('faculty.view_users', 'View users management section'),
('problem.create', 'Create and manage problems'),
('event.create', 'Create and manage events'),
('blog.approvals.manage', 'Create and manage blogs'),
('approvals.manage', 'Approve/deny pending changes'),
('faculty.edit_own_profile', 'Edit own profile/account'),
('faculty.submit_for_review', 'Submit changes for admin review'),
('problem.auto_approve', 'Auto-approve own problem changes'),
('event.auto_approve', 'Auto-approve own event changes'),
('blog.auto_approve', 'Auto-approve own blog changes');

-- Step 2: Get the Faculty role ID (assumes role_name = 'Faculty')
SET @faculty_role_id = (SELECT role_id FROM roles WHERE role_name = 'Faculty' LIMIT 1);

-- Step 3: If Faculty role exists, grant all permissions to it
-- (If not found, you'll need to create the role first)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT @faculty_role_id, permission_id FROM permissions 
WHERE permission_name IN (
    'faculty_view_dashboard',
    'faculty.view_dashboard',
    'faculty.view_users',
    'problem.create',
    'event.create',
    'blog.approvals.manage',
    'approvals.manage',
    'faculty.edit_own_profile',
    'faculty.submit_for_review',
    'problem.auto_approve',
    'event.auto_approve',
    'blog.auto_approve'
);

-- Step 4: Verify faculty_test_user has Faculty role
-- If not, add it:
SET @faculty_user_id = (SELECT user_id FROM users WHERE username = 'faculty_test_user' LIMIT 1);
INSERT IGNORE INTO user_roles (user_id, role_id)
VALUES (@faculty_user_id, @faculty_role_id);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the permissions are set up correctly:

-- Check if Faculty role exists
SELECT 'Faculty role check:' as Check_Type;
SELECT role_id, role_name FROM roles WHERE role_name = 'Faculty';

-- Check if faculty_test_user exists
SELECT 'faculty_test_user check:' as Check_Type;
SELECT user_id, username, role FROM users WHERE username = 'faculty_test_user';

-- Check if faculty_test_user has Faculty role
SELECT 'faculty_test_user roles:' as Check_Type;
SELECT u.username, r.role_name 
FROM users u
LEFT JOIN user_roles ur ON u.user_id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.role_id
WHERE u.username = 'faculty_test_user';

-- Check all faculty permissions exist
SELECT 'All faculty permissions:' as Check_Type;
SELECT permission_id, permission_name 
FROM permissions 
WHERE permission_name LIKE 'faculty_%'
ORDER BY permission_name;

-- Check if Faculty role has all required permissions
SELECT 'Faculty role permissions:' as Check_Type;
SELECT r.role_name, p.permission_name 
FROM roles r
LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.permission_id
WHERE r.role_name = 'Faculty'
ORDER BY p.permission_name;

-- ============================================================================
-- IF YOU GET "Role not found" or "User not found" errors:
-- ============================================================================
-- You may need to create the Faculty role and/or user. 
-- See setup scripts in sql/ directory or ask DevOps for the schema.
-- Common alternative role names: 'faculty', 'FACULTY', 'Instructor', 'Teacher'
