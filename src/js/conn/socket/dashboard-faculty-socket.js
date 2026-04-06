const {
    checkFacultyPermission,
    requireAllPermissions,
    commitPendingChange,
    queuePendingChange,
    FACULTY_TABLE_CONFIG,
    TABLE_ALLOWED_FIELDS,
    syncFacultyChangeToApprovals
} = require('../../faculty-dashboard');
const fs = require('fs');
const path = require('path');

function registerFacultySocketHandlers(socket, db, bcrypt, jwt, helpers, io) {
    const { verifySession, verifyAdmin } = helpers || {};

    // reuse socket handshake when present; fallback to token
    async function getSession(token_session) {
        if (socket.user && socket.user.userId) {
            return { userId: socket.user.userId, decoded: socket.user.decoded };
        }
        return verifySession ? await verifySession(token_session) : null;
    }

    async function ensurePermission(userId, permission) {
        return checkFacultyPermission(db, userId, permission);
    }

    function safeJsonParse(val) {
        if (!val) return {};
        if (typeof val === 'object') return val;
        try {
            return JSON.parse(val);
        } catch (e) {
            return {};
        }
    }

    // Allow faculty to edit the proposed_data payload of their own
    // pending changes (status = 'pending_faculty_review') before they
    // are forwarded to admin. This is used by the faculty dashboard
    // when editing draft/pending events and blogs that have not yet
    // been materialized into the base tables.
    socket.on('request_update_faculty_change_proposed', async ({ token_session, change_id, proposed_data }) => {
        const id = parseInt(change_id, 10);
        if (!id) return socket.emit('response_update_faculty_change_proposed', { success: false, message: 'Invalid change id' });

        try {
            const session = await getSession(token_session);
            if (!session) return socket.emit('response_update_faculty_change_proposed', { success: false, message: 'Invalid session' });

            // Load the pending change, ensure it belongs to this faculty
            // member and is still under faculty review.
            const [rows] = await db.query(
                `SELECT * FROM faculty_pending_changes
                 WHERE id = ? AND faculty_id = ? AND status = 'pending_faculty_review'
                 LIMIT 1`,
                [id, session.userId]
            );
            if (!rows.length) {
                return socket.emit('response_update_faculty_change_proposed', {
                    success: false,
                    message: 'Change not found or no longer editable'
                });
            }

            const change = rows[0];

            // Enforce the same base permission that was required to
            // create the original change. This uses FACULTY_TABLE_CONFIG
            // to map table_name -> basePermission (e.g. event.create).
            const cfg = FACULTY_TABLE_CONFIG && FACULTY_TABLE_CONFIG[change.table_name];
            if (cfg && cfg.basePermission) {
                const allowed = await ensurePermission(session.userId, cfg.basePermission);
                if (!allowed) {
                    return socket.emit('response_update_faculty_change_proposed', { success: false, message: 'Forbidden' });
                }
            }

            const newProposed = (typeof proposed_data === 'string')
                ? safeJsonParse(proposed_data)
                : (proposed_data || {});

            await db.query(
                `UPDATE faculty_pending_changes
                 SET proposed_data = ?, updated_at = NOW()
                 WHERE id = ?`,
                [JSON.stringify(newProposed), id]
            );

            socket.emit('response_update_faculty_change_proposed', {
                success: true,
                message: 'Draft change updated',
                change_id: id
            });
        } catch (err) {
            console.error('[socket update_faculty_change_proposed] error', err);
            socket.emit('response_update_faculty_change_proposed', { success: false, message: err.message || 'Failed to update draft change' });
        }
    });

    function pickAllowed(source, allowedKeys) {
        const out = {};
        if (!source) return out;
        allowedKeys.forEach((key) => {
            if (source[key] !== undefined) out[key] = source[key];
        });
        return out;
    }

    // === EDIT ACCOUNT (Self-edit only) ===
    socket.on('request_update_faculty_profile', async ({ token_session, first_name, last_name, email, phone }) => {
        try {
            const session = await getSession(token_session);
            if (!session) return socket.emit('response_update_faculty_profile', { success: false, message: 'Invalid session' });

            // Self-edit only (no permission check required)
            const [profileResult] = await db.query(
                `UPDATE profiles SET first_name = ?, last_name = ?, email = ?, phone = ? WHERE user_id = ?`,
                [first_name || null, last_name || null, email || null, phone || null, session.userId]
            );

            if (profileResult.affectedRows === 0) {
                // If profile doesn't exist, create it
                await db.query(
                    `INSERT INTO profiles (user_id, first_name, last_name, email, phone) VALUES (?, ?, ?, ?, ?)`,
                    [session.userId, first_name || null, last_name || null, email || null, phone || null]
                );
            }

            // Log in audit trail
            await db.query(
                `INSERT INTO audit_trail (user_id, action, timestamp)
                 VALUES (?, 'update_profile', NOW())`,
                [session.userId]
            );

            // Emit notification
            try {
                socket.emit('notification', {
                    type: 'update',
                    title: 'Profile Updated',
                    message: 'Your profile was updated successfully',
                    data: { resource_type: 'profile', action_url: '#settings' }
                });
            } catch (e) { console.error('notification emit error:', e); }

            socket.emit('response_update_faculty_profile', { success: true, message: 'Profile updated successfully', updated_at: new Date() });
        } catch (err) {
            console.error('[socket update_faculty_profile] error', err);
            socket.emit('response_update_faculty_profile', { success: false, message: err.message || 'Failed to update profile' });
        }
    });

    socket.on('request_faculty_dashboard', async ({ token_session }) => {
        try {
            const session = await getSession(token_session);
            if (!session) return socket.emit('response_faculty_dashboard', { success: false, message: 'Invalid session' });
            const allowed = await ensurePermission(session.userId, 'faculty.view_dashboard');
            if (!allowed) return socket.emit('response_faculty_dashboard', { success: false, message: 'Forbidden' });

            const queries = [
                db.query('SELECT COUNT(*) AS total_users FROM users'),
                db.query('SELECT COUNT(*) AS total_problems FROM problems'),
                db.query('SELECT COUNT(*) AS total_events FROM events'),
                db.query('SELECT COUNT(*) AS total_blogs FROM blogs'),
                db.query("SELECT COUNT(*) AS pending_faculty FROM faculty_pending_changes WHERE status = 'pending_faculty_review'"),
                db.query("SELECT COUNT(*) AS pending_admin FROM faculty_pending_changes WHERE status = 'pending_admin'")
            ];
            const [usersRes, problemsRes, eventsRes, blogsRes, pendingFacultyRes, pendingAdminRes] = await Promise.all(queries);

            socket.emit('response_faculty_dashboard', {
                success: true,
                totals: {
                    users: usersRes[0][0].total_users,
                    problems: problemsRes[0][0].total_problems,
                    events: eventsRes[0][0].total_events,
                    blogs: blogsRes[0][0].total_blogs,
                    pending_faculty: pendingFacultyRes[0][0].pending_faculty,
                    pending_admin: pendingAdminRes[0][0].pending_admin
                }
            });
        } catch (err) {
            console.error('[socket faculty_dashboard] error', err);
            socket.emit('response_faculty_dashboard', { success: false, message: 'Failed to load dashboard' });
        }
    });

    socket.on('request_faculty_pending_changes', async ({ token_session }) => {
        try {
            const session = await getSession(token_session);
            if (!session) return socket.emit('response_faculty_pending_changes', { success: false, message: 'Invalid session' });
            // Allow faculty to view pending changes if they can create
            // content OR if they have the global approvals.manage permission.
            const canView =
                await ensurePermission(session.userId, 'approvals.manage') ||
                await ensurePermission(session.userId, 'blog.create') ||
                await ensurePermission(session.userId, 'event.create') ||
                await ensurePermission(session.userId, 'problem.create');
            if (!canView) return socket.emit('response_faculty_pending_changes', { success: false, message: 'Forbidden' });

            // Central Faculty > Approvals tab is intended for
            // peer review only. Do NOT show the current faculty
            // member's own pending submissions here; they will
            // see their own items in the "My" views instead.
            const [rows] = await db.query(
                `SELECT * FROM faculty_pending_changes
                 WHERE status = 'pending_faculty_review' AND faculty_id != ?
                 ORDER BY created_at DESC`,
                [session.userId]
            );

            const pendingRows = Array.isArray(rows) ? rows : [];

            // Enrich pending problem rows with test_cases so the
            // faculty "View" modal can display test case numbers
            // and input/output even when proposed_data lacks them.
            const problemPending = pendingRows.filter(r => r && r.change_type === 'problem' && r.table_name === 'problems');
            const ids = [...new Set(problemPending.map(r => Number(r.record_id)).filter(id => id && id > 0))];

            let testCasesByProblem = new Map();
            if (ids.length) {
                try {
                    const [tcs] = await db.query(
                        `SELECT problem_id, test_case_number, is_sample, input_data, expected_output, score
                         FROM test_cases WHERE problem_id IN (?) ORDER BY test_case_number ASC`,
                        [ids]
                    );
                    if (Array.isArray(tcs)) {
                        tcs.forEach(tc => {
                            if (!testCasesByProblem.has(tc.problem_id)) testCasesByProblem.set(tc.problem_id, []);
                            testCasesByProblem.get(tc.problem_id).push({
                                TestCaseNumber: tc.test_case_number,
                                IsSample: !!tc.is_sample,
                                InputData: tc.input_data,
                                ExpectedOutput: tc.expected_output,
                                Score: tc.score
                            });
                        });
                    }
                } catch (e) {
                    console.warn('[socket faculty_pending] failed to load test_cases for pending problems', e && e.message);
                }
            }

            // Attach test_cases: prefer proposed_data.test_cases if present,
            // otherwise use DB-sourced test cases for existing records.
            const enriched = pendingRows.map(r => {
                try {
                    const proposed = r.proposed_data ? JSON.parse(r.proposed_data) : {};
                    if (r.change_type === 'problem' && r.table_name === 'problems') {
                        if (Array.isArray(proposed.test_cases) && proposed.test_cases.length) {
                            return { ...r, test_cases: proposed.test_cases };
                        }
                        const tc = testCasesByProblem.get(Number(r.record_id)) || [];
                        return { ...r, test_cases: tc };
                    }
                } catch (e) {
                    // ignore JSON parse errors and fall through
                }
                return r;
            });

            socket.emit('response_faculty_pending_changes', { success: true, pending: enriched });
        } catch (err) {
            console.error('[socket faculty_pending] error', err);
            socket.emit('response_faculty_pending_changes', { success: false, message: 'Failed to load pending changes' });
        }
    });

    socket.on('request_faculty_approve_change', async ({ token_session, change_id, comment }) => {
        const id = parseInt(change_id, 10);
        if (!id) return socket.emit('response_faculty_approve_change', { success: false, message: 'Invalid change id' });

        try {
            const session = await getSession(token_session);
            if (!session) return socket.emit('response_faculty_approve_change', { success: false, message: 'Invalid session' });

            const allowed = await ensurePermission(session.userId, 'approvals.manage');
            if (!allowed) return socket.emit('response_faculty_approve_change', { success: false, message: 'Forbidden: approvals permission required' });

            const [result] = await db.query(
                `UPDATE faculty_pending_changes
                 SET status = 'pending_admin', faculty_reviewer_id = ?, faculty_review_date = NOW(), faculty_review_comment = ?
                 WHERE id = ? AND status = 'pending_faculty_review'`,
                [session.userId, comment || null, id]
            );
            if (result.affectedRows === 0) return socket.emit('response_faculty_approve_change', { success: false, message: 'Change not found or already processed' });

            // Reuse the shared HTTP helper so that both socket and HTTP
            // approval flows keep the approvals table in sync.
            try {
                await syncFacultyChangeToApprovals(db, id);
            } catch (e) {
                console.warn('post-forward sync to approvals failed', e && e.message);
            }

            socket.emit('response_faculty_approve_change', { success: true, message: 'Change approved and sent to admin' });
            try {
                socket.broadcast.emit('faculty_change_forwarded', { id, reviewer_id: session.userId });
            } catch (e) {}
        } catch (err) {
            console.error('[socket faculty_approve] error', err);
            socket.emit('response_faculty_approve_change', { success: false, message: 'Failed to approve change' });
        }
    });

    socket.on('request_faculty_reject_change', async ({ token_session, change_id, comment }) => {
        const id = parseInt(change_id, 10);
        if (!id) return socket.emit('response_faculty_reject_change', { success: false, message: 'Invalid change id' });

        try {
            const session = await getSession(token_session);
            if (!session) return socket.emit('response_faculty_reject_change', { success: false, message: 'Invalid session' });

            const allowed = await ensurePermission(session.userId, 'approvals.manage');
            if (!allowed) return socket.emit('response_faculty_reject_change', { success: false, message: 'Forbidden: approvals permission required' });

            // Load the change row so we can also update the shared
            // approvals pipeline when a faculty rejection occurs.
            const [changeRows] = await db.query(
                'SELECT * FROM faculty_pending_changes WHERE id = ? LIMIT 1',
                [id]
            );
            if (!changeRows || !changeRows.length) {
                return socket.emit('response_faculty_reject_change', { success: false, message: 'Change not found or already processed' });
            }
            const change = changeRows[0];

            const [result] = await db.query(
                `UPDATE faculty_pending_changes
                 SET status = 'rejected', faculty_reviewer_id = ?, faculty_review_date = NOW(), faculty_review_comment = ?
                 WHERE id = ? AND status = 'pending_faculty_review'`,
                [session.userId, comment || null, id]
            );
            if (result.affectedRows === 0) return socket.emit('response_faculty_reject_change', { success: false, message: 'Change not found or already processed' });

            // For content tables that participate in the shared approvals
            // workflow (problems, events, blogs), also mark the latest
            // pending approvals row as denied so that admin/faculty Level 1
            // queues reflect the rejection without requiring a second
            // explicit deny in the admin dashboard.
            try {
                if (['problems', 'events', 'blogs'].includes(change.table_name) && change.record_id) {
                    const tableName = change.table_name;
                    const recordId = change.record_id;
                    let contentItemId = null;

                    if (tableName === 'problems') {
                        const [cp] = await db.query(
                            'SELECT content_item_id FROM content_problems WHERE problem_id = ? LIMIT 1',
                            [recordId]
                        );
                        if (cp && cp.length) contentItemId = cp[0].content_item_id;
                    } else if (tableName === 'events') {
                        const [ce] = await db.query(
                            'SELECT content_item_id FROM content_events WHERE event_id = ? LIMIT 1',
                            [recordId]
                        );
                        if (ce && ce.length) contentItemId = ce[0].content_item_id;
                    } else if (tableName === 'blogs') {
                        const [cb] = await db.query(
                            'SELECT content_item_id FROM content_blogs WHERE blog_id = ? LIMIT 1',
                            [recordId]
                        );
                        if (cb && cb.length) contentItemId = cb[0].content_item_id;
                    }

                    if (contentItemId) {
                        await db.query(
                            `UPDATE approvals
                             SET status = 'denied', approved_by = ?, reason = COALESCE(?, reason)
                             WHERE content_item_id = ? AND status = 'pending'`,
                            [session.userId, comment || 'Denied by faculty', contentItemId]
                        );
                    }
                }
            } catch (e) {
                console.warn('[socket faculty_reject] failed to sync rejection to approvals for change', id, e && e.message);
            }

            socket.emit('response_faculty_reject_change', { success: true, message: 'Change rejected' });
            try {
                socket.broadcast.emit('faculty_change_rejected', { id, reviewer_id: session.userId });
            } catch (e) {}
        } catch (err) {
            console.error('[socket faculty_reject] error', err);
            socket.emit('response_faculty_reject_change', { success: false, message: 'Failed to reject change' });
        }
    });

    socket.on('request_admin_pending_faculty_changes', async ({ token_session }) => {
        try {
            const session = await getSession(token_session);
            const isAdmin = verifyAdmin ? await verifyAdmin(session) : false;
            if (!session || !isAdmin) return socket.emit('response_admin_pending_faculty_changes', { success: false, message: 'Admin only' });
            const [rows] = await db.query(
                "SELECT * FROM faculty_pending_changes WHERE status = 'pending_admin' ORDER BY created_at DESC"
            );
            socket.emit('response_admin_pending_faculty_changes', { success: true, pending: rows });
        } catch (err) {
            console.error('[socket admin_pending_faculty] error', err);
            socket.emit('response_admin_pending_faculty_changes', { success: false, message: 'Failed to load admin approvals' });
        }
    });

    socket.on('request_admin_commit_change', async ({ token_session, change_id, comment }) => {
        const id = parseInt(change_id, 10);
        if (!id) return socket.emit('response_admin_commit_change', { success: false, message: 'Invalid change id' });

        try {
            const session = await getSession(token_session);
            const isAdmin = verifyAdmin ? await verifyAdmin(session) : false;
            if (!session || !isAdmin) return socket.emit('response_admin_commit_change', { success: false, message: 'Admin only' });

            const [rows] = await db.query(
                "SELECT * FROM faculty_pending_changes WHERE id = ? AND status = 'pending_admin' LIMIT 1",
                [id]
            );
            if (!rows.length) return socket.emit('response_admin_commit_change', { success: false, message: 'Change not found or already processed' });

            const changeRow = rows[0];
            const commitResult = await commitPendingChange(db, bcrypt, changeRow);

            await db.query(
                `UPDATE faculty_pending_changes
                 SET status = 'committed', admin_reviewer_id = ?, admin_review_date = NOW(), admin_review_comment = ?
                 WHERE id = ?`,
                [session.userId, comment || null, id]
            );

            if (commitResult?.newId && changeRow.record_id === 0) {
                await db.query('UPDATE faculty_pending_changes SET record_id = ? WHERE id = ?', [commitResult.newId, id]);
            }

            socket.emit('response_admin_commit_change', { success: true, message: 'Change committed', details: commitResult });
            try {
                socket.broadcast.emit('faculty_change_committed', { id, admin_id: session.userId, result: commitResult });
            } catch (e) {}
        } catch (err) {
            console.error('[socket admin_commit_change] error', err);
            socket.emit('response_admin_commit_change', { success: false, message: err.message || 'Commit failed' });
        }
    });

    socket.on('request_admin_reject_change', async ({ token_session, change_id, comment }) => {
        const id = parseInt(change_id, 10);
        if (!id) return socket.emit('response_admin_reject_change', { success: false, message: 'Invalid change id' });

        try {
            const session = await getSession(token_session);
            const isAdmin = verifyAdmin ? await verifyAdmin(session) : false;
            if (!session || !isAdmin) return socket.emit('response_admin_reject_change', { success: false, message: 'Admin only' });

            const [result] = await db.query(
                `UPDATE faculty_pending_changes
                 SET status = 'rejected', admin_reviewer_id = ?, admin_review_date = NOW(), admin_review_comment = ?
                 WHERE id = ? AND status = 'pending_admin'`,
                [session.userId, comment || null, id]
            );
            if (result.affectedRows === 0) return socket.emit('response_admin_reject_change', { success: false, message: 'Change not found or already processed' });

            socket.emit('response_admin_reject_change', { success: true, message: 'Change rejected' });
            try {
                socket.broadcast.emit('faculty_change_rejected_admin', { id, admin_id: session.userId });
            } catch (e) {}
        } catch (err) {
            console.error('[socket admin_reject_change] error', err);
            socket.emit('response_admin_reject_change', { success: false, message: 'Reject failed' });
        }
    });

    // === USERS CRUD ===
    socket.on('request_get_faculty_users', async ({ token_session }) => {
        try {
            const session = await getSession(token_session);
            if (!session) return socket.emit('response_get_faculty_users', { success: false, message: 'Invalid session' });
            // Allow either the dedicated faculty users permission or the
            // more general users.view / users.manage permissions to
            // satisfy this check. This keeps existing role setups
            // working while honoring the newer normalized names.
            const allowedFacultyUsers = await ensurePermission(session.userId, 'faculty.view_users');
            const allowedUsersView = await ensurePermission(session.userId, 'users.view');
            const allowedUsersManage = await ensurePermission(session.userId, 'users.manage');
            // Diagnostic log: who requested users and which permission probes passed
            console.log(`[faculty:get_users] request by user=${session.userId} faculty.view_users=${allowedFacultyUsers} users.view=${allowedUsersView} users.manage=${allowedUsersManage}`);
            if (!allowedFacultyUsers && !allowedUsersView && !allowedUsersManage) {
                console.warn(`[faculty:get_users] forbidden for user=${session.userId}`);
                return socket.emit('response_get_faculty_users', { success: false, message: 'Forbidden' });
            }

            const [rows] = await db.query(
                `SELECT 
                    u.user_id,
                    u.username,
                    u.email,
                    u.created_at,
                    SUBSTRING_INDEX(GROUP_CONCAT(DISTINCT r.role_name ORDER BY r.role_name ASC), ',', 1) AS role
                 FROM users u
                 LEFT JOIN user_roles ur ON u.user_id = ur.user_id
                 LEFT JOIN roles r ON ur.role_id = r.role_id
                 GROUP BY u.user_id
                 ORDER BY u.created_at DESC`
            );

            console.log(`[faculty:get_users] user=${session.userId} returned ${rows.length} users`);

            socket.emit('response_get_faculty_users', { success: true, users: rows });
        } catch (err) {
            console.error('[socket get_faculty_users] error', err);
            socket.emit('response_get_faculty_users', { success: false, message: 'Failed to load users', users: [] });
        }
    });

    socket.on('request_view_faculty_user', async ({ token_session, user_id }) => {
        try {
            const session = await getSession(token_session);
            if (!session) return socket.emit('response_view_faculty_user', { success: false, message: 'Invalid session' });
            // Allow either manage, global view, or the faculty-specific
            // faculty.view_users permission to inspect user details. This
            // keeps the faculty dashboard consistent with the users list
            // endpoint which already honors faculty.view_users.
            const canManage = await ensurePermission(session.userId, 'users.manage');
            const canView = await ensurePermission(session.userId, 'users.view');
            const canFacultyView = await ensurePermission(session.userId, 'faculty.view_users');
            if (!canManage && !canView && !canFacultyView) {
                return socket.emit('response_view_faculty_user', { success: false, message: 'Forbidden' });
            }

            const [rows] = await db.query(
                `SELECT u.user_id, u.username, u.email, u.created_at
                 FROM users u
                 WHERE u.user_id = ? LIMIT 1`,
                [user_id]
            );
            if (rows.length === 0) return socket.emit('response_view_faculty_user', { success: false, message: 'User not found' });

            socket.emit('response_view_faculty_user', { success: true, user: rows[0] });
        } catch (err) {
            console.error('[socket view_faculty_user] error', err);
            socket.emit('response_view_faculty_user', { success: false, message: 'Failed to load user' });
        }
    });

    // === PROBLEMS CRUD ===
    socket.on('request_get_faculty_problems', async ({ token_session }) => {
        try {
            const session = await getSession(token_session);
            if (!session) return socket.emit('response_get_faculty_problems', { success: false, message: 'Invalid session' });

            const [rows] = await db.query(
                `SELECT 
                    p.problem_id,
                    p.problem_name,
                    p.difficulty,
                    p.time_limit_seconds,
                    p.memory_limit_mb,
                    p.description,
                    p.sample_solution,
                    a.status,
                    a.requested_by,
                    a.approved_by,
                    a.approval_id,
                    ci.content_item_id,
                    (a.requested_by = ?) AS is_mine
                 FROM problems p
                 LEFT JOIN content_problems cp ON p.problem_id = cp.problem_id
                 LEFT JOIN content_items ci ON cp.content_item_id = ci.content_item_id
                 LEFT JOIN approvals a ON a.content_item_id = ci.content_item_id
                 WHERE ci.content_item_id IS NOT NULL
                   AND (
                        a.approval_id IS NULL
                        OR a.approval_id = (
                            SELECT MAX(a2.approval_id)
                            FROM approvals a2
                            WHERE a2.content_item_id = ci.content_item_id
                        )
                   )
                 ORDER BY p.problem_id DESC`,
                [session.userId]
            );

            // attach topics and test cases
            const ids = rows.map(r => r.problem_id);
            let testCasesByProblem = new Map();
            let topicsByProblem = new Map();
            if (ids.length) {
                const [tcs] = await db.query(
                    `SELECT problem_id, test_case_number, is_sample, input_data, expected_output, score
                     FROM test_cases WHERE problem_id IN (?) ORDER BY test_case_number ASC`, [ids]
                );
                tcs.forEach(tc => {
                    if (!testCasesByProblem.has(tc.problem_id)) testCasesByProblem.set(tc.problem_id, []);
                    testCasesByProblem.get(tc.problem_id).push({
                        TestCaseNumber: tc.test_case_number,
                        IsSample: !!tc.is_sample,
                        InputData: tc.input_data,
                        ExpectedOutput: tc.expected_output,
                        Score: tc.score
                    });
                });

                const [topics] = await db.query(
                    `SELECT pht.problem_id, pt.topic_id, pt.topic_name
                     FROM problems_have_topics pht
                     JOIN problem_topics pt ON pht.topic_id = pt.topic_id
                     WHERE pht.problem_id IN (?)`, [ids]
                );
                topics.forEach(t => {
                    if (!topicsByProblem.has(t.problem_id)) topicsByProblem.set(t.problem_id, []);
                    topicsByProblem.get(t.problem_id).push({ TopicID: t.topic_id, TopicName: t.topic_name });
                });
            }

            const enriched = rows.map(r => ({
                ...r,
                topics: topicsByProblem.get(r.problem_id) || [],
                test_cases: testCasesByProblem.get(r.problem_id) || []
            }));

                        // Include current user's pending problem changes (not yet in problems table).
                        // Only show items that are still in faculty review. Once a change has been
                        // forwarded to the admin pipeline (status = 'pending_admin'), it should no
                        // longer appear in the faculty "pending" views to avoid duplicates when the
                        // corresponding base record is also pending in the admin approvals table.
                        const [pending] = await db.query(
                                `SELECT * FROM faculty_pending_changes
                                 WHERE faculty_id = ?
                                     AND change_type = 'problem'
                                     AND status = 'pending_faculty_review'
                                 ORDER BY created_at DESC`,
                                [session.userId]
                        );

            // If the viewer can manage approvals for problems, also include
            // pending problems from other faculty.
            let otherPending = [];
            try {
                const canManage =
                    await ensurePermission(session.userId, 'approvals.manage') ||
                    await ensurePermission(session.userId, 'roles.manage');
                if (canManage) {
                    const [rowsOther] = await db.query(
                        `SELECT * FROM faculty_pending_changes
                         WHERE faculty_id != ? AND change_type = 'problem' AND status = 'pending_faculty_review'
                         ORDER BY created_at DESC`,
                        [session.userId]
                    );
                    otherPending = rowsOther || [];
                }
            } catch (e) { otherPending = [] }

            // Prefetch topic names for any numeric topic IDs referenced in pending proposed_data
            const topicIdSet = new Set();
            pending.forEach(p => {
                const proposed = (typeof p.proposed_data === 'string') ? safeJsonParse(p.proposed_data) : (p.proposed_data || {});
                if (Array.isArray(proposed.topics)) {
                    proposed.topics.forEach(t => {
                        if (typeof t === 'number' && Number.isFinite(t)) topicIdSet.add(t);
                        else if (typeof t === 'string' && /^\d+$/.test(t)) topicIdSet.add(Number(t));
                    });
                }
            });

            let topicMap = {};
            if (topicIdSet.size > 0) {
                const ids = Array.from(topicIdSet);
                const [topicRows] = await db.query(`SELECT topic_id, topic_name FROM problem_topics WHERE topic_id IN (?)`, [ids]);
                topicRows.forEach(tr => { topicMap[tr.topic_id] = tr.topic_name });
            }

            const pendingMapped = pending.map((p) => {
                const proposed = (typeof p.proposed_data === 'string') ? safeJsonParse(p.proposed_data) : (p.proposed_data || {});

                // Normalize topics: convert numeric ids to { TopicID, TopicName } objects when possible
                let topicsOut = [];
                if (Array.isArray(proposed.topics)) {
                    topicsOut = proposed.topics.map(t => {
                        if (t && typeof t === 'object') return { TopicID: t.TopicID || t.topic_id, TopicName: t.TopicName || t.topic_name };
                        if (typeof t === 'number' && topicMap[t]) return { TopicID: t, TopicName: topicMap[t] };
                        if (typeof t === 'string' && /^\d+$/.test(t) && topicMap[Number(t)]) return { TopicID: Number(t), TopicName: topicMap[Number(t)] };
                        // otherwise treat as plain name string
                        return String(t || '');
                    }).filter(Boolean);
                }

                return {
                    problem_id: p.record_id || null,
                    problem_name: proposed.problem_name || '(pending problem)',
                    difficulty: proposed.difficulty || null,
                    time_limit_seconds: proposed.time_limit_seconds || null,
                    memory_limit_mb: proposed.memory_limit_mb || null,
                    description: proposed.description || null,
                    sample_solution: proposed.sample_solution || null,
                    status: 'pending',
                    requested_by: session.userId,
                    approved_by: null,
                    approval_id: null,
                    content_item_id: null,
                    is_mine: 1,
                    pending_action: p.action_type || null,
                    change_id: p.id,
                    // Include proposed topics and test cases so edit flows have full context
                    topics: topicsOut,
                    test_cases: Array.isArray(proposed.test_cases) ? proposed.test_cases : []
                };
            });

            const otherMapped = (otherPending || []).map((p) => {
                const proposed = (typeof p.proposed_data === 'string') ? safeJsonParse(p.proposed_data) : (p.proposed_data || {});
                let topicsOut = [];
                if (Array.isArray(proposed.topics)) {
                    topicsOut = proposed.topics.map(t => {
                        if (t && typeof t === 'object') return { TopicID: t.TopicID || t.topic_id, TopicName: t.TopicName || t.topic_name };
                        if (typeof t === 'number' && topicMap[t]) return { TopicID: t, TopicName: topicMap[t] };
                        if (typeof t === 'string' && /^\d+$/.test(t) && topicMap[Number(t)]) return { TopicID: Number(t), TopicName: topicMap[Number(t)] };
                        return String(t || '');
                    }).filter(Boolean);
                }
                return {
                    problem_id: p.record_id || null,
                    problem_name: proposed.problem_name || '(pending problem)',
                    difficulty: proposed.difficulty || null,
                    time_limit_seconds: proposed.time_limit_seconds || null,
                    memory_limit_mb: proposed.memory_limit_mb || null,
                    description: proposed.description || null,
                    sample_solution: proposed.sample_solution || null,
                    status: 'pending',
                    requested_by: p.faculty_id,
                    approved_by: null,
                    approval_id: null,
                    content_item_id: null,
                    is_mine: 0,
                    pending_action: p.action_type || null,
                    change_id: p.id,
                    topics: topicsOut,
                    test_cases: Array.isArray(proposed.test_cases) ? proposed.test_cases : []
                };
            });

                // If the current faculty has a pending create/update/delete for a problem, hide the
            // original committed row for that problem from their merged view.
            // This prevents duplicate rows with the same problem_id (for example one approved
            // and one "(pending problem)") from appearing in the faculty tables.
            const hiddenIds = new Set(
                pending
                    .filter(p => p.record_id && (p.action_type === 'delete' || p.action_type === 'create' || p.action_type === 'update'))
                    .map(p => p.record_id)
            );

            const enrichedFiltered = enriched.filter(r => !hiddenIds.has(r.problem_id));

            const merged = enrichedFiltered.concat(pendingMapped).concat(otherMapped);
            socket.emit('response_get_faculty_problems', { success: true, problems: merged });
        } catch (err) {
            console.error('[socket get_faculty_problems] error', err);
            socket.emit('response_get_faculty_problems', { success: false, message: 'Failed to load problems', problems: [] });
        }
    });

    socket.on('request_create_faculty_problem', async ({ token_session, problem_name, description, difficulty, time_limit_seconds, memory_limit_mb, sample_solution, test_cases, topics }) => {
        try {
            const session = await getSession(token_session);
            if (!session) return socket.emit('response_create_faculty_problem', { success: false, message: 'Invalid session' });
            const allowed = await ensurePermission(session.userId, 'problem.create');
            if (!allowed) return socket.emit('response_create_faculty_problem', { success: false, message: 'Forbidden' });

            if (!problem_name) return socket.emit('response_create_faculty_problem', { success: false, message: 'problem_name is required' });

            const body = pickAllowed({
                problem_name,
                description,
                difficulty,
                time_limit_seconds,
                memory_limit_mb,
                sample_solution
            }, TABLE_ALLOWED_FIELDS.problems || []);

            const hasAutoApprove = await ensurePermission(session.userId, 'problem.auto_approve');

            // Auto-approve: create base problem + content/approvals immediately.
            // Non-auto-approve: queue a faculty_pending_changes row so that
            // Level 1 (faculty) and Level 2 (admin Faculty Change) both run
            // before the problem is finalized.
            if (hasAutoApprove) {
                let connection = null;
                try {
                    connection = await db.getConnection();
                    await connection.beginTransaction();

                    const keys = Object.keys(body);
                    const placeholders = keys.map(() => '?').join(',');
                    const sql = `INSERT INTO problems (${keys.join(',')}) VALUES (${placeholders})`;
                    const [insertRes] = await connection.query(sql, keys.map((k) => body[k]));
                    const problemId = insertRes.insertId;

                    // Insert test cases if provided
                    if (Array.isArray(test_cases) && test_cases.length > 0) {
                        for (let i = 0; i < test_cases.length; i++) {
                            const tc = test_cases[i];
                            await connection.query(
                                `INSERT INTO test_cases (problem_id, test_case_number, is_sample, input_data, expected_output, score)
                                 VALUES (?, ?, ?, ?, ?, ?)` ,
                                [problemId, tc.TestCaseNumber || (i + 1), tc.IsSample ? 1 : 0, tc.InputData || '', tc.ExpectedOutput || '', tc.Score || 0]
                            );
                        }
                    }

                    // Insert topics if provided
                    if (Array.isArray(topics) && topics.length > 0) {
                        for (const topicItem of topics) {
                            try {
                                const tid = await resolveOrCreateTopic(connection, topicItem);
                                if (!tid) continue;
                                await connection.query(
                                    `INSERT INTO problems_have_topics (problem_id, topic_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE problem_id = problem_id`,
                                    [problemId, tid]
                                );
                            } catch (e) {
                                console.warn('Failed to associate topic', topicItem, e.message);
                            }
                        }
                    }

                    // Create content_item + mapping so the new problem appears in
                    // all problem lists and is wired to approvals.
                    const [ciRes] = await connection.query(`INSERT INTO content_items (content_type) VALUES ('problem')`);
                    const contentItemId = ciRes.insertId;
                    await connection.query(
                        'INSERT INTO content_problems (content_item_id, problem_id) VALUES (?, ?)',
                        [contentItemId, problemId]
                    );

                    // Auto-approve: mark approval as approved immediately.
                    await connection.query(
                        `INSERT INTO approvals (content_item_id, requested_by, approved_by, status, reason)
                         VALUES (?, ?, ?, 'approved', NOW(), ?)` ,
                        [contentItemId, session.userId, session.userId, 'Auto-approved by faculty']
                    );

                    await connection.commit();

                    socket.emit('response_create_faculty_problem', {
                        success: true,
                        message: 'Problem created successfully',
                        status: 'committed',
                        problem_id: problemId,
                        problem: { ...body, problem_id: problemId, test_cases, topics, is_mine: 1 }
                    });
                } catch (err) {
                    if (connection) await connection.rollback();
                    throw err;
                } finally {
                    if (connection) connection.release();
                }
            } else {
                // Non-auto-approve: queue a pending change (create) and
                // immediately materialize the base record + approvals entry
                // so that the shared Level 1 pending queues (admin +
                // faculty) can see this upload.
                const changeId = await queuePendingChange(db, {
                    facultyId: session.userId,
                    changeType: 'problem',
                    tableName: 'problems',
                    recordId: 0,
                    actionType: 'create',
                    originalData: {},
                    proposedData: { ...body, test_cases, topics }
                });

                try {
                    await syncFacultyChangeToApprovals(db, changeId);
                } catch (e) {
                    console.warn('[faculty create problem] sync to approvals failed', e && e.message);
                }

                socket.emit('response_create_faculty_problem', {
                    success: true,
                    message: 'Problem create pending faculty approval',
                    status: 'pending_faculty_review',
                    changeId,
                    problem_id: null,
                    problem: { ...body, test_cases, topics, is_mine: 1 }
                });
            }
        } catch (err) {
            console.error('[socket create_faculty_problem] error', err);
            socket.emit('response_create_faculty_problem', { success: false, message: err.message || 'Failed to create problem' });
        }
    });

    // Helper: resolve topic identifier (id or name) to numeric topic_id, creating topic row if needed
    async function resolveOrCreateTopic(connection, topic) {
        if (typeof topic === 'number' && Number.isFinite(topic)) return topic;
        if (typeof topic === 'string' && /^\d+$/.test(topic)) return Number(topic);
        const name = String(topic || '').trim();
        if (!name) return null;
        // try find existing
        const [rows] = await connection.query('SELECT topic_id FROM problem_topics WHERE topic_name = ? LIMIT 1', [name]);
        if (rows && rows.length > 0) return rows[0].topic_id;
        const [ins] = await connection.query('INSERT INTO problem_topics (topic_name) VALUES (?)', [name]);
        return ins.insertId;
    }

    socket.on('request_update_faculty_problem', async ({ token_session, problem_id, problem_name, description, difficulty, time_limit_seconds, memory_limit_mb, sample_solution, test_cases, topics }) => {
        try {
            const session = await getSession(token_session);
            if (!session) return socket.emit('response_update_faculty_problem', { success: false, message: 'Invalid session' });
            const allowed = await ensurePermission(session.userId, 'problem.create');
            if (!allowed) return socket.emit('response_update_faculty_problem', { success: false, message: 'Forbidden' });

            if (!problem_id) return socket.emit('response_update_faculty_problem', { success: false, message: 'Invalid problem id' });

            const [rows] = await db.query('SELECT * FROM problems WHERE problem_id = ? LIMIT 1', [problem_id]);
            if (!rows.length) return socket.emit('response_update_faculty_problem', { success: false, message: 'Problem not found' });
            const existing = rows[0];

            const body = pickAllowed({
                problem_name,
                description,
                difficulty,
                time_limit_seconds,
                memory_limit_mb,
                sample_solution
            }, TABLE_ALLOWED_FIELDS.problems || []);

            if (!Object.keys(body).length) return socket.emit('response_update_faculty_problem', { success: false, message: 'No fields to update' });

            const hasAutoApprove = await ensurePermission(session.userId, 'problem.auto_approve');

            if (hasAutoApprove) {
                // Direct commit
                let connection = null;
                try {
                    connection = await db.getConnection();
                    await connection.beginTransaction();

                    const keys = Object.keys(body);
                    const assignments = keys.map((k) => `${k} = ?`).join(', ');
                    await connection.query(`UPDATE problems SET ${assignments} WHERE problem_id = ?`, [...keys.map((k) => body[k]), problem_id]);

                    // Replace test cases if provided
                    if (Array.isArray(test_cases)) {
                        await connection.query('DELETE FROM test_cases WHERE problem_id = ?', [problem_id]);
                        for (let i = 0; i < test_cases.length; i++) {
                            const tc = test_cases[i];
                            await connection.query(
                                `INSERT INTO test_cases (problem_id, test_case_number, is_sample, input_data, expected_output, score)
                                 VALUES (?, ?, ?, ?, ?, ?)`,
                                [problem_id, tc.TestCaseNumber || (i + 1), tc.IsSample ? 1 : 0, tc.InputData || '', tc.ExpectedOutput || '', tc.Score || 0]
                            );
                        }
                    }

                    // Replace topics if provided
                    if (Array.isArray(topics)) {
                        await connection.query('DELETE FROM problems_have_topics WHERE problem_id = ?', [problem_id]);
                        for (const topicItem of topics) {
                            try {
                                const tid = await resolveOrCreateTopic(connection, topicItem);
                                if (!tid) continue;
                                await connection.query('INSERT INTO problems_have_topics (problem_id, topic_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE problem_id = problem_id', [problem_id, tid]);
                            } catch (e) {
                                console.warn('Failed to associate topic', topicItem, e.message);
                            }
                        }
                    }

                    await connection.commit();

                    socket.emit('response_update_faculty_problem', {
                        success: true,
                        message: 'Problem updated successfully',
                        status: 'committed',
                        problem: { ...body, problem_id, test_cases, topics }
                    });
                } catch (err) {
                    if (connection) await connection.rollback();
                    throw err;
                } finally {
                    if (connection) connection.release();
                }
            } else {
                // Queue for approval
                const changeId = await queuePendingChange(db, {
                    facultyId: session.userId,
                    changeType: 'problem',
                    tableName: 'problems',
                    recordId: problem_id,
                    actionType: 'update',
                    originalData: existing,
                    proposedData: { ...body, test_cases, topics }
                });

                socket.emit('response_update_faculty_problem', {
                    success: true,
                    message: 'Problem update pending approval',
                    status: 'pending_faculty_review',
                    changeId,
                    problem: { ...body, problem_id, test_cases, topics }
                });
            }
        } catch (err) {
            console.error('[socket update_faculty_problem] error', err);
            socket.emit('response_update_faculty_problem', { success: false, message: err.message || 'Failed to update problem' });
        }
    });

    socket.on('request_delete_faculty_problem', async ({ token_session, problem_id }) => {
        try {
            const session = await getSession(token_session);
            if (!session) return socket.emit('response_delete_faculty_problem', { success: false, message: 'Invalid session' });
            const allowed = await ensurePermission(session.userId, 'problem.create');
            if (!allowed) return socket.emit('response_delete_faculty_problem', { success: false, message: 'Forbidden' });

            if (!problem_id) return socket.emit('response_delete_faculty_problem', { success: false, message: 'Invalid problem id' });

            const [rows] = await db.query('SELECT * FROM problems WHERE problem_id = ? LIMIT 1', [problem_id]);
            if (!rows.length) return socket.emit('response_delete_faculty_problem', { success: false, message: 'Problem not found' });
            const existing = rows[0];
            // Determine ownership via approvals/requested_by if available
            let isOwn = false;
            try {
                const [ownerRows] = await db.query(
                    `SELECT a.requested_by
                     FROM problems p
                     JOIN content_problems cp ON p.problem_id = cp.problem_id
                     JOIN content_items ci ON cp.content_item_id = ci.content_item_id
                     JOIN approvals a ON ci.content_item_id = a.content_item_id
                     WHERE p.problem_id = ?
                     ORDER BY a.approval_id DESC
                     LIMIT 1`,
                    [problem_id]
                );
                if (ownerRows && ownerRows.length && ownerRows[0].requested_by === session.userId) {
                    isOwn = true;
                }
            } catch (e) {
                // If ownership lookup fails, treat as not-owned so it goes to admin
                isOwn = false;
            }

            if (isOwn) {
                // Own problem: delete immediately using the same cascade
                // semantics as commitPendingChange.
                await commitPendingChange(db, bcrypt, {
                    table_name: 'problems',
                    action_type: 'delete',
                    record_id: problem_id,
                    original_data: JSON.stringify(existing),
                    proposed_data: '{}',
                    faculty_id: session.userId
                });

                socket.emit('response_delete_faculty_problem', {
                    success: true,
                    message: 'Problem deleted successfully',
                    status: 'committed'
                });
            } else {
                // Deleting someone else's problem: send directly to admin
                // faculty change pipeline (skip faculty.pending list).
                const changeId = await queuePendingChange(db, {
                    facultyId: session.userId,
                    changeType: 'problem',
                    tableName: 'problems',
                    recordId: problem_id,
                    actionType: 'delete',
                    originalData: existing,
                    proposedData: {},
                    status: 'pending_admin'
                });

                socket.emit('response_delete_faculty_problem', {
                    success: true,
                    message: 'Problem deletion sent to admin',
                    status: 'pending_admin',
                    changeId
                });
            }
        } catch (err) {
            console.error('[socket delete_faculty_problem] error', err);
            socket.emit('response_delete_faculty_problem', { success: false, message: err.message || 'Failed to delete problem' });
        }
    });

    // === EVENTS CRUD ===
    socket.on('request_get_faculty_events', async ({ token_session }) => {
        try {
            const session = await getSession(token_session);
            if (!session) return socket.emit('response_get_faculty_events', { success: false, message: 'Invalid session' });

            const [rows] = await db.query(
                `SELECT 
                    e.event_id,
                    e.event_name,
                    e.thumbnail_url,
                    e.host_id,
                    e.reward_points,
                    e.reward_level,
                    e.created_at,
                    e.status AS event_status,
                    es.starts_at,
                    es.ends_at,
                    a.status,
                    a.requested_by,
                    a.approved_by,
                    a.approval_id,
                    ci.content_item_id,
                    (a.requested_by = ?) AS is_mine
                 FROM events e
                 LEFT JOIN event_schedule es ON es.event_id = e.event_id
                 LEFT JOIN content_events ce ON e.event_id = ce.event_id
                 LEFT JOIN content_items ci ON ce.content_item_id = ci.content_item_id
                 LEFT JOIN approvals a ON a.content_item_id = ci.content_item_id
                  WHERE ci.content_item_id IS NOT NULL
                    AND (
                         a.approval_id IS NULL
                         OR a.approval_id = (
                             SELECT MAX(a2.approval_id)
                             FROM approvals a2
                             WHERE a2.content_item_id = ci.content_item_id
                         )
                    )
                 ORDER BY e.created_at DESC`,
                [session.userId]
            );
                        // ensure approval_id is present in rows (some DB drivers may already include it)
                        rows.forEach(r => { if (r.approval_id === undefined && r.status !== undefined && r.requested_by !== undefined) r.approval_id = r.approval_id || null });

                        // Include current user's pending event changes (not yet in events table).
                        // Only keep items under faculty review; once they are forwarded to admin
                        // (status = 'pending_admin') they should disappear from faculty pending
                        // lists to avoid duplicates with the admin approvals pipeline.
                        const [pending] = await db.query(
                                `SELECT * FROM faculty_pending_changes
                                 WHERE faculty_id = ?
                                     AND change_type = 'event'
                                     AND status = 'pending_faculty_review'
                                 ORDER BY created_at DESC`,
                                [session.userId]
                        );

            const pendingMapped = pending.map((p) => {
                const proposed = (typeof p.proposed_data === 'string') ? safeJsonParse(p.proposed_data) : (p.proposed_data || {});
                const original = (typeof p.original_data === 'string') ? safeJsonParse(p.original_data) : (p.original_data || {});
                const name = (p.action_type === 'delete') ? (original.event_name || proposed.event_name) : (proposed.event_name || original.event_name);
                return {
                    event_id: p.record_id || null,
                    event_name: name || '(pending event)',
                    thumbnail_url: proposed.thumbnail_url || original.thumbnail_url || null,
                    host_id: proposed.host_id || original.host_id || session.userId,
                    reward_points: proposed.reward_points || original.reward_points || 0,
                    reward_level: proposed.reward_level || original.reward_level || 0,
                    created_at: p.created_at,
                    event_status: proposed.status || original.status || 'pending',
                    starts_at: proposed.starts_at || original.starts_at || null,
                    ends_at: proposed.ends_at || original.ends_at || null,
                    status: 'pending',
                    requested_by: session.userId,
                    approved_by: null,
                    approval_id: null,
                    content_item_id: null,
                    is_mine: 1,
                    change_id: p.id,
                    pending_action: p.action_type || null
                };
            });

            // If approver, include pending events created by other faculty
            let otherPending = [];
            try {
                const canManage =
                    await ensurePermission(session.userId, 'approvals.manage') ||
                    await ensurePermission(session.userId, 'roles.manage');
                if (canManage) {
                    const [rowsOther] = await db.query(
                        `SELECT * FROM faculty_pending_changes
                         WHERE faculty_id != ? AND change_type = 'event' AND status = 'pending_faculty_review'
                         ORDER BY created_at DESC`,
                        [session.userId]
                    );
                    otherPending = rowsOther || [];
                }
            } catch (e) { otherPending = [] }

            const otherMapped = (otherPending || []).map((p) => {
                const proposed = (typeof p.proposed_data === 'string') ? safeJsonParse(p.proposed_data) : (p.proposed_data || {});
                const original = (typeof p.original_data === 'string') ? safeJsonParse(p.original_data) : (p.original_data || {});
                const name = (p.action_type === 'delete') ? (original.event_name || proposed.event_name) : (proposed.event_name || original.event_name);
                return {
                    event_id: p.record_id || null,
                    event_name: name || '(pending event)',
                    thumbnail_url: proposed.thumbnail_url || original.thumbnail_url || null,
                    host_id: proposed.host_id || original.host_id || null,
                    reward_points: proposed.reward_points || original.reward_points || 0,
                    reward_level: proposed.reward_level || original.reward_level || 0,
                    created_at: p.created_at,
                    event_status: proposed.status || original.status || 'pending',
                    starts_at: proposed.starts_at || original.starts_at || null,
                    ends_at: proposed.ends_at || original.ends_at || null,
                    status: 'pending',
                    requested_by: p.faculty_id,
                    approved_by: null,
                    approval_id: null,
                    content_item_id: null,
                    is_mine: 0,
                    change_id: p.id,
                    pending_action: p.action_type || null
                };
            });

                // If the current faculty has a pending create/update/delete for an event, hide the
            // original committed row for that event from their merged view to
            // prevent duplicate rows with the same event_id.
            const hiddenIds = new Set(
                pending
                    .filter(p => p.record_id && (p.action_type === 'delete' || p.action_type === 'create' || p.action_type === 'update'))
                    .map(p => p.record_id)
            );

            const rowsFiltered = rows.filter(r => !hiddenIds.has(r.event_id));

            const merged = rowsFiltered.concat(pendingMapped).concat(otherMapped);
            socket.emit('response_get_faculty_events', { success: true, events: merged });
        } catch (err) {
            console.error('[socket get_faculty_events] error', err);
            socket.emit('response_get_faculty_events', { success: false, message: 'Failed to load events', events: [] });
        }
    });

    socket.on('request_create_faculty_event', async ({ token_session, event_name, description, starts_at, ends_at, thumbnail_url, thumbnail_data, thumbnail_file_name, reward_points, reward_level }) => {
        try {
            const session = await getSession(token_session);
            if (!session) return socket.emit('response_create_faculty_event', { success: false, message: 'Invalid session' });
            const allowed = await ensurePermission(session.userId, 'event.create');
            if (!allowed) return socket.emit('response_create_faculty_event', { success: false, message: 'Forbidden' });

            if (!event_name) return socket.emit('response_create_faculty_event', { success: false, message: 'event_name is required' });

            // Process thumbnail if provided. For create there is no
            // existing row yet, so start from the provided
            // thumbnail_url (if any) and then overwrite if a new
            // file upload is supplied.
            let finalThumb = thumbnail_url || null;
            if (thumbnail_data && thumbnail_file_name) {
                try {
                    const base64Data = thumbnail_data.split(',')[1] || thumbnail_data;
                    const buffer = Buffer.from(base64Data, 'base64');
                    const safeName = `${Date.now()}_${thumbnail_file_name.replace(/[^a-zA-Z0-9_.-]/g, '') || 'event.png'}`;
                    const destDir = path.join(__dirname, '../../../../public/asset/event');
                    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
                    const destPath = path.join(destDir, safeName);
                    fs.writeFileSync(destPath, buffer);
                    finalThumb = `/asset/event/${safeName}`;
                } catch (e) {
                    console.warn('Failed to save event thumbnail', e.message);
                }
            }

            const body = pickAllowed({
                event_name,
                thumbnail_url: finalThumb,
                host_id: session.userId,
                reward_points,
                reward_level,
                status: 'active'
            }, TABLE_ALLOWED_FIELDS.events || []);

            const hasAutoApprove = await ensurePermission(session.userId, 'event.auto_approve');

            // Auto-approve: create base event + content/approvals immediately.
            // Non-auto-approve: queue a faculty_pending_changes create entry so
            // faculty Level 1 and admin Level 2 both run before finalization.
            if (hasAutoApprove) {
                let connection = null;
                try {
                    connection = await db.getConnection();
                    await connection.beginTransaction();

                    const keys = Object.keys(body);
                    const placeholders = keys.map(() => '?').join(',');
                    const sql = `INSERT INTO events (${keys.join(',')}) VALUES (${placeholders})`;
                    const [insertRes] = await connection.query(sql, keys.map((k) => body[k]));
                    const eventId = insertRes.insertId;

                    // Insert event schedule if dates provided
                    if (starts_at || ends_at) {
                        await connection.query(
                            `INSERT INTO event_schedule (event_id, starts_at, ends_at) VALUES (?, ?, ?)` ,
                            [eventId, starts_at || null, ends_at || null]
                        );
                    }

                    // Create content_item + mapping so the new event participates
                    // in the shared approvals/content pipeline.
                    const [ciRes] = await connection.query(`INSERT INTO content_items (content_type) VALUES ('event')`);
                    const contentItemId = ciRes.insertId;
                    await connection.query(
                        'INSERT INTO content_events (content_item_id, event_id) VALUES (?, ?)',
                        [contentItemId, eventId]
                    );

                    await connection.query(
                        `INSERT INTO approvals (content_item_id, requested_by, approved_by, status, reason)
                         VALUES (?, ?, ?, 'approved', NOW(), ?)` ,
                        [contentItemId, session.userId, session.userId, 'Auto-approved by faculty']
                    );

                    await connection.commit();

                    socket.emit('response_create_faculty_event', {
                        success: true,
                        message: 'Event created successfully',
                        status: 'committed',
                        event_id: eventId,
                        event: { ...body, event_id: eventId, starts_at, ends_at, is_mine: 1 }
                    });
                } catch (err) {
                    if (connection) await connection.rollback();
                    throw err;
                } finally {
                    if (connection) connection.release();
                }
            } else {
                const changeId = await queuePendingChange(db, {
                    facultyId: session.userId,
                    changeType: 'event',
                    tableName: 'events',
                    recordId: 0,
                    actionType: 'create',
                    originalData: {},
                    proposedData: { ...body, starts_at, ends_at }
                });

                try {
                    await syncFacultyChangeToApprovals(db, changeId);
                } catch (e) {
                    console.warn('[faculty create event] sync to approvals failed', e && e.message);
                }

                socket.emit('response_create_faculty_event', {
                    success: true,
                    message: 'Event create pending faculty approval',
                    status: 'pending_faculty_review',
                    changeId,
                    event_id: null,
                    event: { ...body, starts_at, ends_at, is_mine: 1 }
                });
            }
        } catch (err) {
            console.error('[socket create_faculty_event] error', err);
            socket.emit('response_create_faculty_event', { success: false, message: err.message || 'Failed to create event' });
        }
    });

    socket.on('request_update_faculty_event', async ({ token_session, event_id, event_name, description, starts_at, ends_at, thumbnail_url, reward_points, reward_level, thumbnail_data, thumbnail_file_name }) => {
        try {
            const session = await getSession(token_session);
            if (!session) return socket.emit('response_update_faculty_event', { success: false, message: 'Invalid session' });
            const allowed = await ensurePermission(session.userId, 'event.create');
            if (!allowed) return socket.emit('response_update_faculty_event', { success: false, message: 'Forbidden' });

            if (!event_id) return socket.emit('response_update_faculty_event', { success: false, message: 'Invalid event id' });

            const [rows] = await db.query('SELECT * FROM events WHERE event_id = ? LIMIT 1', [event_id]);
            if (!rows.length) return socket.emit('response_update_faculty_event', { success: false, message: 'Event not found' });
            const existing = rows[0];

            // Process thumbnail if provided. If no new thumbnail_url is
            // sent from the client and no new file is uploaded, keep
            // the existing thumbnail_url so edits do not clear it.
            let finalThumb = thumbnail_url || existing.thumbnail_url || null;
            if (thumbnail_data && thumbnail_file_name) {
                try {
                    const base64Data = thumbnail_data.split(',')[1] || thumbnail_data;
                    const buffer = Buffer.from(base64Data, 'base64');
                    const safeName = `${Date.now()}_${thumbnail_file_name.replace(/[^a-zA-Z0-9_.-]/g, '') || 'event.png'}`;
                    const destDir = path.join(__dirname, '../../../../public/asset/event');
                    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true});
                    const destPath = path.join(destDir, safeName);
                    fs.writeFileSync(destPath, buffer);
                    finalThumb = `/asset/event/${safeName}`;
                } catch (e) {
                    console.warn('Failed to save event thumbnail', e.message);
                }
            }

            const body = pickAllowed({
                event_name,
                thumbnail_url: finalThumb,
                reward_points,
                reward_level,
                status: existing.status
            }, TABLE_ALLOWED_FIELDS.events || []);

            if (!Object.keys(body).length) return socket.emit('response_update_faculty_event', { success: false, message: 'No fields to update' });

            const hasAutoApprove = await ensurePermission(session.userId, 'event.auto_approve');

            if (hasAutoApprove) {
                // Direct commit
                let connection = null;
                try {
                    connection = await db.getConnection();
                    await connection.beginTransaction();

                    const keys = Object.keys(body);
                    const assignments = keys.map((k) => `${k} = ?`).join(', ');
                    await connection.query(`UPDATE events SET ${assignments} WHERE event_id = ?`, [...keys.map((k) => body[k]), event_id]);

                    // Update event schedule if dates provided
                    if (starts_at !== undefined || ends_at !== undefined) {
                        const [schedResult] = await connection.query('SELECT schedule_id FROM event_schedule WHERE event_id = ?', [event_id]);
                        if (schedResult.length > 0) {
                            await connection.query('UPDATE event_schedule SET starts_at = ?, ends_at = ? WHERE event_id = ?', [starts_at || null, ends_at || null, event_id]);
                        } else {
                            await connection.query('INSERT INTO event_schedule (event_id, starts_at, ends_at) VALUES (?, ?, ?)', [event_id, starts_at || null, ends_at || null]);
                        }
                    }

                    await connection.commit();

                    socket.emit('response_update_faculty_event', {
                        success: true,
                        message: 'Event updated successfully',
                        status: 'committed',
                        event: { ...body, event_id, starts_at, ends_at }
                    });
                } catch (err) {
                    if (connection) await connection.rollback();
                    throw err;
                } finally {
                    if (connection) connection.release();
                }
            } else {
                // Queue for approval and ensure the shared approvals
                // pipeline can see this updated event by syncing the
                // pending change into the approvals/content tables.
                const changeId = await queuePendingChange(db, {
                    facultyId: session.userId,
                    changeType: 'event',
                    tableName: 'events',
                    recordId: event_id,
                    actionType: 'update',
                    originalData: existing,
                    proposedData: { ...body, starts_at, ends_at }
                });

                try {
                    await syncFacultyChangeToApprovals(db, changeId);
                } catch (e) {
                    console.warn('[faculty update event] sync to approvals failed', e && e.message);
                }

                socket.emit('response_update_faculty_event', {
                    success: true,
                    message: 'Event update pending approval',
                    status: 'pending_faculty_review',
                    changeId,
                    event: { ...body, event_id, starts_at, ends_at }
                });
            }
        } catch (err) {
            console.error('[socket update_faculty_event] error', err);
            socket.emit('response_update_faculty_event', { success: false, message: err.message || 'Failed to update event' });
        }
    });

    socket.on('request_delete_faculty_event', async ({ token_session, event_id }) => {
        try {
            const session = await getSession(token_session);
            if (!session) return socket.emit('response_delete_faculty_event', { success: false, message: 'Invalid session' });
            const allowed = await ensurePermission(session.userId, 'event.create');
            if (!allowed) return socket.emit('response_delete_faculty_event', { success: false, message: 'Forbidden' });
            if (!event_id) return socket.emit('response_delete_faculty_event', { success: false, message: 'Invalid event id' });

            const [rows] = await db.query('SELECT * FROM events WHERE event_id = ? LIMIT 1', [event_id]);
            if (!rows.length) return socket.emit('response_delete_faculty_event', { success: false, message: 'Event not found' });
            const existing = rows[0];

            const isOwn = existing.host_id === session.userId;

            if (isOwn) {
                // Own event: delete immediately via commitPendingChange semantics
                await commitPendingChange(db, bcrypt, {
                    table_name: 'events',
                    action_type: 'delete',
                    record_id: event_id,
                    original_data: JSON.stringify(existing),
                    proposed_data: '{}',
                    faculty_id: session.userId
                });

                await db.query(
                    `INSERT INTO audit_trail (user_id, action, timestamp)
                     VALUES (?, 'delete_event', NOW())`,
                    [session.userId]
                );

                try {
                    socket.emit('notification', {
                        type: 'delete',
                        title: 'Event Deleted',
                        message: 'Your event was deleted successfully',
                        data: { resource_type: 'event', resource_id: event_id, action_url: '#events' }
                    });
                } catch (e) { console.error('notification emit error:', e); }

                socket.emit('response_delete_faculty_event', { success: true, message: 'Event deleted successfully', status: 'committed' });
            } else {
                // Deleting someone else's event: queue directly for admin review
                const changeId = await queuePendingChange(db, {
                    facultyId: session.userId,
                    changeType: 'event',
                    tableName: 'events',
                    recordId: event_id,
                    actionType: 'delete',
                    originalData: existing,
                    proposedData: {},
                    status: 'pending_admin'
                });

                socket.emit('response_delete_faculty_event', {
                    success: true,
                    message: 'Event deletion sent to admin',
                    status: 'pending_admin',
                    changeId
                });
            }
        } catch (err) {
            console.error('[socket delete_faculty_event] error', err);
            socket.emit('response_delete_faculty_event', { success: false, message: err.message || 'Failed to delete event' });
        }
    });

    // === BLOGS CRUD ===
    socket.on('request_get_faculty_blogs', async ({ token_session }) => {
        try {
            const session = await getSession(token_session);
            if (!session) return socket.emit('response_get_faculty_blogs', { success: false, message: 'Invalid session' });

            const [rows] = await db.query(
                `SELECT 
                    b.blog_id,
                    b.title AS blog_title,
                    b.title,
                    b.content,
                    b.author_id,
                    b.thumbnail_url,
                    'blog' AS content_type,
                    b.updated_at,
                    b.created_at,
                    b.published_at,
                    a.status,
                    a.requested_by,
                    a.approved_by,
                    a.approval_id,
                    ci.content_item_id,
                    (a.requested_by = ?) AS is_mine
                 FROM blogs b
                 LEFT JOIN content_blogs cb ON b.blog_id = cb.blog_id
                 LEFT JOIN content_items ci ON cb.content_item_id = ci.content_item_id
                 LEFT JOIN approvals a ON a.content_item_id = ci.content_item_id
                 WHERE ci.content_item_id IS NOT NULL
                   AND (
                        a.approval_id IS NULL
                        OR a.approval_id = (
                            SELECT MAX(a2.approval_id)
                            FROM approvals a2
                            WHERE a2.content_item_id = ci.content_item_id
                        )
                   )
                 ORDER BY b.created_at DESC`,
                [session.userId]
            );
                        // attach approval_id placeholder if missing
                        rows.forEach(r => { if (r.approval_id === undefined && r.status !== undefined && r.requested_by !== undefined) r.approval_id = r.approval_id || null });

                        // Include current user's pending blog changes (not yet in blogs table).
                        // Only surface items that are still under faculty review. Once a change
                        // has status 'pending_admin' it is owned by the admin approvals queue
                        // and should not appear as a faculty pending row to avoid duplicates.
                        const [pending] = await db.query(
                                `SELECT * FROM faculty_pending_changes
                                 WHERE faculty_id = ?
                                     AND change_type = 'blog'
                                     AND status = 'pending_faculty_review'
                                 ORDER BY created_at DESC`,
                                [session.userId]
                        );
            const pendingMapped = pending.map((p) => {
                const proposed = (typeof p.proposed_data === 'string') ? safeJsonParse(p.proposed_data) : (p.proposed_data || {});
                const original = (typeof p.original_data === 'string') ? safeJsonParse(p.original_data) : (p.original_data || {});
                const title = (p.action_type === 'delete') ? (original.title || original.blog_title || proposed.title) : (proposed.title || proposed.blog_title || original.title || original.blog_title);
                return {
                    blog_id: p.record_id || null,
                    title: title || '(pending blog)',
                    blog_title: title || '(pending blog)',
                    content: proposed.content || original.content || null,
                    author_id: proposed.author_id || original.author_id || session.userId,
                    thumbnail_url: proposed.thumbnail_url || original.thumbnail_url || null,
                    content_type: proposed.content_type || original.content_type || null,
                    updated_at: p.updated_at || p.created_at,
                    created_at: p.created_at,
                    published_at: null,
                    status: 'pending',
                    requested_by: session.userId,
                    approved_by: null,
                    approval_id: null,
                    content_item_id: null,
                    is_mine: 1,
                    change_id: p.id,
                    pending_action: p.action_type || null
                };
            });

            // If approver, include pending blogs created by other faculty
            let otherPendingBlogs = [];
            try {
                const canManageBlogs =
                    await ensurePermission(session.userId, 'approvals.manage') ||
                    await ensurePermission(session.userId, 'roles.manage');
                if (canManageBlogs) {
                    const [rowsOtherBlogs] = await db.query(
                        `SELECT * FROM faculty_pending_changes
                         WHERE faculty_id != ? AND change_type = 'blog' AND status = 'pending_faculty_review'
                         ORDER BY created_at DESC`,
                        [session.userId]
                    );
                    otherPendingBlogs = rowsOtherBlogs || [];
                }
            } catch (e) { otherPendingBlogs = [] }

            const otherBlogsMapped = (otherPendingBlogs || []).map((p) => {
                const proposed = (typeof p.proposed_data === 'string') ? safeJsonParse(p.proposed_data) : (p.proposed_data || {});
                const original = (typeof p.original_data === 'string') ? safeJsonParse(p.original_data) : (p.original_data || {});
                const title = (p.action_type === 'delete')
                    ? (original.title || original.blog_title || proposed.title)
                    : (proposed.title || proposed.blog_title || original.title || original.blog_title);

                return {
                    blog_id: p.record_id || null,
                    // Keep both title and blog_title so UI helpers that
                    // look at either field (or proposed_data) can display
                    // a meaningful value instead of "Untitled Blog".
                    title: title || '(pending blog)',
                    blog_title: title || '(pending blog)',
                    content: proposed.content || original.content || null,
                    author_id: proposed.author_id || original.author_id || p.faculty_id,
                    content_type: proposed.content_type || original.content_type || null,
                    blog_subtitle: proposed.blog_subtitle || original.blog_subtitle || null,
                    thumbnail_url: proposed.thumbnail_url || original.thumbnail_url || null,
                    created_at: p.created_at,
                    status: 'pending',
                    requested_by: p.faculty_id,
                    is_mine: 0,
                    change_id: p.id,
                    pending_action: p.action_type || null
                };
            });

                // If the current faculty has a pending create/update/delete for a blog, hide the
            // original committed row for that blog from their merged view to
            // prevent duplicate rows with the same blog_id.
            const hiddenIds = new Set(
                pending
                    .filter(p => p.record_id && (p.action_type === 'delete' || p.action_type === 'create' || p.action_type === 'update'))
                    .map(p => p.record_id)
            );

            const rowsFiltered = rows.filter(r => !hiddenIds.has(r.blog_id));

            const merged = rowsFiltered.concat(pendingMapped).concat(otherBlogsMapped);
            socket.emit('response_get_faculty_blogs', { success: true, blogs: merged });
        } catch (err) {
            console.error('[socket get_faculty_blogs] error', err);
            socket.emit('response_get_faculty_blogs', { success: false, message: 'Failed to load blogs', blogs: [] });
        }
    });

    socket.on('request_create_faculty_blog', async ({ token_session, blog_title, blog_content, thumbnail_url, content_type, thumbnail_data, thumbnail_file_name }) => {
        try {
            const session = await getSession(token_session);
            if (!session) return socket.emit('response_create_faculty_blog', { success: false, message: 'Invalid session' });
            const allowed = await ensurePermission(session.userId, 'blog.create');
            if (!allowed) return socket.emit('response_create_faculty_blog', { success: false, message: 'Forbidden' });

            if (!blog_title) return socket.emit('response_create_faculty_blog', { success: false, message: 'blog_title is required' });

            // Process thumbnail if provided
            let finalThumb = thumbnail_url || null;
            if (thumbnail_data && thumbnail_file_name) {
                try {
                    const base64Data = thumbnail_data.split(',')[1] || thumbnail_data;
                    const buffer = Buffer.from(base64Data, 'base64');
                    const safeName = `${Date.now()}_${thumbnail_file_name.replace(/[^a-zA-Z0-9_.-]/g, '') || 'blog.png'}`;
                    const destDir = path.join(__dirname, '../../../../public/asset/blog');
                    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
                    const destPath = path.join(destDir, safeName);
                    fs.writeFileSync(destPath, buffer);
                    finalThumb = `/asset/blog/${safeName}`;
                } catch (e) {
                    console.warn('Failed to save blog thumbnail', e.message);
                }
            }

            const body = pickAllowed({
                title: blog_title,
                content: blog_content,
                thumbnail_url: finalThumb,
                content_type,
                author_id: session.userId,
                status: 'draft'
            }, TABLE_ALLOWED_FIELDS.blogs || []);

            const hasAutoApprove = await ensurePermission(session.userId, 'blog.auto_approve');

            // Auto-approve: create base blog + content/approvals immediately.
            // Non-auto-approve: queue a faculty_pending_changes create entry so
            // faculty Level 1 and admin Level 2 both run before finalization.
            if (hasAutoApprove) {
                const keys = Object.keys(body);
                const placeholders = keys.map(() => '?').join(',');
                const sql = `INSERT INTO blogs (${keys.join(',')}) VALUES (${placeholders})`;
                const [insertRes] = await db.query(sql, keys.map((k) => body[k]));

                const blogId = insertRes.insertId;

                // Create content_item + mapping so the new blog participates in
                // the shared approvals/content pipeline.
                const [ciRes] = await db.query(`INSERT INTO content_items (content_type) VALUES ('blog')`);
                const contentItemId = ciRes.insertId;
                await db.query(
                    'INSERT INTO content_blogs (content_item_id, blog_id) VALUES (?, ?)',
                    [contentItemId, blogId]
                );

                await db.query(
                    `INSERT INTO approvals (content_item_id, requested_by, approved_by, status, reason)
                     VALUES (?, ?, ?, 'approved', NOW(), ?)` ,
                    [contentItemId, session.userId, session.userId, 'Auto-approved by faculty']
                );

                socket.emit('response_create_faculty_blog', {
                    success: true,
                    message: 'Blog created successfully',
                    status: 'committed',
                    blog_id: blogId,
                    blog: { ...body, blog_id: blogId, is_mine: 1 }
                });
            } else {
                const changeId = await queuePendingChange(db, {
                    facultyId: session.userId,
                    changeType: 'blog',
                    tableName: 'blogs',
                    recordId: 0,
                    actionType: 'create',
                    originalData: {},
                    proposedData: body
                });

                try {
                    await syncFacultyChangeToApprovals(db, changeId);
                } catch (e) {
                    console.warn('[faculty create blog] sync to approvals failed', e && e.message);
                }

                socket.emit('response_create_faculty_blog', {
                    success: true,
                    message: 'Blog create pending faculty approval',
                    status: 'pending_faculty_review',
                    changeId,
                    blog_id: null,
                    blog: { ...body, is_mine: 1 }
                });
            }
        } catch (err) {
            console.error('[socket create_faculty_blog] error', err);
            socket.emit('response_create_faculty_blog', { success: false, message: err.message || 'Failed to create blog' });
        }
    });

    socket.on('request_update_faculty_blog', async ({ token_session, blog_id, blog_title, blog_content, thumbnail_url, content_type, thumbnail_data, thumbnail_file_name }) => {
        try {
            const session = await getSession(token_session);
            if (!session) return socket.emit('response_update_faculty_blog', { success: false, message: 'Invalid session' });
            const allowed = await ensurePermission(session.userId, 'blog.create');
            if (!allowed) return socket.emit('response_update_faculty_blog', { success: false, message: 'Forbidden' });

            if (!blog_id) return socket.emit('response_update_faculty_blog', { success: false, message: 'Invalid blog id' });

            const [rows] = await db.query('SELECT * FROM blogs WHERE blog_id = ? LIMIT 1', [blog_id]);
            if (!rows.length) return socket.emit('response_update_faculty_blog', { success: false, message: 'Blog not found' });
            const existing = rows[0];

            // Process thumbnail if provided
            let finalThumb = thumbnail_url || null;
            if (thumbnail_data && thumbnail_file_name) {
                try {
                    const base64Data = thumbnail_data.split(',')[1] || thumbnail_data;
                    const buffer = Buffer.from(base64Data, 'base64');
                    const safeName = `${Date.now()}_${thumbnail_file_name.replace(/[^a-zA-Z0-9_.-]/g, '') || 'blog.png'}`;
                    const destDir = path.join(__dirname, '../../../../public/asset/blog');
                    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
                    const destPath = path.join(destDir, safeName);
                    fs.writeFileSync(destPath, buffer);
                    finalThumb = `/asset/blog/${safeName}`;
                } catch (e) {
                    console.warn('Failed to save blog thumbnail', e.message);
                }
            }

            const body = pickAllowed({
                title: blog_title,
                content: blog_content,
                thumbnail_url: finalThumb,
                content_type,
                status: existing.status
            }, TABLE_ALLOWED_FIELDS.blogs || []);

            if (!Object.keys(body).length) return socket.emit('response_update_faculty_blog', { success: false, message: 'No fields to update' });

            const hasAutoApprove = await ensurePermission(session.userId, 'blog.auto_approve');

            if (hasAutoApprove) {
                // Direct commit
                const keys = Object.keys(body);
                const assignments = keys.map((k) => `${k} = ?`).join(', ');
                await db.query(`UPDATE blogs SET ${assignments} WHERE blog_id = ?`, [...keys.map((k) => body[k]), blog_id]);

                socket.emit('response_update_faculty_blog', {
                    success: true,
                    message: 'Blog updated successfully',
                    status: 'committed',
                    blog: { ...body, blog_id }
                });
            } else {
                // Queue for approval and sync into shared approvals so
                // that admin pending approvals can also see updated
                // blogs awaiting review.
                const changeId = await queuePendingChange(db, {
                    facultyId: session.userId,
                    changeType: 'blog',
                    tableName: 'blogs',
                    recordId: blog_id,
                    actionType: 'update',
                    originalData: existing,
                    proposedData: body
                });

                try {
                    await syncFacultyChangeToApprovals(db, changeId);
                } catch (e) {
                    console.warn('[faculty update blog] sync to approvals failed', e && e.message);
                }

                socket.emit('response_update_faculty_blog', {
                    success: true,
                    message: 'Blog update pending approval',
                    status: 'pending_faculty_review',
                    changeId,
                    blog: { ...body, blog_id }
                });
            }
        } catch (err) {
            console.error('[socket update_faculty_blog] error', err);
            socket.emit('response_update_faculty_blog', { success: false, message: err.message || 'Failed to update blog' });
        }
    });

    socket.on('request_delete_faculty_blog', async ({ token_session, blog_id }) => {
        try {
            const session = await getSession(token_session);
            if (!session) return socket.emit('response_delete_faculty_blog', { success: false, message: 'Invalid session' });
            const allowed = await ensurePermission(session.userId, 'blog.create');
            if (!allowed) return socket.emit('response_delete_faculty_blog', { success: false, message: 'Forbidden' });

            if (!blog_id) return socket.emit('response_delete_faculty_blog', { success: false, message: 'Invalid blog id' });

            const [rows] = await db.query('SELECT * FROM blogs WHERE blog_id = ? LIMIT 1', [blog_id]);
            if (!rows.length) return socket.emit('response_delete_faculty_blog', { success: false, message: 'Blog not found' });
            const existing = rows[0];
            const isOwn = existing.author_id === session.userId;

            if (isOwn) {
                // Own blog: delete immediately via commitPendingChange semantics
                await commitPendingChange(db, bcrypt, {
                    table_name: 'blogs',
                    action_type: 'delete',
                    record_id: blog_id,
                    original_data: JSON.stringify(existing),
                    proposed_data: '{}',
                    faculty_id: session.userId
                });

                socket.emit('response_delete_faculty_blog', {
                    success: true,
                    message: 'Blog deleted successfully',
                    status: 'committed'
                });
            } else {
                // Deleting someone else's blog: queue directly for admin review
                const changeId = await queuePendingChange(db, {
                    facultyId: session.userId,
                    changeType: 'blog',
                    tableName: 'blogs',
                    recordId: blog_id,
                    actionType: 'delete',
                    originalData: existing,
                    proposedData: {},
                    status: 'pending_admin'
                });

                socket.emit('response_delete_faculty_blog', {
                    success: true,
                    message: 'Blog deletion sent to admin',
                    status: 'pending_admin',
                    changeId
                });
            }
        } catch (err) {
            console.error('[socket delete_faculty_blog] error', err);
            socket.emit('response_delete_faculty_blog', { success: false, message: err.message || 'Failed to delete blog' });
        }
    });
}

module.exports = registerFacultySocketHandlers;
