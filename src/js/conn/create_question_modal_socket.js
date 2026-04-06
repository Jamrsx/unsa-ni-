// Handlers for the create-question modal used by Home, Solo and Dashboard
module.exports = function registerCreateQuestionModalHandlers(socket, db, bcrypt, jwt, helpers) {
  const { verifySession, verifyAdmin, hasPermission, getUserPrimaryRole, deriveCategory } = helpers || {};

  // Helper: resolve a topic identifier which may be a numeric id or a topic name string
  async function resolveTopicId(connection, topic) {
    // numeric id passed directly
    if (typeof topic === 'number' && Number.isFinite(topic)) return topic;
    if (typeof topic === 'string' && /^\d+$/.test(topic)) return Number(topic);

    // treat as name: try to lookup existing topic
    const [rows] = await connection.query('SELECT topic_id FROM problem_topics WHERE topic_name = ? LIMIT 1', [String(topic).trim()]);
    if (rows && rows.length > 0) return rows[0].topic_id;

    // not found -> create new topic and return id
    const [ins] = await connection.query('INSERT INTO problem_topics (topic_name) VALUES (?)', [String(topic).trim()]);
    return ins.insertId;
  }

  // Debug: check effective permission for a user (admin or self only)
  socket.on('request_debug_hasPermission', async ({ token_session, targetUserId, permissionName }) => {
    try {
      let session = null;
      if (socket.user && socket.user.userId) {
        session = { userId: socket.user.userId, decoded: socket.user.decoded };
      } else if (verifySession) {
        session = await verifySession(token_session);
      }

      if (!session) {
        socket.emit('response_debug_hasPermission', { success: false, message: 'Invalid session' });
        return;
      }

      const isAdmin = verifyAdmin ? await verifyAdmin(session) : false;
      if (!isAdmin && session.userId !== targetUserId) {
        socket.emit('response_debug_hasPermission', { success: false, message: 'Unauthorized' });
        return;
      }

      const allowed = hasPermission ? await hasPermission(targetUserId, permissionName) : false;
      console.log('[perm-debug] request_debug_hasPermission:', { requester: session.userId, targetUserId, permissionName, allowed });
      socket.emit('response_debug_hasPermission', { success: true, targetUserId, permissionName, allowed });
    } catch (e) {
      console.error('Error in request_debug_hasPermission:', e);
      socket.emit('response_debug_hasPermission', { success: false, message: 'Server error' });
    }
  });

  // === request_get_problem_details ===
  socket.on('request_get_problem_details', async ({ token_session, problem_id }) => {
    try {
      let session = null;
      if (socket.user && socket.user.userId) {
        session = { userId: socket.user.userId, decoded: socket.user.decoded };
      } else if (verifySession) {
        session = await verifySession(token_session);
      }

      if (!session) {
        socket.emit('response_get_problem_details', { success: false, message: 'Invalid session' });
        return;
      }

      const isAdmin = verifyAdmin ? await verifyAdmin(session) : false;

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
          [problem_id]
        );

        if (ownerRows.length > 0) {
          isOwner = ownerRows[0].requested_by === session.userId;
        }
      }

      if (!isAdmin && !isOwner) {
        socket.emit('response_get_problem_details', { success: false, message: 'Unauthorized: Only admins or the problem owner may access details' });
        return;
      }

      const [problems] = await db.query(
        `
        SELECT 
            problem_id,
            problem_name,
            difficulty,
            time_limit_seconds,
            memory_limit_mb,
            description
        FROM problems
        WHERE problem_id = ?
        `,
        [problem_id]
      );

      if (problems.length === 0) {
        socket.emit('response_get_problem_details', { success: false, message: 'Problem not found' });
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

      const [topics] = await db.query(
        `
        SELECT 
            pt.topic_id,
            pt.topic_name
        FROM problem_topics pt
        LEFT JOIN problems_have_topics pht ON pt.topic_id = pht.topic_id
        WHERE pht.problem_id = ?
        `,
        [problem_id]
      );

      const problem = problems[0];
      // Fetch approval status from approvals table (content_problems has no status column)
      let cpStatus = null;
      try {
        const [cpRows] = await db.query(
          `SELECT a.status FROM approvals a
           JOIN content_problems cp ON cp.content_item_id = a.content_item_id
           WHERE cp.problem_id = ? LIMIT 1`,
          [problem_id]
        );
        if (cpRows && cpRows.length > 0) cpStatus = cpRows[0].status;
      } catch (e) {
        // non-fatal: approval status unavailable
      }
      const testCaseList = testCases.map(tc => ({
        TestCaseID: tc.test_case_id,
        TestCaseNumber: tc.test_case_number,
        IsSample: tc.is_sample === 1,
        InputData: tc.input_data,
        ExpectedOutput: tc.expected_output,
        Score: tc.score
      }));

      // Map raw topics rows to payload format
      const topicList = (topics || []).map(t => ({ TopicID: t.topic_id, TopicName: t.topic_name }));

      // Build a best-effort test summary: passed/total (based on complete tests only)
      // Compute totals from complete test cases
      const completeTestCases = testCaseList.filter(r => (r.InputData || '').toString().trim() && (r.ExpectedOutput || '').toString().trim());
      const totalTests = completeTestCases.length;
      const maxScore = completeTestCases.reduce((s, r) => s + (Number.isFinite(r.Score) ? r.Score : 0), 0);

      // Retrieve last run summary (prefer content_problems.last_* then fallback to problem_test_runs history)
      let lastSubmission = null;
      try {
        const [cpRows] = await db.query(`SELECT NULL AS score, NULL AS result, NULL AS submitted_at, NULL AS passed, NULL AS total, NULL AS verdict FROM content_problems WHERE problem_id = ? LIMIT 1`, [problem_id]);
        if (cpRows && cpRows.length > 0 && (cpRows[0].submitted_at || cpRows[0].score || cpRows[0].result || cpRows[0].passed)) {
          lastSubmission = cpRows[0];
        } else {
          const [subs] = await db.query(`SELECT test_run_id AS submission_id, user_id, passed, total, verdict, result, score, submitted_at FROM problem_test_runs WHERE problem_id = ? ORDER BY submitted_at DESC LIMIT 1`, [problem_id]);
          lastSubmission = (subs && subs.length) ? subs[0] : null;
        }
      } catch (e) {
        console.error('Error fetching last submission for problem', problem_id, e);
      }

      let testSummary = null;
      if (lastSubmission) {
        const passed = (() => {
          const lastScoreNum = Number(lastSubmission.score);
          if (!Number.isNaN(lastScoreNum) && totalTests > 0) {
            if (lastScoreNum <= totalTests) return Math.max(0, Math.min(totalTests, Math.round(lastScoreNum)));
            if (maxScore > 0) {
              const avg = maxScore / totalTests;
              if (avg > 0) return Math.min(totalTests, Math.round(lastScoreNum / avg));
            }
          }
          if ((lastSubmission.result || '').toString() === 'passed') return totalTests;
          return 0;
        })();

        testSummary = { passed, total: totalTests };
      }

      socket.emit('response_get_problem_details', {
        success: true,
        problem: {
          ProblemID: problem.problem_id,
          ProblemName: problem.problem_name,
          Difficulty: problem.difficulty,
          TimeLimitSeconds: problem.time_limit_seconds,
          MemoryLimitMB: problem.memory_limit_mb,
          Description: problem.description,
          SourceCode: problem.sample_solution || '',
          Status: cpStatus || null
        },
        testCases: testCaseList,
        topics: topicList
        ,
        // include last submission summary (if available) so clients can show verdict and passed/total
        LastRun: lastSubmission || null,
        TestSummary: testSummary
      });

    } catch (err) {
      console.error('Error in request_get_problem_details (modal handler):', err);
      socket.emit('response_get_problem_details', { success: false, message: 'Server error' });
    }
  });

  // === CREATE-PROBLEM-FLOW ===
  socket.on('request_create_problem', async ({ token_session, problemData }) => {
    let session = null;
    if (socket.user && socket.user.userId) {
      session = { userId: socket.user.userId, decoded: socket.user.decoded };
    } else if (verifySession) {
      session = await verifySession(token_session);
    }

    if (!session) {
      console.error('Create problem failed: invalid session');
      socket.emit('response_create_problem', { success: false, message: 'Invalid session' });
      return;
    }

    let connection = null;

    try {
      const errs = [];
      const cases = Array.isArray(problemData.TestCases) ? problemData.TestCases : [];
      const sampleCount = cases.filter(c => !!c.IsSample).length;
      const hiddenCount = cases.filter(c => !c.IsSample).length;
      const total = cases.length;
      const totalScore = cases.reduce((s, c) => s + (Number.isFinite(c.Score) ? c.Score : 0), 0);

      if (!problemData.isDraft) {
        if (sampleCount < 3) errs.push('At least 3 sample test cases required');
        if (hiddenCount < 10) errs.push('At least 10 hidden test cases required');
        if (total < 13) errs.push('At least 13 total test cases required');
        if (total > 15) errs.push('Maximum 15 test cases allowed');
        if (totalScore <= 0) errs.push('Total test case score must be greater than 0');
        cases.forEach((tc, i) => {
          if (!(tc.InputData && String(tc.InputData).trim())) errs.push(`Test case ${i+1} is missing input`);
          if (!(tc.ExpectedOutput && String(tc.ExpectedOutput).trim())) errs.push(`Test case ${i+1} is missing expected output`);
        });
      }

      if (errs.length > 0) {
        socket.emit('response_create_problem', { success: false, message: 'Validation failed', errors: errs });
        return;
      }

      const roleName = getUserPrimaryRole ? await getUserPrimaryRole(session.userId) : 'user';
      // Auto-approve is controlled by explicit permission, not just role.
      const hasAutoApprove = hasPermission ? await hasPermission(session.userId, 'problem.auto_approve') : false;
      const approvalStatus = hasAutoApprove ? 'approved' : 'pending';
      const approvalReason = hasAutoApprove ? 'Auto-approved: problem.auto_approve' : 'Problem awaiting approval';

      connection = await db.getConnection();
      await connection.beginTransaction();

      const sampleSolutionValue = problemData.SourceCode || problemData.sourceCode || '';
      
      const [problemResult] = await connection.query(
        `INSERT INTO problems (problem_name, difficulty, time_limit_seconds, memory_limit_mb, description, sample_solution)
         VALUES (?, ?, ?, ?, ?, ?)` ,
        [
          problemData.ProblemName || 'Untitled Problem',
          problemData.Difficulty || 'Easy',
          problemData.TimeLimitSeconds || 1,
          problemData.MemoryLimitMB || 64,
          problemData.Description || '',
          sampleSolutionValue
        ]
      );

      const problemId = problemResult.insertId;

      const [contentItemResult] = await connection.query(
        [problem_id]
      );

      if (problems.length === 0) {
        socket.emit('response_get_problem_details', { success: false, message: 'Problem not found' });
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

      const [topics] = await db.query(
        `
        SELECT 
            pt.topic_id,
            pt.topic_name
        FROM problem_topics pt
        LEFT JOIN problems_have_topics pht ON pt.topic_id = pht.topic_id
        WHERE pht.problem_id = ?
        `,
        [problem_id]
      );

      const problem = problems[0];
      // Fetch approval status from approvals table (content_problems has no status column)
      let cpStatus = null;
      try {
        const [cpRows] = await db.query(
          `SELECT a.status FROM approvals a
           JOIN content_problems cp ON cp.content_item_id = a.content_item_id
           WHERE cp.problem_id = ? LIMIT 1`,
          [problem_id]
        );
        if (cpRows && cpRows.length > 0) cpStatus = cpRows[0].status;
      } catch (e) {
        // non-fatal: approval status unavailable
      }
      const testCaseList = testCases.map(tc => ({
        TestCaseID: tc.test_case_id,
        TestCaseNumber: tc.test_case_number,
        IsSample: tc.is_sample === 1,
        InputData: tc.input_data,
        ExpectedOutput: tc.expected_output,
        Score: tc.score
      }));

      // Map raw topics rows to payload format
      const topicList = (topics || []).map(t => ({ TopicID: t.topic_id, TopicName: t.topic_name }));

      // Build a best-effort test summary: passed/total (based on complete tests only)
      // Compute totals from complete test cases
      const completeTestCases = testCaseList.filter(r => (r.InputData || '').toString().trim() && (r.ExpectedOutput || '').toString().trim());
      const totalTests = completeTestCases.length;
      const maxScore = completeTestCases.reduce((s, r) => s + (Number.isFinite(r.Score) ? r.Score : 0), 0);

      // Retrieve last run summary (prefer content_problems.last_* then fallback to problem_test_runs history)
      let lastSubmission = null;
      try {
        const [cpRows] = await db.query(`SELECT NULL AS score, NULL AS result, NULL AS submitted_at, NULL AS passed, NULL AS total, NULL AS verdict FROM content_problems WHERE problem_id = ? LIMIT 1`, [problem_id]);
        if (cpRows && cpRows.length > 0 && (cpRows[0].submitted_at || cpRows[0].score || cpRows[0].result || cpRows[0].passed)) {
          lastSubmission = cpRows[0];
        } else {
          const [subs] = await db.query(`SELECT test_run_id AS submission_id, user_id, passed, total, verdict, result, score, submitted_at FROM problem_test_runs WHERE problem_id = ? ORDER BY submitted_at DESC LIMIT 1`, [problem_id]);
          lastSubmission = (subs && subs.length) ? subs[0] : null;
        }
      } catch (e) {
        console.error('Error fetching last submission for problem', problem_id, e);
      }

      let testSummary = null;
      if (lastSubmission) {
        const passed = (() => {
          const lastScoreNum = Number(lastSubmission.score);
          if (!Number.isNaN(lastScoreNum) && totalTests > 0) {
            if (lastScoreNum <= totalTests) return Math.max(0, Math.min(totalTests, Math.round(lastScoreNum)));
            if (maxScore > 0) {
              const avg = maxScore / totalTests;
              if (avg > 0) return Math.min(totalTests, Math.round(lastScoreNum / avg));
            }
          }
          if ((lastSubmission.result || '').toString() === 'passed') return totalTests;
          return 0;
        })();

        testSummary = { passed, total: totalTests };
      }

      socket.emit('response_get_problem_details', {
        success: true,
        problem: {
          ProblemID: problem.problem_id,
          ProblemName: problem.problem_name,
          Difficulty: problem.difficulty,
          TimeLimitSeconds: problem.time_limit_seconds,
          MemoryLimitMB: problem.memory_limit_mb,
          Description: problem.description,
          SourceCode: problem.sample_solution || '',
          Status: cpStatus || null
        },
        testCases: testCaseList,
        topics: topicList
        ,
        // include last submission summary (if available) so clients can show verdict and passed/total
        LastRun: lastSubmission || null,
        TestSummary: testSummary
      });

    } catch (err) {
      console.error('Error in request_get_problem_details (modal handler):', err);
      socket.emit('response_get_problem_details', { success: false, message: 'Server error' });
    }
  });

  // === CREATE-PROBLEM-FLOW ===
  socket.on('request_create_problem', async ({ token_session, problemData }) => {
    let session = null;
    if (socket.user && socket.user.userId) {
      session = { userId: socket.user.userId, decoded: socket.user.decoded };
    } else if (verifySession) {
      session = await verifySession(token_session);
    }

    if (!session) {
      console.error('Create problem failed: invalid session');
      socket.emit('response_create_problem', { success: false, message: 'Invalid session' });
      return;
    }

    let connection = null;

    try {
      const errs = [];
      const cases = Array.isArray(problemData.TestCases) ? problemData.TestCases : [];
      const sampleCount = cases.filter(c => !!c.IsSample).length;
      const hiddenCount = cases.filter(c => !c.IsSample).length;
      const total = cases.length;
      const totalScore = cases.reduce((s, c) => s + (Number.isFinite(c.Score) ? c.Score : 0), 0);

      if (!problemData.isDraft) {
        if (sampleCount < 3) errs.push('At least 3 sample test cases required');
        if (hiddenCount < 10) errs.push('At least 10 hidden test cases required');
        if (total < 13) errs.push('At least 13 total test cases required');
        if (total > 15) errs.push('Maximum 15 test cases allowed');
        if (totalScore <= 0) errs.push('Total test case score must be greater than 0');
        cases.forEach((tc, i) => {
          if (!(tc.InputData && String(tc.InputData).trim())) errs.push(`Test case ${i+1} is missing input`);
          if (!(tc.ExpectedOutput && String(tc.ExpectedOutput).trim())) errs.push(`Test case ${i+1} is missing expected output`);
        });
      }

      if (errs.length > 0) {
        socket.emit('response_create_problem', { success: false, message: 'Validation failed', errors: errs });
        return;
      }

      const roleName = getUserPrimaryRole ? await getUserPrimaryRole(session.userId) : 'user';
      // Auto-approve is controlled by explicit permission, not just role.
      const hasAutoApprove = hasPermission ? await hasPermission(session.userId, 'problem.auto_approve') : false;
      const approvalStatus = hasAutoApprove ? 'approved' : 'pending';
      const approvalReason = hasAutoApprove ? 'Auto-approved: problem.auto_approve' : 'Problem awaiting approval';

      connection = await db.getConnection();
      await connection.beginTransaction();

      const sampleSolutionValue = problemData.SourceCode || problemData.sourceCode || '';
      
      const [problemResult] = await connection.query(
        `INSERT INTO problems (problem_name, difficulty, time_limit_seconds, memory_limit_mb, description, sample_solution)
         VALUES (?, ?, ?, ?, ?, ?)` ,
        [
          problemData.ProblemName || 'Untitled Problem',
          problemData.Difficulty || 'Easy',
          problemData.TimeLimitSeconds || 1,
          problemData.MemoryLimitMB || 64,
          problemData.Description || '',
          sampleSolutionValue
        ]
      );

      const problemId = problemResult.insertId;

      const [contentItemResult] = await connection.query(
        `INSERT INTO content_items (content_type) VALUES ('problem')`
      );

      const contentItemId = contentItemResult.insertId;

      await connection.query(
        `INSERT INTO content_problems (content_item_id, problem_id) VALUES (?, ?)` ,
        [contentItemId, problemId]
      );

      if (Array.isArray(problemData.Topics) && problemData.Topics.length > 0) {
        const resolved = [];
        for (const topicItem of problemData.Topics) {
          try {
            const tid = await resolveTopicId(connection, topicItem);
            resolved.push({ raw: topicItem, topic_id: tid });
            await connection.query(
              `INSERT INTO problems_have_topics (problem_id, topic_id) VALUES (?, ?)` ,
              [problemId, tid]
            );
          } catch (e) {
            console.warn('Failed to associate topic for created problem', topicItem, e && e.message);
          }
        }
        try {
          const [phtRows] = await connection.query('SELECT pt.topic_id, pt.topic_name FROM problems_have_topics pht JOIN problem_topics pt ON pht.topic_id = pt.topic_id WHERE pht.problem_id = ?', [problemId]);
          // verification performed; intentionally not logging in production
        } catch (e) { console.warn('request_create_problem -> failed to verify problems_have_topics', e && e.message); }
      }

      const casesToInsert = Array.isArray(problemData.TestCases) && problemData.TestCases.length > 0
        ? problemData.TestCases
        : [{ InputData: '[]', ExpectedOutput: '', IsSample: 1, Score: 0, TestCaseNumber: 1 }];

      for (const tc of casesToInsert) {
        await connection.query(
          `INSERT INTO test_cases (problem_id, test_case_number, is_sample, input_data, expected_output, score)
           VALUES (?, ?, ?, ?, ?, ?)` ,
          [
            problemId,
            tc.TestCaseNumber || 1,
            tc.IsSample ? 1 : 0,
            tc.InputData || '',
            tc.ExpectedOutput || '',
            tc.Score || 0
          ]
        );
      }

      await connection.query(
        `INSERT INTO approvals (content_item_id, requested_by, approved_by, status, reason)
         VALUES (?, ?, ?, ?, ?)` ,
        [
          contentItemId,
          session.userId,
          hasAutoApprove ? session.userId : null,
          approvalStatus,
          approvalReason
        ]
      );

      await connection.commit();
      connection.release();

      socket.emit('response_create_problem', {
        success: true,
        message: approvalStatus === 'approved' ? 'Problem created and approved' : 'Problem submitted for approval',
        status: approvalStatus,
        problem_id: problemId,
        content_item_id: contentItemId
      });

    } catch (err) {
      if (connection) {
        try { await connection.rollback(); connection.release(); } catch (e) { console.error('Rollback err:', e); }
      }
      console.error('Error in request_create_problem (modal handler):', err);
      socket.emit('response_create_problem', { success: false, message: 'Server error creating problem', error: err.message });
    }
  });

  // === SAVE DRAFT ===
  socket.on('request_save_draft', async ({ token_session, problemData }) => {
    let session = null;
    if (socket.user && socket.user.userId) {
      session = { userId: socket.user.userId, decoded: socket.user.decoded };
    } else if (verifySession) {
      session = await verifySession(token_session);
    }

    if (!session) {
      console.error('Save draft failed: invalid session');
      socket.emit('response_save_draft', { success: false, message: 'Invalid session' });
      return;
    }

    let connection = null;

    try {
      connection = await db.getConnection();
      await connection.beginTransaction();

      const sampleSolutionValue = problemData.SourceCode || problemData.sourceCode || '';
      const [problemResult] = await connection.query(
        `INSERT INTO problems (problem_name, difficulty, time_limit_seconds, memory_limit_mb, description, sample_solution)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          problemData.ProblemName || 'Untitled Draft',
          problemData.Difficulty || 'Easy',
          problemData.TimeLimitSeconds || 1,
          problemData.MemoryLimitMB || 64,
          problemData.Description || '',
          sampleSolutionValue
        ]
      );

      const problemId = problemResult.insertId;

      const [contentItemResult] = await connection.query(`INSERT INTO content_items (content_type) VALUES ('problem')`);
      const contentItemId = contentItemResult.insertId;

      await connection.query(`INSERT INTO content_problems (content_item_id, problem_id) VALUES (?, ?)`, [contentItemId, problemId]);

      if (Array.isArray(problemData.Topics) && problemData.Topics.length > 0) {
        const resolvedDraft = [];
        for (const topicItem of problemData.Topics) {
          try {
            const tid = await resolveTopicId(connection, topicItem);
            resolvedDraft.push({ raw: topicItem, topic_id: tid });
            await connection.query(`INSERT INTO problems_have_topics (problem_id, topic_id) VALUES (?, ?)`, [problemId, tid]);
          } catch (e) {
            console.warn('Failed to associate topic for draft problem', topicItem, e && e.message);
          }
        }
        try {
          const [phtRowsDraft] = await connection.query('SELECT pt.topic_id, pt.topic_name FROM problems_have_topics pht JOIN problem_topics pt ON pht.topic_id = pt.topic_id WHERE pht.problem_id = ?', [problemId]);
          // verification performed; intentionally not logging in production
        } catch (e) { console.warn('request_save_draft -> failed to verify problems_have_topics', e && e.message); }
      }

      const cases = Array.isArray(problemData.TestCases) && problemData.TestCases.length > 0
        ? problemData.TestCases
        : [{ InputData: '', ExpectedOutput: '', IsSample: 1, Score: 0, TestCaseNumber: 1 }];

      for (const tc of cases) {
        await connection.query(
          `INSERT INTO test_cases (problem_id, test_case_number, is_sample, input_data, expected_output, score)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            problemId,
            tc.TestCaseNumber || 1,
            tc.IsSample ? 1 : 0,
            tc.InputData || '',
            tc.ExpectedOutput || '',
            tc.Score || 0
          ]
        );
      }

      await connection.query(
        `INSERT INTO approvals (content_item_id, requested_by, approved_by, status, reason)
         VALUES (?, ?, ?, ?, ?)`,
        [
          contentItemId,
          session.userId,
          null,
          'draft',
          'Draft - in progress'
        ]
      );

      await connection.commit();
      connection.release();

      socket.emit('response_save_draft', { success: true, message: 'Draft saved successfully', status: 'draft', problem_id: problemId, content_item_id: contentItemId });

    } catch (err) {
      if (connection) { try { await connection.rollback(); connection.release(); } catch (e) { console.error('Rollback err:', e); } }
      console.error('Error in request_save_draft (modal handler):', err);
      socket.emit('response_save_draft', { success: false, message: 'Server error saving draft', error: err.message });
    }
  });

  // === request_update_question ===
  socket.on('request_update_question', async ({ token_session, problemData }) => {
    try {
      let session = null;
      if (socket.user && socket.user.userId) {
        session = { userId: socket.user.userId, decoded: socket.user.decoded };
      } else if (verifySession) {
        session = await verifySession(token_session);
      }

      if (!session) {
        socket.emit('response_update_question', { success: false, message: 'Invalid session' });
        return;
      }

      const isAdmin = verifyAdmin ? await verifyAdmin(session) : false;

      const {
        ProblemID,
        ProblemName,
        Difficulty,
        TimeLimitSeconds,
        MemoryLimitMB,
        Description,
        Topics,
        TestCases,
        SourceCode
      } = problemData;

      try {
        const errs = [];
        const cases = Array.isArray(TestCases) ? TestCases : [];
        const sampleCount = cases.filter(c => !!c.IsSample).length;
        const hiddenCount = cases.filter(c => !c.IsSample).length;
        const total = cases.length;
        const totalScore = cases.reduce((s, c) => s + (Number.isFinite(c.Score) ? c.Score : 0), 0);

        if (!problemData.isDraft) {
          if (sampleCount < 3) errs.push('At least 3 sample test cases required');
          if (hiddenCount < 10) errs.push('At least 10 hidden test cases required');
          if (total < 13) errs.push('At least 13 total test cases required');
          if (total > 15) errs.push('Maximum 15 test cases allowed');
          if (totalScore <= 0) errs.push('Total test case score must be greater than 0');
          cases.forEach((tc, i) => {
            if (!(tc.InputData && String(tc.InputData).trim())) errs.push(`Test case ${i+1} is missing input`);
            if (!(tc.ExpectedOutput && String(tc.ExpectedOutput).trim())) errs.push(`Test case ${i+1} is missing expected output`);
          });
        }

        if (errs.length > 0) {
          socket.emit('response_update_question', { success: false, message: 'Validation failed', errors: errs });
          return;
        }
      } catch (e) {
        // ignore and continue
      }

      // Use centralized `hasPermission` for both any/own checks and then
      // decide based on ownership. This avoids ad-hoc DB checks and keeps
      // permission logic consistent across the app.
      const canEditAny = hasPermission ? await hasPermission(session.userId, 'problem.edit.any') : false;
      const canEditOwn = hasPermission ? await hasPermission(session.userId, 'problem.edit.own') : false;
      console.log('[perm-debug] request_update_question:', { userId: session.userId, isAdmin, canEditAny, canEditOwn, ProblemID });

      if (!canEditAny) {
        const [ownerRows] = await db.query(
          `
          SELECT a.requested_by
          FROM approvals a
          JOIN content_items ci ON a.content_item_id = ci.content_item_id
          JOIN content_problems cp ON cp.content_item_id = ci.content_item_id
          WHERE cp.problem_id = ?
          LIMIT 1
          `,
          [ProblemID]
        );

        console.log('[perm-debug] request_update_question -> ownerRows:', { ownerRows });

        const isOwner = ownerRows.length > 0 && ownerRows[0].requested_by === session.userId;
        // Require explicit `problem.edit.own` permission for owners to update
        // when they don't have the global `problem.edit.any` grant.
        if (!isOwner || !canEditOwn) {
          socket.emit('response_update_question', { success: false, message: 'Unauthorized: Only owners with problem.edit.own or users with problem.edit.any may update' });
          return;
        }
      }

      if (!ProblemID || !ProblemName || !Description) {
        socket.emit('response_update_question', { success: false, message: 'Missing required fields' });
        return;
      }

      const connection = await db.getConnection();
      await connection.beginTransaction();

      try {
        const sampleSolutionVal = SourceCode || problemData.sourceCode || '';
        await connection.query(
          'UPDATE problems SET problem_name = ?, difficulty = ?, time_limit_seconds = ?, memory_limit_mb = ?, description = ?, sample_solution = ? WHERE problem_id = ?',
          [ProblemName, Difficulty, TimeLimitSeconds || 1, MemoryLimitMB || 64, Description || '', sampleSolutionVal, ProblemID]
        );

        await connection.query('DELETE FROM test_cases WHERE problem_id = ?', [ProblemID]);

        if (TestCases && TestCases.length > 0) {
          for (let i = 0; i < TestCases.length; i++) {
            const tc = TestCases[i];
            await connection.query(
              'INSERT INTO test_cases (problem_id, test_case_number, input_data, expected_output, is_sample, score) VALUES (?, ?, ?, ?, ?, ?)',
              [ProblemID, i + 1, tc.InputData, tc.ExpectedOutput, tc.IsSample ? 1 : 0, tc.Score || 0]
            );
          }
        }

        // Topics payload processed for update (no debug log in production)
        await connection.query('DELETE FROM problems_have_topics WHERE problem_id = ?', [ProblemID]);
        if (Topics && Topics.length > 0) {
          const resolvedUpdate = [];
          for (const topicItem of Topics) {
            try {
              const tid = await resolveTopicId(connection, topicItem);
              // resolved topic id available for internal verification
              resolvedUpdate.push({ raw: topicItem, topic_id: tid });
              await connection.query('INSERT INTO problems_have_topics (problem_id, topic_id) VALUES (?, ?)', [ProblemID, tid]);
            } catch (e) {
              console.warn('Failed to associate topic for updated problem', topicItem, e && e.message);
            }
          }
          try {
            const [phtRowsUpd] = await connection.query('SELECT pt.topic_id, pt.topic_name FROM problems_have_topics pht JOIN problem_topics pt ON pht.topic_id = pt.topic_id WHERE pht.problem_id = ?', [ProblemID]);
            // verification performed; intentionally not logging in production
          } catch (e) { console.warn('request_update_question -> failed to verify problems_have_topics', e && e.message); }
        }

        // content_problems has no status column; update approval status via approvals table
        try {
          const newStatus = (problemData && problemData.isDraft) ? 'draft' : (isAdmin ? 'approved' : 'pending');
          const [cpLink] = await connection.query('SELECT content_item_id FROM content_problems WHERE problem_id = ? LIMIT 1', [ProblemID]);
          if (cpLink && cpLink.length > 0) {
            const approvedBy = (newStatus === 'approved') ? session.userId : null;
            const reason = (newStatus === 'approved') ? 'Auto-approved: Admin update' : (newStatus === 'draft' ? 'Draft - in progress' : 'Awaiting approval');
            await connection.query(
              'UPDATE approvals SET status = ?, approved_by = ?, reason = ? WHERE content_item_id = ?',
              [newStatus, approvedBy, reason, cpLink[0].content_item_id]
            );
          }
        } catch (e) {
          // non-fatal: approval status update failed
        }

        await connection.commit();
        connection.release();

        socket.emit('response_update_question', { success: true, message: 'Question updated successfully' });

      } catch (err) {
        await connection.rollback();
        connection.release();
        throw err;
      }

    } catch (err) {
      console.error('Error in request_update_question (modal handler):', err);
      socket.emit('response_update_question', { success: false, message: 'Server error: ' + err.message });
    }
  });

  // === RECORD TEST RUN: persist a test run result for an existing problem ===
  socket.on('request_record_test_run', async ({ token_session, ProblemID, passed, total, verdict, results }) => {
    try {
      let session = null;
      if (socket.user && socket.user.userId) {
        session = { userId: socket.user.userId, decoded: socket.user.decoded };
      } else if (verifySession) {
        session = await verifySession(token_session);
      }
      if (!session) {
        socket.emit('response_record_test_run', { success: false, message: 'Invalid session' });
        return;
      }

      // Insert a row into problem_test_runs (separate from gameplay submissions)
      const connection = await db.getConnection();
      try {
        const resultsText = results ? JSON.stringify(results) : null;
        const [ins] = await connection.query(
          `INSERT INTO problem_test_runs (problem_id, user_id, passed, total, verdict, results, score, result, submitted_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [ProblemID, session.userId, Number.isFinite(Number(passed)) ? Number(passed) : null, Number.isFinite(Number(total)) ? Number(total) : null, (verdict || '').toString(), resultsText, Number(passed || 0), (verdict || '').toString(), new Date()]
        );

        // content_problems has no last_* columns; test run data is stored only in problem_test_runs

        connection.release();
        socket.emit('response_record_test_run', { success: true, test_run_id: ins.insertId, problem_id: ProblemID });
      } catch (e) {
        try { connection.release(); } catch (er) {}
        console.error('Failed to record test run for problem', ProblemID, e);
        socket.emit('response_record_test_run', { success: false, message: 'Failed to record test run' });
      }
    } catch (err) {
      console.error('Error in request_record_test_run:', err);
      socket.emit('response_record_test_run', { success: false, message: 'Server error' });
    }
  });

};
