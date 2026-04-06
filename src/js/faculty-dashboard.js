const FACULTY_TABLE_CONFIG = {
    problems: { idField: 'problem_id', changeType: 'problem', autoPermission: 'problem.auto_approve', basePermission: 'problem.create' },
    events: { idField: 'event_id', changeType: 'event', autoPermission: 'event.auto_approve', basePermission: 'event.create' },
    blogs: { idField: 'blog_id', changeType: 'blog', autoPermission: 'blog.auto_approve', basePermission: 'blog.create' },
    users: { idField: 'user_id', changeType: 'user_edit', autoPermission: null, basePermission: 'users.manage' }
};

const TABLE_ALLOWED_FIELDS = {
    problems: ['problem_name', 'difficulty', 'time_limit_seconds', 'memory_limit_mb', 'description', 'sample_solution'],
    events: ['event_name', 'thumbnail_url', 'host_id', 'reward_points', 'reward_level', 'status'],
    blogs: ['title', 'content', 'status', 'author_id', 'thumbnail_url', 'content_type'],
    users: ['username', 'email', 'password', 'role']
};

function safeJsonParse(val) {
    if (!val) return {};
    if (typeof val === 'object') return val;
    try {
        return JSON.parse(val);
    } catch (e) {
        return {};
    }
}

function pickAllowed(source, allowedKeys) {
    const out = {};
    if (!source) return out;
    allowedKeys.forEach((key) => {
        if (source[key] !== undefined) out[key] = source[key];
    });
    return out;
}

// Helper: resolve a topic reference (id or name) to numeric topic_id; create if missing
async function resolveOrCreateTopicId(connection, topic) {
    if (typeof topic === 'number' && Number.isFinite(topic)) return topic;
    if (typeof topic === 'string' && /^\d+$/.test(topic)) return Number(topic);
    const name = String(topic || '').trim();
    if (!name) return null;
    const [rows] = await connection.query('SELECT topic_id FROM problem_topics WHERE topic_name = ? LIMIT 1', [name]);
    if (rows && rows.length > 0) return rows[0].topic_id;
    const [ins] = await connection.query('INSERT INTO problem_topics (topic_name) VALUES (?)', [name]);
    return ins.insertId;
}

async function checkFacultyPermission(db, userId, permissionName) {
    if (!userId || !permissionName) return false;

    // normalize legacy permission names to the new normalized permissions
    permissionName = normalizePermissionName(permissionName);

    const [permRows] = await db.query(
        'SELECT permission_id FROM permissions WHERE permission_name = ? LIMIT 1',
        [permissionName]
    );
    if (!permRows.length) {
        console.log(`[Permission] Permission "${permissionName}" not found in DB`);
        return false;
    }
    const permissionId = permRows[0].permission_id;

    const [userOverride] = await db.query(
        'SELECT is_granted FROM user_permissions WHERE user_id = ? AND permission_id = ? LIMIT 1',
        [userId, permissionId]
    );
    if (userOverride.length) {
        const granted = !!userOverride[0].is_granted;
        console.log(`[Permission] User ${userId} has override for "${permissionName}": ${granted}`);
        return granted;
    }

    const [roleRows] = await db.query(
        'SELECT role_id FROM user_roles WHERE user_id = ?',
        [userId]
    );
    if (!roleRows.length) {
        console.log(`[Permission] User ${userId} has no roles`);
        return false;
    }
    const roleIds = roleRows.map((r) => r.role_id).filter((id) => !!id);
    if (!roleIds.length) {
        console.log(`[Permission] User ${userId} role_ids empty`);
        return false;
    }

    const placeholders = roleIds.map(() => '?').join(',');
    const [rolePerms] = await db.query(
        `SELECT 1 FROM role_permissions WHERE role_id IN (${placeholders}) AND permission_id = ? LIMIT 1`,
        [...roleIds, permissionId]
    );
    const hasPermission = rolePerms.length > 0;
    console.log(`[Permission] User ${userId} (roles: ${roleIds.join(',')}) permission "${permissionName}": ${hasPermission}`);
    return hasPermission;
}

// helper: map legacy permission names to normalized permission names (kept in sync with admin mapping)
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

async function requireAllPermissions(db, userId, permissionNames = []) {
    for (const name of permissionNames) {
        const allowed = await checkFacultyPermission(db, userId, name);
        if (!allowed) return false;
    }
    return true;
}

