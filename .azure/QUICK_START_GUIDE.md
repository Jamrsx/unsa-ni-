# SearchPanel Filter - Quick Start Guide

## 📋 What Was Done

Enhanced question filtering in the Admin Dashboard with:
- ✅ Real-time search by problem name
- ✅ Sort ascending/descending toggle
- ✅ Difficulty filter (Easy/Medium/Hard)
- ✅ Multi-select topic filters (6 categories)
- ✅ Clear all filters button
- ✅ Immediate table updates across all 3 tables

---

## 🚀 Implementation Steps

### Step 1: Database Migration (REQUIRED)

```bash
cd DuelCode-Capstone-Project/sql
mysql -u root -p duelcode_capstone_project < add_problem_topics_table.sql
```

**What this creates:**
- `problem_topics` table (6 predefined topics)
- `problems_have_topics` junction table (linking problems to topics)
- 3 new indexes for fast queries

---

### Step 2: Frontend Code (ALREADY DONE)

All Vue components updated:
- ✅ SearchPanel.vue - Enhanced with filters
- ✅ content_question_set.vue - Emits filter events
- ✅ AdminDashboard.vue - Receives and processes filters

No action needed on frontend.

---

### Step 3: Backend Socket Handler (TO DO)

Add this to your `server.js` or socket handlers file:

**File:** `server.js` (or wherever you handle socket events)

```javascript
socket.on('request_filter_questions', async (payload) => {
  const { token_session, tableType, search, sortOrder, difficulty, topicIds } = payload;

  try {
    // 1. Verify admin session
    const userId = await verifyAdmin(token_session);
    if (!userId) {
      socket.emit('response_filter_questions', {
        success: false,
        message: 'Unauthorized',
        questions: []
      });
      return;
    }

    // 2. Build SQL query
    let query = `
      SELECT DISTINCT p.problem_id, p.problem_name, p.difficulty, 
             p.time_limit_seconds, p.memory_limit_mb, p.description
      FROM problems p
      LEFT JOIN problems_have_topics pht ON p.problem_id = pht.problem_id
      WHERE 1=1
    `;

    const params = [];

    // 3. Add filters
    if (search && search.trim()) {
      query += ` AND p.problem_name LIKE ?`;
      params.push(`%${search}%`);
    }

    if (difficulty && difficulty.trim()) {
      query += ` AND p.difficulty = ?`;
      params.push(difficulty);
    }

    if (topicIds && topicIds.length > 0) {
      const placeholders = topicIds.map(() => '?').join(',');
      query += ` AND pht.topic_id IN (${placeholders})`;
      params.push(...topicIds);
    }

    // 4. Sort
    if (sortOrder === 'desc') {
      query += ` ORDER BY p.problem_name DESC`;
    } else {
      query += ` ORDER BY p.problem_name ASC`;
    }

    // 5. Execute
    const connection = await pool.getConnection();
    const [rows] = await connection.query(query, params);
    connection.release();

    // 6. Send response
    socket.emit('response_filter_questions', {
      success: true,
      questions: rows,
      message: `Found ${rows.length} problems`
    });

  } catch (error) {
    console.error('[Filter Error]:', error);
    socket.emit('response_filter_questions', {
      success: false,
      message: 'Server error',
      questions: []
    });
  }
});
```

**See:** `BACKEND_FILTER_HANDLER.js` for complete implementation with helper functions.

---

## 🧪 Testing

### 1. Database Check
```sql
-- Verify new tables exist
SHOW TABLES LIKE 'problem_topics';
SHOW TABLES LIKE 'problems_have_topics';

-- Check topics
SELECT * FROM problem_topics;

-- Check problem-topic mappings
SELECT * FROM problems_have_topics;
```

### 2. Frontend Testing

1. Open browser DevTools (F12)
2. Go to Admin Dashboard → Question Set
3. Open SearchPanel (right panel)
4. Test each filter:
   - **Type search:** "Two Sum" → should filter results
   - **Click sort buttons:** ⬆️ / ⬇️ → tables should re-sort
   - **Select difficulty:** "Easy" → filter by difficulty
   - **Check topics:** Array, Math → filter by topics
   - **Clear filters:** All should reset
5. Check Console for debug logs
6. Verify all 3 tables update together

### 3. Console Output
You should see logs like:
```
[SearchPanel] Filters updated: {search: "Two Sum", sortOrder: "asc", difficulty: "Easy", selectedTopics: [1, 2]}
[AdminDashboard] Filter questions received: {...}
[Filter] Questions filtered for admin: ...resultCount: 3
```

