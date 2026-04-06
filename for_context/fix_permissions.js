// fix_permissions.js - Remove auto-approve permissions from faculty role
const path = require('path');
const { pool } = require(path.join(__dirname, '..', 'db'));

async function main() {
    let connection;
    try {
        connection = await pool.getConnection();
        
        console.log('=== FIXING FACULTY ROLE PERMISSIONS ===\n');
        
        // Remove auto-approve permissions from faculty role (23, 25, 27)
        const autoApproveIds = [23, 25, 27];
        for (const permId of autoApproveIds) {
            const [result] = await connection.query(
                `DELETE FROM role_permissions WHERE role_id = 2 AND permission_id = ?`,
                [permId]
            );
            console.log(`Removed permission ${permId}: ${result.affectedRows} rows deleted`);
        }
        
        // Also remove approve permissions (11, 12, 13) if faculty shouldn't approve submissions
        // Note: Only admin should typically approve faculty submissions
        const approveIds = [11, 12, 13]; // approve_problem, approve_blog, approve_event
        console.log('\nRemove approval permissions (11=approve_problem, 12=approve_blog, 13=approve_event)?');
        console.log('Currently assigned to faculty role.');
        for (const permId of approveIds) {
            const [result] = await connection.query(
                `DELETE FROM role_permissions WHERE role_id = 2 AND permission_id = ?`,
                [permId]
            );
            console.log(`Removed permission ${permId}: ${result.affectedRows} rows deleted`);
        }
        
        // Keep the core faculty permissions (create_own_*, manage_* without auto-approve)
        const [remaining] = await connection.query(`
            SELECT DISTINCT p.permission_id, p.permission_name
            FROM role_permissions rp
            JOIN permissions p ON rp.permission_id = p.permission_id
            WHERE rp.role_id = 2
            ORDER BY p.permission_name
        `);
        
        console.log('\n=== REMAINING FACULTY ROLE PERMISSIONS ===');
        remaining.forEach(p => console.log(`  [${p.permission_id}] ${p.permission_name}`));
        
        console.log('\n✓ Faculty permissions cleaned up');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    } finally {
        if (connection) connection.release();
    }
}

if (require.main === module) main();