async function queuePendingChange(db, { facultyId, changeType, tableName, recordId, actionType, originalData, proposedData, status }) {
    const [result] = await db.query(
        `INSERT INTO faculty_pending_changes (
            faculty_id, change_type, table_name, record_id, action_type, original_data, proposed_data, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        , [
            facultyId,
            changeType,
            tableName,
            recordId,
            actionType,
            originalData ? JSON.stringify(originalData) : null,
            JSON.stringify(proposedData || {}),
            status || 'pending_faculty_review'
        ]
    );
    return result.insertId;
}

async function commitPendingChange(db, bcrypt, changeRow) {
    const tableName = changeRow.table_name;
    const cfg = FACULTY_TABLE_CONFIG[tableName];
    if (!cfg) throw new Error(`Unsupported table for commit: ${tableName}`);
    const idField = cfg.idField;
    const action = changeRow.action_type;
    const proposed = safeJsonParse(changeRow.proposed_data);
    const original = safeJsonParse(changeRow.original_data);

    // If record_id already exists for a create action (created earlier when forwarded), skip re-insert
    if (action === 'create' && changeRow.record_id && Number(changeRow.record_id) > 0) {
        return { newId: changeRow.record_id };
    }

    const allowed = pickAllowed(proposed, TABLE_ALLOWED_FIELDS[tableName] || []);

    if (tableName === 'events' && !allowed.host_id) {
        allowed.host_id = changeRow.faculty_id;
    }
    if (tableName === 'blogs' && !allowed.author_id) {
        allowed.author_id = changeRow.faculty_id;
    }

    if (tableName === 'users' && allowed.password && !allowed.password.startsWith('$2')) {
        allowed.password = await bcrypt.hash(allowed.password, 10);
    }

    // Special handling for problems: also persist test_cases and topics within a transaction
    if (tableName === 'problems' && (action === 'create' || action === 'update')) {
        let connection = null;
        try {
            connection = await db.getConnection();
            await connection.beginTransaction();

            if (action === 'create') {
                const keys = Object.keys(allowed);
                if (!keys.length) throw new Error('No fields provided to insert');
                const placeholders = keys.map(() => '?').join(',');
                const sql = `INSERT INTO ${tableName} (${keys.join(',')}) VALUES (${placeholders})`;
                const [insertRes] = await connection.query(sql, keys.map((k) => allowed[k]));
                const newProblemId = insertRes.insertId;

                // Insert proposed test cases if provided
                if (Array.isArray(proposed.test_cases) && proposed.test_cases.length > 0) {
                    for (let i = 0; i < proposed.test_cases.length; i++) {
                        const tc = proposed.test_cases[i] || {};
                        await connection.query(
                            `INSERT INTO test_cases (problem_id, test_case_number, is_sample, input_data, expected_output, score)
                             VALUES (?, ?, ?, ?, ?, ?)`,
                            [
                                newProblemId,
                                tc.TestCaseNumber || tc.test_case_number || (i + 1),
                                tc.IsSample ? 1 : (tc.is_sample ? 1 : 0),
                                tc.InputData || tc.input || tc.input_data || '',
                                tc.ExpectedOutput || tc.expected || tc.expected_output || '',
                                tc.Score ?? tc.score ?? 0
                            ]
                        );
                    }
                }

                // Insert proposed topics if provided
                if (Array.isArray(proposed.topics) && proposed.topics.length > 0) {
                    for (const topicItem of proposed.topics) {
                        const tid = await resolveOrCreateTopicId(connection, topicItem);
                        if (!tid) continue;
                        await connection.query(
                            `INSERT INTO problems_have_topics (problem_id, topic_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE problem_id = problem_id`,
                            [newProblemId, tid]
                        );
                    }
                }

                await connection.commit();
                return { newId: newProblemId };
            }

            if (action === 'update') {
                if (!changeRow.record_id) throw new Error('Missing record_id for update');
                const keys = Object.keys(allowed);
                if (!keys.length) throw new Error('No fields provided to update');
                const assignments = keys.map((k) => `${k} = ?`).join(', ');
                await connection.query(`UPDATE ${tableName} SET ${assignments} WHERE ${idField} = ?`, [...keys.map((k) => allowed[k]), changeRow.record_id]);

                // Replace test cases if provided
                if (Array.isArray(proposed.test_cases)) {
                    await connection.query('DELETE FROM test_cases WHERE problem_id = ?', [changeRow.record_id]);
                    for (let i = 0; i < proposed.test_cases.length; i++) {
                        const tc = proposed.test_cases[i] || {};
                        await connection.query(
                            `INSERT INTO test_cases (problem_id, test_case_number, is_sample, input_data, expected_output, score)
                             VALUES (?, ?, ?, ?, ?, ?)`,
                            [
                                changeRow.record_id,
                                tc.TestCaseNumber || tc.test_case_number || (i + 1),
                                tc.IsSample ? 1 : (tc.is_sample ? 1 : 0),
                                tc.InputData || tc.input || tc.input_data || '',
                                tc.ExpectedOutput || tc.expected || tc.expected_output || '',
                                tc.Score ?? tc.score ?? 0
                            ]
                        );
                    }
                }

                // Replace topics if provided
                if (Array.isArray(proposed.topics)) {
                    await connection.query('DELETE FROM problems_have_topics WHERE problem_id = ?', [changeRow.record_id]);
                    for (const topicItem of proposed.topics) {
                        const tid = await resolveOrCreateTopicId(connection, topicItem);
                        if (!tid) continue;
                        await connection.query(
                            'INSERT INTO problems_have_topics (problem_id, topic_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE problem_id = problem_id',
                            [changeRow.record_id, tid]
                        );
                    }
                }

                await connection.commit();
                return { updatedId: changeRow.record_id, original };
            }
        } catch (err) {
            if (connection) {
                try { await connection.rollback(); } catch (e) {}
            }
            throw err;
        } finally {
            if (connection) connection.release();
        }
    }

    if (action === 'create') {
        const keys = Object.keys(allowed);
        if (!keys.length) throw new Error('No fields provided to insert');
        const placeholders = keys.map(() => '?').join(',');
        const sql = `INSERT INTO ${tableName} (${keys.join(',')}) VALUES (${placeholders})`;
        const [insertRes] = await db.query(sql, keys.map((k) => allowed[k]));
        return { newId: insertRes.insertId };
    }

    if (action === 'update') {
        if (!changeRow.record_id) throw new Error('Missing record_id for update');
        const keys = Object.keys(allowed);
        if (!keys.length) throw new Error('No fields provided to update');
        const assignments = keys.map((k) => `${k} = ?`).join(', ');
        const sql = `UPDATE ${tableName} SET ${assignments} WHERE ${idField} = ?`;
        await db.query(sql, [...keys.map((k) => allowed[k]), changeRow.record_id]);
        return { updatedId: changeRow.record_id, original };
    }

    if (action === 'delete') {
        if (!changeRow.record_id) throw new Error('Missing record_id for delete');

        // Special handling for problems: cascade delete related test cases and topic links
        if (tableName === 'problems') {
            let connection = null;
            try {
                connection = await db.getConnection();
                await connection.beginTransaction();

                await connection.query('DELETE FROM test_cases WHERE problem_id = ?', [changeRow.record_id]);
                await connection.query('DELETE FROM problems_have_topics WHERE problem_id = ?', [changeRow.record_id]);
                await connection.query(`DELETE FROM ${tableName} WHERE ${idField} = ?`, [changeRow.record_id]);

                await connection.commit();
                return { deletedId: changeRow.record_id, original };
            } catch (err) {
                if (connection) { try { await connection.rollback(); } catch (e) {} }
                throw err;
            } finally {
                if (connection) connection.release();
            }
        }

        await db.query(`DELETE FROM ${tableName} WHERE ${idField} = ?`, [changeRow.record_id]);
        return { deletedId: changeRow.record_id, original };
    }

    throw new Error(`Unsupported action type: ${action}`);
}

// When a faculty_pending_changes row is approved at Level 1, ensure that the
// corresponding content record and approvals row exist so that the item
// appears in the shared Level 1 approvals queues (admin + faculty).
//
// This helper mirrors the logic used by the faculty socket handler
// "request_faculty_approve_change" so that both HTTP and socket based flows
// keep the approvals table in sync.
async function syncFacultyChangeToApprovals(db, changeId) {
    if (!changeId) return;

    try {
        const [changeRows] = await db.query('SELECT * FROM faculty_pending_changes WHERE id = ? LIMIT 1', [changeId]);
        if (!changeRows || !changeRows.length) return;

        const change = changeRows[0];
        const tableName = change.table_name;
        const actionType = change.action_type;

        // Only handle content-related tables that participate in approvals
        if (!['problems', 'events', 'blogs'].includes(tableName)) return;

        const proposed = safeJsonParse(change.proposed_data);
        const original = safeJsonParse(change.original_data);

        let connection = null;
        try {
            connection = await db.getConnection();
            await connection.beginTransaction();

            // For creates: materialize the base record + content mapping +
            // approvals row now so that admin/faculty Level 1 queues can see it.
            // If a record has already been materialized for this change
            // (record_id set by a previous sync), treat this helper as a
            // no-op to avoid inserting duplicate base rows.
            if (actionType === 'create') {
                if (change.record_id && Number(change.record_id) > 0) {
                    await connection.commit();
                    return;
                }
                if (tableName === 'problems') {
                    const allowed = pickAllowed(proposed, TABLE_ALLOWED_FIELDS.problems || []);
                    const keys = Object.keys(allowed);
                    if (keys.length) {
                        const placeholders = keys.map(() => '?').join(',');
                        const sql = `INSERT INTO problems (${keys.join(',')}) VALUES (${placeholders})`;
                        const [ins] = await connection.query(sql, keys.map((k) => allowed[k]));
                        const newProblemId = ins.insertId;

                        // test cases
                        if (Array.isArray(proposed.test_cases)) {
                            for (let i = 0; i < proposed.test_cases.length; i++) {
                                const tc = proposed.test_cases[i] || {};
                                await connection.query(
                                    `INSERT INTO test_cases (problem_id, test_case_number, is_sample, input_data, expected_output, score) VALUES (?, ?, ?, ?, ?, ?)` ,
                                    [
                                        newProblemId,
                                        tc.TestCaseNumber || tc.test_case_number || i + 1,
                                        tc.IsSample ? 1 : (tc.is_sample ? 1 : 0),
                                        tc.InputData || tc.input || tc.input_data || '',
                                        tc.ExpectedOutput || tc.expected || tc.expected_output || '',
                                        tc.Score ?? tc.score ?? 0
                                    ]
                                );
                            }
                        }

                        // topics
                        if (Array.isArray(proposed.topics)) {
                            for (const topicItem of proposed.topics) {
                                try {
                                    const tid = await resolveOrCreateTopicId(connection, topicItem);
                                    if (!tid) continue;
                                    await connection.query(
                                        'INSERT INTO problems_have_topics (problem_id, topic_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE problem_id = problem_id',
                                        [newProblemId, tid]
                                    );
                                } catch (e) {
                                    // swallow topic assoc errors; core record should still proceed
                                }
                            }
                        }

                        // create content_item and mapping
                        const [ciRes] = await connection.query(`INSERT INTO content_items (content_type) VALUES ('problem')`);
                        const contentItemId = ciRes.insertId;
                        await connection.query('INSERT INTO content_problems (content_item_id, problem_id) VALUES (?, ?)', [contentItemId, newProblemId]);

                        // create approvals row (pending)
                        await connection.query(
                            `INSERT INTO approvals (content_item_id, requested_by, approved_by, status, reason) VALUES (?, ?, NULL, 'pending', NULL)`,
                            [contentItemId, change.faculty_id]
                        );

                        // update faculty_pending_changes.record_id so commit flow knows record exists
                        await connection.query('UPDATE faculty_pending_changes SET record_id = ? WHERE id = ?', [newProblemId, changeId]);
                    }
                } else if (tableName === 'events') {
                    const allowed = pickAllowed(proposed, TABLE_ALLOWED_FIELDS.events || []);
                    const keys = Object.keys(allowed);
                    const placeholders = keys.map(() => '?').join(',');
                    const sql = `INSERT INTO events (${keys.join(',')}) VALUES (${placeholders})`;
                    const [ins] = await connection.query(sql, keys.map((k) => allowed[k]));
                    const newEventId = ins.insertId;

                    // schedule if present
                    if (proposed.starts_at || proposed.ends_at) {
                        await connection.query(
                            'INSERT INTO event_schedule (event_id, starts_at, ends_at) VALUES (?, ?, ?)',
                            [newEventId, proposed.starts_at || null, proposed.ends_at || null]
                        );
                    }

                    const [ciRes] = await connection.query(`INSERT INTO content_items (content_type) VALUES ('event')`);
                    const contentItemId = ciRes.insertId;
                    await connection.query('INSERT INTO content_events (content_item_id, event_id) VALUES (?, ?)', [contentItemId, newEventId]);
                    await connection.query(
                        `INSERT INTO approvals (content_item_id, requested_by, approved_by, status, reason) VALUES (?, ?, NULL, 'pending', NULL)`,
                        [contentItemId, change.faculty_id]
                    );
                    await connection.query('UPDATE faculty_pending_changes SET record_id = ? WHERE id = ?', [newEventId, changeId]);
                } else if (tableName === 'blogs') {
                    const allowed = pickAllowed(proposed, TABLE_ALLOWED_FIELDS.blogs || []);
                    const keys = Object.keys(allowed);
                    const placeholders = keys.map(() => '?').join(',');
                    const sql = `INSERT INTO blogs (${keys.join(',')}) VALUES (${placeholders})`;
                    const [ins] = await connection.query(sql, keys.map((k) => allowed[k]));
                    const newBlogId = ins.insertId;

                    const [ciRes] = await connection.query(`INSERT INTO content_items (content_type) VALUES ('blog')`);
                    const contentItemId = ciRes.insertId;
                    await connection.query('INSERT INTO content_blogs (content_item_id, blog_id) VALUES (?, ?)', [contentItemId, newBlogId]);
                    await connection.query(
                        `INSERT INTO approvals (content_item_id, requested_by, approved_by, status, reason) VALUES (?, ?, NULL, 'pending', NULL)`,
                        [contentItemId, change.faculty_id]
                    );
                    await connection.query('UPDATE faculty_pending_changes SET record_id = ? WHERE id = ?', [newBlogId, changeId]);
                }
            } else {
                // for update/delete: if existing record present, create approvals row referencing its content_item
                const targetId = change.record_id || (original && (original.problem_id || original.event_id || original.blog_id));
                if (targetId) {
                    let contentItemId = null;

                    if (tableName === 'problems') {
                        const [cp] = await connection.query('SELECT content_item_id FROM content_problems WHERE problem_id = ? LIMIT 1', [targetId]);
                        if (cp && cp.length) contentItemId = cp[0].content_item_id;
                    } else if (tableName === 'events') {
                        const [ce] = await connection.query('SELECT content_item_id FROM content_events WHERE event_id = ? LIMIT 1', [targetId]);
                        if (ce && ce.length) contentItemId = ce[0].content_item_id;
                    } else if (tableName === 'blogs') {
                        const [cb] = await connection.query('SELECT content_item_id FROM content_blogs WHERE blog_id = ? LIMIT 1', [targetId]);
                        if (cb && cb.length) contentItemId = cb[0].content_item_id;
                    }

                    if (contentItemId) {
                        await connection.query(
                            `INSERT INTO approvals (content_item_id, requested_by, approved_by, status, reason) VALUES (?, ?, NULL, 'pending', NULL)`,
                            [contentItemId, change.faculty_id]
                        );
                    }
                }
            }

            await connection.commit();
        } catch (err) {
            if (connection) {
                try { await connection.rollback(); } catch (e) {}
            }
            console.warn('[syncFacultyChangeToApprovals] failed for change', changeId, err && err.message);
        } finally {
            if (connection) connection.release();
        }
    } catch (outerErr) {
        console.warn('[syncFacultyChangeToApprovals] outer error for change', changeId, outerErr && outerErr.message);
    }
}

function makeAuthMiddleware({ verifySession }) {
    return async function authMiddleware(req, res, next) {
        const authHeader = req.headers['authorization'];
        if (!authHeader) return res.status(401).json({ success: false, message: 'Missing Authorization header' });
        const token = authHeader.split(' ')[1];
        if (!token) return res.status(401).json({ success: false, message: 'Missing token' });

        const session = await verifySession(token);
        if (!session) return res.status(401).json({ success: false, message: 'Invalid or expired session' });

        req.user = { id: session.userId, token };
        next();
    };
}

function makeRequirePermission({ db }) {
    return function requirePermission(permissionName) {
        return async (req, res, next) => {
            const allowed = await checkFacultyPermission(db, req.user.id, permissionName);
            console.log(`[Permission Check] User ${req.user.id} checking "${permissionName}": ${allowed ? 'ALLOWED' : 'DENIED'}`);
            if (!allowed) return res.status(403).json({ success: false, message: 'Forbidden' });
            next();
        };
    };
}

async function handleFacultyCrud({ db, bcrypt, req, res, tableName, actionType }) {
    const cfg = FACULTY_TABLE_CONFIG[tableName];
    const basePerm = cfg.basePermission;
    const hasBase = await checkFacultyPermission(db, req.user.id, basePerm);
    if (!hasBase) return res.status(403).json({ success: false, message: 'Forbidden' });

    const idField = cfg.idField;
    const body = pickAllowed(req.body, TABLE_ALLOWED_FIELDS[tableName]);

    if (tableName === 'events' && actionType === 'create') {
        body.host_id = body.host_id || req.user.id;
    }
    if (tableName === 'blogs' && actionType === 'create') {
        body.author_id = body.author_id || req.user.id;
    }

    if (tableName === 'problems' && actionType === 'create' && !body.problem_name) {
        return res.status(400).json({ success: false, message: 'problem_name is required' });
    }
    if (tableName === 'events' && actionType === 'create' && !body.event_name) {
        return res.status(400).json({ success: false, message: 'event_name is required' });
    }
    if (tableName === 'blogs' && actionType === 'create' && !body.title) {
        return res.status(400).json({ success: false, message: 'title is required' });
    }

    const targetId = req.params.id ? parseInt(req.params.id, 10) : null;
    let existing = null;
    if (actionType !== 'create') {
        if (!targetId) return res.status(400).json({ success: false, message: 'Invalid target id' });
        const [rows] = await db.query(`SELECT * FROM ${tableName} WHERE ${idField} = ? LIMIT 1`, [targetId]);
        if (!rows.length) return res.status(404).json({ success: false, message: 'Record not found' });
        existing = rows[0];
    }

    if (actionType === 'update' && !Object.keys(body).length) {
        return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    const hasAuto = cfg.autoPermission ? await checkFacultyPermission(db, req.user.id, cfg.autoPermission) : false;

    try {
        if (hasAuto) {
            if (actionType === 'create') {
                const keys = Object.keys(body);
                if (!keys.length) return res.status(400).json({ success: false, message: 'No fields to insert' });
                const placeholders = keys.map(() => '?').join(',');
                const sql = `INSERT INTO ${tableName} (${keys.join(',')}) VALUES (${placeholders})`;
                const [insertRes] = await db.query(sql, keys.map((k) => body[k]));
                return res.json({ success: true, status: 'committed', id: insertRes.insertId });
            }

            if (actionType === 'update') {
                const keys = Object.keys(body);
                const assignments = keys.map((k) => `${k} = ?`).join(', ');
                await db.query(`UPDATE ${tableName} SET ${assignments} WHERE ${idField} = ?`, [...keys.map((k) => body[k]), targetId]);
                return res.json({ success: true, status: 'committed', id: targetId });
            }

            if (actionType === 'delete') {
                await db.query(`DELETE FROM ${tableName} WHERE ${idField} = ?`, [targetId]);
                return res.json({ success: true, status: 'committed', id: targetId });
            }
        }

        const changeId = await queuePendingChange(db, {
            facultyId: req.user.id,
            changeType: cfg.changeType,
            tableName,
            recordId: actionType === 'create' ? 0 : targetId,
            actionType,
            originalData: existing,
            proposedData: body
        });
        res.json({ success: true, status: 'pending_faculty_review', changeId });
    } catch (err) {
        console.error(`[faculty/${tableName} ${actionType}] error`, err);
        res.status(500).json({ success: false, message: 'Operation failed' });
    }
}

function registerFacultyHttp({ app, db, bcrypt, jwt, helpers, io }) {
    const { verifySession, verifyAdmin } = helpers;
    const authMiddleware = makeAuthMiddleware({ verifySession });
    const requirePermission = makeRequirePermission({ db });

    // Permission probe endpoint - returns user's permissions without blocking
    app.get('/api/faculty/permissions', authMiddleware, async (req, res) => {
        try {
            const permissionsToCheck = [
                'faculty.view_dashboard',
                'faculty.view_users',
                'problem.create',
                'event.create',
                'blog.create',
                'approvals.manage'
            ];

            const permissions = {};
            for (const permName of permissionsToCheck) {
                const allowed = await checkFacultyPermission(db, req.user.id, permName);
                permissions[permName] = allowed;
            }

            console.log(`[Faculty Permissions] User ${req.user.id} has:`, permissions);
            res.json({ success: true, permissions });
        } catch (err) {
            console.error('[faculty/permissions] error', err);
            res.status(500).json({ success: false, message: 'Failed to check permissions' });
        }
    });

    app.get('/api/faculty/dashboard', authMiddleware, requirePermission('faculty.view_dashboard'), async (req, res) => {
        try {
            const queries = [
                db.query('SELECT COUNT(*) AS total_users FROM users'),
                db.query('SELECT COUNT(*) AS total_problems FROM problems'),
                db.query('SELECT COUNT(*) AS total_events FROM events'),
                db.query('SELECT COUNT(*) AS total_blogs FROM blogs'),
                db.query("SELECT COUNT(*) AS pending_faculty FROM faculty_pending_changes WHERE status = 'pending_faculty_review'"),
                db.query("SELECT COUNT(*) AS pending_admin FROM faculty_pending_changes WHERE status = 'pending_admin'")
            ];
            const [usersRes, problemsRes, eventsRes, blogsRes, pendingFacultyRes, pendingAdminRes] = await Promise.all(queries);

            const totals = {
                users: usersRes[0][0].total_users,
                problems: problemsRes[0][0].total_problems,
                events: eventsRes[0][0].total_events,
                blogs: blogsRes[0][0].total_blogs,
                pending_faculty: pendingFacultyRes[0][0].pending_faculty,
                pending_admin: pendingAdminRes[0][0].pending_admin
            };
            console.log('[Faculty Dashboard] User', req.user.id, 'totals:', totals);

            res.json({
                success: true,
                totals
            });
        } catch (err) {
            console.error('[faculty/dashboard] error', err);
            res.status(500).json({ success: false, message: 'Failed to load dashboard' });
        }
    });

    app.get('/api/faculty/profile', authMiddleware, async (req, res) => {
        try {
            const [rows] = await db.query(
                'SELECT user_id, username, email, role FROM users WHERE user_id = ? LIMIT 1',
                [req.user.id]
            );
            if (!rows.length) return res.status(404).json({ success: false, message: 'User not found' });

            const [roleRows] = await db.query(
                `SELECT r.role_name FROM user_roles ur
                 JOIN roles r ON ur.role_id = r.role_id
                 WHERE ur.user_id = ?`,
                [req.user.id]
            );

            res.json({ success: true, profile: rows[0], roles: roleRows.map((r) => r.role_name) });
        } catch (err) {
            console.error('[faculty/profile] error', err);
            res.status(500).json({ success: false, message: 'Failed to load profile' });
        }
    });

    app.patch('/api/faculty/profile', authMiddleware, requirePermission('faculty.edit_own_profile'), async (req, res) => {
        try {
            const updates = [];
            const params = [];
            const { username, email, password } = req.body || {};

            if (username) { updates.push('username = ?'); params.push(username); }
            if (email) { updates.push('email = ?'); params.push(email); }
            if (password) {
                const hashed = await bcrypt.hash(password, 10);
                updates.push('password = ?');
                params.push(hashed);
            }

            if (!updates.length) return res.status(400).json({ success: false, message: 'No fields to update' });

            params.push(req.user.id);
            await db.query(`UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`, params);
            res.json({ success: true, message: 'Profile updated' });
        } catch (err) {
            console.error('[faculty/profile PATCH] error', err);
            res.status(500).json({ success: false, message: 'Failed to update profile' });
        }
    });

    app.get('/api/faculty/users', authMiddleware, requirePermission('faculty.view_users'), async (req, res) => {
        try {
            console.log(`[HTTP faculty GET users] requested by user=${req.user && req.user.id}`);
            const [rows] = await db.query(
                `SELECT u.user_id, u.username, u.email, u.role, GROUP_CONCAT(r.role_name) AS roles
                 FROM users u
                 LEFT JOIN user_roles ur ON u.user_id = ur.user_id
                 LEFT JOIN roles r ON ur.role_id = r.role_id
                 GROUP BY u.user_id`
            );
            res.json({ success: true, users: rows });
        } catch (err) {
            console.error('[faculty/users GET] error', err);
            res.status(500).json({ success: false, message: 'Failed to load users' });
        }
    });

    app.post('/api/faculty/users', authMiddleware, async (req, res) => {
        const hasPerms = await requireAllPermissions(db, req.user.id, ['users.manage', 'faculty.submit_for_review']);
        if (!hasPerms) return res.status(403).json({ success: false, message: 'Forbidden' });

        const proposed = pickAllowed(req.body, TABLE_ALLOWED_FIELDS.users);
        if (proposed.password) {
            proposed.password = await bcrypt.hash(proposed.password, 10);
        }

        if (!proposed.username || !proposed.email || !proposed.password) {
            return res.status(400).json({ success: false, message: 'username, email, and password are required' });
        }

        try {
            const changeId = await queuePendingChange(db, {
                facultyId: req.user.id,
                changeType: FACULTY_TABLE_CONFIG.users.changeType,
                tableName: 'users',
                recordId: 0,
                actionType: 'create',
                originalData: null,
                proposedData: proposed
            });
            res.json({ success: true, status: 'pending_faculty_review', changeId });
        } catch (err) {
            console.error('[faculty/users POST] error', err);
            res.status(500).json({ success: false, message: 'Failed to submit user change' });
        }
    });

    app.patch('/api/faculty/users/:id', authMiddleware, async (req, res) => {
        const hasPerms = await requireAllPermissions(db, req.user.id, ['users.manage', 'faculty.submit_for_review']);
        if (!hasPerms) return res.status(403).json({ success: false, message: 'Forbidden' });

        const targetId = parseInt(req.params.id, 10);
        if (!targetId) return res.status(400).json({ success: false, message: 'Invalid user id' });

        const [existingRows] = await db.query('SELECT * FROM users WHERE user_id = ? LIMIT 1', [targetId]);
        if (!existingRows.length) return res.status(404).json({ success: false, message: 'User not found' });

        const proposed = pickAllowed(req.body, TABLE_ALLOWED_FIELDS.users);
        if (proposed.password) {
            proposed.password = await bcrypt.hash(proposed.password, 10);
        }

        if (!Object.keys(proposed).length) return res.status(400).json({ success: false, message: 'No fields to update' });

        try {
            const changeId = await queuePendingChange(db, {
                facultyId: req.user.id,
                changeType: FACULTY_TABLE_CONFIG.users.changeType,
                tableName: 'users',
                recordId: targetId,
                actionType: 'update',
                originalData: existingRows[0],
                proposedData: proposed
            });
            res.json({ success: true, status: 'pending_faculty_review', changeId });
        } catch (err) {
            console.error('[faculty/users PATCH] error', err);
            res.status(500).json({ success: false, message: 'Failed to submit user update' });
        }
    });

    app.delete('/api/faculty/users/:id', authMiddleware, async (req, res) => {
        const hasPerms = await requireAllPermissions(db, req.user.id, ['users.manage', 'faculty.submit_for_review']);
        if (!hasPerms) return res.status(403).json({ success: false, message: 'Forbidden' });

        const targetId = parseInt(req.params.id, 10);
        if (!targetId) return res.status(400).json({ success: false, message: 'Invalid user id' });

        const [existingRows] = await db.query('SELECT * FROM users WHERE user_id = ? LIMIT 1', [targetId]);
        if (!existingRows.length) return res.status(404).json({ success: false, message: 'User not found' });

        try {
            const changeId = await queuePendingChange(db, {
                facultyId: req.user.id,
                changeType: FACULTY_TABLE_CONFIG.users.changeType,
                tableName: 'users',
                recordId: targetId,
                actionType: 'delete',
                originalData: existingRows[0],
                proposedData: {}
            });
            res.json({ success: true, status: 'pending_faculty_review', changeId });
        } catch (err) {
            console.error('[faculty/users DELETE] error', err);
            res.status(500).json({ success: false, message: 'Failed to submit user delete' });
        }
    });

    app.get('/api/faculty/problems', authMiddleware, requirePermission('problem.create'), async (req, res) => {
        try {
            const [rows] = await db.query('SELECT * FROM problems ORDER BY problem_id DESC');
            res.json({ success: true, problems: rows });
        } catch (err) {
            console.error('[faculty/problems GET] error', err);
            res.status(500).json({ success: false, message: 'Failed to load problems' });
        }
    });

    app.post('/api/faculty/problems', authMiddleware, (req, res) => handleFacultyCrud({ db, bcrypt, req, res, tableName: 'problems', actionType: 'create' }));
    app.patch('/api/faculty/problems/:id', authMiddleware, (req, res) => handleFacultyCrud({ db, bcrypt, req, res, tableName: 'problems', actionType: 'update' }));
    app.delete('/api/faculty/problems/:id', authMiddleware, (req, res) => handleFacultyCrud({ db, bcrypt, req, res, tableName: 'problems', actionType: 'delete' }));

    app.get('/api/faculty/events', authMiddleware, requirePermission('event.create'), async (req, res) => {
        try {
            const [rows] = await db.query('SELECT * FROM events ORDER BY event_id DESC');
            res.json({ success: true, events: rows });
        } catch (err) {
            console.error('[faculty/events GET] error', err);
            res.status(500).json({ success: false, message: 'Failed to load events' });
        }
    });

    app.post('/api/faculty/events', authMiddleware, (req, res) => handleFacultyCrud({ db, bcrypt, req, res, tableName: 'events', actionType: 'create' }));
    app.patch('/api/faculty/events/:id', authMiddleware, (req, res) => handleFacultyCrud({ db, bcrypt, req, res, tableName: 'events', actionType: 'update' }));
    app.delete('/api/faculty/events/:id', authMiddleware, (req, res) => handleFacultyCrud({ db, bcrypt, req, res, tableName: 'events', actionType: 'delete' }));

    app.get('/api/faculty/blogs', authMiddleware, requirePermission('blog.create'), async (req, res) => {
        try {
            const [rows] = await db.query('SELECT * FROM blogs ORDER BY blog_id DESC');
            res.json({ success: true, blogs: rows });
        } catch (err) {
            console.error('[faculty/blogs GET] error', err);
            res.status(500).json({ success: false, message: 'Failed to load blogs' });
        }
    });

    app.post('/api/faculty/blogs', authMiddleware, (req, res) => handleFacultyCrud({ db, bcrypt, req, res, tableName: 'blogs', actionType: 'create' }));
    app.patch('/api/faculty/blogs/:id', authMiddleware, (req, res) => handleFacultyCrud({ db, bcrypt, req, res, tableName: 'blogs', actionType: 'update' }));
    app.delete('/api/faculty/blogs/:id', authMiddleware, (req, res) => handleFacultyCrud({ db, bcrypt, req, res, tableName: 'blogs', actionType: 'delete' }));

    app.get('/api/faculty/pending-approvals', authMiddleware, async (req, res) => {
        try {
            // Allow users who can manage approvals OR who can create content (problem/event/blog)
            const userId = req.user.id;
            const canManage = await checkFacultyPermission(db, userId, 'approvals.manage');
            const canCreateProblem = await checkFacultyPermission(db, userId, 'problem.create');
            const canCreateEvent = await checkFacultyPermission(db, userId, 'event.create');
            const canCreateBlog = await checkFacultyPermission(db, userId, 'blog.create');
            if (!(canManage || canCreateProblem || canCreateEvent || canCreateBlog)) {
                return res.status(403).json({ success: false, message: 'Forbidden' });
            }

            // For the shared Faculty > Approvals view, never return
            // the current faculty member's own pending changes. Those
            // are surfaced under the per-type Pending tabs instead.
            const [rows] = await db.query(
                "SELECT * FROM faculty_pending_changes WHERE status = 'pending_faculty_review' AND faculty_id != ? ORDER BY created_at DESC",
                [userId]
            );
            res.json({ success: true, pending: rows });
        } catch (err) {
            console.error('[faculty/pending-approvals GET] error', err);
            res.status(500).json({ success: false, message: 'Failed to load approvals' });
        }
    });

    app.get('/api/faculty/approved-items', authMiddleware, requirePermission('approvals.manage'), async (req, res) => {
        try {
            // Include the faculty member's username so the frontend can
            // display Host/Author columns for events, blogs, and problems
            // in the Approved Items tables.
            const [rows] = await db.query(
                `SELECT fpc.*, u.username AS faculty_username
                 FROM faculty_pending_changes fpc
                 LEFT JOIN users u ON fpc.faculty_id = u.user_id
                 WHERE fpc.status = 'committed'
                 ORDER BY fpc.admin_review_date DESC
                 LIMIT 50`
            );

            const approvedRows = Array.isArray(rows) ? rows : [];

            // For approved problem items, also attach test_cases from
            // the problems/test_cases tables so the faculty "View"
            // modal can display full I/O examples.
            const problemRows = approvedRows.filter(r =>
                r && r.change_type === 'problem' && r.table_name === 'problems' && r.record_id
            );

            const problemIds = [...new Set(problemRows.map(r => r.record_id).filter(Boolean))];
            let testCasesByProblem = new Map();

            if (problemIds.length) {
                try {
                    const [tcs] = await db.query(
                        `SELECT problem_id, test_case_number, is_sample, input_data, expected_output, score
                         FROM test_cases
                         WHERE problem_id IN (?)
                         ORDER BY test_case_number ASC`,
                        [problemIds]
                    );

                    if (Array.isArray(tcs)) {
                        tcs.forEach(tc => {
                            if (!testCasesByProblem.has(tc.problem_id)) {
                                testCasesByProblem.set(tc.problem_id, []);
                            }
                            testCasesByProblem.get(tc.problem_id).push({
                                TestCaseNumber: tc.test_case_number,
                                IsSample: !!tc.is_sample,
                                InputData: tc.input_data,
                                ExpectedOutput: tc.expected_output,
                                Score: tc.score
                            });
                        });
                    }
                } catch (tcErr) {
                    console.warn('[faculty/approved-items] failed to load test cases for approved problems', tcErr);
                }
            }

            const enriched = approvedRows.map(r => {
                if (r && r.change_type === 'problem' && r.table_name === 'problems' && r.record_id) {
                    return {
                        ...r,
                        test_cases: testCasesByProblem.get(r.record_id) || []
                    };
                }
                return r;
            });

            res.json({ success: true, approved: enriched });
        } catch (err) {
            console.error('[faculty/approved-items GET] error', err);
            res.status(500).json({ success: false, message: 'Failed to load approved items' });
        }
    });

    app.post('/api/faculty/approve-change/:id', authMiddleware, requirePermission('approvals.manage'), async (req, res) => {
        const changeId = parseInt(req.params.id, 10);
        if (!changeId) return res.status(400).json({ success: false, message: 'Invalid change id' });

        try {
            const [result] = await db.query(
                `UPDATE faculty_pending_changes
                 SET status = 'pending_admin', faculty_reviewer_id = ?, faculty_review_date = NOW(), faculty_review_comment = ?
                 WHERE id = ? AND status = 'pending_faculty_review'`,
                [req.user.id, req.body?.comment || null, changeId]
            );
            if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Change not found or already processed' });

            // Ensure corresponding approvals/content entries exist so that
            // the item appears in admin/faculty Level 1 pending queues.
            try {
                await syncFacultyChangeToApprovals(db, changeId);
            } catch (syncErr) {
                console.warn('[faculty/approve-change] sync to approvals failed', syncErr && syncErr.message);
            }
            // Emit socket event so connected dashboards get live update
            try { if (io && io.emit) io.emit('faculty_change_forwarded', { id: changeId, reviewer_id: req.user.id }); } catch(e) {}
            res.json({ success: true, message: 'Change approved and sent to admin' });
        } catch (err) {
            console.error('[faculty/approve-change] error', err);
            res.status(500).json({ success: false, message: 'Failed to approve change' });
        }
    });

    app.post('/api/faculty/deny-change/:id', authMiddleware, requirePermission('approvals.manage'), async (req, res) => {
        const changeId = parseInt(req.params.id, 10);
        if (!changeId) return res.status(400).json({ success: false, message: 'Invalid change id' });

        try {
            const [result] = await db.query(
                `UPDATE faculty_pending_changes
                 SET status = 'rejected', faculty_reviewer_id = ?, faculty_review_date = NOW(), faculty_review_comment = ?
                 WHERE id = ? AND status = 'pending_faculty_review'`,
                [req.user.id, req.body?.comment || null, changeId]
            );
            if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Change not found or already processed' });
            try { if (io && io.emit) io.emit('faculty_change_rejected', { id: changeId, reviewer_id: req.user.id }); } catch(e) {}
            res.json({ success: true, message: 'Change rejected' });
        } catch (err) {
            console.error('[faculty/deny-change] error', err);
            res.status(500).json({ success: false, message: 'Failed to reject change' });
        }
    });

    app.get('/api/admin/pending-faculty-approvals', authMiddleware, async (req, res) => {
        const isAdmin = await verifyAdmin({ userId: req.user.id });
        if (!isAdmin) return res.status(403).json({ success: false, message: 'Admin only' });

        try {
            const [rows] = await db.query(
                "SELECT * FROM faculty_pending_changes WHERE status = 'pending_admin' ORDER BY created_at DESC"
            );
            res.json({ success: true, pending: rows });
        } catch (err) {
            console.error('[admin/pending-faculty-approvals] error', err);
            res.status(500).json({ success: false, message: 'Failed to load admin approvals' });
        }
    });

    app.post('/api/admin/commit-change/:id', authMiddleware, async (req, res) => {
        const isAdmin = await verifyAdmin({ userId: req.user.id });
        if (!isAdmin) return res.status(403).json({ success: false, message: 'Admin only' });

        const changeId = parseInt(req.params.id, 10);
        if (!changeId) return res.status(400).json({ success: false, message: 'Invalid change id' });

        try {
            const [rows] = await db.query(
                "SELECT * FROM faculty_pending_changes WHERE id = ? AND status = 'pending_admin' LIMIT 1",
                [changeId]
            );
            if (!rows.length) return res.status(404).json({ success: false, message: 'Change not found or already processed' });

            const changeRow = rows[0];
            const commitResult = await commitPendingChange(db, bcrypt, changeRow);

            await db.query(
                `UPDATE faculty_pending_changes
                 SET status = 'committed', admin_reviewer_id = ?, admin_review_date = NOW(), admin_review_comment = ?
                 WHERE id = ?`,
                [req.user.id, req.body?.comment || null, changeId]
            );

            if (commitResult?.newId && changeRow.record_id === 0) {
                await db.query('UPDATE faculty_pending_changes SET record_id = ? WHERE id = ?', [commitResult.newId, changeId]);
            }

            // When an admin commits a faculty change at Level 2, also
            // finalize any corresponding approvals rows so that the
            // problem/event/blog no longer appears as "pending" in
            // faculty or admin pending views.
            try {
                if (['problems', 'events', 'blogs'].includes(changeRow.table_name)) {
                    const effectiveRecordId = changeRow.record_id || commitResult?.newId || commitResult?.updatedId || commitResult?.deletedId || null;
                    if (effectiveRecordId) {
                        let contentItemId = null;

                        if (changeRow.table_name === 'problems') {
                            const [cpRows] = await db.query('SELECT content_item_id FROM content_problems WHERE problem_id = ? LIMIT 1', [effectiveRecordId]);
                            if (cpRows && cpRows.length) contentItemId = cpRows[0].content_item_id;
                        } else if (changeRow.table_name === 'events') {
                            const [ceRows] = await db.query('SELECT content_item_id FROM content_events WHERE event_id = ? LIMIT 1', [effectiveRecordId]);
                            if (ceRows && ceRows.length) contentItemId = ceRows[0].content_item_id;
                        } else if (changeRow.table_name === 'blogs') {
                            const [cbRows] = await db.query('SELECT content_item_id FROM content_blogs WHERE blog_id = ? LIMIT 1', [effectiveRecordId]);
                            if (cbRows && cbRows.length) contentItemId = cbRows[0].content_item_id;
                        }

                        if (contentItemId) {
                            await db.query(
                                `UPDATE approvals
                                 SET status = 'approved', approved_by = ?, updated_at = NOW(), reason = COALESCE(?, reason)
                                 WHERE content_item_id = ? AND status = 'pending'`,
                                [
                                    req.user.id,
                                    req.body?.comment || 'Approved via admin faculty change',
                                    contentItemId
                                ]
                            );
                        }
                    }
                }
            } catch (syncErr) {
                console.warn('[admin/commit-change] failed to sync approvals for faculty change', syncErr && syncErr.message);
            }

            try { if (io && io.emit) io.emit('faculty_change_committed', { id: changeId, admin_id: req.user.id, result: commitResult }); } catch(e) {}
            res.json({ success: true, message: 'Change committed', details: commitResult });
        } catch (err) {
            console.error('[admin/commit-change] error', err);
            res.status(500).json({ success: false, message: err.message || 'Commit failed' });
        }
    });

    app.post('/api/admin/reject-change/:id', authMiddleware, async (req, res) => {
        const isAdmin = await verifyAdmin({ userId: req.user.id });
        if (!isAdmin) return res.status(403).json({ success: false, message: 'Admin only' });

        const changeId = parseInt(req.params.id, 10);
        if (!changeId) return res.status(400).json({ success: false, message: 'Invalid change id' });

        try {
            const [result] = await db.query(
                `UPDATE faculty_pending_changes
                 SET status = 'rejected', admin_reviewer_id = ?, admin_review_date = NOW(), admin_review_comment = ?
                 WHERE id = ? AND status = 'pending_admin'`,
                [req.user.id, req.body?.comment || null, changeId]
            );
            if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Change not found or already processed' });

            // Also mark any related approvals rows as denied so that the
            // content item no longer appears as pending in admin/faculty
            // approval queues.
            try {
                const [rows] = await db.query(
                    'SELECT * FROM faculty_pending_changes WHERE id = ? LIMIT 1',
                    [changeId]
                );
                if (rows && rows.length) {
                    const changeRow = rows[0];
                    if (['problems', 'events', 'blogs'].includes(changeRow.table_name)) {
                        const effectiveRecordId = changeRow.record_id || null;
                        if (effectiveRecordId) {
                            let contentItemId = null;

                            if (changeRow.table_name === 'problems') {
                                const [cpRows] = await db.query('SELECT content_item_id FROM content_problems WHERE problem_id = ? LIMIT 1', [effectiveRecordId]);
                                if (cpRows && cpRows.length) contentItemId = cpRows[0].content_item_id;
                            } else if (changeRow.table_name === 'events') {
                                const [ceRows] = await db.query('SELECT content_item_id FROM content_events WHERE event_id = ? LIMIT 1', [effectiveRecordId]);
                                if (ceRows && ceRows.length) contentItemId = ceRows[0].content_item_id;
                            } else if (changeRow.table_name === 'blogs') {
                                const [cbRows] = await db.query('SELECT content_item_id FROM content_blogs WHERE blog_id = ? LIMIT 1', [effectiveRecordId]);
                                if (cbRows && cbRows.length) contentItemId = cbRows[0].content_item_id;
                            }

                            if (contentItemId) {
                                await db.query(
                                    `UPDATE approvals
                                     SET status = 'denied', approved_by = ?, updated_at = NOW(), reason = COALESCE(?, reason)
                                     WHERE content_item_id = ? AND status = 'pending'`,
                                    [
                                        req.user.id,
                                        req.body?.comment || 'Denied via admin faculty change',
                                        contentItemId
                                    ]
                                );
                            }
                        }
                    }
                }
            } catch (syncErr) {
                console.warn('[admin/reject-change] failed to sync approvals for faculty change', syncErr && syncErr.message);
            }

            try { if (io && io.emit) io.emit('faculty_change_rejected_admin', { id: changeId, admin_id: req.user.id }); } catch(e) {}
            res.json({ success: true, message: 'Change rejected' });
        } catch (err) {
            console.error('[admin/reject-change] error', err);
            res.status(500).json({ success: false, message: 'Reject failed' });
        }
    });
}

module.exports = {
    registerFacultyHttp,
    checkFacultyPermission,
    requireAllPermissions,
    queuePendingChange,
    commitPendingChange,
    FACULTY_TABLE_CONFIG,
    TABLE_ALLOWED_FIELDS,
    syncFacultyChangeToApprovals
};
