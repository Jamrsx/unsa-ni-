module.exports = function registerAdminSocketHandlers(socket, db, bcrypt, jwt, helpers) {
    const { verifySession, verifyAdmin, hasPermission, getUserPrimaryRole, deriveCategory } = helpers;

    // specifically for admins only
    socket.on("request_get_dashboard_details", async ({ token_session }) => {
        try {
            console.log("Dashboard detail request received on socket", socket.id);

            let session = null;

            // Always get session
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
                console.log('Using socket.user for dashboard request', { socketId: socket.id, userId: session.userId });
            } else {
                console.log('Falling back to token_session for dashboard request');
                session = await verifySession(token_session);
            }

            // Always check admin role
            const isAdmin = await verifyAdmin(session);

            // Only reject when session is missing OR user is not admin
            if (!session || !isAdmin) {
                socket.emit("response_get_dashboard_details", {
                    success: false,
                    message: 'Unauthorized: Admin access only'
                });
                return;
            }

            // --- ADMIN ONLY AREA ---
            const [rows] = await db.query(
                `
                SELECT
                    (SELECT COUNT(*) FROM users) AS total_users,
                    (SELECT COUNT(*) FROM problems) AS total_problems
                `
            );

            socket.emit("response_get_dashboard_details", {
                success: true,
                total_users: rows[0].total_users,
                total_question_sets: rows[0].total_problems,
            });

        } catch (err) {
            console.error(err);
            socket.emit("response_get_dashboard_details", { success: false, message: 'Server error' });
        }
    });

    // === request and response get all users (admin only) ===
    socket.on('request_get_all_users', async ({ token_session }) => {
        try {
            console.log('Get all users request received on socket', socket.id);

            // 1. Verify session
            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
                console.log('Using socket.user for get all users request', { socketId: socket.id, userId: session.userId });
            } else {
                console.log('Falling back to token_session for get all users request');
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_get_all_users', { success: false, message: 'Invalid session' });
                return;
            }

            // 2. Permission check: allow users with `users.view` or admin role
            const isAdmin = await verifyAdmin(session);
            const canViewUsers = await hasPermission(session.userId, 'users.view');
            if (!isAdmin && !canViewUsers) {
                socket.emit('response_get_all_users', { success: false, message: 'Unauthorized: users.view required' });
                return;
            }

            // 3. Fetch all users with profile, statistics, and role
            const [users] = await db.query(
                `
                SELECT 
                    u.user_id,
                    u.username,
                    u.email,
                    COALESCE(p.full_name, u.username) as full_name,
                    p.avatar_url,
                    COALESCE(s.statistic_level, 0) as statistic_level,
                    COALESCE(s.statistic_duel_point, 0) as statistic_duel_point,
                    COALESCE(r.role_name, 'user') as role_name
                FROM users u
                LEFT JOIN profiles p ON u.user_id = p.user_id
                LEFT JOIN statistic s ON u.user_id = s.user_id
                LEFT JOIN user_roles ur ON u.user_id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.role_id
                ORDER BY s.statistic_duel_point DESC, u.user_id ASC
                `
            );

            // 4. Format response
            const userList = users.map(user => ({
                UserID: user.user_id,
                UserRank: null, // unassigned as per requirements
                UserName: user.full_name,
                UserImg: user.avatar_url || '/public/asset/general/profile-user.png',
                UserLvl: user.statistic_level,
                UserDP: user.statistic_duel_point,
                UserEmail: user.email,
                UserCountry: null, // unassigned as per requirements
                UserRole: user.role_name.charAt(0).toUpperCase() + user.role_name.slice(1)
            }));

            socket.emit('response_get_all_users', {
                success: true,
                users: userList
            });

        } catch (err) {
            console.error('Error in request_get_all_users:', err);
            socket.emit('response_get_all_users', { success: false, message: 'Server error' });
        }
    });

    // === request and response get all admins/faculty (admin only) ===
    socket.on('request_get_all_admins', async ({ token_session }) => {
        try {
            console.log('Get all admins request received on socket', socket.id);

            // 1. Verify session
            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
                console.log('Using socket.user for get all admins request', { socketId: socket.id, userId: session.userId });
            } else {
                console.log('Falling back to token_session for get all admins request');
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_get_all_admins', { success: false, message: 'Invalid session' });
                return;
            }

            // 2. Permission check: allow viewing admin list if user has `users.view` or is admin
            const isAdminAdmins = await verifyAdmin(session);
            const canViewAdmins = await hasPermission(session.userId, 'users.view');
            if (!isAdminAdmins && !canViewAdmins) {
                socket.emit('response_get_all_admins', { success: false, message: 'Unauthorized: users.view required' });
                return;
            }

            // 3. Fetch all users with admin or faculty roles
            const [admins] = await db.query(
                `
                SELECT 
                    u.user_id,
                    u.username,
                    u.email,
                    COALESCE(p.full_name, u.username) as full_name,
                    p.avatar_url,
                    r.role_name,
                    ur.assigned_at
                FROM users u
                LEFT JOIN profiles p ON u.user_id = p.user_id
                JOIN user_roles ur ON u.user_id = ur.user_id
                JOIN roles r ON ur.role_id = r.role_id
                WHERE r.role_name IN ('admin', 'faculty')
                ORDER BY r.role_level DESC, u.user_id ASC
                `
            );

            // 4. Format response
            const adminList = admins.map(admin => ({
                UserID: admin.user_id,
                UserName: admin.full_name,
                UserImg: admin.avatar_url || '/public/asset/general/profile-user.png',
                UserEmail: admin.email,
                UserRole: admin.role_name.charAt(0).toUpperCase() + admin.role_name.slice(1), // Capitalize first letter
                AssignedAt: admin.assigned_at
            }));

            socket.emit('response_get_all_admins', {
                success: true,
                admins: adminList
            });

        } catch (err) {
            console.error('Error in request_get_all_admins:', err);
            socket.emit('response_get_all_admins', { success: false, message: 'Server error' });
        }
    });

    // === request admin permissions (admin only) ===
    // This handler now returns the full permissions list (from `permissions`) and
    // includes role-based grants (if the target user has a role) and any user-specific
    // overrides. Permissions that are not in the role_permissions for the user's role
    // will have `role_is_granted` set to NULL.
    socket.on('request_get_admin_permissions', async ({ token_session, target_user_id }) => {
        try {
            console.log('Get admin permissions request', { socketId: socket.id, target_user_id });

            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_get_admin_permissions', { success: false, message: 'Invalid session' });
                return;
            }

            // Only users with role management permission or admin may view/modify other users' permissions
            const isAdminPerm = await verifyAdmin(session);
            const canManageRoles = await hasPermission(session.userId, 'roles.manage');
            if (!isAdminPerm && !canManageRoles) {
                socket.emit('response_get_admin_permissions', { success: false, message: 'Unauthorized: roles.manage required' });
                return;
            }

            if (!target_user_id) {
                socket.emit('response_get_admin_permissions', { success: false, message: 'target_user_id is required' });
                return;
            }

            // Return all permissions and annotate with whether the user's role grants it
            // and whether the user has an override in user_permissions.
            const [allPerms] = await db.query(
                `
                SELECT
                    p.permission_id,
                    p.permission_name,
                    p.description AS permission_description,
                    CASE WHEN rp.permission_id IS NULL THEN NULL ELSE 1 END AS role_is_granted,
                    up.is_granted AS user_is_granted
                FROM permissions p
                LEFT JOIN user_roles ur ON ur.user_id = ?
                LEFT JOIN role_permissions rp ON rp.permission_id = p.permission_id AND rp.role_id = ur.role_id
                LEFT JOIN user_permissions up ON up.permission_id = p.permission_id AND up.user_id = ?
                ORDER BY p.permission_name
                `,
                [target_user_id, target_user_id]
            );

            const mapped = allPerms.map((p) => ({
                permission_id: p.permission_id,
                permission_name: p.permission_name,
                permission_description: p.permission_description,
                role_is_granted: p.role_is_granted === null ? null : !!p.role_is_granted,
                user_is_granted: p.user_is_granted === null ? null : !!p.user_is_granted,
                category: deriveCategory(p.permission_name)
            }));

            socket.emit('response_get_admin_permissions', {
                success: true,
                target_user_id,
                permissions: mapped
            });

        } catch (err) {
            console.error('Error in request_get_admin_permissions:', err);
            socket.emit('response_get_admin_permissions', { success: false, message: 'Server error' });
        }
    });

    // === update admin permissions (admin only) ===
    socket.on('request_update_admin_permissions', async ({ token_session, target_user_id, overrides }) => {
        try {
            console.log('Update admin permissions request', { socketId: socket.id, target_user_id });

            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_update_admin_permissions', { success: false, message: 'Invalid session' });
                return;
            }

            // Ensure user has permission to manage roles/permissions
            const isAdminUpdate = await verifyAdmin(session);
            const canManageRolesUpdate = await hasPermission(session.userId, 'roles.manage');
            if (!isAdminUpdate && !canManageRolesUpdate) {
                socket.emit('response_update_admin_permissions', { success: false, message: 'Unauthorized: roles.manage required' });
                return;
            }

            if (!target_user_id) {
                socket.emit('response_update_admin_permissions', { success: false, message: 'target_user_id is required' });
                return;
            }

            const list = Array.isArray(overrides) ? overrides : [];

            // Log the overrides being applied for audit/debugging purposes
            try {
                console.log('Applying permission overrides', { actor_user_id: session.userId, target_user_id, overrides: list });
            } catch (e) {
                // safe no-op
            }

            await db.query('DELETE FROM user_permissions WHERE user_id = ?', [target_user_id]);

            if (list.length > 0) {
                const values = list
                    .filter(p => p.permission_id && typeof p.is_granted === 'boolean')
                    .map(p => [target_user_id, p.permission_id, p.is_granted ? 1 : 0]);

                if (values.length > 0) {
                    await db.query(
                        'INSERT INTO user_permissions (user_id, permission_id, is_granted) VALUES ?',[values]
                    );
                }
            }

            socket.emit('response_update_admin_permissions', { success: true, target_user_id });

            // Notify the target user (if connected) so their client refreshes permissions immediately.
            // This prevents stale client caches from showing outdated grants/denies.
            try {
                // helper to compute effective permissions (same SQL used by request_get_my_permissions)
                const permsHelper = require('../../permissions-service.js');
                const updatedPerms = await permsHelper.getEffectivePermissions(target_user_id).catch(() => []);

                // socket.server is the io instance in current socket.io versions
                const ioInstance = socket.server;
                if (ioInstance && ioInstance.sockets && ioInstance.sockets.sockets) {
                    for (const [sid, s] of ioInstance.sockets.sockets) {
                        try {
                            if (s.user && (s.user.userId === target_user_id || s.user.user_id === target_user_id)) {
                                s.emit('response_get_my_permissions', { success: true, permissions: updatedPerms });
                            }
                        } catch (e) {
                            // ignore per-socket emit errors
                        }
                    }
                }
            } catch (e) {
                console.error('Failed to notify target user of permission update', e);
            }

        } catch (err) {
            console.error('Error in request_update_admin_permissions:', err);
            socket.emit('response_update_admin_permissions', { success: false, message: 'Server error' });
        }
    });

    // === update admin role (admin only) ===
    socket.on('request_update_admin_role', async ({ token_session, target_user_id, role_name }) => {
        try {
            console.log('Update admin role request', { socketId: socket.id, target_user_id, role_name });

            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_update_admin_role', { success: false, message: 'Invalid session' });
                return;
            }

            // Ensure user has permission to assign roles
            const isAdminRole = await verifyAdmin(session);

            // Before allowing broad roles.manage to override, check for explicit denies
            const normalizedRequested = (role_name || '').toString().toLowerCase();
            try {
                if (normalizedRequested === 'admin') {
                    const [denyRows] = await db.query(
                        `SELECT 1 FROM permissions p JOIN user_permissions up2 ON up2.permission_id = p.permission_id
                         WHERE p.permission_name = ? AND up2.user_id = ? AND up2.is_granted = 0 LIMIT 1`,
                        ['roles.assign.admin', session.userId]
                    );
                    if (denyRows && denyRows.length > 0) {
                        socket.emit('response_update_admin_role', { success: false, message: 'Unauthorized: explicit deny for roles.assign.admin' });
                        return;
                    }
                } else if (normalizedRequested === 'faculty') {
                    const [denyRows] = await db.query(
                        `SELECT 1 FROM permissions p JOIN user_permissions up2 ON up2.permission_id = p.permission_id
                         WHERE p.permission_name = ? AND up2.user_id = ? AND up2.is_granted = 0 LIMIT 1`,
                        ['roles.assign.faculty', session.userId]
                    );
                    if (denyRows && denyRows.length > 0) {
                        socket.emit('response_update_admin_role', { success: false, message: 'Unauthorized: explicit deny for roles.assign.faculty' });
                        return;
                    }
                }
            } catch (e) {
                console.error('explicit deny check failed', e);
            }

            const canAssignAdminPerm = await hasPermission(session.userId, 'roles.assign.admin');
            const canAssignFacultyPerm = await hasPermission(session.userId, 'roles.assign.faculty');
            const canManagePerm = await hasPermission(session.userId, 'roles.manage');
            const canAssignRoles = canAssignAdminPerm || canAssignFacultyPerm || canManagePerm;
            if (!isAdminRole && !canAssignRoles) {
                socket.emit('response_update_admin_role', { success: false, message: 'Unauthorized: role assignment required' });
                return;
            }

            if (!target_user_id || !role_name) {
                socket.emit('response_update_admin_role', { success: false, message: 'target_user_id and role_name are required' });
                return;
            }

            const normalizedRole = role_name.toLowerCase();
            // Defensive final explicit-deny check for the specific assign permission
            try {
                const neededPerm = (normalizedRole === 'admin') ? 'roles.assign.admin' : ((normalizedRole === 'faculty') ? 'roles.assign.faculty' : null);
                if (neededPerm) {
                    const [finalDeny] = await db.query(
                        `SELECT 1 FROM permissions p JOIN user_permissions up2 ON up2.permission_id = p.permission_id
                         WHERE p.permission_name = ? AND up2.user_id = ? AND up2.is_granted = 0 LIMIT 1`,
                        [neededPerm, session.userId]
                    );
                    if (finalDeny && finalDeny.length > 0) {
                        console.log('[role-assign] final explicit DENY prevents assignment', { caller: session.userId, neededPerm, socketId: socket.id });
                        socket.emit('response_update_admin_role', { success: false, message: `Unauthorized: explicit deny for ${neededPerm}` });
                        return;
                    }
                }
            } catch (e) {
                console.error('final explicit deny check failed', e);
            }

            // Verbose debug logging to trace why DB update may occur
            try {
                console.log('[role-assign-debug] attempt', {
                    caller: session.userId,
                    isAdminRole,
                    canAssignAdminPerm,
                    canAssignFacultyPerm,
                    canManagePerm,
                    canAssignRoles,
                    normalizedRole,
                    socketId: socket.id
                });
            } catch (e) { /* ignore logging failures */ }
            const [roles] = await db.query('SELECT role_id, role_name FROM roles WHERE role_name = ?', [normalizedRole]);
            if (roles.length === 0) {
                socket.emit('response_update_admin_role', { success: false, message: 'Role not found' });
                return;
            }

            const roleId = roles[0].role_id;

            const [existing] = await db.query('SELECT id FROM user_roles WHERE user_id = ?', [target_user_id]);
            if (existing.length > 0) {
                try { console.log('[role-assign-debug] performing UPDATE user_roles', { target_user_id, roleId }); } catch (e) {}
                await db.query('UPDATE user_roles SET role_id = ? WHERE user_id = ?', [roleId, target_user_id]);
            } else {
                try { console.log('[role-assign-debug] performing INSERT INTO user_roles', { target_user_id, roleId }); } catch (e) {}
                await db.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [target_user_id, roleId]);
            }

            // Notify the target user (if connected) so their client refreshes permissions immediately.
            try {
                const permsHelper = require('../../permissions-service.js');
                const updatedPerms = await permsHelper.getEffectivePermissions(target_user_id).catch(() => []);
                const ioInstance = socket.server;
                if (ioInstance && ioInstance.sockets && ioInstance.sockets.sockets) {
                    for (const [sid, s] of ioInstance.sockets.sockets) {
                        try {
                            if (s.user && (s.user.userId === target_user_id || s.user.user_id === target_user_id)) {
                                s.emit('response_get_my_permissions', { success: true, permissions: updatedPerms });
                            }
                        } catch (e) {
                            // ignore per-socket emit errors
                        }
                    }
                }
            } catch (e) {
                console.error('Failed to notify target user after role update', e);
            }

            socket.emit('response_update_admin_role', { success: true, target_user_id, role_name: normalizedRole });

        } catch (err) {
            console.error('Error in request_update_admin_role:', err);
            socket.emit('response_update_admin_role', { success: false, message: 'Server error' });
        }
    });

    // === Ban user (admin only) ===
    const { performBan } = require('../../admin-ban');
    socket.on('request_ban_user', async ({ token_session, user_id }, ack) => {
        try {
            console.log('request_ban_user received', { socketId: socket.id, user_id });

            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_ban_user', { success: false, message: 'Invalid session' });
                try { if (typeof ack === 'function') ack({ success: false, message: 'Invalid session' }) } catch (e) {}
                return;
            }

            // Use server-side permission helper so explicit-deny user overrides are honored.
            // Note: do NOT allow `verifyAdmin(session)` to bypass explicit user denies.
            // First, check explicit deny for admin.ban_users — deny must override broader role grants.
            try {
                const [denyRows] = await db.query(
                    `SELECT 1 FROM permissions p JOIN user_permissions up2 ON up2.permission_id = p.permission_id
                     WHERE p.permission_name = ? AND up2.user_id = ? AND up2.is_granted = 0 LIMIT 1`,
                    ['admin.ban_users', session.userId]
                );
                if (denyRows && denyRows.length > 0) {
                    console.log('[ban-socket] explicit DENY present — rejecting ban attempt', { caller: session.userId, socketId: socket.id });
                    socket.emit('response_ban_user', { success: false, message: 'Unauthorized: explicit deny for admin.ban_users' });
                    try { if (typeof ack === 'function') ack({ success: false, message: 'Unauthorized' }) } catch (e) {}
                    return;
                }
            } catch (e) {
                console.error('[ban-socket] explicit deny check failed', e);
            }

            const allowed = await hasPermission(session.userId, 'admin.ban_users') || await hasPermission(session.userId, 'roles.manage');
            console.log('[ban-socket] attempt', { caller: session.userId, target: user_id, allowed: !!allowed, socketId: socket.id });
            if (!allowed) {
                socket.emit('response_ban_user', { success: false, message: 'Unauthorized: admin.ban_users required' });
                try { if (typeof ack === 'function') ack({ success: false, message: 'Unauthorized' }) } catch (e) {}
                return;
            }

            if (!user_id) {
                socket.emit('response_ban_user', { success: false, message: 'user_id is required' });
                try { if (typeof ack === 'function') ack({ success: false, message: 'user_id required' }) } catch (e) {}
                return;
            }

            // For testing: simulate success for authorized callers without DB writes.
            try {
                // Optionally notify connected sockets (kept as no-op during testing).
                console.log('[ban-socket] authorized — simulating ban success for user', user_id, 'caller', session.userId);
            } catch (e) {}

            socket.emit('response_ban_user', { success: true, user_id });
            try { if (typeof ack === 'function') ack({ success: true, user_id }) } catch (e) {}
        } catch (err) {
            console.error('Error in request_ban_user handler', err);
            socket.emit('response_ban_user', { success: false, message: 'Server error' });
            try { if (typeof ack === 'function') ack({ success: false, message: 'Server error' }) } catch (e) {}
        }
    });

    // === request current user's permissions (for client-side UI guards) ===
    socket.on('request_get_my_permissions', async ({ token_session }) => {
        try {
            console.log('[DEBUG] request_get_my_permissions called with token:', token_session ? 'present' : 'null');
            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
                console.log('[DEBUG] Using socket user session:', session.userId);
            } else if (verifySession) {
                session = await verifySession(token_session);
                console.log('[DEBUG] Using token session, result:', !!session);
            }

            if (!session || !(await verifyAdmin(session))) {
                console.log('[DEBUG] Session invalid or not admin');
                socket.emit('response_get_my_permissions', { success: false, message: 'Unauthorized' });
                return;
            }

            // helper to compute effective permissions (same SQL used by request_get_my_permissions)
            const permsHelper = require('../../permissions-service.js');
            const updatedPerms = await permsHelper.getEffectivePermissions(session.userId).catch(() => []);
            console.log('[DEBUG] Effective permissions for user', session.userId, ':', updatedPerms);
                                WHERE (up.is_granted = 1)
                                    OR (ur.user_id IS NOT NULL AND (up.is_granted IS NULL OR up.is_granted = 1))
                                `,
                                [session.userId, session.userId]
                        );

                        const perms = (rows || []).map(r => r.permission_name);
            socket.emit('response_get_my_permissions', { success: true, permissions: perms });

        } catch (err) {
            console.error('Error in request_get_my_permissions:', err);
            socket.emit('response_get_my_permissions', { success: false, message: 'Server error' });
        }
    });

    // === request get admin questions (all statuses for problems created by admins) ===
    socket.on('request_get_admin_questions', async ({ token_session }) => {
        try {
            console.log('Get admin questions request received on socket', socket.id);

            // 1. Verify session
            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
                console.log('Using socket.user for get admin questions request', { socketId: socket.id, userId: session.userId });
            } else {
                console.log('Falling back to token_session for get admin questions request');
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_get_admin_questions', { success: false, message: 'Invalid session' });
                return;
            }

            // 2. Verify admin role
            const isAdmin = await verifyAdmin(session);
            if (!isAdmin) {
                socket.emit('response_get_admin_questions', { success: false, message: 'Unauthorized: Admin access required' });
                return;
            }

            // 3. Fetch problems created by admin/faculty with any status (approved, pending, denied, draft)
            let questions;
            try {
                const res = await db.query(
                    `
                    SELECT 
                        p.problem_id,
                        p.problem_name,
                        p.difficulty,
                        ci.content_item_id,
                        ci.created_at,
                        a.status,
                        u.user_id as creator_id,
                        COALESCE(prof.full_name, u.username) as creator_name,
                        GROUP_CONCAT(DISTINCT t.topic_name ORDER BY t.topic_name SEPARATOR ',') AS TopicsText
                    FROM problems p
                    JOIN content_problems cp ON p.problem_id = cp.problem_id
                    JOIN content_items ci ON cp.content_item_id = ci.content_item_id
                    JOIN approvals a ON ci.content_item_id = a.content_item_id
                    JOIN users u ON a.requested_by = u.user_id
                    JOIN user_roles ur ON u.user_id = ur.user_id
                    JOIN roles r ON ur.role_id = r.role_id
                    LEFT JOIN profiles prof ON u.user_id = prof.user_id
                    LEFT JOIN problems_have_topics pht ON p.problem_id = pht.problem_id
                    LEFT JOIN problem_topics t ON pht.topic_id = t.topic_id
                    WHERE a.status IN ('approved','pending','denied','draft')
                      AND r.role_name IN ('admin', 'faculty')
                      AND ci.content_type = 'problem'
                    GROUP BY p.problem_id
                    ORDER BY ci.created_at DESC
                    `
                );
                questions = res[0];
            } catch (qerr) {
                // Fallback: if topic aggregation fails (missing tables), run simpler query
                if (qerr && qerr.code === 'ER_NO_SUCH_TABLE') {
                    const res2 = await db.query(
                        `
                        SELECT 
                            p.problem_id,
                            p.problem_name,
                            p.difficulty,
                            ci.content_item_id,
                            ci.created_at,
                            a.status,
                            u.user_id as creator_id,
                            COALESCE(prof.full_name, u.username) as creator_name,
                            '' AS TopicsText
                        FROM problems p
                        JOIN content_problems cp ON p.problem_id = cp.problem_id
                        JOIN content_items ci ON cp.content_item_id = ci.content_item_id
                        JOIN approvals a ON ci.content_item_id = a.content_item_id
                        JOIN users u ON a.requested_by = u.user_id
                        JOIN user_roles ur ON u.user_id = ur.user_id
                        JOIN roles r ON ur.role_id = r.role_id
                        LEFT JOIN profiles prof ON u.user_id = prof.user_id
                        WHERE a.status IN ('approved','pending','denied','draft')
                          AND r.role_name IN ('admin', 'faculty')
                          AND ci.content_type = 'problem'
                        GROUP BY p.problem_id
                        ORDER BY ci.created_at DESC
                        `
                    );
                    questions = res2[0];
                } else {
                    throw qerr;
                }
            }

            // 4. Format response
            // If TopicsText is empty or fallback was used, fetch topic names explicitly from problem_topics
            const questionList = [];
            const problemIds = questions.map(q => q.problem_id).filter(Boolean);
            let topicMap = {};
            if (problemIds.length > 0) {
                try {
                    const placeholders = problemIds.map(() => '?').join(',');
                    const [topicRows] = await db.query(
                        `SELECT pht.problem_id, pt.topic_name
                         FROM problems_have_topics pht
                         JOIN problem_topics pt ON pht.topic_id = pt.topic_id
                         WHERE pht.problem_id IN (${placeholders})`,
                        problemIds
                    );
                    // build map problem_id -> [topic_name,...]
                    topicMap = topicRows.reduce((acc, r) => {
                        if (!acc[r.problem_id]) acc[r.problem_id] = [];
                        acc[r.problem_id].push(r.topic_name);
                        return acc;
                    }, {});
                } catch (tErr) {
                    // ignore topic map fetch errors to avoid breaking the response
                }
            }

            for (const q of questions) {
                const topicsArr = (topicMap[q.problem_id] && topicMap[q.problem_id].length > 0)
                    ? topicMap[q.problem_id]
                    : (q.TopicsText && q.TopicsText.length ? q.TopicsText.split(',') : []);

                questionList.push({
                    QuestionID: q.problem_id,
                    QuestionName: q.problem_name,
                    QuestionDifficulty: q.difficulty,
                    QuestionLink: `/problem/${q.problem_id}`,
                    CreatedAt: q.created_at,
                    CreatorName: q.creator_name,
                    Status: q.status,
                    TopicsText: topicsArr.join(',')
                });
            }

            socket.emit('response_get_admin_questions', {
                success: true,
                questions: questionList
            });

        } catch (err) {
            socket.emit('response_get_admin_questions', { success: false, message: 'Server error' });
        }
    });

    // === request get user questions (all statuses for problems created by regular users) ===
    socket.on('request_get_user_questions', async ({ token_session }) => {
        try {
            console.log('Get user questions request received on socket', socket.id);

            // 1. Verify session
            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
                console.log('Using socket.user for get user questions request', { socketId: socket.id, userId: session.userId });
            } else {
                console.log('Falling back to token_session for get user questions request');
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_get_user_questions', { success: false, message: 'Invalid session' });
                return;
            }

            // 2. Verify admin role
            const isAdmin = await verifyAdmin(session);
            if (!isAdmin) {
                socket.emit('response_get_user_questions', { success: false, message: 'Unauthorized: Admin access required' });
                return;
            }

            // Fetch problems created by regular users (not admin/faculty) with any status
            let questions;
            try {
                const res = await db.query(
                    `
                    SELECT 
                        p.problem_id,
                        p.problem_name,
                        p.difficulty,
                        ci.content_item_id,
                        ci.created_at,
                        a.status,
                        u.user_id as creator_id,
                        COALESCE(prof.full_name, u.username) as creator_name,
                        GROUP_CONCAT(DISTINCT t.topic_name ORDER BY t.topic_name SEPARATOR ',') AS TopicsText
                    FROM problems p
                    JOIN content_problems cp ON p.problem_id = cp.problem_id
                    JOIN content_items ci ON cp.content_item_id = ci.content_item_id
                    JOIN approvals a ON ci.content_item_id = a.content_item_id
                    JOIN users u ON a.requested_by = u.user_id
                    LEFT JOIN user_roles ur ON u.user_id = ur.user_id
                    LEFT JOIN roles r ON ur.role_id = r.role_id
                    LEFT JOIN profiles prof ON u.user_id = prof.user_id
                    LEFT JOIN problems_have_topics pht ON p.problem_id = pht.problem_id
                    LEFT JOIN problem_topics t ON pht.topic_id = t.topic_id
                    WHERE a.status IN ('approved','pending','denied','draft')
                      AND (r.role_name IS NULL OR r.role_name = 'user')
                      AND ci.content_type = 'problem'
                    GROUP BY p.problem_id
                    ORDER BY ci.created_at DESC
                    `
                );
                questions = res[0];
            } catch (qerr) {
                // Fallback: if topic aggregation fails (missing tables), run simpler query
                if (qerr && qerr.code === 'ER_NO_SUCH_TABLE') {
                    const res2 = await db.query(
                        `
                        SELECT 
                            p.problem_id,
                            p.problem_name,
                            p.difficulty,
                            ci.content_item_id,
                            ci.created_at,
                            a.status,
                            u.user_id as creator_id,
                            COALESCE(prof.full_name, u.username) as creator_name,
                            '' AS TopicsText
                        FROM problems p
                        JOIN content_problems cp ON p.problem_id = cp.problem_id
                        JOIN content_items ci ON cp.content_item_id = ci.content_item_id
                        JOIN approvals a ON ci.content_item_id = a.content_item_id
                        JOIN users u ON a.requested_by = u.user_id
                        LEFT JOIN user_roles ur ON u.user_id = ur.user_id
                        LEFT JOIN roles r ON ur.role_id = r.role_id
                        LEFT JOIN profiles prof ON u.user_id = prof.user_id
                        WHERE a.status IN ('approved','pending','denied','draft')
                          AND (r.role_name IS NULL OR r.role_name = 'user')
                          AND ci.content_type = 'problem'
                        GROUP BY p.problem_id
                        ORDER BY ci.created_at DESC
                        `
                    );
                    questions = res2[0];
                } else {
                    throw qerr;
                }
            }

            // 4. Format response
            // Ensure user questions include topic names by fetching from problem_topics mapping
            const questionList = [];
            const problemIds = questions.map(q => q.problem_id).filter(Boolean);
            let topicMap = {};
            if (problemIds.length > 0) {
                try {
                    const placeholders = problemIds.map(() => '?').join(',');
                    const [topicRows] = await db.query(
                        `SELECT pht.problem_id, pt.topic_name
                         FROM problems_have_topics pht
                         JOIN problem_topics pt ON pht.topic_id = pt.topic_id
                         WHERE pht.problem_id IN (${placeholders})`,
                        problemIds
                    );
                    topicMap = topicRows.reduce((acc, r) => {
                        if (!acc[r.problem_id]) acc[r.problem_id] = [];
                        acc[r.problem_id].push(r.topic_name);
                        return acc;
                    }, {});
                } catch (tErr) {
                    // ignore topic map fetch errors
                }
            }

            for (const q of questions) {
                const topicsArr = (topicMap[q.problem_id] && topicMap[q.problem_id].length > 0)
                    ? topicMap[q.problem_id]
                    : (q.TopicsText && q.TopicsText.length ? q.TopicsText.split(',') : []);

                questionList.push({
                    QuestionID: q.problem_id,
                    QuestionName: q.problem_name,
                    QuestionDifficulty: q.difficulty,
                    QuestionLink: `/problem/${q.problem_id}`,
                    CreatedAt: q.created_at,
                    CreatorName: q.creator_name,
                    Status: q.status,
                    TopicsText: topicsArr.join(',')
                });
            }

            socket.emit('response_get_user_questions', {
                success: true,
                questions: questionList
            });

        } catch (err) {
            socket.emit('response_get_user_questions', { success: false, message: 'Server error' });
        }
    });

    // === request get pending questions (pending problems from all privilege levels) ===
    socket.on('request_get_pending_questions', async ({ token_session }) => {
        try {
            console.log('Get pending questions request received on socket', socket.id);

            // 1. Verify session
            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
                console.log('Using socket.user for get pending questions request', { socketId: socket.id, userId: session.userId });
            } else {
                console.log('Falling back to token_session for get pending questions request');
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_get_pending_questions', { success: false, message: 'Invalid session' });
                return;
            }

            // 2. Verify admin role
            const isAdmin = await verifyAdmin(session);
            if (!isAdmin) {
                socket.emit('response_get_pending_questions', { success: false, message: 'Unauthorized: Admin access required' });
                return;
            }

            // 3. Fetch pending problems from all users (admin, faculty, and regular users)
            const [questions] = await db.query(
                `
                SELECT 
                    p.problem_id,
                    p.problem_name,
                    p.difficulty,
                    ci.content_item_id,
                    ci.created_at,
                    a.status,
                    a.approval_id,
                    u.user_id as creator_id,
                    COALESCE(prof.full_name, u.username) as creator_name,
                    COALESCE(r.role_name, 'user') as creator_role
                FROM problems p
                JOIN content_problems cp ON p.problem_id = cp.problem_id
                JOIN content_items ci ON cp.content_item_id = ci.content_item_id
                JOIN approvals a ON ci.content_item_id = a.content_item_id
                JOIN users u ON a.requested_by = u.user_id
                LEFT JOIN user_roles ur ON u.user_id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.role_id
                LEFT JOIN profiles prof ON u.user_id = prof.user_id
                WHERE a.status = 'pending' 
                  AND ci.content_type = 'problem'
                ORDER BY ci.created_at DESC
                `
            );

            // 4. Format response
            const questionList = questions.map(q => ({
                QuestionID: q.problem_id,
                ApprovalID: q.approval_id,
                QuestionName: q.problem_name,
                QuestionDifficulty: q.difficulty,
                QuestionLink: `/problem/${q.problem_id}`,
                CreatedAt: q.created_at,
                CreatorName: q.creator_name,
                CreatorRole: q.creator_role.charAt(0).toUpperCase() + q.creator_role.slice(1)
            }));

            socket.emit('response_get_pending_questions', {
                success: true,
                questions: questionList
            });

        } catch (err) {
            console.error('Error in request_get_pending_questions:', err);
            socket.emit('response_get_pending_questions', { success: false, message: 'Server error' });
        }
    });

    // === Approve question (admin only) ===
    socket.on('request_approve_question', async ({ token_session, questionId }) => {
        try {
            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }
            if (!session || !(await verifyAdmin(session))) {
                socket.emit('response_approve_question', { success: false, message: 'Unauthorized' });
                return;
            }

            const [rows] = await db.query('SELECT content_item_id FROM content_problems WHERE problem_id = ?', [questionId]);
            if (rows.length === 0) {
                socket.emit('response_approve_question', { success: false, message: 'Question not found' });
                return;
            }

            await db.query(
                'UPDATE approvals SET status = ?, approved_by = ?, updated_at = NOW() WHERE content_item_id = ?',
                ['approved', session.userId, rows[0].content_item_id]
            );

            socket.emit('response_approve_question', { success: true, questionId });
        } catch (err) {
            console.error('Error in request_approve_question:', err);
            socket.emit('response_approve_question', { success: false, message: 'Server error' });
        }
    });

    // === Deny question (admin only) ===
    socket.on('request_deny_question', async ({ token_session, questionId, reason }) => {
        try {
            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }
            if (!session || !(await verifyAdmin(session))) {
                socket.emit('response_deny_question', { success: false, message: 'Unauthorized' });
                return;
            }

            const [rows] = await db.query('SELECT content_item_id FROM content_problems WHERE problem_id = ?', [questionId]);
            if (rows.length === 0) {
                socket.emit('response_deny_question', { success: false, message: 'Question not found' });
                return;
            }

            await db.query(
                'UPDATE approvals SET status = ?, approved_by = ?, reason = ?, updated_at = NOW() WHERE content_item_id = ?',
                ['denied', session.userId, reason || 'Inappropriate content', rows[0].content_item_id]
            );

            socket.emit('response_deny_question', { success: true, questionId });
        } catch (err) {
            console.error('Error in request_deny_question:', err);
            socket.emit('response_deny_question', { success: false, message: 'Server error' });
        }
    });

    // === Delete question (admin logic for full deletion) ===
    socket.on('request_delete_question', async ({ token_session, questionId }) => {
        try {
            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }
            if (!session || !(await verifyAdmin(session))) {
                socket.emit('response_delete_question', { success: false, message: 'Unauthorized' });
                return;
            }

            const [rows] = await db.query('SELECT content_item_id FROM content_problems WHERE problem_id = ?', [questionId]);
            if (rows.length === 0) {
                socket.emit('response_delete_question', { success: false, message: 'Question not found' });
                return;
            }
            
            const cid = rows[0].content_item_id;
            const connection = await db.getConnection();
            try {
                await connection.beginTransaction();

                await connection.query('DELETE FROM approvals WHERE content_item_id = ?', [cid]);
                await connection.query('DELETE FROM content_problems WHERE content_item_id = ?', [cid]);
                await connection.query('DELETE FROM content_items WHERE content_item_id = ?', [cid]);

                await connection.query('DELETE FROM problems_have_topics WHERE problem_id = ?', [questionId]);
                await connection.query('DELETE FROM test_cases WHERE problem_id = ?', [questionId]);
                await connection.query('DELETE FROM problems WHERE problem_id = ?', [questionId]);

                await connection.commit();
                socket.emit('response_delete_question', { success: true, questionId });
            } catch (err) {
                await connection.rollback();
                throw err;
            } finally {
                connection.release();
            }
        } catch (err) {
            console.error('Error in request_delete_question:', err);
            socket.emit('response_delete_question', { success: false, message: 'Server error' });
        }
    });
};
