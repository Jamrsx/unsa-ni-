module.exports = function registerHeaderSocket(socket, db, bcrypt, jwt) {
    // local helper: verify session token (same logic as other modules)
    async function verifySession(token) {
        if (!token) return null;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const [sessions] = await db.query(
                'SELECT session_id, user_id FROM active_sessions WHERE token = ? AND expires_at > NOW()',
                [token]
            );
            if (sessions.length === 0) return null;
            return { userId: sessions[0].user_id, decoded };
        } catch (e) {
            console.error('header_socket verifySession error:', e);
            return null;
        }
    }

    async function getUserPrimaryRole(userId) {
        try {
            const [roles] = await db.query(
                `SELECT r.role_name FROM user_roles ur
                 JOIN roles r ON ur.role_id = r.role_id
                 WHERE ur.user_id = ?
                 LIMIT 1`,
                [userId]
            );
            return roles.length > 0 ? roles[0].role_name : 'user';
        } catch (e) {
            console.error('header_socket getUserPrimaryRole error:', e);
            return 'user';
        }
    }

    socket.on('request_get_user_primary_role', async ({ token_session }) => {
        try {
            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_get_user_primary_role', { success: false, message: 'Invalid session' });
                return;
            }

            const roleName = await getUserPrimaryRole(session.userId);
            socket.emit('response_get_user_primary_role', { success: true, role: roleName });
        } catch (err) {
            console.error('Error in header_socket request_get_user_primary_role:', err);
            socket.emit('response_get_user_primary_role', { success: false, message: 'Server error' });
        }
    });
};
