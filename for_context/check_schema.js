// check_schema.js - Inspect actual database schema and permissions
const path = require('path');
const { queryReadOnly } = require(path.join(__dirname, '..', 'db'));

const DB_NAME = process.env.DB_NAME || 'duelcode_capstone_project';

async function checkRolePermissions() {
    console.log('\n===== FACULTY ROLE PERMISSIONS =====');
    const faculty = await queryReadOnly(`
        SELECT p.permission_id, p.permission_name, p.description
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.permission_id
        WHERE rp.role_id = 2
        ORDER BY p.permission_name
    `);
    console.log('Permissions assigned to faculty role:');
    faculty.forEach(p => console.log(`  ${p.permission_id}: ${p.permission_name} - ${p.description}`));
    
    console.log('\n===== AUTO-APPROVE PERMISSIONS =====');
    const autoApprove = await queryReadOnly(`
        SELECT * FROM permissions WHERE permission_name LIKE '%auto_approve%'
    `);
    autoApprove.forEach(p => console.log(`  ${p.permission_id}: ${p.permission_name}`));
}

async function checkTableColumns(tableName) {
    console.log(`\n===== TABLE: ${tableName} =====`);
    const columns = await queryReadOnly(`
        SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
    `, [DB_NAME, tableName]);
    columns.forEach(c => {
        console.log(`  ${c.COLUMN_NAME}: ${c.COLUMN_TYPE} (NULL: ${c.IS_NULLABLE}, Default: ${c.COLUMN_DEFAULT})`);
    });
}

async function checkFacultyTestUserData() {
    console.log('\n===== FACULTY TEST USER DATA =====');
    const user = await queryReadOnly(`
        SELECT u.user_id, u.username, u.email, r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.username = 'faculty_test_user'
    `);
    if (user.length > 0) {
        console.log(`Found user: ${user[0].username} (ID: ${user[0].user_id}, Role: ${user[0].role_name})`);
        
        const userId = user[0].user_id;
        const userPerms = await queryReadOnly(`
            SELECT p.permission_name
            FROM user_permissions up
            JOIN permissions p ON up.permission_id = p.permission_id
            WHERE up.user_id = ?
        `, [userId]);
        console.log('User-level permissions override:', userPerms.map(p => p.permission_name).join(', ') || 'None');
    }
}

async function checkProblems() {
    console.log('\n===== FACULTY CREATED PROBLEMS =====');
    const problems = await queryReadOnly(`
        SELECT p.problem_id, p.problem_name, ci.content_item_id, a.status, a.requested_by, a.approved_by
        FROM problems p
        LEFT JOIN content_problems cp ON p.problem_id = cp.problem_id
        LEFT JOIN content_items ci ON cp.content_item_id = ci.content_item_id
        LEFT JOIN approvals a ON ci.content_item_id = a.content_item_id
        WHERE a.requested_by = 20 OR a.requested_by IS NULL
        LIMIT 5
    `);
    if (problems.length === 0) {
        console.log('No problems found for user ID 20');
    } else {
        problems.forEach(p => {
            console.log(`  Problem ID ${p.problem_id}: "${p.problem_name}" - Status: ${p.status}, Requested by: ${p.requested_by}, Approved by: ${p.approved_by}`);
        });
    }
}

async function main() {
    try {
        await checkRolePermissions();
        await checkTableColumns('problems');
        await checkTableColumns('blogs');
        await checkTableColumns('events');
        await checkTableColumns('approvals');
        await checkFacultyTestUserData();
        await checkProblems();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err && err.message ? err.message : err);
        process.exit(2);
    }
}

if (require.main === module) main();
module.exports = { checkRolePermissions, checkTableColumns };
