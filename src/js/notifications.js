const jwt = require('jsonwebtoken');

module.exports = function setupNotifications({ app, db, io, activeSessions, jwtSecret }) {
    // Helper to verify JWT and active session, returns user payload or null
    async function verifyRequestToken(req) {
        try {
            const authHeader = req.headers['authorization'];
            if (!authHeader) return null;
            const token = authHeader.split(' ')[1];
            if (!token) return null;

            const user = jwt.verify(token, jwtSecret);

            // check active session
            const [sessions] = await db.query('SELECT session_id FROM active_sessions WHERE token = ? AND expires_at > NOW()', [token]);
            if (sessions.length === 0) return null;

            return { token, user };
        } catch (e) {
            return null;
        }
    }

    async function isAdminUser(userId) {
        try {
            const [rows] = await db.query(
                `SELECT r.role_name FROM user_roles ur JOIN roles r ON ur.role_id = r.role_id WHERE ur.user_id = ? AND r.role_name = 'admin' LIMIT 1`,
                [userId]
            );
            return rows && rows.length > 0;
        } catch (e) {
            console.error('isAdminUser error', e);
            return false;
        }
    }

    // GET /api/notifications - list notifications for authenticated user (exclude soft-deleted)
    app.get('/api/notifications', async (req, res) => {
        try {
            const auth = await verifyRequestToken(req);
            if (!auth) return res.status(401).json({ success: false });

            const userId = auth.user.id;
            const limit = Math.min(200, Number(req.query.limit) || 50);
            const [rows] = await db.query('SELECT id, user_id, type, title, message, data, link, is_read, created_at, read_at FROM notifications WHERE user_id = ? AND (is_deleted = 0 OR is_deleted IS NULL) ORDER BY created_at DESC LIMIT ?', [userId, limit]);
            res.json({ success: true, notifications: rows });
        } catch (err) {
            console.error('GET /api/notifications error', err);
            res.status(500).json({ success: false });
        }
    });

    // POST /api/notifications/mark-read - mark notifications as read
    app.post('/api/notifications/mark-read', async (req, res) => {
        try {
            const auth = await verifyRequestToken(req);
            if (!auth) return res.status(401).json({ success: false });

            const userId = auth.user.id;
            const ids = Array.isArray(req.body.ids) ? req.body.ids.map(Number).filter(Boolean) : [];
            if (req.body.all === true) {
                await db.query('UPDATE notifications SET is_read = 1, read_at = NOW() WHERE user_id = ?', [userId]);
                return res.json({ success: true });
            }

            if (ids.length === 0) return res.json({ success: false, message: 'No ids provided' });

            const placeholders = ids.map(() => '?').join(',');
            await db.query(`UPDATE notifications SET is_read = 1, read_at = NOW() WHERE user_id = ? AND id IN (${placeholders})`, [userId, ...ids]);
            res.json({ success: true });
        } catch (err) {
            console.error('POST /api/notifications/mark-read error', err);
            res.status(500).json({ success: false });
        }
    });

    // DELETE /api/notifications - soft-delete (archive) notifications for authenticated user
    // This will mark notifications as deleted and copy rows into `notifications_archieved` for auditing
    app.delete('/api/notifications', async (req, res) => {
        try {
            const auth = await verifyRequestToken(req);
            if (!auth) return res.status(401).json({ success: false });

            const userId = auth.user.id;
            const ids = Array.isArray(req.body && req.body.ids) ? req.body.ids.map(Number).filter(Boolean) : [];

            const connection = await db.getConnection();
            await connection.beginTransaction();
            try {
                if (req.body && req.body.all === true) {
                    // select rows to archive
                    const [rows] = await connection.query('SELECT * FROM notifications WHERE user_id = ? AND (is_deleted = 0 OR is_deleted IS NULL)', [userId]);
                    if (rows && rows.length) {
                        // insert into archive table
                        const insertPromises = rows.map(r => {
                            const sql = 'INSERT INTO notifications_archieved (id, user_id, type, title, message, data, link, is_read, created_at, read_at, deleted_at, archived_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())';
                            return connection.query(sql, [r.id, r.user_id, r.type, r.title, r.message, r.data, r.link, r.is_read, r.created_at, r.read_at, r.deleted_at]);
                        });
                        await Promise.all(insertPromises);
                    }
                    // mark as deleted
                    await connection.query('UPDATE notifications SET is_deleted = 1, deleted_at = NOW() WHERE user_id = ?', [userId]);
                    await connection.commit();
                    // emit socket event to user's active sessions to notify other open tabs
                    try {
                        const sids = activeSessions.get(Number(userId));
                        if (sids && sids.size) {
                            const deletedIds = rows.map(r => r.id).filter(Boolean);
                            sids.forEach((sid) => {
                                const sock = io.sockets.sockets.get(sid);
                                if (sock) sock.emit('notifications_deleted', { ids: deletedIds, all: true });
                            });
                        }
                    } catch (e) { console.warn('Failed to emit notifications_deleted (all)', e); }
                    connection.release();
                    return res.json({ success: true });
                }

                if (ids.length === 0) {
                    connection.release();
                    return res.status(400).json({ success: false, message: 'No ids provided' });
                }

                // select specific rows to archive
                const placeholders = ids.map(() => '?').join(',');
                const [rows] = await connection.query(`SELECT * FROM notifications WHERE user_id = ? AND id IN (${placeholders}) AND (is_deleted = 0 OR is_deleted IS NULL)`, [userId, ...ids]);
                if (rows && rows.length) {
                    const insertPromises = rows.map(r => {
                        const sql = 'INSERT INTO notifications_archieved (id, user_id, type, title, message, data, link, is_read, created_at, read_at, deleted_at, archived_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())';
                        return connection.query(sql, [r.id, r.user_id, r.type, r.title, r.message, r.data, r.link, r.is_read, r.created_at, r.read_at, r.deleted_at]);
                    });
                    await Promise.all(insertPromises);
                }

                await connection.query(`UPDATE notifications SET is_deleted = 1, deleted_at = NOW() WHERE user_id = ? AND id IN (${placeholders})`, [userId, ...ids]);
                await connection.commit();
                // notify other sessions about deleted ids
                try {
                    const sids = activeSessions.get(Number(userId));
                    if (sids && sids.size) {
                        const deletedIds = rows.map(r => r.id).filter(Boolean);
                        sids.forEach((sid) => {
                            const sock = io.sockets.sockets.get(sid);
                            if (sock) sock.emit('notifications_deleted', { ids: deletedIds, all: false });
                        });
                    }
                } catch (e) { console.warn('Failed to emit notifications_deleted (ids)', e); }
                connection.release();
                return res.json({ success: true });
            } catch (e) {
                await connection.rollback();
                connection.release();
                console.error('DELETE /api/notifications (soft-delete) error', e);
                return res.status(500).json({ success: false });
            }
        } catch (err) {
            console.error('DELETE /api/notifications error', err);
            return res.status(500).json({ success: false });
        }
    });

    // POST /api/notifications - create a notification (intended for server/admin use)
    app.post('/api/notifications', async (req, res) => {
        try {
            // allow server-to-server or admin creation via token
            const auth = await verifyRequestToken(req);
            if (!auth) return res.status(401).json({ success: false });

            const { user_id, type, title, message, data, link } = req.body;
            if (!user_id || !type) return res.status(400).json({ success: false, message: 'missing fields' });

            const insertSql = 'INSERT INTO notifications (user_id, type, title, message, data, link, is_read) VALUES (?, ?, ?, ?, ?, ?, 0)';
            const [result] = await db.query(insertSql, [user_id, type, title || null, message || null, data ? JSON.stringify(data) : null, link || null]);

            // fetch inserted notification
            const [rows] = await db.query('SELECT * FROM notifications WHERE id = ?', [result.insertId]);
            const newNotif = rows[0] || null;

            // Emit real-time event to connected sockets for that user (if present)
            try {
                const sids = activeSessions.get(Number(user_id));
                if (sids && sids.size) {
                    sids.forEach((sid) => {
                        const sock = io.sockets.sockets.get(sid);
                        if (sock) sock.emit('notification', newNotif);
                    });
                }
            } catch (e) {
                console.warn('Failed to emit notification socket event', e);
            }

            res.json({ success: true, notification: newNotif });
        } catch (err) {
            console.error('POST /api/notifications error', err);
            res.status(500).json({ success: false });
        }
    });

    // Admin HTTP endpoints to approve/deny approvals (convenience for testing)
    app.post('/api/admin/approve-question', async (req, res) => {
        try {
            const auth = await verifyRequestToken(req);
            if (!auth) return res.status(401).json({ success: false });

            const userId = auth.user.id;
            const isAdmin = await isAdminUser(userId);
            if (!isAdmin) return res.status(403).json({ success: false, message: 'Admin required' });

            const { approval_id, question_id } = req.body;
            if (!approval_id) return res.status(400).json({ success: false, message: 'approval_id required' });

            const connection = await db.getConnection();
            await connection.beginTransaction();
            try {
                await connection.query(`UPDATE approvals SET status = 'approved', approved_by = ? WHERE approval_id = ?`, [userId, approval_id]);

                const [reqRows] = await connection.query('SELECT requested_by FROM approvals WHERE approval_id = ?', [approval_id]);
                const requester = reqRows && reqRows.length ? reqRows[0].requested_by : null;

                await connection.commit();
                connection.release();

                if (requester) {
                    const title = 'Question Approved';
                    const message = 'An admin has approved your question.';
                    const [ins] = await db.query('INSERT INTO notifications (user_id, type, title, message, data, link, is_read) VALUES (?, ?, ?, ?, ?, ?, 0)', [requester, 'question_approved', title, message, JSON.stringify({ approval_id, question_id }), null]);
                    const [nrows] = await db.query('SELECT * FROM notifications WHERE id = ?', [ins.insertId]);
                    const newNotif = nrows && nrows.length ? nrows[0] : null;
                    if (newNotif && activeSessions && io) {
                        const sids = activeSessions.get(Number(requester));
                        if (sids && sids.size) {
                            sids.forEach((sid) => {
                                const sock = io.sockets.sockets.get(sid);
                                if (sock) sock.emit('notification', newNotif);
                            });
                        }
                        try {
                            if (sids && sids.size) sids.forEach((sid) => { const sock = io.sockets.sockets.get(sid); if (sock) sock.emit('approval_approved', { message: message, approval_id, question_id, notification_id: newNotif.id }); });
                        } catch (e) {}
                    }
                }

                return res.json({ success: true });
            } catch (e) {
                await connection.rollback();
                connection.release();
                console.error('/api/admin/approve-question error', e);
                return res.status(500).json({ success: false });
            }
        } catch (err) {
            console.error('/api/admin/approve-question outer error', err);
            return res.status(500).json({ success: false });
        }
    });

    app.post('/api/admin/deny-question', async (req, res) => {
        try {
            const auth = await verifyRequestToken(req);
            if (!auth) return res.status(401).json({ success: false });

            const userId = auth.user.id;
            const isAdmin = await isAdminUser(userId);
            if (!isAdmin) return res.status(403).json({ success: false, message: 'Admin required' });

            const { approval_id, question_id, reason } = req.body;
            if (!approval_id) return res.status(400).json({ success: false, message: 'approval_id required' });

            const connection = await db.getConnection();
            await connection.beginTransaction();
            try {
                await connection.query(`UPDATE approvals SET status = 'denied', approved_by = ?, reason = ? WHERE approval_id = ?`, [userId, reason || 'No reason provided', approval_id]);

                const [reqRows] = await connection.query('SELECT requested_by FROM approvals WHERE approval_id = ?', [approval_id]);
                const requester = reqRows && reqRows.length ? reqRows[0].requested_by : null;

                await connection.commit();
                connection.release();

                if (requester) {
                    const title = 'Question Denied';
                    const messageToUser = reason || 'Your submitted question was denied by an admin.';
                    const [ins] = await db.query('INSERT INTO notifications (user_id, type, title, message, data, link, is_read) VALUES (?, ?, ?, ?, ?, ?, 0)', [requester, 'question_denied', title, messageToUser, JSON.stringify({ approval_id, question_id, reason }), null]);
                    const [nrows] = await db.query('SELECT * FROM notifications WHERE id = ?', [ins.insertId]);
                    const newNotif = nrows && nrows.length ? nrows[0] : null;
                    if (newNotif && activeSessions && io) {
                        const sids = activeSessions.get(Number(requester));
                        if (sids && sids.size) {
                            sids.forEach((sid) => {
                                const sock = io.sockets.sockets.get(sid);
                                if (sock) sock.emit('notification', newNotif);
                            });
                        }
                        try {
                            if (sids && sids.size) sids.forEach((sid) => { const sock = io.sockets.sockets.get(sid); if (sock) sock.emit('approval_denied', { message: messageToUser, approval_id, question_id, notification_id: newNotif.id }); });
                        } catch (e) {}
                    }
                }

                return res.json({ success: true });
            } catch (e) {
                await connection.rollback();
                connection.release();
                console.error('/api/admin/deny-question error', e);
                return res.status(500).json({ success: false });
            }
        } catch (err) {
            console.error('/api/admin/deny-question outer error', err);
            return res.status(500).json({ success: false });
        }
    });
};
