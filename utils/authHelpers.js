/**
 * Auth Helpers Module
 * Centralizes session verification, role checks, and permission management.
 */

/**
 * Verify token (checks JWT signature and active session in DB)
 * @param {object} db - Database connection
 * @param {string} token - JWT token to verify
 * @param {string} jwtSecret - Secret key for JWT
 * @returns {object|null} Session object { userId, decoded } or null
 */
async function verifySession(db, token, jwtSecret) {
    if (!token) return null;
    
    // Safety: strip Bearer if it accidentally reaches this lower-level helper
    let cleanToken = token;
    if (typeof token === 'string' && token.startsWith('Bearer ')) {
        cleanToken = token.split(' ')[1];
    }
    
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(cleanToken, jwtSecret);
        
        // Debug: Log the session lookup (previewing token)
        console.log(`[AUTH] Verifying session for ${decoded.username || decoded.email || 'unknown'} (Token: ${cleanToken.slice(0, 20)}...)`);

        const [sessions] = await db.query(
            'SELECT session_id, user_id FROM active_sessions WHERE token = ? AND expires_at > NOW()',
            [cleanToken]
        );

        if (sessions.length === 0) {
            console.warn(`[AUTH] Session not found or expired for token: ${cleanToken.slice(0, 20)}...`);
            return null;
        }

        return { userId: sessions[0].user_id, decoded };
    } catch (e) {
        console.error('[AUTH] verifySession error:', e.message);
        return null;
    }
}

/**
 * Verify if user has admin role
 * @param {object} db - Database connection
 * @param {number} userId - ID of the user to check
 * @returns {boolean}
 */
async function verifyAdmin(db, userId) {
    if (!userId) return false;

    const [rows] = await db.query(
        `
        SELECT r.role_name 
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.role_id
        WHERE ur.user_id = ? AND r.role_name = 'admin'
        `,
        [userId]
    );

    return rows.length > 0;
}

/**
 * Normalize legacy permission names to the new format
 * @param {string} name - Permission name to normalize
 * @returns {string}
 */
function normalizePermissionName(name) {
    if (!name) return name;
    const n = name.toString().trim();
    const map = {
        // blog
        'create_own_blog': 'blog.create',
        'edit_any_blog': 'blog.edit.any',
        'edit_own_blog': 'blog.edit.own',
        'delete_any_blog': 'blog.delete.any',
        'delete_own_blog': 'blog.delete.own',
        'approve_blog': 'blog.approvals.manage',
        'deny_blog': 'blog.approvals.manage',
        'faculty_auto_approve_blogs': 'blog.auto_approve',
        'faculty_manage_blogs': 'blog.approvals.manage',

        // event
        'approve_event': 'event.approvals.manage',
        'deny_event': 'event.approvals.manage',
        'edit_any_event': 'event.edit.any',
        'edit_own_event': 'event.edit.own',

        // problem / question
        'approve_problem': 'problem.approvals.manage',
        'deny_problem': 'problem.approvals.manage',
        'edit_any_problem': 'problem.edit.any',
        'edit_own_problem': 'problem.edit.own',
        'delete_any_problem': 'problem.delete.any',
        'delete_own_problem': 'problem.delete.own',

        // faculty/admin
        'faculty_manage_approvals': 'approvals.manage',
        'faculty_submit_for_review': 'faculty.submit_for_review',
        'request_admin_changes': 'users.request_admin_changes',
        'manage_roles': 'roles.manage'
    };
    return map[n] || n;
}

/**
 * Check if user has a specific permission
 * @param {object} db - Database connection
 * @param {number} userId - ID of the user to check
 * @param {string} permissionName - Name of the permission
 * @returns {boolean}
 */
async function hasPermission(db, userId, permissionName) {
    if (!userId || !permissionName) return false;
    
    permissionName = normalizePermissionName(permissionName);

    // SQL strategy: 
    // 1. Check if there is an explicit DENY (is_granted = 0) in user_permissions.
    // 2. Otherwise, check if there is an explicit GRANT (is_granted = 1) in user_permissions
    //    OR a grant via any of the user's roles in role_permissions.
    
    const [rows] = await db.query(
        `
        SELECT 1 AS has_perm
        FROM permissions p
        WHERE p.permission_name = ?
          AND NOT EXISTS (
                SELECT 1 FROM user_permissions up2 
                WHERE up2.user_id = ? AND up2.permission_id = p.permission_id AND up2.is_granted = 0
          )
          AND (
                EXISTS (
                    SELECT 1
                    FROM role_permissions rp
                    JOIN user_roles ur ON rp.role_id = ur.role_id
                    WHERE ur.user_id = ? AND rp.permission_id = p.permission_id
                )
             OR EXISTS (
                    SELECT 1
                    FROM user_permissions up
                    WHERE up.user_id = ? AND up.permission_id = p.permission_id AND up.is_granted = 1
                )
          )
        LIMIT 1
        `,
        [permissionName, userId, userId, userId]
    );

    return rows.length > 0;
}

/**
 * Get primary role for a user
 * @param {object} db 
 * @param {number} userId 
 * @returns {string} role name (default 'user')
 */
async function getUserPrimaryRole(db, userId) {
    if (!userId) return 'user';
    const [roles] = await db.query(
        `SELECT r.role_name FROM user_roles ur
         JOIN roles r ON ur.role_id = r.role_id
         WHERE ur.user_id = ?
         LIMIT 1`,
        [userId]
    );
    return roles.length > 0 ? roles[0].role_name : 'user';
}

/**
 * Derive category from table name (problems -> problem, etc)
 */
function deriveCategory(tableName) {
    if (!tableName) return 'unknown';
    if (tableName.endsWith('s')) return tableName.slice(0, -1);
    return tableName;
}

module.exports = {
    verifySession,
    verifyAdmin,
    normalizePermissionName,
    hasPermission,
    getUserPrimaryRole,
    deriveCategory
};
