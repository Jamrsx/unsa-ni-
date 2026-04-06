const mysql = require('mysql2/promise');

async function repairDatabase() {
    const config = {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'duelcode_capstone_project'
    };

    const conn = await mysql.createConnection(config);
    console.log('--- DATABASE REPAIR ---');

    try {
        // 1. Sync users.role with user_roles for the admin user
        console.log('1. Syncing admin role...');
        await conn.execute("UPDATE users SET role = 'admin' WHERE user_id = 4");
        
        // 2. Identify missing approvals
        console.log('2. Repairing missing approvals for problems...');
        // First find all content_items for problems that don't have an entry in approvals
        const [missing] = await conn.execute(`
            SELECT ci.content_item_id, cp.problem_id
            FROM content_items ci
            JOIN content_problems cp ON ci.content_item_id = cp.content_item_id
            LEFT JOIN approvals a ON ci.content_item_id = a.content_item_id
            WHERE ci.content_type = 'problem' AND a.approval_id IS NULL
        `);
        
        console.log(`Found ${missing.length} content items missing approvals.`);
        
        for (const m of missing) {
            console.log(`Creating approval for content_item_id ${m.content_item_id} (problem_id ${m.problem_id})`);
            await conn.execute(
                "INSERT INTO approvals (content_item_id, status, requested_by, updated_at) VALUES (?, 'approved', 4, NOW())",
                [m.content_item_id]
            );
        }

        // 3. Ensure all users have profiles
        console.log('3. Repairing missing profiles...');
        const [usersWithoutProfile] = await conn.execute(`
            SELECT u.user_id, u.username
            FROM users u
            LEFT JOIN profiles p ON u.user_id = p.user_id
            WHERE p.profile_id IS NULL
        `);

        for (const u of usersWithoutProfile) {
            console.log(`Creating profile for user_id ${u.user_id} (${u.username})`);
            await conn.execute(
                "INSERT INTO profiles (user_id, full_name, bio, avatar_url) VALUES (?, ?, '', '')",
                [u.user_id, u.username]
            );
        }

        console.log('\n✓ Database repair completed successfully.');
    } catch (e) {
        console.error('\n✗ Repair failed:', e.message);
    } finally {
        await conn.end();
    }
}

repairDatabase();
