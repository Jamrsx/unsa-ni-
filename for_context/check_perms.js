// check_perms.js - Check auto-approve permissions for faculty
const path = require('path');
const { queryReadOnly } = require(path.join(__dirname, '..', 'db'));

async function main() {
    try {
        // Check all auto-approve permissions
        const autoApprove = await queryReadOnly(`
            SELECT permission_id, permission_name FROM permissions 
            WHERE permission_name LIKE '%auto_approve%'
        `);
        console.log('=== AUTO-APPROVE PERMISSIONS ===');
        autoApprove.forEach(p => console.log(`  [${p.permission_id}] ${p.permission_name}`));
        
        // Check which auto-approve perms are assigned to faculty role
        const facultyAuto = await queryReadOnly(`
            SELECT DISTINCT p.permission_id, p.permission_name 
            FROM role_permissions rp 
            JOIN permissions p ON rp.permission_id = p.permission_id 
            WHERE rp.role_id = 2 AND p.permission_name LIKE '%auto_approve%'
        `);
        console.log('\n=== FACULTY ROLE AUTO-APPROVE PERMISSIONS ===');
        if (facultyAuto.length === 0) {
            console.log('None assigned');
        } else {
            facultyAuto.forEach(p => console.log(`  [${p.permission_id}] ${p.permission_name}`));
        }
        
        // Check the recent problem created by faculty_test_user (user_id=20)
        const recentProb = await queryReadOnly(`
            SELECT p.problem_id, p.problem_name, ci.content_item_id, a.approval_id, a.status, a.requested_by, a.approved_by, a.created_at
            FROM problems p
            LEFT JOIN content_problems cp ON p.problem_id = cp.problem_id
            LEFT JOIN content_items ci ON cp.content_item_id = ci.content_item_id
            LEFT JOIN approvals a ON ci.content_item_id = a.content_item_id
            WHERE a.requested_by = 20
            ORDER BY a.created_at DESC
            LIMIT 1
        `);
        console.log('\n=== MOST RECENT PROBLEM BY faculty_test_user (ID=20) ===');
        if (recentProb.length > 0) {
            const prob = recentProb[0];
            console.log(`Problem ID: ${prob.problem_id}`);
            console.log(`Name: ${prob.problem_name}`);
            console.log(`Content Item ID: ${prob.content_item_id}`);
            console.log(`Approval Status: ${prob.status} (Approval ID: ${prob.approval_id})`);
            console.log(`Requested by: ${prob.requested_by}, Approved by: ${prob.approved_by}`);
            console.log(`Created at: ${prob.created_at}`);
        } else {
            console.log('No problems found');
        }
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

if (require.main === module) main();
