const mysql = require('mysql2/promise');
const { normalizePermissionName } = require('./utils/authHelpers.js');

async function migratePermissions() {
    const config = {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'duelcode_capstone_project'
    };

    const conn = await mysql.createConnection(config);
    console.log('--- PERMISSIONS MIGRATION ---');

    try {
        const [rows] = await conn.execute('SELECT permission_id, permission_name FROM permissions');
        console.log(`Found ${rows.length} permissions.`);

        for (const row of rows) {
            const oldName = row.permission_name;
            const newName = normalizePermissionName(oldName);
            
            if (oldName !== newName) {
                console.log(`Migrating: "${oldName}" -> "${newName}"`);
                await conn.execute(
                    'UPDATE permissions SET permission_name = ? WHERE permission_id = ?',
                    [newName, row.permission_id]
                );
            } else {
                console.log(`Keeping: "${oldName}" (already normalized or no map entry)`);
            }
        }

        console.log('\n✓ Migration completed successfully.');
    } catch (e) {
        console.error('\n✗ Migration failed:', e.message);
    } finally {
        await conn.end();
    }
}

migratePermissions();
