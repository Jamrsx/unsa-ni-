// ============================================================
// Backend Socket Handler for Question Filtering
// ============================================================
// This is the required backend implementation for the SearchPanel filter feature.
// Add this to your server.js or appropriate socket handler file.
// ============================================================

socket.on('request_filter_questions', async (payload) => {
  const { token_session, tableType, search, sortOrder, difficulty, topicIds } = payload;

  try {
    // 1. Verify admin session and get user ID
    const userId = await verifyAdmin(token_session);
    if (!userId) {
      socket.emit('response_filter_questions', {
        success: false,
        message: 'Unauthorized: Admin access required',
        questions: []
      });
      return;
    }

    // 2. Build SQL query based on tableType
    let query = `
      SELECT DISTINCT p.problem_id, p.problem_name, p.difficulty, 
             p.time_limit_seconds, p.memory_limit_mb, p.description
      FROM problems p
      LEFT JOIN problems_have_topics pht ON p.problem_id = pht.problem_id
      LEFT JOIN content_problems cp ON p.problem_id = cp.problem_id
      LEFT JOIN content_items ci ON cp.content_item_id = ci.content_item_id
      WHERE 1=1
    `;

    const params = [];

    // 3. Filter by table type (admin/user/pending)
    if (tableType === 'admin') {
      // Admin-created problems (where author is admin)
      query += ` AND ci.content_item_id IS NOT NULL`;
    } else if (tableType === 'user') {
      // User-submitted problems (where author is not admin)
      query += ` AND ci.content_item_id IS NOT NULL`;
    } else if (tableType === 'pending') {
      // Pending approval problems
      query += ` AND ci.content_item_id IS NOT NULL`;
    }

    // 4. Filter by search (problem name)
    if (search && search.trim()) {
      query += ` AND p.problem_name LIKE ?`;
      params.push(`%${search}%`);
    }

    // 5. Filter by difficulty
    if (difficulty && difficulty.trim()) {
      query += ` AND p.difficulty = ?`;
      params.push(difficulty);
    }

    // 6. Filter by topics (if selected)
    if (topicIds && topicIds.length > 0) {
      const placeholders = topicIds.map(() => '?').join(',');
      query += ` AND pht.topic_id IN (${placeholders})`;
      params.push(...topicIds);
    }

    // 7. Sort by problem name
    if (sortOrder === 'desc') {
      query += ` ORDER BY p.problem_name DESC`;
    } else {
      query += ` ORDER BY p.problem_name ASC`;
    }

    // 8. Execute query
    const connection = await pool.getConnection();
    const [rows] = await connection.query(query, params);
    connection.release();

    // 9. Return filtered results
    socket.emit('response_filter_questions', {
      success: true,
      questions: rows,
      message: `Found ${rows.length} problems matching filters`
    });

    // Debug log
    console.log('[Filter] Questions filtered for', tableType, ':', {
      search,
      difficulty,
      topicIds,
      sortOrder,
      resultCount: rows.length
    });

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

// ============================================================
// Helper: Verify Admin Access
// ============================================================
async function verifyAdmin(token_session) {
  try {
    const decoded = jwt.verify(token_session, JWT_SECRET);
    
    // Check if user has admin role
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT ur.role_id FROM user_roles ur 
       JOIN users u ON ur.user_id = u.user_id 
       WHERE u.user_id = ? AND ur.role_id = 3`,
      [decoded.id]
    );
    connection.release();

    return rows.length > 0 ? decoded.id : null;
  } catch (error) {
    console.error('[Verify] Admin verification failed:', error);
    return null;
  }
}

// ============================================================
// SQL Query Reference
// ============================================================
// 1. Basic filter by difficulty:
// SELECT * FROM problems WHERE difficulty = 'Easy' ORDER BY problem_name ASC;

// 2. Filter by topics:
// SELECT DISTINCT p.* FROM problems p
// LEFT JOIN problems_have_topics pht ON p.problem_id = pht.problem_id
// WHERE pht.topic_id IN (1, 2, 3)
// ORDER BY p.problem_name ASC;

// 3. Combined filters (search + difficulty + topics):
// SELECT DISTINCT p.* FROM problems p
// LEFT JOIN problems_have_topics pht ON p.problem_id = pht.problem_id
// WHERE p.problem_name LIKE '%Two Sum%'
// AND p.difficulty = 'Easy'
// AND pht.topic_id IN (1, 2)
// ORDER BY p.problem_name ASC;

// ============================================================
// Expected Response Format
// ============================================================
/*
{
  "success": true,
  "message": "Found 3 problems matching filters",
  "questions": [
    {
      "problem_id": 2,
      "problem_name": "Two Sum",
      "difficulty": "Easy",
      "time_limit_seconds": 1,
      "memory_limit_mb": 64,
      "description": "Find two numbers that add up to a target"
    },
    {
      "problem_id": 4,
      "problem_name": "Longest Substring Without Repeating",
      "difficulty": "Medium",
      "time_limit_seconds": 2,
      "memory_limit_mb": 128,
      "description": "Find length of longest substring without repeating characters"
    },
    ...
  ]
}
*/

// ============================================================
// Frontend Socket Emission (for reference)
// ============================================================
/*
socket.emit('request_filter_questions', {
  token_session: 'jwt_token_here',
  tableType: 'admin',  // or 'user', 'pending'
  search: 'Two Sum',
  sortOrder: 'asc',    // or 'desc'
  difficulty: 'Easy',  // or '', 'Medium', 'Hard'
  topicIds: [1, 2]     // or [] for all topics
})
*/
