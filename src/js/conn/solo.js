// === Solo question selection (non-admin) ===
// Provides approved question listing and basic problem detail retrieval for solo play

function soloSocket(socket, db, bcrypt, jwt) {
    // Verify token against JWT and active_sessions
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
        } catch (err) {
            console.error('[solo] verifySession error:', err);
            return null;
        }
    }

    // Combine admin/faculty/user approved problems for solo play
    socket.on('request_get_solo_questions', async ({ token_session }) => {
        try {
            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_get_solo_questions', { success: false, message: 'Invalid session', questions: [] });
                return;
            }

            const [rows] = await db.query(
                `
                SELECT
                    p.problem_id,
                    p.problem_name,
                    p.difficulty,
                    ci.created_at,
                    COALESCE(prof.full_name, u.username) AS creator_name,
                    COALESCE(pup.progress, 'untouch') AS progress_status,
                    GROUP_CONCAT(DISTINCT pt.topic_name ORDER BY pt.topic_name SEPARATOR ', ') AS topics_text
                FROM problems p
                JOIN content_problems cp ON p.problem_id = cp.problem_id
                JOIN content_items ci ON cp.content_item_id = ci.content_item_id
                JOIN approvals a ON ci.content_item_id = a.content_item_id
                JOIN users u ON a.requested_by = u.user_id
                LEFT JOIN user_roles ur ON u.user_id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.role_id
                LEFT JOIN profiles prof ON u.user_id = prof.user_id
                LEFT JOIN problem_user_progression pup ON p.problem_id = pup.problem_id AND pup.user_id = ?
                LEFT JOIN problems_have_topics pht ON p.problem_id = pht.problem_id
                LEFT JOIN problem_topics pt ON pht.topic_id = pt.topic_id
                WHERE ci.content_type = 'problem'
                  AND a.status = 'approved'
                GROUP BY p.problem_id, p.problem_name, p.difficulty, ci.created_at, creator_name, progress_status
                ORDER BY ci.created_at DESC
                `,
                [session.userId]
            );

            const questions = rows.map((row) => ({
                QuestionID: row.problem_id,
                QuestionName: row.problem_name,
                QuestionDifficulty: row.difficulty,
                QuestionLink: `/problem/${row.problem_id}`,
                CreatedAt: row.created_at,
                CreatorName: row.creator_name,
                ProgressStatus: row.progress_status,
                TopicsText: row.topics_text || ''
            }));

            socket.emit('response_get_solo_questions', {
                success: true,
                questions
            });
        } catch (err) {
            console.error('[solo] Error in request_get_solo_questions:', err);
            socket.emit('response_get_solo_questions', { success: false, message: 'Server error', questions: [] });
        }
    });

    // Filter approved questions for solo play
    socket.on('request_filter_solo_questions', async (payload) => {
        const { token_session, search, sortOrder, difficulty, progress, topicIds } = payload || {};

        try {
            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_filter_solo_questions', {
                    success: false,
                    message: 'Invalid session',
                    questions: []
                });
                return;
            }

            let query = `
                SELECT DISTINCT
                    p.problem_id,
                    p.problem_name,
                    p.difficulty,
                    ci.created_at,
                    COALESCE(prof.full_name, u.username) AS creator_name,
                    COALESCE(pup.progress, 'untouch') AS progress_status,
                    GROUP_CONCAT(DISTINCT pt.topic_name ORDER BY pt.topic_name SEPARATOR ', ') AS topics_text
                FROM problems p
                LEFT JOIN problems_have_topics pht ON p.problem_id = pht.problem_id
                LEFT JOIN problem_topics pt ON pht.topic_id = pt.topic_id
                JOIN content_problems cp ON p.problem_id = cp.problem_id
                JOIN content_items ci ON cp.content_item_id = ci.content_item_id
                JOIN approvals a ON ci.content_item_id = a.content_item_id
                JOIN users u ON a.requested_by = u.user_id
                LEFT JOIN user_roles ur ON u.user_id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.role_id
                LEFT JOIN profiles prof ON u.user_id = prof.user_id
                LEFT JOIN problem_user_progression pup ON p.problem_id = pup.problem_id AND pup.user_id = ?
                WHERE ci.content_type = 'problem'
                  AND a.status = 'approved'
            `;

            const params = [session.userId];

            if (search && search.trim()) {
                query += ' AND p.problem_name LIKE ?';
                params.push(`%${search}%`);
            }

            if (difficulty && difficulty.trim()) {
                query += ' AND p.difficulty = ?';
                params.push(difficulty);
            }

            if (progress && typeof progress === 'string' && progress.trim()) {
                query += ' AND COALESCE(pup.progress, \'untouch\') = ?';
                params.push(progress);
            }

            if (topicIds && Array.isArray(topicIds) && topicIds.length > 0) {
                const placeholders = topicIds.map(() => '?').join(',');
                query += ` AND pht.topic_id IN (${placeholders})`;
                params.push(...topicIds);
            }


            // Ensure proper grouping for GROUP_CONCAT
            let groupedQuery = `${query} GROUP BY p.problem_id, p.problem_name, p.difficulty, ci.created_at, creator_name, progress_status`;
            if (sortOrder === 'desc') {
                groupedQuery += ' ORDER BY p.problem_name DESC';
            } else {
                groupedQuery += ' ORDER BY p.problem_name ASC';
            }
            const [rows] = await db.query(groupedQuery, params);

            const questions = rows.map((row) => ({
                QuestionID: row.problem_id,
                QuestionName: row.problem_name,
                QuestionDifficulty: row.difficulty,
                QuestionLink: `/problem/${row.problem_id}`,
                CreatedAt: row.created_at,
                CreatorName: row.creator_name,
                ProgressStatus: row.progress_status,
                TopicsText: row.topics_text || ''
            }));

            socket.emit('response_filter_solo_questions', {
                success: true,
                questions,
                message: `Found ${questions.length} problems matching filters`
            });
        } catch (err) {
            console.error('[solo] Error in request_filter_solo_questions:', err);
            socket.emit('response_filter_solo_questions', {
                success: false,
                message: 'Server error: Failed to filter questions',
                questions: []
            });
        }
    });

    // Basic problem details (approved only) for solo modal
    socket.on('request_get_solo_problem_details', async ({ token_session, problem_id }) => {
        try {
            let session = null;
            if (socket.user && socket.user.userId) {
                session = { userId: socket.user.userId, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_get_solo_problem_details', { success: false, message: 'Invalid session' });
                return;
            }

            const [problems] = await db.query(
                `
                SELECT
                    p.problem_id,
                    p.problem_name,
                    p.difficulty,
                    p.time_limit_seconds,
                    p.memory_limit_mb,
                    p.description
                FROM problems p
                JOIN content_problems cp ON p.problem_id = cp.problem_id
                JOIN content_items ci ON cp.content_item_id = ci.content_item_id
                JOIN approvals a ON ci.content_item_id = a.content_item_id
                WHERE p.problem_id = ?
                  AND ci.content_type = 'problem'
                  AND a.status = 'approved'
                LIMIT 1
                `,
                [problem_id]
            );

            if (problems.length === 0) {
                socket.emit('response_get_solo_problem_details', { success: false, message: 'Problem not found or not approved' });
                return;
            }

            const [testCases] = await db.query(
                `
                SELECT
                    test_case_id,
                    test_case_number,
                    is_sample,
                    input_data,
                    expected_output,
                    score
                FROM test_cases
                WHERE problem_id = ?
                ORDER BY test_case_number ASC
                `,
                [problem_id]
            );

            // Fetch topics
            const [topics] = await db.query(
                `
                SELECT pt.topic_id, pt.topic_name
                FROM problems_have_topics pht
                LEFT JOIN problem_topics pt ON pht.topic_id = pt.topic_id
                WHERE pht.problem_id = ?
                `,
                [problem_id]
            );

            const problem = problems[0];
            const testCaseList = testCases.map((tc) => ({
                TestCaseID: tc.test_case_id,
                TestCaseNumber: tc.test_case_number,
                IsSample: tc.is_sample === 1,
                InputData: tc.input_data,
                ExpectedOutput: tc.expected_output,
                Score: tc.score
            }));

            socket.emit('response_get_solo_problem_details', {
                success: true,
                problem: {
                    ProblemID: problem.problem_id,
                    ProblemName: problem.problem_name,
                    Difficulty: problem.difficulty,
                    TimeLimitSeconds: problem.time_limit_seconds,
                    MemoryLimitMB: problem.memory_limit_mb,
                    Description: problem.description
                },
                testCases: testCaseList,
                topics: topics.map(t => ({ TopicID: t.topic_id, TopicName: t.topic_name }))
            });
        } catch (err) {
            console.error('[solo] Error in request_get_solo_problem_details:', err);
            socket.emit('response_get_solo_problem_details', { success: false, message: 'Server error' });
        }
    });
}

module.exports = { soloSocket };