---

## 📁 Files Modified/Created

| File | Action | Note |
|------|--------|------|
| `sql/add_problem_topics_table.sql` | **CREATED** | Database migration |
| `src/components/search-panel.vue` | **UPDATED** | New filter UI |
| `src/components/dashboard/admin/content_question_set.vue` | **UPDATED** | Added emits |
| `src/js/admin-dashboard.js` | **UPDATED** | Added filter_questions() |
| `src/AdminDashboard.vue` | **UPDATED** | Added filter handler |
| `BACKEND_FILTER_HANDLER.js` | **CREATED** | Backend implementation guide |
| `FILTER_IMPLEMENTATION_SUMMARY.md` | **CREATED** | Full documentation |
| `FLOW_DIAGRAMS.md` | **CREATED** | Visual flow diagrams |

---

## 🔍 How It Works (Quick Overview)

```
User types/clicks filters in SearchPanel
           ↓
SearchPanel emits 'filters-updated' event
           ↓
content_question_set re-emits as 'filter-questions'
           ↓
AdminDashboard catches event & calls filter_questions()
           ↓
Socket sends 'request_filter_questions' to backend
           ↓
Backend processes query & sends back 'response_filter_questions'
           ↓
AdminDashboard updates question tables with results
           ↓
Vue reactivity triggers & tables re-render instantly ✓
```

---

## ⚠️ Important Notes

1. **Database migration MUST be run first**
   ```bash
   mysql -u root -p duelcode_capstone_project < sql/add_problem_topics_table.sql
   ```

2. **Backend socket handler MUST be implemented**
   - See `BACKEND_FILTER_HANDLER.js` for complete code
   - Follow the same socket request/response pattern as existing handlers

3. **No watchers needed**
   - Filter logic is event-driven (cleaner design)
   - Existing watchers in AdminDashboard remain unchanged

4. **Progress filter is intentionally excluded**
   - As per requirements: "dont include the progress"
   - Only: search, sort, difficulty, topics

5. **Debug section kept**
   - Shows current filter values
   - Useful for troubleshooting
   - Keep in production or remove as preferred

---

## 🔧 Troubleshooting

### Tables not updating
- Check browser console for errors
- Verify backend socket handler is running
- Check network tab for socket messages

### Filters not emitting
- Check SearchPanel debug section (bottom)
- Verify filters are reactive (use ref())
- Check console for emitFilters() logs

### Database errors
- Run migration: `add_problem_topics_table.sql`
- Verify tables created: `SHOW TABLES`
- Check problem_topics has data: `SELECT * FROM problem_topics`

### Socket connection issues
- Backend socket.io server must be running
- Token must be in localStorage
- Check browser console for socket errors

---

## 📚 Documentation Files

1. **FILTER_IMPLEMENTATION_SUMMARY.md** - Complete overview
2. **BACKEND_FILTER_HANDLER.js** - Backend code template
3. **FLOW_DIAGRAMS.md** - Visual flow diagrams
4. **This file** - Quick start guide

---

## ✅ Checklist Before Going Live

- [ ] Run SQL migration
- [ ] Implement backend socket handler
- [ ] Test search filter
- [ ] Test sort buttons (asc/desc)
- [ ] Test difficulty dropdown
- [ ] Test topic checkboxes
- [ ] Test clear button
- [ ] Verify all 3 tables update together
- [ ] Check console for debug logs
- [ ] Test with various filter combinations
- [ ] Verify socket messages in Network tab
- [ ] Load test with large result sets

---

## 🎯 Next Steps

1. **Run database migration** (if not done)
2. **Implement backend handler** from BACKEND_FILTER_HANDLER.js
3. **Test thoroughly** using Testing section above
4. **Deploy** when confident

---

## 💡 Tips

- **Debug mode:** Check SearchPanel debug section at bottom for current filters
- **Real-time feedback:** Type in search → immediate results
- **Combine filters:** All filters work together (AND logic)
- **Performance:** Indexes added for fast queries (even with large datasets)
- **Extensibility:** Easy to add more filters in future (e.g., rating, author)

---

Need help? Check:
1. Console logs for errors
2. Network tab for socket messages
3. BACKEND_FILTER_HANDLER.js for implementation details
4. FLOW_DIAGRAMS.md for visual reference
