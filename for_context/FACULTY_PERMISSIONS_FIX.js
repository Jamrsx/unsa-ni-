#!/usr/bin/env node
/**
 * FACULTY_PERMISSIONS_FIX.js
 * 
 * Auto-fixes faculty_test_user permissions by:
 * 1. Creating missing permissions in the `permissions` table
 * 2. Assigning them to the 'Faculty' role
 * 3. Ensuring faculty_test_user has the Faculty role
 * 
 * Usage:
 *   node for_context/FACULTY_PERMISSIONS_FIX.js
 */

const path = require('path')
const { pool } = require(path.join(__dirname, '..', 'db'))

// Helper to run queries on the pool
const queryWithPool = async (sql, params = []) => {
  const conn = await pool.getConnection()
  try {
    return await conn.query(sql, params)
  } finally {
    conn.release()
  }
}

const FACULTY_PERMISSIONS = [
  'faculty.view_dashboard',
  'faculty.view_users',
  'faculty.create_problems',
  'faculty.manage_events',
  'blog.approvals.manage',
  'approvals.manage',
  'faculty.edit_own_profile',
  'faculty.submit_for_review',
  'faculty.auto_approve_problems',
  'faculty.auto_approve_events',
  'blog.auto_approve'
]

async function main() {
  console.log('[Faculty Permissions Fix] Starting...\n')

  try {
    // Step 1: Get or create Faculty role
    console.log('Step 1: Checking Faculty role...')
    let [roleRows] = await queryWithPool(`SELECT role_id FROM roles WHERE role_name = 'Faculty' LIMIT 1`)
    let facultyRoleId = roleRows.length ? roleRows[0].role_id : null

    if (!facultyRoleId) {
      console.log('  ⚠️  Faculty role not found. Creating...')
      const [result] = await queryWithPool(`INSERT INTO roles (role_name, description) VALUES (?, ?)`, [
        'Faculty',
        'Faculty members - can manage problems, events, blogs, and manage approvals'
      ])
      facultyRoleId = result.insertId
      console.log('  ✓ Faculty role created:', facultyRoleId)
    } else {
      console.log('  ✓ Faculty role exists:', facultyRoleId)
    }

    // Step 2: Create missing permissions
    console.log('\nStep 2: Creating missing permissions...')
    for (const permName of FACULTY_PERMISSIONS) {
      const [permRows] = await queryWithPool(
        `SELECT permission_id FROM permissions WHERE permission_name = ? LIMIT 1`,
        [permName]
      )
      if (!permRows.length) {
        const [result] = await queryWithPool(
          `INSERT INTO permissions (permission_name, description) VALUES (?, ?)`,
          [permName, `Permission: ${permName}`]
        )
        console.log(`  ✓ Created: ${permName}`)
      } else {
        console.log(`  • Already exists: ${permName}`)
      }
    }

    // Step 3: Assign all permissions to Faculty role
    console.log('\nStep 3: Assigning permissions to Faculty role...')
    for (const permName of FACULTY_PERMISSIONS) {
      const [permRows] = await queryWithPool(
        `SELECT permission_id FROM permissions WHERE permission_name = ? LIMIT 1`,
        [permName]
      )
      if (!permRows.length) {
        console.log(`  ✗ Permission not found: ${permName}`)
        continue
      }
      const permId = permRows[0].permission_id

      // Check if assignment already exists
      const [rpRows] = await queryWithPool(
        `SELECT 1 FROM role_permissions WHERE role_id = ? AND permission_id = ? LIMIT 1`,
        [facultyRoleId, permId]
      )
      if (!rpRows.length) {
        await queryWithPool(
          `INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)`,
          [facultyRoleId, permId]
        )
        console.log(`  ✓ Assigned: ${permName}`)
      } else {
        console.log(`  • Already assigned: ${permName}`)
      }
    }

    // Step 4: Ensure faculty_test_user exists and has Faculty role
    console.log('\nStep 4: Checking faculty_test_user...')
    let [userRows] = await queryWithPool(
      `SELECT user_id FROM users WHERE username = 'faculty_test_user' LIMIT 1`
    )
    if (!userRows.length) {
      console.log('  ✗ faculty_test_user NOT FOUND. Please create this user first.')
      console.log('    (You can do this via the admin dashboard or registration.)\n')
      process.exit(1)
    }
    const facultyUserId = userRows[0].user_id
    console.log('  ✓ faculty_test_user found:', facultyUserId)

    // Check if user has Faculty role
    const [urRows] = await queryWithPool(
      `SELECT 1 FROM user_roles WHERE user_id = ? AND role_id = ? LIMIT 1`,
      [facultyUserId, facultyRoleId]
    )
    if (!urRows.length) {
      console.log('  ⚠️  faculty_test_user does not have Faculty role. Adding...')
      await queryWithPool(
        `INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`,
        [facultyUserId, facultyRoleId]
      )
      console.log('  ✓ Faculty role assigned to faculty_test_user')
    } else {
      console.log('  ✓ faculty_test_user already has Faculty role')
    }

    // Step 5: Verify everything
    console.log('\n' + '='.repeat(60))
    console.log('VERIFICATION')
    console.log('='.repeat(60))

    const [finalPerms] = await queryWithPool(
      `SELECT p.permission_name
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.permission_id
       WHERE rp.role_id = ?
       ORDER BY p.permission_name`,
      [facultyRoleId]
    )
    console.log(`\nFaculty role has ${finalPerms.length} permissions:`)
    finalPerms.forEach((row) => console.log(`  • ${row.permission_name}`))

    const [userRoles] = await queryWithPool(
      `SELECT r.role_name
       FROM user_roles ur
       JOIN roles r ON ur.role_id = r.role_id
       WHERE ur.user_id = ?`,
      [facultyUserId]
    )
    console.log(`\nfaculty_test_user has ${userRoles.length} role(s):`)
    userRoles.forEach((row) => console.log(`  • ${row.role_name}`))

    console.log('\n✅ Permission setup complete!\n')
    console.log('Next steps:')
    console.log('  1. Restart backend: node server.js')
    console.log('  2. Restart frontend: npm run dev')
    console.log('  3. Login as faculty_test_user')
    console.log('  4. Dashboard should now load without permission errors\n')

    process.exit(0)
  } catch (err) {
    console.error('\n❌ Error:', err.message)
    console.error(err)
    process.exit(1)
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}

module.exports = { FACULTY_PERMISSIONS }
