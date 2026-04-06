// === for dashboard admin and user ===
const fs = require('fs');
const path = require('path');

function dashboardAdminAndUserSocket(socket, db, bcrypt, jwt, io, activeSessions, auth) {
    if (!auth) try { auth = require('../../../utils/authHelpers.js'); } catch(e) {}

    // helper: verify token (checks JWT signature and active session in DB)
    async function verifySession(token) {
        return auth.verifySession(db, token, process.env.JWT_SECRET);
    }
    // helper: verify admin role
    async function verifyAdmin(session) {
        const userId = session?.userId || session?.user_id || session;
        return auth.verifyAdmin(db, userId);
    }

    // helper: check if user has a specific permission (role-based or user override)
    async function hasPermission(userId, permissionName) {
        return auth.hasPermission(db, userId, normalizePermissionName(permissionName));
    }

    // helper: map legacy permission names to normalized permission names
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
        if (map[n]) return map[n];
        return n;
    }

    // === CREATE-PROBLEM-FLOW: fetch primary role for current user
    async function getUserPrimaryRole(userId) {
        return auth.getUserPrimaryRole(db, userId);
    }

    // NOTE: registration of admin/user and modal socket modules is performed in server.js

    // User socket handlers moved to 'js/conn/socket/dashboard-user-socket.js'

    // Admin-only socket handlers moved to 'js/conn/socket/dashboard-admin-socket.js'

    // === request filter questions for search panel in content_question_set.vue
    // Access: socket, db, bcrypt, jwt (all passed as parameters)
    socket.on('request_filter_questions', async (payload) => {

        const { token_session, tableType, search, sortOrder, difficulty, topicIds } = payload;

        try {
            // 1. Verify session
            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
                // using socket.user for filter questions request
            } else {
                // falling back to token_session for filter questions request
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_filter_questions', {
                    success: false,
                    message: 'Invalid session',
                    questions: []
                });
                return;
            }

            // 2. Access control by tableType
            if (tableType === 'admin') {
                const isAdmin = await verifyAdmin(session);
                if (!isAdmin) {
                    socket.emit('response_filter_questions', {
                        success: false,
                        message: 'Unauthorized: Admin access required',
                        questions: []
                    });
                    return;
                }
            } else if (tableType === 'pending') {
                // Allow faculty/users with explicit approve permission to view pending
                const canViewPending = await hasPermission(session.userId, 'problem.approvals.manage');
                if (!canViewPending) {
                    socket.emit('response_filter_questions', {
                        success: false,
                        message: 'Unauthorized: You do not have permission to view pending problems',
                        questions: []
                    });
                    return;
                }
            }

            // 3. Build SQL query based on tableType - MUST match the structure of get_admin_questions/get_user_questions/get_pending_questions
            let query = `
                SELECT DISTINCT
                    p.problem_id,
                    p.problem_name,
                    p.difficulty,
                    ci.content_item_id,
                    ci.created_at,
                    a.status,
                    u.user_id as creator_id,
                    r.role_name,
                    COALESCE(prof.full_name, u.username) as creator_name
            `;
            
            // Add approval_id for pending questions
            if (tableType === 'pending') {
                query += `, a.approval_id`;
            }

            query += `
                FROM problems p
                LEFT JOIN problems_have_topics pht ON p.problem_id = pht.problem_id
                JOIN content_problems cp ON p.problem_id = cp.problem_id
                JOIN content_items ci ON cp.content_item_id = ci.content_item_id
                JOIN approvals a ON ci.content_item_id = a.content_item_id
                JOIN users u ON a.requested_by = u.user_id
                LEFT JOIN user_roles ur ON u.user_id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.role_id
                LEFT JOIN profiles prof ON u.user_id = prof.user_id
                WHERE ci.content_type = 'problem'
            `;

            const params = [];

            // 4. Filter by table type (admin/user/pending)
            if (tableType === 'admin') {
                // Admin-created problems (approved, by admin/faculty)
                query += ` AND a.status = 'approved' AND r.role_name IN ('admin', 'faculty')`;
            } else if (tableType === 'user') {
                // User-submitted problems (approved, by regular users)
                query += ` AND a.status = 'approved' AND (r.role_name IS NULL OR r.role_name = 'user')`;
            } else if (tableType === 'pending') {
                // Pending approval problems
                query += ` AND a.status = 'pending'`;
            }

            // 5. Filter by search (problem name)
            if (search && search.trim()) {
                query += ` AND p.problem_name LIKE ?`;
                params.push(`%${search}%`);
            }

            // 6. Filter by difficulty
            if (difficulty && difficulty.trim()) {
                query += ` AND p.difficulty = ?`;
                params.push(difficulty);
            }

            // 7. Filter by topics (if selected)
            if (topicIds && topicIds.length > 0) {
                const placeholders = topicIds.map(() => '?').join(',');
                query += ` AND pht.topic_id IN (${placeholders})`;
                params.push(...topicIds);
            }

            // 8. Sort by problem name
            if (sortOrder === 'desc') {
                query += ` ORDER BY p.problem_name DESC`;
            } else {
                query += ` ORDER BY p.problem_name ASC`;
            }

            // 9. Execute query
            const [rows] = await db.query(query, params);

            // 10. Attach topic names for each problem (so client can render pills)
            const questionList = [];
            const problemIds = rows.map(r => r.problem_id).filter(Boolean);
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
                    // ignore topic map fetch errors to avoid breaking filter response
                }
            }

            for (const q of rows) {
                const formatted = {
                    QuestionID: q.problem_id,
                    QuestionName: q.problem_name,
                    QuestionDifficulty: q.difficulty,
                    QuestionLink: `/problem/${q.problem_id}`,
                    CreatedAt: q.created_at,
                    CreatorName: q.creator_name,
                    Status: q.status || null,
                    // provide TopicsText for client normalization and Topics as array
                    TopicsText: (topicMap[q.problem_id] && topicMap[q.problem_id].length) ? topicMap[q.problem_id].join(',') : (q.TopicsText || ''),
                    Topics: (topicMap[q.problem_id] && topicMap[q.problem_id].length) ? topicMap[q.problem_id].map(name => ({ TopicName: name })) : []
                };

                if (tableType === 'pending') {
                    formatted.ApprovalID = q.approval_id;
                    formatted.CreatorRole = q.role_name ? (q.role_name.charAt(0).toUpperCase() + q.role_name.slice(1)) : 'User';
                }

                questionList.push(formatted);
            }

            // Attach LastRun/TestSummary for each problem where possible
            for (const item of questionList) {
                try {
                    const pid = item.QuestionID
                    // fetch test cases to compute totals
                    const [tcRows] = await db.query(
                        `SELECT score, input_data, expected_output FROM test_cases WHERE problem_id = ?`,
                        [pid]
                    )
                    // Count only complete test cases (both input and expected output present)
                    const completeRows = tcRows.filter(r => (r.input_data || '').toString().trim() && (r.expected_output || '').toString().trim());
                    const totalTests = completeRows.length;
                    const maxScore = completeRows.reduce((s, r) => s + (Number.isFinite(r.score) ? r.score : 0), 0);

                    // Fetch last-run data from problem_test_runs
                    let last = null;
                    try {
                        const [subs] = await db.query(
                            `SELECT test_run_id AS submission_id, user_id, passed, total, verdict, result, score, submitted_at FROM problem_test_runs WHERE problem_id = ? ORDER BY submitted_at DESC LIMIT 1`,
                            [pid]
                        );
                        last = (subs && subs.length) ? subs[0] : null;
                    } catch (e) {
                        // ignore and fallback to null
                    }

                    // Compute test summary based on complete test cases; default to 0/total when no submissions
                    let passed = 0;
                    if (last) {
                        const lastScoreNum = Number(last.score);
                        if (!Number.isNaN(lastScoreNum) && totalTests > 0) {
                            // If the recorded score already looks like a passed-count (<= totalTests), trust it.
                            if (lastScoreNum <= totalTests) {
                                passed = Math.max(0, Math.min(totalTests, Math.round(lastScoreNum)));
                            } else if (maxScore > 0) {
                                // Otherwise fall back to scaling by average test weight (legacy behavior)
                                const avg = maxScore / totalTests;
                                if (avg > 0) passed = Math.min(totalTests, Math.round(lastScoreNum / avg));
                            }
                        } else if ((last.result || '').toString() === 'passed') {
                            passed = totalTests;
                        }
                    }
                    item.LastRun = last || null;
                    item.TestSummary = { passed, total: totalTests };
                } catch (e) {
                    // ignore per-item errors
                }
            }

            socket.emit('response_filter_questions', {
                success: true,
                questions: questionList,
                message: `Found ${questionList.length} problems matching filters`
            });

            // Questions filtered for tableType: resultCount = questionList.length

        } catch (error) {
            console.error('[Filter] Error filtering questions:', error);
            socket.emit('response_filter_questions', {
                success: false,
                message: 'Server error: Failed to filter questions',
                questions: [],
                error: error.message
            });
        }
    });



    // request_get_problem_details moved to create_question_modal_socket.js

    // request_create_problem moved to create_question_modal_socket.js

    // request_save_draft moved to create_question_modal_socket.js

    // === GET MY QUESTIONS: Fetch all questions created by current user (all statuses) ===
    // Returns questions grouped by status: approved, pending, denied, draft
    socket.on('request_get_my_questions', async ({ token_session }) => {
        // Get my questions request received

        let session = null;
        if (socket.user && socket.user.userId) {
            session = { userId: socket.user.userId, decoded: socket.user.decoded };
        } else {
            session = await verifySession(token_session);
        }

        if (!session) {
            console.error('Get my questions failed: invalid session');
            socket.emit('response_get_my_questions', { success: false, message: 'Invalid session' });
            return;
        }

        try {
            // Fetch all questions created by this user with approval status and topics
            const [questions] = await db.query(
                `SELECT 
                    p.problem_id,
                    p.problem_name,
                    p.difficulty,
                    ci.created_at,
                    a.status,
                    a.reason
                FROM problems p
                JOIN content_problems cp ON p.problem_id = cp.problem_id
                JOIN content_items ci ON cp.content_item_id = ci.content_item_id
                JOIN approvals a ON ci.content_item_id = a.content_item_id
                WHERE a.requested_by = ?
                  AND ci.content_type = 'problem'
                ORDER BY ci.created_at DESC`,
                [session.userId]
            );

            // Fetch topics for each question
            const questionList = await Promise.all(questions.map(async (q) => {
                const [topics] = await db.query(
                    `SELECT pt.topic_id, pt.topic_name
                     FROM problem_topics pt
                     JOIN problems_have_topics pht ON pt.topic_id = pht.topic_id
                     WHERE pht.problem_id = ?`,
                    [q.problem_id]
                );

                return {
                    QuestionID: q.problem_id,
                    QuestionName: q.problem_name,
                    QuestionDifficulty: q.difficulty,
                    CreatedAt: q.created_at,
                    Status: q.status,
                    Reason: q.reason,
                    Topics: topics.map(t => ({ TopicID: t.topic_id, TopicName: t.topic_name }))
                };
            }));

            // Enrich with LastRun/TestSummary per question
            for (const item of questionList) {
                try {
                    const pid = item.QuestionID
                    const [tcRows] = await db.query(
                        `SELECT score, input_data, expected_output FROM test_cases WHERE problem_id = ?`,
                        [pid]
                    )
                    const completeRows = tcRows.filter(r => (r.input_data || '').toString().trim() && (r.expected_output || '').toString().trim());
                    const totalTests = completeRows.length;
                    const maxScore = completeRows.reduce((s, r) => s + (Number.isFinite(r.score) ? r.score : 0), 0);

                    // Prefer quick-read last-run data from content_problems
                    let last = null;
                    try {
                        const [cpRows] = await db.query(`SELECT NULL AS score, NULL AS result, NULL AS submitted_at, NULL AS passed, NULL AS total, NULL AS verdict FROM content_problems WHERE problem_id = ? LIMIT 1`, [pid]);
                        if (cpRows && cpRows.length > 0 && (cpRows[0].submitted_at || cpRows[0].score || cpRows[0].result || cpRows[0].passed)) {
                            last = cpRows[0];
                        }
                    } catch (e) {
                        // ignore and fallback
                    }
                    if (!last) {
                        const [subs] = await db.query(
                            `SELECT test_run_id AS submission_id, user_id, passed, total, verdict, result, score, submitted_at FROM problem_test_runs WHERE problem_id = ? ORDER BY submitted_at DESC LIMIT 1`,
                            [pid]
                        );
                        last = (subs && subs.length) ? subs[0] : null;
                    }

                    let passed = 0;
                    if (last) {
                        const lastScoreNum = Number(last.score);
                        if (!Number.isNaN(lastScoreNum) && totalTests > 0) {
                            if (lastScoreNum <= totalTests) {
                                passed = Math.max(0, Math.min(totalTests, Math.round(lastScoreNum)));
                            } else if (maxScore > 0) {
                                const avg = maxScore / totalTests;
                                if (avg > 0) passed = Math.min(totalTests, Math.round(lastScoreNum / avg));
                            }
                        } else if ((last.result || '').toString() === 'passed') {
                            passed = totalTests;
                        }
                    }
                    item.LastRun = last || null;
                    item.TestSummary = { passed, total: totalTests };
                } catch (e) {
                    // ignore per-item errors
                }
            }

            socket.emit('response_get_my_questions', {
                success: true,
                questions: questionList
            });

        } catch (err) {
            console.error('Error in request_get_my_questions:', err);
            socket.emit('response_get_my_questions', { success: false, message: 'Server error' });
        }
    });

    // === Filter my questions by status with search/sort/filters ===
    socket.on('request_filter_my_questions', async ({ token_session, status, search, sortOrder, difficulty, topicIds }) => {
        // Filter my questions request received (status)

        let session = null;
        if (socket.user && socket.user.userId) {
            session = { userId: socket.user.userId, decoded: socket.user.decoded };
        } else {
            session = await verifySession(token_session);
        }

        if (!session) {
            console.error('Filter my questions failed: invalid session');
            socket.emit(`response_filter_my_questions_${status}`, { success: false, message: 'Invalid session' });
            return;
        }

        try {
                        // Build query differently for draft vs other statuses to avoid leaking drafts into other filters
                        let query = `
                                SELECT DISTINCT
                                        p.problem_id,
                                        p.problem_name,
                                        p.difficulty,
                                        ci.created_at,
                                        a.status,
                                        a.reason
                                FROM problems p
                                JOIN content_problems cp ON p.problem_id = cp.problem_id
                                JOIN content_items ci ON cp.content_item_id = ci.content_item_id
                                JOIN approvals a ON ci.content_item_id = a.content_item_id
                                LEFT JOIN problems_have_topics pht ON p.problem_id = pht.problem_id
                                WHERE a.requested_by = ?
                                    AND ci.content_type = 'problem'
                        `;
                        const params = [session.userId];

                        if (status === 'draft') {
                                // Include both explicit 'draft' status and legacy rows with empty status but reason mentioning 'draft'
                                query += ` AND (a.status = 'draft' OR ((IFNULL(a.status, '') = '') AND LOWER(IFNULL(a.reason, '')) LIKE '%draft%'))`;
                        } else {
                                query += ` AND a.status = ?`;
                                params.push(status);
                        }

            // Apply search filter
            if (search && search.trim()) {
                query += ` AND p.problem_name LIKE ?`;
                params.push(`%${search.trim()}%`);
            }

            // Apply difficulty filter
            if (difficulty) {
                query += ` AND p.difficulty = ?`;
                params.push(difficulty);
            }

            // Apply topic filter
            if (topicIds && topicIds.length > 0) {
                const placeholders = topicIds.map(() => '?').join(',');
                query += ` AND pht.topic_id IN (${placeholders})`;
                params.push(...topicIds);
            }

            // Apply sort order
            if (sortOrder === 'asc') {
                query += ` ORDER BY p.problem_name ASC`;
            } else if (sortOrder === 'desc') {
                query += ` ORDER BY p.problem_name DESC`;
            } else {
                query += ` ORDER BY ci.created_at DESC`;
            }

            const [questions] = await db.query(query, params);

            // Fetch topics for each question
            const questionList = await Promise.all(questions.map(async (q) => {
                const [topics] = await db.query(
                    `SELECT pt.topic_id, pt.topic_name
                     FROM problem_topics pt
                     JOIN problems_have_topics pht ON pt.topic_id = pht.topic_id
                     WHERE pht.problem_id = ?`,
                    [q.problem_id]
                );

                return {
                    QuestionID: q.problem_id,
                    QuestionName: q.problem_name,
                    QuestionDifficulty: q.difficulty,
                    CreatedAt: q.created_at,
                    Status: q.status,
                    Reason: q.reason,
                    Topics: topics.map(t => ({ TopicID: t.topic_id, TopicName: t.topic_name }))
                };
            }));

            // Enrich with LastRun/TestSummary per question
            for (const item of questionList) {
                try {
                    const pid = item.QuestionID
                    const [tcRows] = await db.query(
                        `SELECT score, input_data, expected_output FROM test_cases WHERE problem_id = ?`,
                        [pid]
                    )
                    const completeRows = tcRows.filter(r => (r.input_data || '').toString().trim() && (r.expected_output || '').toString().trim());
                    const totalTests = completeRows.length;
                    const maxScore = completeRows.reduce((s, r) => s + (Number.isFinite(r.score) ? r.score : 0), 0);

                    // Prefer quick-read last-run data from content_problems
                    let last = null;
                    try {
                        const [cpRows] = await db.query(`SELECT NULL AS score, NULL AS result, NULL AS submitted_at, NULL AS passed, NULL AS total, NULL AS verdict FROM content_problems WHERE problem_id = ? LIMIT 1`, [pid]);
                        if (cpRows && cpRows.length > 0 && (cpRows[0].submitted_at || cpRows[0].score || cpRows[0].result || cpRows[0].passed)) {
                            last = cpRows[0];
                        }
                    } catch (e) {
                        // ignore and fallback
                    }
                    if (!last) {
                        const [subs] = await db.query(
                            `SELECT test_run_id AS submission_id, user_id, passed, total, verdict, result, score, submitted_at FROM problem_test_runs WHERE problem_id = ? ORDER BY submitted_at DESC LIMIT 1`,
                            [pid]
                        );
                        last = (subs && subs.length) ? subs[0] : null;
                    }

                    let passed = 0;
                    if (last) {
                        const lastScoreNum = Number(last.score);
                        if (!Number.isNaN(lastScoreNum) && totalTests > 0) {
                            if (lastScoreNum <= totalTests) {
                                passed = Math.max(0, Math.min(totalTests, Math.round(lastScoreNum)));
                            } else if (maxScore > 0) {
                                const avg = maxScore / totalTests;
                                if (avg > 0) passed = Math.min(totalTests, Math.round(lastScoreNum / avg));
                            }
                        } else if ((last.result || '').toString() === 'passed') {
                            passed = totalTests;
                        }
                    }
                    item.LastRun = last || null;
                    item.TestSummary = { passed, total: totalTests };
                } catch (e) {
                    // ignore per-item errors
                }
            }

            socket.emit(`response_filter_my_questions_${status}`, {
                success: true,
                questions: questionList
            });

        } catch (err) {
            console.error('Error in request_filter_my_questions:', err);
            socket.emit(`response_filter_my_questions_${status}`, { success: false, message: 'Server error' });
        }
    });

    // === request get global events (approved events from all users) ===
    socket.on('request_get_global_events', async ({ token_session }) => {
        try {
            console.log('Get global events request received on socket', socket.id);

            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_get_global_events', { success: false, message: 'Invalid session' });
                return;
            }

            const [events] = await db.query(
                `
                SELECT 
                    e.event_id,
                    e.event_name,
                    e.thumbnail_url,
                    e.host_id,
                    e.reward_points,
                    e.reward_level,
                    e.status,
                    COALESCE(u.username, 'Unknown') as host_name,
                    es.starts_at,
                    es.ends_at,
                    ci.content_item_id,
                    a.status as approval_status,
                    COUNT(DISTINCT ep.user_id) as participant_count
                FROM events e
                JOIN content_events ce ON e.event_id = ce.event_id
                JOIN content_items ci ON ce.content_item_id = ci.content_item_id
                JOIN approvals a ON ci.content_item_id = a.content_item_id
                LEFT JOIN users u ON e.host_id = u.user_id
                LEFT JOIN event_schedule es ON e.event_id = es.event_id
                LEFT JOIN event_participants ep ON e.event_id = ep.event_id
                WHERE a.status = 'approved' AND ci.content_type = 'event'
                GROUP BY e.event_id
                ORDER BY es.starts_at DESC
                `
            );

            const eventList = events.map(ev => ({
                EventID: ev.event_id,
                EventName: ev.event_name,
                ThumbnailUrl: ev.thumbnail_url,
                HostID: ev.host_id,
                HostName: ev.host_name,
                RewardPoints: ev.reward_points,
                RewardLevel: ev.reward_level,
                Status: ev.status,
                StartsAt: ev.starts_at,
                EndsAt: ev.ends_at,
                ParticipantCount: ev.participant_count
            }));

            socket.emit('response_get_global_events', {
                success: true,
                events: eventList
            });

        } catch (err) {
            console.error('Error in request_get_global_events:', err);
            socket.emit('response_get_global_events', { success: false, message: 'Server error' });
        }
    });

    // === request get user events (approved events created by current user) ===
    socket.on('request_get_user_events', async ({ token_session }) => {
        try {
            console.log('Get user events request received on socket', socket.id);

            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_get_user_events', { success: false, message: 'Invalid session' });
                return;
            }

            const isAdmin = await verifyAdmin(session);
            if (!isAdmin) {
                socket.emit('response_get_user_events', { success: false, message: 'Unauthorized: Admin access required' });
                return;
            }

            const [events] = await db.query(
                `
                SELECT 
                    e.event_id,
                    e.event_name,
                    e.thumbnail_url,
                    e.host_id,
                    e.reward_points,
                    e.reward_level,
                    e.status,
                    COALESCE(u.username, 'Unknown') as host_name,
                    es.starts_at,
                    es.ends_at,
                    ci.content_item_id,
                    a.status as approval_status,
                    COUNT(DISTINCT ep.user_id) as participant_count
                FROM events e
                JOIN content_events ce ON e.event_id = ce.event_id
                JOIN content_items ci ON ce.content_item_id = ci.content_item_id
                JOIN approvals a ON ci.content_item_id = a.content_item_id
                LEFT JOIN users u ON e.host_id = u.user_id
                LEFT JOIN event_schedule es ON e.event_id = es.event_id
                LEFT JOIN event_participants ep ON e.event_id = ep.event_id
                WHERE a.status = 'approved' 
                  AND ci.content_type = 'event'
                  AND a.requested_by = ?
                GROUP BY e.event_id
                ORDER BY es.starts_at DESC
                `,
                [session.userId]
            );

            const eventList = events.map(ev => ({
                EventID: ev.event_id,
                EventName: ev.event_name,
                ThumbnailUrl: ev.thumbnail_url,
                HostID: ev.host_id,
                HostName: ev.host_name,
                RewardPoints: ev.reward_points,
                RewardLevel: ev.reward_level,
                Status: ev.status,
                StartsAt: ev.starts_at,
                EndsAt: ev.ends_at,
                ParticipantCount: ev.participant_count
            }));

            socket.emit('response_get_user_events', {
                success: true,
                events: eventList
            });

        } catch (err) {
            console.error('Error in request_get_user_events:', err);
            socket.emit('response_get_user_events', { success: false, message: 'Server error' });
        }
    });

    // === CREATE-PROBLEM-FLOW: get all problem topics for dropdown selection ===
    socket.on('request_get_problem_topics', async ({ token_session }) => {
        try {
            console.log('Get problem topics request received on socket', socket.id);

            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_get_problem_topics', { success: false, message: 'Invalid session' });
                return;
            }

            const [topics] = await db.query(
                `SELECT topic_id, topic_name, description FROM problem_topics ORDER BY topic_name ASC`
            );

            socket.emit('response_get_problem_topics', {
                success: true,
                topics: topics.map(t => ({
                    topic_id: t.topic_id,
                    topic_name: t.topic_name,
                    description: t.description
                }))
            });

        } catch (err) {
            console.error('Error in request_get_problem_topics:', err);
            socket.emit('response_get_problem_topics', { success: false, message: 'Server error' });
        }
    });

    // === request get pending events (pending events from all users) ===
    socket.on('request_get_pending_events', async ({ token_session }) => {
        try {
            console.log('Get pending events request received on socket', socket.id);

            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_get_pending_events', { success: false, message: 'Invalid session' });
                return;
            }

            const isAdmin = await verifyAdmin(session);
            if (!isAdmin) {
                socket.emit('response_get_pending_events', { success: false, message: 'Unauthorized: Admin access required' });
                return;
            }

            const [events] = await db.query(
                `
                SELECT 
                    e.event_id,
                    e.event_name,
                    e.thumbnail_url,
                    e.host_id,
                    e.reward_points,
                    e.reward_level,
                    e.status,
                    COALESCE(u.username, 'Unknown') as host_name,
                    es.starts_at,
                    es.ends_at,
                    ci.content_item_id,
                    a.approval_id,
                    a.status as approval_status,
                    a.requested_by,
                    COUNT(DISTINCT ep.user_id) as participant_count
                FROM events e
                JOIN content_events ce ON e.event_id = ce.event_id
                JOIN content_items ci ON ce.content_item_id = ci.content_item_id
                JOIN approvals a ON ci.content_item_id = a.content_item_id
                LEFT JOIN users u ON e.host_id = u.user_id
                LEFT JOIN event_schedule es ON e.event_id = es.event_id
                LEFT JOIN event_participants ep ON e.event_id = ep.event_id
                WHERE a.status = 'pending' AND ci.content_type = 'event'
                GROUP BY e.event_id
                ORDER BY es.starts_at DESC
                `
            );

            const eventList = events.map(ev => ({
                EventID: ev.event_id,
                EventName: ev.event_name,
                ThumbnailUrl: ev.thumbnail_url,
                HostID: ev.host_id,
                HostName: ev.host_name,
                RewardPoints: ev.reward_points,
                RewardLevel: ev.reward_level,
                Status: ev.status,
                StartsAt: ev.starts_at,
                EndsAt: ev.ends_at,
                ParticipantCount: ev.participant_count,
                ApprovalID: ev.approval_id
            }));

            socket.emit('response_get_pending_events', {
                success: true,
                events: eventList
            });

        } catch (err) {
            console.error('Error in request_get_pending_events:', err);
            socket.emit('response_get_pending_events', { success: false, message: 'Server error' });
        }
    });

    // === request get event details with participants ===
    socket.on('request_get_event_details', async ({ token_session, event_id }) => {
        try {
            console.log('Get event details request received on socket', socket.id, 'event_id:', event_id);

            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_get_event_details', { success: false, message: 'Invalid session' });
                return;
            }

            const isAdmin = await verifyAdmin(session);
            if (!isAdmin) {
                socket.emit('response_get_event_details', { success: false, message: 'Unauthorized: Admin access required' });
                return;
            }

            const [events] = await db.query(
                `
                SELECT 
                    e.event_id,
                    e.event_name,
                    e.thumbnail_url,
                    e.host_id,
                    e.reward_points,
                    e.reward_level,
                    e.status,
                    COALESCE(u.username, 'Unknown') as host_name,
                    es.starts_at,
                    es.ends_at,
                    es.schedule_id
                FROM events e
                LEFT JOIN users u ON e.host_id = u.user_id
                LEFT JOIN event_schedule es ON e.event_id = es.event_id
                WHERE e.event_id = ?
                `,
                [event_id]
            );

            if (events.length === 0) {
                socket.emit('response_get_event_details', { success: false, message: 'Event not found' });
                return;
            }

            const [participants] = await db.query(
                `
                SELECT 
                    ep.participant_id,
                    ep.user_id,
                    ep.joined_at,
                    COALESCE(u.username, 'Unknown') as username,
                    u.email,
                    COALESCE(p.full_name, u.username) as full_name,
                    p.avatar_url
                FROM event_participants ep
                JOIN users u ON ep.user_id = u.user_id
                LEFT JOIN profiles p ON u.user_id = p.user_id
                WHERE ep.event_id = ?
                ORDER BY ep.joined_at ASC
                `,
                [event_id]
            );

            const event = events[0];
            const participantList = participants.map(p => ({
                ParticipantID: p.participant_id,
                UserID: p.user_id,
                Username: p.username,
                Email: p.email,
                FullName: p.full_name,
                AvatarUrl: p.avatar_url,
                JoinedAt: p.joined_at
            }));

            socket.emit('response_get_event_details', {
                success: true,
                event: {
                    EventID: event.event_id,
                    EventName: event.event_name,
                    ThumbnailUrl: event.thumbnail_url,
                    HostID: event.host_id,
                    HostName: event.host_name,
                    RewardPoints: event.reward_points,
                    RewardLevel: event.reward_level,
                    Status: event.status,
                    StartsAt: event.starts_at,
                    EndsAt: event.ends_at,
                    ScheduleID: event.schedule_id
                },
                participants: participantList
            });

        } catch (err) {
            console.error('Error in request_get_event_details:', err);
            socket.emit('response_get_event_details', { success: false, message: 'Server error' });
        }
    });

    // === request create event (creates new event and adds to approvals pipeline) ===
    socket.on('request_create_event', async ({ token_session, eventData }) => {
        try {
            console.log('Create event request received on socket', socket.id);

            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_create_event', { success: false, message: 'Invalid session' });
                return;
            }

            const isAdmin = await verifyAdmin(session);
            if (!isAdmin) {
                socket.emit('response_create_event', { success: false, message: 'Unauthorized: Admin access required' });
                return;
            }

            // Admins may or may not auto-approve based on permission
            const hasAutoApproveEvent = hasPermission
                ? await hasPermission(session.userId, 'event.auto_approve')
                : false;

            // Start transaction
            const connection = await db.getConnection();
            await connection.beginTransaction();

            try {
                let thumbnailUrl;
                
                // Handle file upload if thumbnailData is provided
                if (eventData.thumbnailData && eventData.thumbnailFileName) {
                    const base64Data = eventData.thumbnailData.replace(/^data:image\/\w+;base64,/, '');
                    const buffer = Buffer.from(base64Data, 'base64');
                    
                    // Generate filename from event name
                    const filename = eventData.eventName.toLowerCase().replace(/\s+/g, '-');
                    const extension = path.extname(eventData.thumbnailFileName) || '.png';
                    const filePath = path.join(__dirname, '../../../public/asset/event', `${filename}${extension}`);
                    
                    // Ensure directory exists
                    const dir = path.dirname(filePath);
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                    }
                    
                    // Write file to disk
                    fs.writeFileSync(filePath, buffer);
                    thumbnailUrl = `/asset/event/${filename}${extension}`;
                } else {
                    // Use explicit default thumbnail when no upload or existing URL provided
                    thumbnailUrl = eventData.thumbnailUrl || '/asset/event/default.png';
                }
                
                // 1. Insert into events table; status depends on auto-approve permission
                const [eventResult] = await connection.query(
                    `INSERT INTO events (event_name, thumbnail_url, host_id, reward_points, reward_level, status)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        eventData.eventName,
                        thumbnailUrl,
                        session.userId,
                        eventData.rewardPoints || 0,
                        eventData.rewardLevel || 0,
                        hasAutoApproveEvent ? 'approved' : 'pending'
                    ]
                );

                const eventId = eventResult.insertId;

                // 2. Insert into event_schedule table
                await connection.query(
                    `INSERT INTO event_schedule (event_id, starts_at, ends_at)
                     VALUES (?, ?, ?)`,
                    [eventId, eventData.startsAt, eventData.endsAt]
                );

                // 3. Insert into content_items table
                const [contentItemResult] = await connection.query(
                    `INSERT INTO content_items (content_type) VALUES ('event')`
                );

                const contentItemId = contentItemResult.insertId;

                // 4. Insert into content_events table
                await connection.query(
                    `INSERT INTO content_events (content_item_id, event_id) VALUES (?, ?)`,
                    [contentItemId, eventId]
                );

                // 5. Insert into approvals table; status depends on auto-approve permission
                await connection.query(
                    `INSERT INTO approvals (content_item_id, requested_by, approved_by, status, reason)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        contentItemId,
                        session.userId,
                        hasAutoApproveEvent ? session.userId : null,
                        hasAutoApproveEvent ? 'approved' : 'pending',
                        hasAutoApproveEvent ? new Date() : null,
                        hasAutoApproveEvent ? 'Auto-approved: event.auto_approve' : 'Event awaiting approval'
                    ]
                );

                await connection.commit();
                connection.release();

                socket.emit('response_create_event', {
                    success: true,
                    message: 'Event created and approved successfully',
                    eventId: eventId
                });

            } catch (err) {
                await connection.rollback();
                connection.release();
                throw err;
            }

        } catch (err) {
            console.error('Error in request_create_event:', err);
            socket.emit('response_create_event', { success: false, message: 'Server error: ' + err.message });
        }
    });

    // === request update event (updates existing event) ===
    socket.on('request_update_event', async ({ token_session, eventData }) => {
        try {
            console.log('Update event request received on socket', socket.id);
            // Early debug log to trace incoming payloads and tokens
            try {
                console.log('DEBUG request_update_event payload:', { token_session: Boolean(token_session) ? token_session : '(none)', eventDataPreview: { eventId: eventData?.eventId || eventData?.EventID || null, eventName: eventData?.eventName || eventData?.EventName || null } });
            } catch (e) {
                console.log('DEBUG request_update_event payload: (unable to stringify)');
            }

            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_update_event', { success: false, message: 'Invalid session' });
                return;
            }

            const isAdmin = await verifyAdmin(session);
            if (!isAdmin) {
                socket.emit('response_update_event', { success: false, message: 'Unauthorized: Admin access required' });
                return;
            }

            if (!eventData.eventId) {
                socket.emit('response_update_event', { success: false, message: 'Event ID is required' });
                return;
            }

            // Start transaction
            const connection = await db.getConnection();
            await connection.beginTransaction();

            try {
                let thumbnailUrl;
                
                // Handle file upload if thumbnailData is provided
                if (eventData.thumbnailData && eventData.thumbnailFileName) {
                    const base64Data = eventData.thumbnailData.replace(/^data:image\/\w+;base64,/, '');
                    const buffer = Buffer.from(base64Data, 'base64');
                    
                    // Generate filename from event name
                    const filename = eventData.eventName.toLowerCase().replace(/\s+/g, '-');
                    const extension = path.extname(eventData.thumbnailFileName) || '.png';
                    const filePath = path.join(__dirname, '../../../public/asset/event', `${filename}${extension}`);
                    
                    // Ensure directory exists
                    const dir = path.dirname(filePath);
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                    }
                    
                    // Write file to disk
                    fs.writeFileSync(filePath, buffer);
                    thumbnailUrl = `/asset/event/${filename}${extension}`;
                } else {
                    // Use explicit default thumbnail when no upload or existing URL provided
                    thumbnailUrl = eventData.thumbnailUrl || '/asset/event/default.png';
                }
                
                // Normalize start/end datetimes to MySQL friendly format
                const normalizeDateTime = (dt) => {
                    if (!dt) return null;
                    // Accept 'YYYY-MM-DDTHH:mm' or full ISO; convert 'T' to space and ensure seconds
                    try {
                        let s = String(dt);
                        if (s.includes('T')) {
                            // If no seconds, append :00
                            const parts = s.split('T');
                            let time = parts[1];
                            if (time && time.length === 5) time = time + ':00';
                            return parts[0] + ' ' + time;
                        }
                        return s;
                    } catch (e) {
                        return dt;
                    }
                }

                const startsAtSql = normalizeDateTime(eventData.startsAt);
                const endsAtSql = normalizeDateTime(eventData.endsAt);

                // Debug logging for update payload
                console.log('Updating event', { eventId: eventData.eventId, eventName: eventData.eventName, thumbnailUrl, startsAt: startsAtSql, endsAt: endsAtSql, rewardPoints: eventData.rewardPoints, rewardLevel: eventData.rewardLevel, status: eventData.status });

                // 1. Update events table
                await connection.query(
                    `UPDATE events 
                     SET event_name = ?, thumbnail_url = ?, reward_points = ?, reward_level = ?, status = ?
                     WHERE event_id = ?`,
                    [
                        eventData.eventName,
                        thumbnailUrl,
                        eventData.rewardPoints || 0,
                        eventData.rewardLevel || 0,
                        eventData.status || 'upcoming',
                        eventData.eventId
                    ]
                );

                // 2. Update event_schedule table (use normalized datetime values)
                await connection.query(
                    `UPDATE event_schedule 
                     SET starts_at = ?, ends_at = ?
                     WHERE event_id = ?`,
                    [startsAtSql, endsAtSql, eventData.eventId]
                );

                await connection.commit();
                connection.release();

                socket.emit('response_update_event', {
                    success: true,
                    message: 'Event updated successfully'
                });

            } catch (err) {
                await connection.rollback();
                connection.release();
                throw err;
            }

        } catch (err) {
            console.error('Error in request_update_event:', err);
            socket.emit('response_update_event', { success: false, message: 'Server error: ' + err.message });
        }
    });

    // ======== BLOG HANDLERS ========

    // === request get global blogs (approved blogs from all users) ===
    socket.on('request_get_global_blogs', async ({ token_session }) => {
        try {
            console.log('Get global blogs request received on socket', socket.id);

            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_get_global_blogs', { success: false, message: 'Invalid session' });
                return;
            }

            const isAdmin = await verifyAdmin(session);
            if (!isAdmin) {
                socket.emit('response_get_global_blogs', { success: false, message: 'Unauthorized: Admin access required' });
                return;
            }

            const [blogs] = await db.query(
                `
                SELECT 
                    b.blog_id,
                    b.author_id,
                    b.thumbnail_url,
                    b.title,
                    b.content,
                    b.published_at,
                    b.updated_at,
                    b.status,
                    'blog' AS content_type,
                    COALESCE(u.username, 'Unknown') as author_name,
                    ci.content_item_id,
                    a.status as approval_status
                FROM blogs b
                JOIN content_blogs cb ON b.blog_id = cb.blog_id
                JOIN content_items ci ON cb.content_item_id = ci.content_item_id
                JOIN approvals a ON ci.content_item_id = a.content_item_id
                LEFT JOIN users u ON b.author_id = u.user_id
                WHERE a.status = 'approved' AND ci.content_type = 'blog'
                ORDER BY b.published_at DESC
                `
            );

            const blogList = blogs.map(blog => ({
                BlogID: blog.blog_id,
                AuthorID: blog.author_id,
                AuthorName: blog.author_name,
                ThumbnailUrl: blog.thumbnail_url,
                Title: blog.title,
                Content: blog.content,
                PublishedAt: blog.published_at,
                UpdatedAt: blog.updated_at,
                Status: blog.status,
                ContentType: blog.content_type
            }));

            socket.emit('response_get_global_blogs', {
                success: true,
                blogs: blogList
            });

        } catch (err) {
            console.error('Error in request_get_global_blogs:', err);
            socket.emit('response_get_global_blogs', { success: false, message: 'Server error' });
        }
    });

    // === request get user blogs (blogs created by current user) ===
    socket.on('request_get_user_blogs', async ({ token_session }) => {
        try {
            console.log('Get user blogs request received on socket', socket.id);

            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_get_user_blogs', { success: false, message: 'Invalid session' });
                return;
            }

            const isAdmin = await verifyAdmin(session);
            if (!isAdmin) {
                socket.emit('response_get_user_blogs', { success: false, message: 'Unauthorized: Admin access required' });
                return;
            }

            const [blogs] = await db.query(
                `
                SELECT 
                    b.blog_id,
                    b.author_id,
                    b.thumbnail_url,
                    b.title,
                    b.content,
                    b.published_at,
                    b.updated_at,
                    b.status,
                    'blog' AS content_type,
                    COALESCE(u.username, 'Unknown') as author_name
                FROM blogs b
                LEFT JOIN users u ON b.author_id = u.user_id
                WHERE b.author_id = ?
                ORDER BY b.updated_at DESC
                `,
                [session.userId]
            );

            const blogList = blogs.map(blog => ({
                BlogID: blog.blog_id,
                AuthorID: blog.author_id,
                AuthorName: blog.author_name,
                ThumbnailUrl: blog.thumbnail_url,
                Title: blog.title,
                Content: blog.content,
                PublishedAt: blog.published_at,
                UpdatedAt: blog.updated_at,
                Status: blog.status,
                ContentType: blog.content_type
            }));

            socket.emit('response_get_user_blogs', {
                success: true,
                blogs: blogList
            });

        } catch (err) {
            console.error('Error in request_get_user_blogs:', err);
            socket.emit('response_get_user_blogs', { success: false, message: 'Server error' });
        }
    });

    // === request get pending blogs (blogs awaiting approval) ===
    socket.on('request_get_pending_blogs', async ({ token_session }) => {
        try {
            console.log('Get pending blogs request received on socket', socket.id);

            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_get_pending_blogs', { success: false, message: 'Invalid session' });
                return;
            }

            const isAdmin = await verifyAdmin(session);
            if (!isAdmin) {
                socket.emit('response_get_pending_blogs', { success: false, message: 'Unauthorized: Admin access required' });
                return;
            }

            const [blogs] = await db.query(
                `
                SELECT 
                    b.blog_id,
                    b.author_id,
                    b.thumbnail_url,
                    b.title,
                    b.content,
                    b.published_at,
                    b.updated_at,
                    b.status,
                    'blog' AS content_type,
                    COALESCE(u.username, 'Unknown') as author_name,
                    ci.content_item_id,
                    a.approval_id,
                    a.status as approval_status
                FROM blogs b
                LEFT JOIN content_blogs cb ON b.blog_id = cb.blog_id
                LEFT JOIN content_items ci ON cb.content_item_id = ci.content_item_id
                LEFT JOIN approvals a ON ci.content_item_id = a.content_item_id
                LEFT JOIN users u ON b.author_id = u.user_id
                -- Include only blogs that have a pending approval record or explicit pending status
                WHERE (a.status = 'pending' OR b.status IN ('pending', 'pending_review'))
                ORDER BY b.updated_at DESC
                `
            );

            const blogList = blogs.map(blog => ({
                BlogID: blog.blog_id,
                AuthorID: blog.author_id,
                AuthorName: blog.author_name,
                ThumbnailUrl: blog.thumbnail_url,
                Title: blog.title,
                Content: blog.content,
                PublishedAt: blog.published_at,
                UpdatedAt: blog.updated_at,
                Status: blog.status,
                ContentType: blog.content_type,
                ApprovalID: blog.approval_id
            }));

            // Pending blogs prepared for response (debug logging removed)

            socket.emit('response_get_pending_blogs', {
                success: true,
                blogs: blogList
            });

        } catch (err) {
            console.error('Error in request_get_pending_blogs:', err);
            socket.emit('response_get_pending_blogs', { success: false, message: 'Server error' });
        }
    });

    // === request get blog details (get single blog by id) ===
    socket.on('request_get_blog_details', async ({ token_session, blog_id }) => {
        try {
            console.log('Get blog details request received on socket', socket.id);

            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_get_blog_details', { success: false, message: 'Invalid session' });
                return;
            }

            const isAdmin = await verifyAdmin(session);
            if (!isAdmin) {
                socket.emit('response_get_blog_details', { success: false, message: 'Unauthorized: Admin access required' });
                return;
            }

            const [blogs] = await db.query(
                `
                SELECT 
                    b.blog_id,
                    b.author_id,
                    b.thumbnail_url,
                    b.title,
                    b.content,
                    b.published_at,
                    b.updated_at,
                    b.status,
                    'blog' AS content_type,
                    COALESCE(u.username, 'Unknown') as author_name
                FROM blogs b
                LEFT JOIN users u ON b.author_id = u.user_id
                WHERE b.blog_id = ?
                `,
                [blog_id]
            );

            if (blogs.length === 0) {
                socket.emit('response_get_blog_details', { success: false, message: 'Blog not found' });
                return;
            }

            const blog = blogs[0];

            socket.emit('response_get_blog_details', {
                success: true,
                blog: {
                    BlogID: blog.blog_id,
                    AuthorID: blog.author_id,
                    AuthorName: blog.author_name,
                    ThumbnailUrl: blog.thumbnail_url,
                    Title: blog.title,
                    Content: blog.content,
                    PublishedAt: blog.published_at,
                    UpdatedAt: blog.updated_at,
                    Status: blog.status,
                    ContentType: blog.content_type
                }
            });

        } catch (err) {
            console.error('Error in request_get_blog_details:', err);
            socket.emit('response_get_blog_details', { success: false, message: 'Server error' });
        }
    });

    // === request create blog (creates new blog and adds to approvals pipeline) ===
    socket.on('request_create_blog', async ({ token_session, blogData }) => {
        try {
            console.log('Create blog request received on socket', socket.id);

            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_create_blog', { success: false, message: 'Invalid session' });
                return;
            }

            const isAdmin = await verifyAdmin(session);
            if (!isAdmin) {
                socket.emit('response_create_blog', { success: false, message: 'Unauthorized: Admin access required' });
                return;
            }

            // Admins may or may not auto-approve based on permission
            const hasAutoApproveBlog = hasPermission
                ? await hasPermission(session.userId, 'blog.auto_approve')
                : false;

            const connection = await db.getConnection();
            await connection.beginTransaction();

            try {
                let thumbnailUrl = blogData.ThumbnailUrl || '';
                
                // Handle base64 image upload if provided
                if (blogData.ThumbnailUrl && blogData.ThumbnailUrl.startsWith('data:image')) {
                    const base64Data = blogData.ThumbnailUrl.replace(/^data:image\/\w+;base64,/, '');
                    const buffer = Buffer.from(base64Data, 'base64');
                    
                    const filename = blogData.Title.toLowerCase().replace(/\s+/g, '-');
                    const extension = '.png';
                    const filePath = path.join(__dirname, '../../../public/asset/blog', `${filename}${extension}`);
                    
                    const dir = path.dirname(filePath);
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                    }
                    
                    fs.writeFileSync(filePath, buffer);
                    thumbnailUrl = `/asset/blog/${filename}${extension}`;
                }

                // Ensure we have a safe fallback thumbnail if none provided
                if (!thumbnailUrl) {
                    thumbnailUrl = '/asset/event/default.png';
                }

                // Insert into blogs table; status depends on auto-approve permission
                const [blogResult] = await connection.query(
                    `INSERT INTO blogs (author_id, thumbnail_url, title, content, status, content_type, published_at)
                     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                    [
                        session.userId,
                        thumbnailUrl,
                        blogData.Title,
                        blogData.Content,
                        hasAutoApproveBlog ? 'approved' : 'pending',
                        blogData.ContentType || ''
                    ]
                );

                const blogId = blogResult.insertId;

                // Create approval workflow for all admin-created blogs (auto or pending)
                const [contentItemResult] = await connection.query(
                    `INSERT INTO content_items (content_type) VALUES ('blog')`
                );

                const contentItemId = contentItemResult.insertId;

                await connection.query(
                    `INSERT INTO content_blogs (content_item_id, blog_id) VALUES (?, ?)`,
                    [contentItemId, blogId]
                );

                // Insert into approvals table; status depends on auto-approve permission
                await connection.query(
                    `INSERT INTO approvals (content_item_id, requested_by, approved_by, status, reason)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        contentItemId,
                        session.userId,
                        hasAutoApproveBlog ? session.userId : null,
                        hasAutoApproveBlog ? 'approved' : 'pending',
                        hasAutoApproveBlog ? new Date() : null,
                        hasAutoApproveBlog ? 'Auto-approved: blog.auto_approve' : 'Blog awaiting approval'
                    ]
                );

                await connection.commit();
                connection.release();

                socket.emit('response_create_blog', {
                    success: true,
                    message: 'Blog created successfully',
                    blog_id: blogId
                });

                // Notify all connected clients that home content (blogs) changed
                try {
                    if (socket && socket.server && typeof socket.server.emit === 'function') {
                        socket.server.emit('notify_home_content_changed', { type: 'create', blog_id: blogId });
                    }
                } catch (e) {
                    console.error('Failed to broadcast notify_home_content_changed (create):', e);
                }

            } catch (err) {
                await connection.rollback();
                connection.release();
                throw err;
            }

        } catch (err) {
            console.error('Error in request_create_blog:', err);
            socket.emit('response_create_blog', { success: false, message: 'Server error: ' + err.message });
        }
    });

    // === request update blog ===
    socket.on('request_update_blog', async ({ token_session, blogData }) => {
        try {
            console.log('Update blog request received on socket', socket.id);

            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_update_blog', { success: false, message: 'Invalid session' });
                return;
            }

            const isAdmin = await verifyAdmin(session);
            if (!isAdmin) {
                socket.emit('response_update_blog', { success: false, message: 'Unauthorized: Admin access required' });
                return;
            }

            const connection = await db.getConnection();
            await connection.beginTransaction();

            try {
                let thumbnailUrl = blogData.ThumbnailUrl || '';
                
                // Handle base64 image upload if provided
                if (blogData.ThumbnailUrl && blogData.ThumbnailUrl.startsWith('data:image')) {
                    const base64Data = blogData.ThumbnailUrl.replace(/^data:image\/\w+;base64,/, '');
                    const buffer = Buffer.from(base64Data, 'base64');
                    
                    const filename = blogData.Title.toLowerCase().replace(/\s+/g, '-');
                    const extension = '.png';
                    const filePath = path.join(__dirname, '../../../public/asset/blog', `${filename}${extension}`);
                    
                    const dir = path.dirname(filePath);
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                    }
                    
                    fs.writeFileSync(filePath, buffer);
                    thumbnailUrl = `/asset/blog/${filename}${extension}`;
                }

                // If no thumbnail provided in update payload, preserve existing thumbnail
                if (!thumbnailUrl) {
                    const [rows] = await connection.query('SELECT thumbnail_url FROM blogs WHERE blog_id = ?', [blogData.BlogID]);
                    if (rows && rows.length > 0) {
                        thumbnailUrl = rows[0].thumbnail_url || '/asset/event/default.png';
                    } else {
                        thumbnailUrl = '/asset/event/default.png';
                    }
                }

                await connection.query(
                    `UPDATE blogs 
                     SET title = ?, content = ?, thumbnail_url = ?, status = ?, content_type = ?, updated_at = NOW()
                     WHERE blog_id = ?`,
                    [
                        blogData.Title,
                        blogData.Content,
                        thumbnailUrl,
                        blogData.Status,
                        blogData.ContentType || '',
                        blogData.BlogID
                    ]
                );

                await connection.commit();
                connection.release();

                socket.emit('response_update_blog', {
                    success: true,
                    message: 'Blog updated successfully'
                });

                // Notify all connected clients that home content (blogs) changed
                try {
                    if (socket && socket.server && typeof socket.server.emit === 'function') {
                        socket.server.emit('notify_home_content_changed', { type: 'update', blog_id: blogData.BlogID });
                    }
                } catch (e) {
                    console.error('Failed to broadcast notify_home_content_changed (update):', e);
                }

            } catch (err) {
                await connection.rollback();
                connection.release();
                throw err;
            }

        } catch (err) {
            console.error('Error in request_update_blog:', err);
            socket.emit('response_update_blog', { success: false, message: 'Server error: ' + err.message });
        }
    });

    // === request approve blog ===
    socket.on('request_approve_blog', async ({ token_session, blog_id, approval_id }) => {
        try {
            console.log('Approve blog request received on socket', socket.id);

            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_approve_blog', { success: false, message: 'Invalid session' });
                return;
            }

            const canApprove = await hasPermission(session.userId, 'blog.approvals.manage');
            if (!canApprove) {
                socket.emit('response_approve_blog', { success: false, message: 'Unauthorized: You do not have permission to approve blogs' });
                return;
            }

            const connection = await db.getConnection();
            await connection.beginTransaction();

            try {
                // Ensure the approval row exists and is pending
                const [apRows] = await connection.query('SELECT * FROM approvals WHERE approval_id = ? LIMIT 1', [approval_id]);
                if (!apRows || !apRows.length) {
                    // Missing approval - do not change blog status
                    await connection.release();
                    socket.emit('response_approve_blog', { success: false, message: 'Approval not found' });
                    return;
                }
                const approvalRow = apRows[0];
                if (approvalRow.status !== 'pending') {
                    await connection.release();
                    socket.emit('response_approve_blog', { success: false, message: 'Approval already processed' });
                    return;
                }

                await connection.query(
                    `UPDATE approvals 
                     SET status = 'approved', approved_by = ?
                     WHERE approval_id = ?`,
                    [session.userId, approval_id]
                );

                await connection.query(
                    `UPDATE blogs SET status = 'approved' WHERE blog_id = ?`,
                    [blog_id]
                );

                // If this blog originated from a faculty_pending_changes row
                // (non-auto-approve faculty create/update), mark that change
                // as committed so it no longer appears in faculty pending
                // views after a direct Level 1 admin approval.
                await connection.query(
                    `UPDATE faculty_pending_changes
                     SET status = 'committed', admin_reviewer_id = ?, admin_review_date = NOW(), admin_review_comment = COALESCE(admin_review_comment, 'Approved via admin blog approval')
                     WHERE table_name = 'blogs'
                       AND change_type = 'blog'
                       AND record_id = ?
                       AND status IN ('pending_faculty_review','pending_admin')`,
                    [session.userId, blog_id]
                );

                await connection.commit();
                connection.release();

                // Notify requester (author) similar to question approvals
                try {
                    const [reqRows] = await db.query('SELECT requested_by FROM approvals WHERE approval_id = ?', [approval_id]);
                    const requester = reqRows && reqRows.length ? reqRows[0].requested_by : null;
                    if (requester) {
                        const title = 'Blog Approved';
                        const message = 'An admin has approved your blog.';
                        const [ins] = await db.query(
                            'INSERT INTO notifications (user_id, type, title, message, data, link, is_read) VALUES (?, ?, ?, ?, ?, ?, 0)',
                            [requester, 'blog_approved', title, message, JSON.stringify({ approval_id, blog_id }), null]
                        );
                        const [nrows] = await db.query('SELECT * FROM notifications WHERE id = ?', [ins.insertId]);
                        const newNotif = nrows && nrows.length ? nrows[0] : null;
                        if (newNotif && activeSessions && io) {
                            const sids = activeSessions.get(Number(requester));
                            if (sids && sids.size) {
                                sids.forEach((sid) => {
                                    const sock = io.sockets.sockets.get(sid);
                                    if (sock) sock.emit('notification', newNotif);
                                });
                                try { sids.forEach((sid) => { const sock = io.sockets.sockets.get(sid); if (sock) sock.emit('approval_approved', { message, approval_id, blog_id }); }); } catch (e) {}
                            }
                        }
                    }
                } catch (notifyErr) {
                    console.warn('Failed to emit blog approval notification:', notifyErr);
                }

                socket.emit('response_approve_blog', {
                    success: true,
                    message: 'Blog approved successfully'
                });

            } catch (err) {
                await connection.rollback();
                connection.release();
                throw err;
            }

        } catch (err) {
            console.error('Error in request_approve_blog:', err);
            socket.emit('response_approve_blog', { success: false, message: 'Server error: ' + err.message });
        }
    });

    // === request approve event ===
    socket.on('request_approve_event', async ({ token_session, event_id, approval_id }) => {
        try {
            console.log('Approve event request received on socket', socket.id);

            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_approve_event', { success: false, message: 'Invalid session' });
                return;
            }

            const canApprove = await hasPermission(session.userId, 'event.approvals.manage');
            if (!canApprove) {
                socket.emit('response_approve_event', { success: false, message: 'Unauthorized: You do not have permission to approve events' });
                return;
            }

            const connection = await db.getConnection();
            await connection.beginTransaction();

            try {
                // Ensure the approval row exists and is pending
                const [apRows] = await connection.query('SELECT * FROM approvals WHERE approval_id = ? LIMIT 1', [approval_id]);
                if (!apRows || !apRows.length) {
                    await connection.release();
                    socket.emit('response_approve_event', { success: false, message: 'Approval not found' });
                    return;
                }
                const approvalRow = apRows[0];
                if (approvalRow.status !== 'pending') {
                    await connection.release();
                    socket.emit('response_approve_event', { success: false, message: 'Approval already processed' });
                    return;
                }

                await connection.query(
                    `UPDATE approvals 
                     SET status = 'approved', approved_by = ?
                     WHERE approval_id = ?`,
                    [session.userId, approval_id]
                );

                await connection.query(
                    `UPDATE events SET status = 'approved' WHERE event_id = ?`,
                    [event_id]
                );

                // If this event came from a faculty_pending_changes entry
                // (non-auto-approve faculty create/update), mark that change
                // as committed here as well so faculty pending lists no longer
                // show it after a direct Level 1 admin approval.
                await connection.query(
                    `UPDATE faculty_pending_changes
                     SET status = 'committed', admin_reviewer_id = ?, admin_review_date = NOW(), admin_review_comment = COALESCE(admin_review_comment, 'Approved via admin event approval')
                     WHERE table_name = 'events'
                       AND change_type = 'event'
                       AND record_id = ?
                       AND status IN ('pending_faculty_review','pending_admin')`,
                    [session.userId, event_id]
                );

                await connection.commit();
                connection.release();

                // Notify requester (event author/host)
                try {
                    const [reqRows] = await db.query('SELECT requested_by FROM approvals WHERE approval_id = ?', [approval_id]);
                    const requester = reqRows && reqRows.length ? reqRows[0].requested_by : null;
                    if (requester) {
                        const title = 'Event Approved';
                        const message = 'An admin has approved your event.';
                        const [ins] = await db.query(
                            'INSERT INTO notifications (user_id, type, title, message, data, link, is_read) VALUES (?, ?, ?, ?, ?, ?, 0)',
                            [requester, 'event_approved', title, message, JSON.stringify({ approval_id, event_id }), null]
                        );
                        const [nrows] = await db.query('SELECT * FROM notifications WHERE id = ?', [ins.insertId]);
                        const newNotif = nrows && nrows.length ? nrows[0] : null;
                        if (newNotif && activeSessions && io) {
                            const sids = activeSessions.get(Number(requester));
                            if (sids && sids.size) {
                                sids.forEach((sid) => {
                                    const sock = io.sockets.sockets.get(sid);
                                    if (sock) sock.emit('notification', newNotif);
                                });
                                try { sids.forEach((sid) => { const sock = io.sockets.sockets.get(sid); if (sock) sock.emit('approval_approved', { message, approval_id, event_id }); }); } catch (e) {}
                            }
                        }
                    }
                } catch (notifyErr) {
                    console.warn('Failed to emit event approval notification:', notifyErr);
                }

                socket.emit('response_approve_event', {
                    success: true,
                    message: 'Event approved successfully'
                });

            } catch (err) {
                await connection.rollback();
                connection.release();
                throw err;
            }

        } catch (err) {
            console.error('Error in request_approve_event:', err);
            socket.emit('response_approve_event', { success: false, message: 'Server error: ' + err.message });
        }
    });

    // === request deny event ===
    socket.on('request_deny_event', async ({ token_session, event_id, approval_id, reason }) => {
        try {
            console.log('Deny event request received on socket', socket.id);

            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_deny_event', { success: false, message: 'Invalid session' });
                return;
            }

            const canDeny = await hasPermission(session.userId, 'event.approvals.manage');
            if (!canDeny) {
                socket.emit('response_deny_event', { success: false, message: 'Unauthorized: You do not have permission to deny events' });
                return;
            }

            const connection = await db.getConnection();
            await connection.beginTransaction();

            try {
                // Ensure the approval row exists and is pending
                const [apRows] = await connection.query('SELECT * FROM approvals WHERE approval_id = ? LIMIT 1', [approval_id]);
                if (!apRows || !apRows.length) {
                    await connection.release();
                    socket.emit('response_deny_event', { success: false, message: 'Approval not found' });
                    return;
                }
                const approvalRow = apRows[0];
                if (approvalRow.status !== 'pending') {
                    await connection.release();
                    socket.emit('response_deny_event', { success: false, message: 'Approval already processed' });
                    return;
                }

                await connection.query(
                    `UPDATE approvals 
                     SET status = 'denied', approved_by = ?, reason = ?
                     WHERE approval_id = ?`,
                    [session.userId, reason || 'No reason provided', approval_id]
                );

                await connection.query(
                    `UPDATE events SET status = 'denied' WHERE event_id = ?`,
                    [event_id]
                );

                // If this event also originated from the faculty
                // pending changes pipeline, ensure any related
                // faculty_pending_changes rows are marked rejected so
                // faculty dashboards no longer see it as pending.
                try {
                    await connection.query(
                        `UPDATE faculty_pending_changes
                         SET status = 'rejected', admin_reviewer_id = ?, admin_review_date = NOW(), admin_review_comment = ?
                         WHERE table_name = 'events'
                           AND change_type = 'event'
                           AND record_id = ?
                           AND status IN ('pending_faculty_review','pending_admin')`,
                        [session.userId, reason || 'Denied in admin pending events', event_id]
                    );
                } catch (e) {
                    console.warn('request_deny_event: failed to sync faculty_pending_changes for event', event_id, e && e.message);
                }

                await connection.commit();
                connection.release();

                socket.emit('response_deny_event', {
                    success: true,
                    message: 'Event denied successfully'
                });

                // Notify other connected dashboards (including faculty)
                // that an event approval has been denied so they can
                // refresh their pending views without a full reload.
                try {
                    socket.broadcast.emit('approval_event_denied', {
                        event_id,
                        approval_id
                    });
                } catch (e) {}

            } catch (err) {
                await connection.rollback();
                connection.release();
                throw err;
            }

        } catch (err) {
            console.error('Error in request_deny_event:', err);
            socket.emit('response_deny_event', { success: false, message: 'Server error: ' + err.message });
        }
    });

    // === request deny blog ===
    socket.on('request_deny_blog', async ({ token_session, blog_id, approval_id, reason }) => {
        try {
            console.log('Deny blog request received on socket', socket.id);

            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_deny_blog', { success: false, message: 'Invalid session' });
                return;
            }

            const canDeny = await hasPermission(session.userId, 'blog.approvals.manage');
            if (!canDeny) {
                socket.emit('response_deny_blog', { success: false, message: 'Unauthorized: You do not have permission to deny blogs' });
                return;
            }

            const connection = await db.getConnection();
            await connection.beginTransaction();

            try {
                    await connection.query(
                    `UPDATE approvals 
                     SET status = 'denied', approved_by = ?, reason = ?
                     WHERE approval_id = ?`,
                    [session.userId, reason || 'No reason provided', approval_id]
                );

                    await connection.query(
                        `UPDATE blogs SET status = 'denied' WHERE blog_id = ?`,
                        [blog_id]
                    );

                    // Mirror the denial into any corresponding
                    // faculty_pending_changes rows for blogs so that
                    // faculty dashboards do not continue to treat
                    // these items as pending.
                    try {
                        await connection.query(
                            `UPDATE faculty_pending_changes
                             SET status = 'rejected', admin_reviewer_id = ?, admin_review_date = NOW(), admin_review_comment = ?
                             WHERE table_name = 'blogs'
                               AND change_type = 'blog'
                               AND record_id = ?
                               AND status IN ('pending_faculty_review','pending_admin')`,
                            [session.userId, reason || 'Denied in admin pending blogs', blog_id]
                        );
                    } catch (e) {
                        console.warn('request_deny_blog: failed to sync faculty_pending_changes for blog', blog_id, e && e.message);
                    }

                await connection.commit();
                connection.release();

                socket.emit('response_deny_blog', {
                    success: true,
                    message: 'Blog denied successfully'
                });

                // Broadcast so faculty dashboards can refresh their
                // blog pending queues when an approval is denied in
                // the admin dashboard.
                try {
                    socket.broadcast.emit('approval_blog_denied', {
                        blog_id,
                        approval_id
                    });
                } catch (e) {}

            } catch (err) {
                await connection.rollback();
                connection.release();
                throw err;
            }

        } catch (err) {
            console.error('Error in request_deny_blog:', err);
            socket.emit('response_deny_blog', { success: false, message: 'Server error: ' + err.message });
        }
    });

    // === request delete blog ===
    socket.on('request_delete_blog', async ({ token_session, blog_id }) => {
        try {
            console.log('Delete blog request received on socket', socket.id);

            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_delete_blog', { success: false, message: 'Invalid session' });
                return;
            }

            const isAdmin = await verifyAdmin(session);
            if (!isAdmin) {
                socket.emit('response_delete_blog', { success: false, message: 'Unauthorized: Admin access required' });
                return;
            }

            const connection = await db.getConnection();
            await connection.beginTransaction();

            try {
                // Get content_item_id from content_blogs
                const [contentBlogs] = await connection.query(
                    'SELECT content_item_id FROM content_blogs WHERE blog_id = ?',
                    [blog_id]
                );

                // Delete from content_blogs
                await connection.query('DELETE FROM content_blogs WHERE blog_id = ?', [blog_id]);

                // Delete from approvals if exists
                if (contentBlogs.length > 0) {
                    await connection.query(
                        'DELETE FROM approvals WHERE content_item_id = ?',
                        [contentBlogs[0].content_item_id]
                    );
                    
                    // Delete from content_items
                    await connection.query(
                        'DELETE FROM content_items WHERE content_item_id = ?',
                        [contentBlogs[0].content_item_id]
                    );
                }

                // Delete from blogs
                await connection.query('DELETE FROM blogs WHERE blog_id = ?', [blog_id]);

                await connection.commit();
                connection.release();

                socket.emit('response_delete_blog', {
                    success: true,
                    message: 'Blog deleted successfully'
                });

                // Notify all connected clients that home content (blogs) changed
                try {
                    if (socket && socket.server && typeof socket.server.emit === 'function') {
                        socket.server.emit('notify_home_content_changed', { type: 'delete', blog_id });
                    }
                } catch (e) {
                    console.error('Failed to broadcast notify_home_content_changed (delete):', e);
                }

            } catch (err) {
                await connection.rollback();
                connection.release();
                throw err;
            }

        } catch (err) {
            console.error('Error in request_delete_blog:', err);
            socket.emit('response_delete_blog', { success: false, message: 'Server error: ' + err.message });
        }
    });

    // === request delete event ===
    socket.on('request_delete_event', async ({ token_session, event_id }) => {
        try {
            console.log('Delete event request received on socket', socket.id);

            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_delete_event', { success: false, message: 'Invalid session' });
                return;
            }

            const isAdmin = await verifyAdmin(session);
            if (!isAdmin) {
                socket.emit('response_delete_event', { success: false, message: 'Unauthorized: Admin access required' });
                return;
            }

            const connection = await db.getConnection();
            await connection.beginTransaction();

            try {
                // Delete from event_schedule
                await connection.query('DELETE FROM event_schedule WHERE event_id = ?', [event_id]);

                // Get content_item_id from content_events
                const [contentEvents] = await connection.query(
                    'SELECT content_item_id FROM content_events WHERE event_id = ?',
                    [event_id]
                );

                // Delete from content_events
                await connection.query('DELETE FROM content_events WHERE event_id = ?', [event_id]);

                // Delete from approvals and content_items for all related content_item_id entries
                if (contentEvents.length > 0) {
                    for (const ce of contentEvents) {
                        if (ce && ce.content_item_id) {
                            await connection.query(
                                'DELETE FROM approvals WHERE content_item_id = ?',
                                [ce.content_item_id]
                            );
                            await connection.query(
                                'DELETE FROM content_items WHERE content_item_id = ?',
                                [ce.content_item_id]
                            );
                        }
                    }
                }

                // Delete from events
                await connection.query('DELETE FROM events WHERE event_id = ?', [event_id]);

                await connection.commit();
                connection.release();

                socket.emit('response_delete_event', {
                    success: true,
                    message: 'Event deleted successfully'
                });

            } catch (err) {
                await connection.rollback();
                connection.release();
                throw err;
            }

        } catch (err) {
            console.error('Error in request_delete_event:', err);
            socket.emit('response_delete_event', { success: false, message: 'Server error: ' + err.message });
        }
    });

    // === request delete question ===
    socket.on('request_delete_question', async ({ token_session, question_id, ProblemID }) => {
        try {
            console.log('Delete question request received on socket', socket.id);

            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_delete_question', { success: false, message: 'Invalid session' });
                return;
            }

            const isAdmin = await verifyAdmin(session);

            // Normalize problem id from either question_id or ProblemID
            const problemId = question_id || ProblemID;
            if (!problemId) {
                socket.emit('response_delete_question', { success: false, message: 'Missing problem id' });
                return;
            }

            // Allow admins, or owners (requested_by) of the problem to delete
            let isOwner = false;
            if (!isAdmin) {
                const [ownerRows] = await db.query(
                    `
                    SELECT a.requested_by
                    FROM approvals a
                    JOIN content_items ci ON a.content_item_id = ci.content_item_id
                    JOIN content_problems cp ON cp.content_item_id = ci.content_item_id
                    WHERE cp.problem_id = ?
                    LIMIT 1
                    `,
                    [problemId]
                );
                if (ownerRows.length > 0) {
                    isOwner = ownerRows[0].requested_by === session.userId;
                }
            }
            // Permission-based delete checks: allow
            // - admins
            // - users with problem.delete.any
            // - owners with problem.delete.own
            let canDeleteAny = false;
            let canDeleteOwn = false;
            try {
                if (hasPermission) {
                    canDeleteAny = await hasPermission(session.userId, 'problem.delete.any');
                    canDeleteOwn = await hasPermission(session.userId, 'problem.delete.own');
                }
            } catch (e) {
                console.error('hasPermission check failed for delete question', e && e.message ? e.message : e);
            }

            if (!(isAdmin || canDeleteAny || (isOwner && canDeleteOwn))) {
                socket.emit('response_delete_question', { success: false, message: 'Unauthorized: You are not allowed to delete this problem' });
                return;
            }

            const connection = await db.getConnection();
            await connection.beginTransaction();

            try {
                // Find linked content_item_id via content_problems
                const [contentProblems] = await connection.query(
                    'SELECT content_item_id FROM content_problems WHERE problem_id = ?',
                    [problemId]
                );

                // Remove from content_problems
                await connection.query('DELETE FROM content_problems WHERE problem_id = ?', [problemId]);

                // Remove approvals and content_items if present
                if (contentProblems.length > 0) {
                    const content_item_id = contentProblems[0].content_item_id;
                    await connection.query('DELETE FROM approvals WHERE content_item_id = ?', [content_item_id]);
                    await connection.query('DELETE FROM content_items WHERE content_item_id = ?', [content_item_id]);
                }

                // Child tables cascade on delete from problems (test_cases, problems_have_topics)
                await connection.query('DELETE FROM problems WHERE problem_id = ?', [problemId]);

                await connection.commit();
                connection.release();

                socket.emit('response_delete_question', {
                    success: true,
                    message: 'Question deleted successfully'
                });

            } catch (err) {
                await connection.rollback();
                connection.release();
                throw err;
            }

        } catch (err) {
            console.error('Error in request_delete_question:', err);
            socket.emit('response_delete_question', { success: false, message: 'Server error: ' + err.message });
        }
    });

    // === request submit draft -> move from draft to pending (or approved for elevated) ===
    socket.on('request_submit_draft', async ({ token_session, ProblemID, problem_id }) => {
        try {
            console.log('Submit draft request received on socket', socket.id);

            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_submit_draft', { success: false, message: 'Invalid session' });
                return;
            }

            const isAdmin = await verifyAdmin(session);
            const problemId = ProblemID || problem_id;
            if (!problemId) {
                socket.emit('response_submit_draft', { success: false, message: 'Missing problem id' });
                return;
            }

            // Check ownership if not admin
            if (!isAdmin) {
                const [ownerRows] = await db.query(
                    `
                    SELECT a.requested_by, a.status, a.content_item_id
                    FROM approvals a
                    JOIN content_items ci ON a.content_item_id = ci.content_item_id
                    JOIN content_problems cp ON cp.content_item_id = ci.content_item_id
                    WHERE cp.problem_id = ?
                    LIMIT 1
                    `,
                    [problemId]
                );
                if (ownerRows.length === 0 || ownerRows[0].requested_by !== session.userId) {
                    socket.emit('response_submit_draft', { success: false, message: 'Unauthorized: Only admins or the problem owner may submit draft' });
                    return;
                }
            }

            // Resolve content_item_id
            const [cpRows] = await db.query('SELECT content_item_id FROM content_problems WHERE problem_id = ? LIMIT 1', [problemId]);
            if (cpRows.length === 0) {
                socket.emit('response_submit_draft', { success: false, message: 'Problem link not found' });
                return;
            }
            const contentItemId = cpRows[0].content_item_id;

            // Determine target status
            const targetStatus = isAdmin ? 'approved' : 'pending';
            const approvedBy = isAdmin ? session.userId : null;
            const reason = isAdmin ? 'Auto-approved: Admin submitted draft' : 'Problem awaiting approval';

            await db.query(
                `UPDATE approvals 
                 SET status = ?, approved_by = ?, reason = ?
                 WHERE content_item_id = ?`,
                [targetStatus, approvedBy, reason, contentItemId]
            );

            // For non-admin submitters, also surface this pending
            // change through the faculty_pending_changes pipeline so
            // that faculty dashboards (Approvals > Pending > Problems)
            // can see re-submitted questions just like newly created
            // ones.
            if (!isAdmin && targetStatus === 'pending') {
                try {
                    // Load the current problem snapshot to use as
                    // proposed_data for the faculty_pending_changes row.
                    const [probRows] = await db.query(
                        'SELECT problem_name, description, difficulty, time_limit_seconds, memory_limit_mb, sample_solution FROM problems WHERE problem_id = ? LIMIT 1',
                        [problemId]
                    );

                    if (probRows && probRows.length) {
                        const p = probRows[0];
                        const proposed = {
                            problem_name: p.problem_name,
                            description: p.description,
                            difficulty: p.difficulty,
                            time_limit_seconds: p.time_limit_seconds,
                            memory_limit_mb: p.memory_limit_mb,
                            sample_solution: p.sample_solution
                        };

                        // If a pending faculty change already exists
                        // for this problem, refresh it; otherwise
                        // create a new one.
                        const [existing] = await db.query(
                            `SELECT id FROM faculty_pending_changes
                             WHERE table_name = 'problems'
                               AND record_id = ?
                               AND status = 'pending_faculty_review'
                             LIMIT 1`,
                            [problemId]
                        );

                        if (existing && existing.length) {
                            await db.query(
                                `UPDATE faculty_pending_changes
                                 SET proposed_data = ?, status = 'pending_faculty_review'
                                 WHERE id = ?`,
                                [JSON.stringify(proposed), existing[0].id]
                            );
                        } else {
                            await db.query(
                                `INSERT INTO faculty_pending_changes (
                                      faculty_id, change_type, table_name, record_id, action_type, original_data, proposed_data, status
                                 ) VALUES (?, 'problem', 'problems', ?, 'update', ?, ?, 'pending_faculty_review')`,
                                [
                                    session.userId,
                                    problemId,
                                    null,
                                    JSON.stringify(proposed)
                                ]
                            );
                        }
                    }
                } catch (e) {
                    console.warn('Non-fatal: failed to sync submit_draft to faculty_pending_changes', e && e.message);
                }
            }

            socket.emit('response_submit_draft', { success: true, status: targetStatus, message: targetStatus === 'approved' ? 'Draft approved' : 'Draft submitted for approval' });
        } catch (err) {
            console.error('Error in request_submit_draft:', err);
            socket.emit('response_submit_draft', { success: false, message: 'Server error: ' + err.message });
        }
    });

    // === request move to draft (from approved/pending/denied -> draft) ===
    socket.on('request_move_to_draft', async (payload) => {
        const { token_session, ProblemID, problem_id, SourceCode, TestCases } = payload || {};
        try {
            console.log('Move to draft request received on socket', socket.id);

            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_move_to_draft', { success: false, message: 'Invalid session' });
                return;
            }

            const isAdmin = await verifyAdmin(session);
            const problemId = ProblemID || problem_id;
            if (!problemId) {
                socket.emit('response_move_to_draft', { success: false, message: 'Missing problem id' });
                return;
            }

            // Ownership check if not admin
            if (!isAdmin) {
                const [ownerRows] = await db.query(
                    `
                    SELECT a.requested_by
                    FROM approvals a
                    JOIN content_items ci ON a.content_item_id = ci.content_item_id
                    JOIN content_problems cp ON cp.content_item_id = ci.content_item_id
                    WHERE cp.problem_id = ?
                    LIMIT 1
                    `,
                    [problemId]
                );
                if (ownerRows.length === 0 || ownerRows[0].requested_by !== session.userId) {
                    socket.emit('response_move_to_draft', { success: false, message: 'Unauthorized: Only admins or the problem owner may move to draft' });
                    return;
                }
            }

            // Resolve content item
            const [cpRows] = await db.query('SELECT content_item_id FROM content_problems WHERE problem_id = ? LIMIT 1', [problemId]);
            if (cpRows.length === 0) {
                socket.emit('response_move_to_draft', { success: false, message: 'Problem link not found' });
                return;
            }
            const contentItemId = cpRows[0].content_item_id;
            // If SourceCode or TestCases were provided, persist them to the problems/test_cases tables
            try {
                const pid = ProblemID || problem_id
                if (pid && (typeof SourceCode !== 'undefined' || Array.isArray(TestCases))) {
                    if (typeof SourceCode !== 'undefined') {
                        await db.query('UPDATE problems SET sample_solution = ? WHERE problem_id = ?', [SourceCode || '', pid]);
                    }
                    if (Array.isArray(TestCases)) {
                        // Replace test cases for this problem with provided list
                        await db.query('DELETE FROM test_cases WHERE problem_id = ?', [pid]);
                        for (let i = 0; i < TestCases.length; i++) {
                            const tc = TestCases[i] || {};
                            await db.query(
                                `INSERT INTO test_cases (problem_id, test_case_number, is_sample, input_data, expected_output, score)
                                 VALUES (?, ?, ?, ?, ?, ?)` ,
                                [pid, tc.TestCaseNumber || (i + 1), tc.IsSample ? 1 : 0, tc.InputData || '', tc.ExpectedOutput || '', tc.Score || 0]
                            );
                        }
                    }
                }
            } catch (e) {
                console.error('Non-fatal: failed to persist payload data while moving to draft', e);
            }

            // Update approvals status to draft
            await db.query(
                `UPDATE approvals
                 SET status = 'draft', approved_by = NULL, reason = 'Draft - in progress'
                 WHERE content_item_id = ?`,
                [contentItemId]
            );

            // Also ensure any faculty_pending_changes entries for
            // this problem are no longer treated as "pending" so
            // that saving as draft hides the question from all
            // faculty/admin pending-approvals views.
            try {
                await db.query(
                    `UPDATE faculty_pending_changes
                     SET status = 'draft'
                     WHERE table_name = 'problems'
                       AND record_id = ?
                       AND status IN ('pending_faculty_review', 'pending_admin')`,
                    [problemId]
                );
            } catch (e) {
                console.warn('Non-fatal: failed to sync move_to_draft to faculty_pending_changes', e && e.message);
            }

            socket.emit('response_move_to_draft', { success: true, message: 'Question moved to draft', status: 'draft' });
        } catch (err) {
            console.error('Error in request_move_to_draft:', err);
            socket.emit('response_move_to_draft', { success: false, message: 'Server error: ' + err.message });
        }
    });

    // === request move to pending (remove current approval state and set to pending) ===
    socket.on('request_move_to_pending', async (payload) => {
        const { token_session, ProblemID, problem_id, SourceCode, TestCases } = payload || {};
        try {
            console.log('Move to pending request received on socket', socket.id);

            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_move_to_pending', { success: false, message: 'Invalid session' });
                return;
            }

            const isAdmin = await verifyAdmin(session);
            const problemId = ProblemID || problem_id;
            if (!problemId) {
                socket.emit('response_move_to_pending', { success: false, message: 'Missing problem id' });
                return;
            }

            // Ownership check if not admin
            if (!isAdmin) {
                const [ownerRows] = await db.query(
                    `
                    SELECT a.requested_by
                    FROM approvals a
                    JOIN content_items ci ON a.content_item_id = ci.content_item_id
                    JOIN content_problems cp ON cp.content_item_id = ci.content_item_id
                    WHERE cp.problem_id = ?
                    LIMIT 1
                    `,
                    [problemId]
                );
                if (ownerRows.length === 0 || ownerRows[0].requested_by !== session.userId) {
                    socket.emit('response_move_to_pending', { success: false, message: 'Unauthorized: Only admins or the problem owner may move to pending' });
                    return;
                }
            }

            // Resolve content item
            const [cpRows] = await db.query('SELECT content_item_id FROM content_problems WHERE problem_id = ? LIMIT 1', [problemId]);
            if (cpRows.length === 0) {
                socket.emit('response_move_to_pending', { success: false, message: 'Problem link not found' });
                return;
            }
            const contentItemId = cpRows[0].content_item_id;

            // If SourceCode or TestCases were provided, persist them to the problems/test_cases tables
            try {
                const pid = ProblemID || problem_id
                if (pid && (typeof SourceCode !== 'undefined' || Array.isArray(TestCases))) {
                    if (typeof SourceCode !== 'undefined') {
                        await db.query('UPDATE problems SET sample_solution = ? WHERE problem_id = ?', [SourceCode || '', pid]);
                    }
                    if (Array.isArray(TestCases)) {
                        await db.query('DELETE FROM test_cases WHERE problem_id = ?', [pid]);
                        for (let i = 0; i < TestCases.length; i++) {
                            const tc = TestCases[i] || {};
                            await db.query(
                                `INSERT INTO test_cases (problem_id, test_case_number, is_sample, input_data, expected_output, score)
                                 VALUES (?, ?, ?, ?, ?, ?)` ,
                                [pid, tc.TestCaseNumber || (i + 1), tc.IsSample ? 1 : 0, tc.InputData || '', tc.ExpectedOutput || '', tc.Score || 0]
                            );
                        }
                    }
                }
            } catch (e) {
                console.error('Non-fatal: failed to persist payload data while moving to pending', e);
            }

            await db.query(
                `UPDATE approvals
                 SET status = 'pending', approved_by = NULL, reason = 'Problem awaiting approval'
                 WHERE content_item_id = ?`,
                [contentItemId]
            );

            // For non-admin owners, mirror this transition into
            // faculty_pending_changes so that other faculty see the
            // updated problem under Approvals > Pending > Problems.
            if (!isAdmin) {
                try {
                    const [probRows] = await db.query(
                        'SELECT problem_name, description, difficulty, time_limit_seconds, memory_limit_mb, sample_solution FROM problems WHERE problem_id = ? LIMIT 1',
                        [problemId]
                    );

                    if (probRows && probRows.length) {
                        const p = probRows[0];
                        const proposed = {
                            problem_name: p.problem_name,
                            description: p.description,
                            difficulty: p.difficulty,
                            time_limit_seconds: p.time_limit_seconds,
                            memory_limit_mb: p.memory_limit_mb,
                            sample_solution: p.sample_solution
                        };

                        const [existing] = await db.query(
                            `SELECT id FROM faculty_pending_changes
                             WHERE table_name = 'problems'
                               AND record_id = ?
                               AND status = 'pending_faculty_review'
                             LIMIT 1`,
                            [problemId]
                        );

                        if (existing && existing.length) {
                            await db.query(
                                `UPDATE faculty_pending_changes
                                 SET proposed_data = ?, status = 'pending_faculty_review'
                                 WHERE id = ?`,
                                [JSON.stringify(proposed), existing[0].id]
                            );
                        } else {
                            await db.query(
                                `INSERT INTO faculty_pending_changes (
                                      faculty_id, change_type, table_name, record_id, action_type, original_data, proposed_data, status
                                 ) VALUES (?, 'problem', 'problems', ?, 'update', ?, ?, 'pending_faculty_review')`,
                                [
                                    session.userId,
                                    problemId,
                                    null,
                                    JSON.stringify(proposed)
                                ]
                            );
                        }
                    }
                } catch (e) {
                    console.warn('Non-fatal: failed to sync move_to_pending to faculty_pending_changes', e && e.message);
                }
            }

            socket.emit('response_move_to_pending', { success: true, message: 'Question moved to pending' });
        } catch (err) {
            console.error('Error in request_move_to_pending:', err);
            socket.emit('response_move_to_pending', { success: false, message: 'Server error: ' + err.message });
        }
    });

    // request_update_question moved to create_question_modal_socket.js

    // === request approve question ===
    socket.on('request_approve_question', async ({ token_session, question_id, approval_id }) => {
        try {
            console.log('Approve question request received on socket', socket.id);

            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_approve_question', { success: false, message: 'Invalid session' });
                return;
            }

            const canApprove = await hasPermission(session.userId, 'problem.approvals.manage');
            if (!canApprove) {
                socket.emit('response_approve_question', { success: false, message: 'Unauthorized: You do not have permission to approve problems' });
                return;
            }

            const connection = await db.getConnection();
            await connection.beginTransaction();

            try {
                await connection.query(
                    `UPDATE approvals 
                     SET status = 'approved', approved_by = ?
                     WHERE approval_id = ?`,
                    [session.userId, approval_id]
                );

                        // find the requester to notify
                        try {
                            const [reqRows] = await db.query('SELECT requested_by, content_item_id FROM approvals WHERE approval_id = ?', [approval_id]);
                            const requester = reqRows && reqRows.length ? reqRows[0].requested_by : null;

                            // If this approval came from a faculty change, mark any
                            // related faculty_pending_changes rows as committed so
                            // no additional Level 2 confirmation is required.
                            try {
                                const [ciRows] = await db.query(
                                    `SELECT cp.problem_id
                                     FROM content_items ci
                                     JOIN content_problems cp ON ci.content_item_id = cp.content_item_id
                                     WHERE ci.content_item_id = ?
                                     LIMIT 1`,
                                    [reqRows && reqRows[0] ? reqRows[0].content_item_id : null]
                                );
                                const probId = ciRows && ciRows.length ? ciRows[0].problem_id : null;
                                if (probId) {
                                    await db.query(
                                        `UPDATE faculty_pending_changes
                                         SET status = 'committed', admin_reviewer_id = ?, admin_review_date = NOW(), admin_review_comment = 'Approved via admin pending questions'
                                         WHERE table_name = 'problems' AND change_type = 'problem' AND record_id = ? AND status IN ('pending_admin','pending_faculty_review')`,
                                        [session.userId, probId]
                                    );
                                }
                            } catch (e) {
                                console.warn('Failed to sync faculty_pending_changes on approve_question:', e && e.message);
                            }

                            await connection.commit();
                            connection.release();

                            // create a notification for requester
                            if (requester) {
                                try {
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
                                        // Emit a toast-like approval event
                                        try { if (sids && sids.size) sids.forEach((sid) => { const sock = io.sockets.sockets.get(sid); if (sock) sock.emit('approval_approved', { message: message, approval_id, question_id }); }); } catch (e) {}
                                    }
                                } catch (e) {
                                    console.warn('Failed to create/emit approval notification:', e);
                                }
                            }

                            socket.emit('response_approve_question', {
                                success: true,
                                message: 'Question approved successfully'
                            });
                        } catch (e) {
                            await connection.rollback();
                            connection.release();
                            throw e;
                        }

            } catch (err) {
                await connection.rollback();
                connection.release();
                throw err;
            }

        } catch (err) {
            console.error('Error in request_approve_question:', err);
            socket.emit('response_approve_question', { success: false, message: 'Server error: ' + err.message });
        }
    });

    // === request deny question ===
    socket.on('request_deny_question', async ({ token_session, question_id, approval_id, reason }) => {
        try {
            console.log('Deny question request received on socket', socket.id);

            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_deny_question', { success: false, message: 'Invalid session' });
                return;
            }

            const canDeny = await hasPermission(session.userId, 'problem.approvals.manage');
            if (!canDeny) {
                socket.emit('response_deny_question', { success: false, message: 'Unauthorized: You do not have permission to deny problems' });
                return;
            }

            const connection = await db.getConnection();
            await connection.beginTransaction();

            try {
                    await connection.query(
                    `UPDATE approvals 
                     SET status = 'denied', approved_by = ?, reason = ?
                     WHERE approval_id = ?`,
                    [session.userId, reason || 'No reason provided', approval_id]
                );

                try {
                    const [reqRows] = await db.query('SELECT requested_by, content_item_id FROM approvals WHERE approval_id = ?', [approval_id]);
                    const requester = reqRows && reqRows.length ? reqRows[0].requested_by : null;

                    // If this denial corresponds to a faculty change, mark any
                    // matching faculty_pending_changes rows as rejected so that
                    // no further Level 1/Level 2 confirmations are needed.
                    try {
                        const [ciRows] = await db.query(
                            `SELECT cp.problem_id
                             FROM content_items ci
                             JOIN content_problems cp ON ci.content_item_id = cp.content_item_id
                             WHERE ci.content_item_id = ?
                             LIMIT 1`,
                            [reqRows && reqRows[0] ? reqRows[0].content_item_id : null]
                        );
                        const probId = ciRows && ciRows.length ? ciRows[0].problem_id : null;
                        if (probId) {
                            await db.query(
                                `UPDATE faculty_pending_changes
                                 SET status = 'rejected', admin_reviewer_id = ?, admin_review_date = NOW(), admin_review_comment = ?
                                 WHERE table_name = 'problems' AND change_type = 'problem' AND record_id = ? AND status IN ('pending_admin','pending_faculty_review')`,
                                [session.userId, reason || 'Denied via admin pending questions', probId]
                            );
                        }
                    } catch (e) {
                        console.warn('Failed to sync faculty_pending_changes on deny_question:', e && e.message);
                    }

                    await connection.commit();
                    connection.release();

                    // create a notification for requester
                    if (requester) {
                        try {
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
                                // Emit denial toast event (client listens for 'approval_denied')
                                try { if (sids && sids.size) sids.forEach((sid) => { const sock = io.sockets.sockets.get(sid); if (sock) sock.emit('approval_denied', { message: messageToUser, approval_id, question_id }); }); } catch (e) {}
                            }
                        } catch (e) {
                            console.warn('Failed to create/emit denial notification:', e);
                        }
                    }

                    socket.emit('response_deny_question', {
                        success: true,
                        message: 'Question denied successfully'
                    });
                } catch (e) {
                    await connection.rollback();
                    connection.release();
                    throw e;
                }

            } catch (err) {
                await connection.rollback();
                connection.release();
                throw err;
            }

        } catch (err) {
            console.error('Error in request_deny_question:', err);
            socket.emit('response_deny_question', { success: false, message: 'Server error: ' + err.message });
        }
    });

    // === Get Pending Approvals (admin only) ===
    socket.on('request_get_pending_approvals', async ({ token_session }) => {
        try {
            console.log('Get pending approvals request', { socketId: socket.id });

            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_get_pending_approvals', { success: false, message: 'Invalid session' });
                return;
            }

            const isAdmin = await verifyAdmin(session);
            if (!isAdmin) {
                socket.emit('response_get_pending_approvals', { success: false, message: 'Unauthorized: Admin access required' });
                return;
            }

            // Get pending events
            const [pendingEvents] = await db.query(`
                SELECT 
                    a.approval_id,
                    a.content_item_id,
                    ci.content_type,
                    e.event_id,
                    e.event_name,
                    e.thumbnail_url AS event_thumbnail,
                    u.username AS event_host,
                    e.created_at AS event_date,
                    COALESCE((SELECT COUNT(*) FROM event_participants WHERE event_id = e.event_id), 0) AS event_players,
                    a.requested_at,
                    a.status,
                    a.reason
                FROM approvals a
                JOIN content_items ci ON a.content_item_id = ci.content_item_id
                JOIN content_events ce ON ci.content_item_id = ce.content_item_id
                JOIN events e ON ce.event_id = e.event_id
                JOIN users u ON e.host_id = u.user_id
                WHERE a.status = 'pending' AND ci.content_type = 'event'
                ORDER BY a.requested_at DESC
            `);

            // Get pending blogs
            const [pendingBlogs] = await db.query(`
                SELECT 
                    a.approval_id,
                    a.content_item_id,
                    ci.content_type,
                    b.blog_id,
                    b.title AS blog_title,
                    b.thumbnail_url AS blog_thumbnail,
                    b.content AS blog_content,
                    u.username AS blog_author,
                    b.published_at AS blog_date,
                    'blog' AS blog_content_type,
                    a.requested_at,
                    a.status,
                    a.reason
                FROM approvals a
                JOIN content_items ci ON a.content_item_id = ci.content_item_id
                JOIN content_blogs cb ON ci.content_item_id = cb.content_item_id
                JOIN blogs b ON cb.blog_id = b.blog_id
                JOIN users u ON b.author_id = u.user_id
                WHERE a.status = 'pending' AND ci.content_type = 'blog'
                ORDER BY a.requested_at DESC
            `);

            // Get pending problems
            const [pendingProblems] = await db.query(`
                SELECT 
                    a.approval_id,
                    a.content_item_id,
                    ci.content_type,
                    p.problem_id,
                    p.problem_name AS question_name,
                    p.difficulty AS question_difficulty,
                    p.description AS question_description,
                    p.time_limit_seconds AS question_time_limit,
                    p.memory_limit_mb AS question_memory_limit,
                    u.username AS author_username,
                    a.requested_at,
                    a.status,
                    a.reason
                FROM approvals a
                JOIN content_items ci ON a.content_item_id = ci.content_item_id
                JOIN content_problems cp ON ci.content_item_id = cp.content_item_id
                JOIN problems p ON cp.problem_id = p.problem_id
                JOIN users u ON a.requested_by = u.user_id
                WHERE a.status = 'pending' AND ci.content_type = 'problem'
                ORDER BY a.requested_at DESC
            `);

            socket.emit('response_get_pending_approvals', {
                success: true,
                events: pendingEvents,
                blogs: pendingBlogs,
                problems: pendingProblems
            });

        } catch (err) {
            console.error('Error in request_get_pending_approvals:', err);
            socket.emit('response_get_pending_approvals', { success: false, message: 'Server error: ' + err.message });
        }
    });

    // === Get Approved Approvals (admin only) ===
    socket.on('request_get_approved_approvals', async ({ token_session }) => {
        try {
            console.log('Get approved approvals request', { socketId: socket.id });

            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_get_approved_approvals', { success: false, message: 'Invalid session' });
                return;
            }

            const isAdmin = await verifyAdmin(session);
            if (!isAdmin) {
                socket.emit('response_get_approved_approvals', { success: false, message: 'Unauthorized: Admin access required' });
                return;
            }

            // Get approved events
            const [approvedEvents] = await db.query(`
                SELECT 
                    a.approval_id,
                    a.content_item_id,
                    ci.content_type,
                    e.event_id,
                    e.event_name,
                    e.thumbnail_url AS event_thumbnail,
                    u.username AS event_host,
                    e.created_at AS event_date,
                    COALESCE((SELECT COUNT(*) FROM event_participants WHERE event_id = e.event_id), 0) AS event_players,
                    a.updated_at AS approved_at,
                    a.status,
                    a.reason
                FROM approvals a
                JOIN content_items ci ON a.content_item_id = ci.content_item_id
                JOIN content_events ce ON ci.content_item_id = ce.content_item_id
                JOIN events e ON ce.event_id = e.event_id
                JOIN users u ON e.host_id = u.user_id
                WHERE a.status = 'approved' AND ci.content_type = 'event'
                ORDER BY a.updated_at DESC
            `);

            // Get approved blogs
            const [approvedBlogs] = await db.query(`
                SELECT 
                    a.approval_id,
                    a.content_item_id,
                    ci.content_type,
                    b.blog_id,
                    b.title AS blog_title,
                    b.thumbnail_url AS blog_thumbnail,
                    b.content AS blog_content,
                    u.username AS blog_author,
                    b.published_at AS blog_date,
                    'blog' AS blog_content_type,
                    a.updated_at AS approved_at,
                    a.status,
                    a.reason
                FROM approvals a
                JOIN content_items ci ON a.content_item_id = ci.content_item_id
                JOIN content_blogs cb ON ci.content_item_id = cb.content_item_id
                JOIN blogs b ON cb.blog_id = b.blog_id
                JOIN users u ON b.author_id = u.user_id
                WHERE a.status = 'approved' AND ci.content_type = 'blog'
                ORDER BY a.updated_at DESC
            `);

            // Get approved problems
            const [approvedProblems] = await db.query(`
                SELECT 
                    a.approval_id,
                    a.content_item_id,
                    ci.content_type,
                    p.problem_id,
                    p.problem_name AS question_name,
                    p.difficulty AS question_difficulty,
                    p.description AS question_description,
                    p.time_limit_seconds AS question_time_limit,
                    p.memory_limit_mb AS question_memory_limit,
                    u.username AS author_username,
                    a.updated_at AS approved_at,
                    a.status,
                    a.reason
                FROM approvals a
                JOIN content_items ci ON a.content_item_id = ci.content_item_id
                JOIN content_problems cp ON ci.content_item_id = cp.content_item_id
                JOIN problems p ON cp.problem_id = p.problem_id
                JOIN users u ON a.requested_by = u.user_id
                WHERE a.status = 'approved' AND ci.content_type = 'problem'
                ORDER BY a.updated_at DESC
            `);

            socket.emit('response_get_approved_approvals', {
                success: true,
                events: approvedEvents,
                blogs: approvedBlogs,
                problems: approvedProblems
            });

        } catch (err) {
            console.error('Error in request_get_approved_approvals:', err);
            socket.emit('response_get_approved_approvals', { success: false, message: 'Server error: ' + err.message });
        }
    });

    // === GET DRAFT QUESTIONS: Fetch all draft questions (admin only) ===
    // Returns all questions with status='draft' from all users for admin review
    socket.on('request_get_draft_questions', async ({ token_session }) => {
        try {
            console.log('Get draft questions request', { socketId: socket.id });

            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_get_draft_questions', { success: false, message: 'Invalid session' });
                return;
            }

            const isAdmin = await verifyAdmin(session);
            if (!isAdmin) {
                socket.emit('response_get_draft_questions', { success: false, message: 'Unauthorized: Admin access required' });
                return;
            }

            // Get all draft questions from all users
            const [draftQuestions] = await db.query(`
                SELECT 
                    a.approval_id,
                    a.content_item_id,
                    ci.content_type,
                    p.problem_id,
                    p.problem_name AS question_name,
                    p.difficulty AS question_difficulty,
                    p.description AS question_description,
                    u.username AS author_username,
                    ci.created_at,
                    a.status
                FROM approvals a
                JOIN content_items ci ON a.content_item_id = ci.content_item_id
                JOIN content_problems cp ON ci.content_item_id = cp.content_item_id
                JOIN problems p ON cp.problem_id = p.problem_id
                JOIN users u ON a.requested_by = u.user_id
                WHERE a.status = 'draft' AND ci.content_type = 'problem'
                ORDER BY ci.created_at DESC
            `);

            socket.emit('response_get_draft_questions', {
                success: true,
                questions: draftQuestions
            });

        } catch (err) {
            console.error('Error in request_get_draft_questions:', err);
            socket.emit('response_get_draft_questions', { success: false, message: 'Server error: ' + err.message });
        }
    });

    // === Approve Item (admin only) ===
    // Generic approval entry point used by the Approvals tab and
    // notification helpers. Mirrors the per-type approve handlers
    // (request_approve_event, request_approve_blog, etc.) so that
    // underlying content tables and faculty_pending_changes stay
    // in sync when items are approved here.
    socket.on('request_approve_item', async ({ token_session, approval_id, content_type }) => {
        try {
            console.log('Approve item request', { socketId: socket.id, approval_id, content_type });

            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_approve_item', { success: false, message: 'Invalid session' });
                return;
            }

            const isAdmin = await verifyAdmin(session);
            if (!isAdmin) {
                socket.emit('response_approve_item', { success: false, message: 'Unauthorized: Admin access required' });
                return;
            }

            if (!approval_id || !content_type) {
                socket.emit('response_approve_item', { success: false, message: 'approval_id and content_type are required' });
                return;
            }

            const connection = await db.getConnection();
            await connection.beginTransaction();

            try {
                // Update approval status
                await connection.query(
                    `UPDATE approvals 
                     SET status = 'approved', approved_by = ?
                     WHERE approval_id = ?`,
                    [session.userId, approval_id]
                );

                // Get content_item_id and requester to update specific content table and notify owner
                const [approval] = await connection.query(
                    `SELECT a.content_item_id, ci.content_type, a.requested_by 
                     FROM approvals a
                     JOIN content_items ci ON a.content_item_id = ci.content_item_id
                     WHERE a.approval_id = ?`,
                    [approval_id]
                );

                if (approval.length > 0) {
                    const { content_item_id, content_type: dbContentType } = approval[0];

                    // Update the status in the corresponding content table
                    if (dbContentType === 'event') {
                        const [eventData] = await connection.query(
                            `SELECT event_id FROM content_events WHERE content_item_id = ?`,
                            [content_item_id]
                        );
                        if (eventData.length > 0) {
                            const eventId = eventData[0].event_id;
                            // Align with request_approve_event: mark event as approved
                            await connection.query(
                                `UPDATE events SET status = 'approved' WHERE event_id = ?`,
                                [eventId]
                            );

                            // If this event originated from the faculty
                            // pipeline, mark the corresponding
                            // faculty_pending_changes entry as committed so
                            // faculty dashboards no longer see it as pending.
                            await connection.query(
                                `UPDATE faculty_pending_changes
                                 SET status = 'committed', admin_reviewer_id = ?, admin_review_date = NOW(),
                                     admin_review_comment = COALESCE(admin_review_comment, 'Approved via admin approvals tab')
                                 WHERE table_name = 'events'
                                   AND change_type = 'event'
                                   AND record_id = ?
                                   AND status IN ('pending_faculty_review','pending_admin')`,
                                [session.userId, eventId]
                            );
                        }
                    } else if (dbContentType === 'blog') {
                        const [blogData] = await connection.query(
                            `SELECT blog_id FROM content_blogs WHERE content_item_id = ?`,
                            [content_item_id]
                        );
                        if (blogData.length > 0) {
                            const blogId = blogData[0].blog_id;
                            await connection.query(
                                `UPDATE blogs SET status = 'approved' WHERE blog_id = ?`,
                                [blogId]
                            );

                            // Mirror the commit into faculty_pending_changes
                            // for blogs when they came from the faculty
                            // dashboard pipeline.
                            await connection.query(
                                `UPDATE faculty_pending_changes
                                 SET status = 'committed', admin_reviewer_id = ?, admin_review_date = NOW(),
                                     admin_review_comment = COALESCE(admin_review_comment, 'Approved via admin approvals tab')
                                 WHERE table_name = 'blogs'
                                   AND change_type = 'blog'
                                   AND record_id = ?
                                   AND status IN ('pending_faculty_review','pending_admin')`,
                                [session.userId, blogId]
                            );
                        }
                    } else if (dbContentType === 'problem') {
                        const [problemData] = await connection.query(
                            `SELECT problem_id FROM content_problems WHERE content_item_id = ?`,
                            [content_item_id]
                        );
                        if (problemData.length > 0) {
                            const problemId = problemData[0].problem_id;
                            // Problems table doesn't have a status field, but
                            // we still want to mirror the approval into
                            // faculty_pending_changes so faculty dashboards
                            // stop treating this question as pending when it
                            // was approved from the Approvals tab.
                            try {
                                await connection.query(
                                    `UPDATE faculty_pending_changes
                                     SET status = 'committed', admin_reviewer_id = ?, admin_review_date = NOW(),
                                         admin_review_comment = COALESCE(admin_review_comment, 'Approved via admin approvals tab')
                                     WHERE table_name = 'problems'
                                       AND change_type = 'problem'
                                       AND record_id = ?
                                       AND status IN ('pending_faculty_review','pending_admin')`,
                                    [session.userId, problemId]
                                );
                            } catch (e) {
                                console.warn('request_approve_item: failed to sync faculty_pending_changes for problem', problemId, e && e.message);
                            }
                        }
                    }
                }

                await connection.commit();
                connection.release();

                // create a persisted notification for the requester and emit real-time events
                try {
                    if (approval && approval.length > 0 && approval[0].requested_by) {
                        const requester = approval[0].requested_by;
                        const title = 'Submission Approved';
                        const message = `Your submission has been approved by an admin.`;
                        const [ins] = await db.query('INSERT INTO notifications (user_id, type, title, message, data, link, is_read) VALUES (?, ?, ?, ?, ?, ?, 0)', [requester, 'item_approved', title, message, JSON.stringify({ approval_id, content_type: approval[0].content_type }), null]);
                        const [nrows] = await db.query('SELECT * FROM notifications WHERE id = ?', [ins.insertId]);
                        const newNotif = nrows && nrows.length ? nrows[0] : null;
                        if (newNotif) {
                            // emit unified notification and specific approval event including notification id
                            const socketsMap = socket.server && socket.server.sockets && socket.server.sockets.sockets;
                            if (socketsMap && socketsMap.size) {
                                for (const [sid, s] of socketsMap) {
                                    try {
                                        const sidUser = s.user && (s.user.userId || s.user.id || s.user.user_id);
                                        if (sidUser && Number(sidUser) === Number(requester)) {
                                            try { s.emit('notification', newNotif); } catch (e) {}
                                            try { s.emit('approval_approved', { message, approval_id, content_type: approval[0].content_type, notification_id: newNotif.id }); } catch (e) {}
                                        }
                                    } catch (e) {}
                                }
                            }
                        }
                    }
                } catch (emitErr) {
                    console.warn('approve_item notification emit failed', emitErr);
                }

                socket.emit('response_approve_item', {
                    success: true,
                    message: 'Item approved successfully'
                });

            } catch (err) {
                await connection.rollback();
                connection.release();
                throw err;
            }

        } catch (err) {
            console.error('Error in request_approve_item:', err);
            socket.emit('response_approve_item', { success: false, message: 'Server error: ' + err.message });
        }
    });

    // === Deny Item (admin only) ===
    // Generic denial entry point used by the Approvals tab and
    // notification helpers. Mirrors the per-type deny handlers
    // (request_deny_event, request_deny_blog, etc.) so that
    // underlying content tables and faculty_pending_changes stay
    // in sync when items are denied here.
    socket.on('request_deny_item', async ({ token_session, approval_id, content_type, reason }) => {
        try {
            console.log('Deny item request', { socketId: socket.id, approval_id, content_type });

            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_deny_item', { success: false, message: 'Invalid session' });
                return;
            }

            const isAdmin = await verifyAdmin(session);
            if (!isAdmin) {
                socket.emit('response_deny_item', { success: false, message: 'Unauthorized: Admin access required' });
                return;
            }

            if (!approval_id || !content_type) {
                socket.emit('response_deny_item', { success: false, message: 'approval_id and content_type are required' });
                return;
            }

            const connection = await db.getConnection();
            await connection.beginTransaction();

            // Track ids for post-commit broadcasts
            let eventIdForBroadcast = null;
            let blogIdForBroadcast = null;

            try {
                // Update approval status
                await connection.query(
                    `UPDATE approvals 
                     SET status = 'denied', approved_by = ?, reason = ?
                     WHERE approval_id = ?`,
                    [session.userId, reason || 'No reason provided', approval_id]
                );

                // Get content_item_id and requester to update the specific content table and notify owner
                const [approval] = await connection.query(
                    `SELECT a.content_item_id, ci.content_type, a.requested_by 
                     FROM approvals a
                     JOIN content_items ci ON a.content_item_id = ci.content_item_id
                     WHERE a.approval_id = ?`,
                    [approval_id]
                );

                if (approval.length > 0) {
                    const { content_item_id, content_type: dbContentType } = approval[0];

                    // Update the status in the corresponding content table
                    if (dbContentType === 'event') {
                        const [eventData] = await connection.query(
                            `SELECT event_id FROM content_events WHERE content_item_id = ?`,
                            [content_item_id]
                        );
                        if (eventData.length > 0) {
                            const eventId = eventData[0].event_id;
                            await connection.query(
                                `UPDATE events SET status = 'denied' WHERE event_id = ?`,
                                [eventId]
                            );

                            // Mirror the denial into any corresponding
                            // faculty_pending_changes rows for events so that
                            // faculty dashboards stop treating the item as
                            // pending after an admin denies it here.
                            try {
                                await connection.query(
                                    `UPDATE faculty_pending_changes
                                     SET status = 'rejected', admin_reviewer_id = ?, admin_review_date = NOW(),
                                         admin_review_comment = ?
                                     WHERE table_name = 'events'
                                       AND change_type = 'event'
                                       AND record_id = ?
                                       AND status IN ('pending_faculty_review','pending_admin')`,
                                    [session.userId, reason || 'Denied in admin approvals tab', eventId]
                                );
                            } catch (e) {
                                console.warn('request_deny_item: failed to sync faculty_pending_changes for event', eventId, e && e.message);
                            }

                            eventIdForBroadcast = eventId;
                        }
                    } else if (dbContentType === 'blog') {
                        const [blogData] = await connection.query(
                            `SELECT blog_id FROM content_blogs WHERE content_item_id = ?`,
                            [content_item_id]
                        );
                        if (blogData.length > 0) {
                            const blogId = blogData[0].blog_id;
                            await connection.query(
                                `UPDATE blogs SET status = 'denied' WHERE blog_id = ?`,
                                [blogId]
                            );

                            // Mirror the denial into any corresponding
                            // faculty_pending_changes rows for blogs so the
                            // faculty side no longer shows them as pending.
                            try {
                                await connection.query(
                                    `UPDATE faculty_pending_changes
                                     SET status = 'rejected', admin_reviewer_id = ?, admin_review_date = NOW(),
                                         admin_review_comment = ?
                                     WHERE table_name = 'blogs'
                                       AND change_type = 'blog'
                                       AND record_id = ?
                                       AND status IN ('pending_faculty_review','pending_admin')`,
                                    [session.userId, reason || 'Denied in admin approvals tab', blogId]
                                );
                            } catch (e) {
                                console.warn('request_deny_item: failed to sync faculty_pending_changes for blog', blogId, e && e.message);
                            }

                            blogIdForBroadcast = blogId;
                        }
                    } else if (dbContentType === 'problem') {
                        const [problemData] = await connection.query(
                            `SELECT problem_id FROM content_problems WHERE content_item_id = ?`,
                            [content_item_id]
                        );
                        if (problemData.length > 0) {
                            const problemId = problemData[0].problem_id;
                            // Problems table doesn't have a status field, but
                            // we still want to mirror the denial into
                            // faculty_pending_changes so faculty dashboards
                            // stop treating this question as pending when it
                            // was denied from the Approvals tab.
                            try {
                                await connection.query(
                                    `UPDATE faculty_pending_changes
                                     SET status = 'rejected', admin_reviewer_id = ?, admin_review_date = NOW(),
                                         admin_review_comment = ?
                                     WHERE table_name = 'problems'
                                       AND change_type = 'problem'
                                       AND record_id = ?
                                       AND status IN ('pending_faculty_review','pending_admin')`,
                                    [session.userId, reason || 'Denied in admin approvals tab', problemId]
                                );
                            } catch (e) {
                                console.warn('request_deny_item: failed to sync faculty_pending_changes for problem', problemId, e && e.message);
                            }
                        }
                    }
                }

                await connection.commit();
                connection.release();

                socket.emit('response_deny_item', {
                    success: true,
                    message: 'Item denied successfully'
                });

                // Broadcast to other dashboards so that both admin and
                // faculty views can refresh their pending queues without a
                // full reload.
                try {
                    if (eventIdForBroadcast) {
                        socket.broadcast.emit('approval_event_denied', {
                            event_id: eventIdForBroadcast,
                            approval_id
                        });
                    }
                    if (blogIdForBroadcast) {
                        socket.broadcast.emit('approval_blog_denied', {
                            blog_id: blogIdForBroadcast,
                            approval_id
                        });
                    }
                } catch (e) {}

                // Persist a notification for the owner and emit real-time events
                try {
                    if (approval && approval.length > 0 && approval[0].requested_by) {
                        const ownerId = approval[0].requested_by;
                        let title = null;
                        if (approval[0].content_type === 'problem') {
                            const [p] = await db.query(
                                `SELECT p.problem_name FROM content_problems cp JOIN problems p ON cp.problem_id = p.problem_id WHERE cp.content_item_id = ? LIMIT 1`,
                                [approval[0].content_item_id]
                            );
                            if (p && p.length > 0) title = p[0].problem_name;
                        }

                        const messageToUser = `Your submission${title ? ` "${title}"` : ''} was denied. ${reason || ''}`.trim();
                        const [ins] = await db.query('INSERT INTO notifications (user_id, type, title, message, data, link, is_read) VALUES (?, ?, ?, ?, ?, ?, 0)', [ownerId, 'item_denied', title || 'Your submission', messageToUser, JSON.stringify({ approval_id, content_type: approval[0].content_type }), null]);
                        const [nrows] = await db.query('SELECT * FROM notifications WHERE id = ?', [ins.insertId]);
                        const newNotif = nrows && nrows.length ? nrows[0] : null;
                        if (newNotif) {
                            const socketsMap = socket.server && socket.server.sockets && socket.server.sockets.sockets;
                            if (socketsMap && socketsMap.size) {
                                for (const [sid, s] of socketsMap) {
                                    try {
                                        const sidUser = s.user && (s.user.userId || s.user.id || s.user.user_id);
                                        if (sidUser && Number(sidUser) === Number(ownerId)) {
                                            try { s.emit('notification', newNotif); } catch (e) {}
                                            try { s.emit('approval_denied', { message: messageToUser, approval_id, content_type: approval[0].content_type, notification_id: newNotif.id }); } catch (e) {}
                                        }
                                    } catch (e) {}
                                }
                            }
                        }
                    }
                } catch (emitErr) {
                    console.warn('deny_item notification emit failed', emitErr);
                }

            } catch (err) {
                await connection.rollback();
                connection.release();
                throw err;
            }

        } catch (err) {
            console.error('Error in request_deny_item:', err);
            socket.emit('response_deny_item', { success: false, message: 'Server error: ' + err.message });
        }
    });

    // (debug endpoint removed)
}

// helper: map permission name to category (for admin and user list modal in admin dashboard)
function deriveCategory(name) {
    if (!name) return 'basic';
    const n = name.toLowerCase();
    if (n.includes('blog')) return 'blog';
    if (n.includes('event')) return 'event';
    if (n.includes('question')) return 'question set';
    if (n.includes('approval')) return 'manage approvals';
    if (n.includes('role')) return 'manage roles';
    return 'basic';
}

// to work ES module of this function (see server.js since you cant use both import and require at the same time.) 
module.exports = { dashboardAdminAndUserSocket };

