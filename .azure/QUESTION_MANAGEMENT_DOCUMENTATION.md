# Question Management System - Complete Documentation

## Overview
This documentation covers the comprehensive question/problem management system with test case validation, draft functionality, and multi-status tracking across both user and admin dashboards.

---

## Table of Contents
1. [Database Schema](#database-schema)
2. [Question Creation Modal](#question-creation-modal)
3. [Test Case Management](#test-case-management)
4. [Code Testing Feature](#code-testing-feature)
5. [Save Draft Feature](#save-draft-feature)
6. [User Dashboard - My Questions](#user-dashboard---my-questions)
7. [Admin Dashboard - Draft Questions](#admin-dashboard---draft-questions)
8. [Backend Socket Handlers](#backend-socket-handlers)
9. [File Structure](#file-structure)

---

## Database Schema

### Approvals Table - Status Enum
The `approvals` table now includes a `draft` status for questions that are saved but not yet submitted for review:

```sql
ALTER TABLE approvals 
MODIFY COLUMN status ENUM('pending', 'approved', 'denied', 'draft') NOT NULL DEFAULT 'pending';
```

**Status Values:**
- `pending`: Question submitted for admin review
- `approved`: Question approved by admin and visible to users
- `denied`: Question rejected by admin with optional reason
- `draft`: Question saved as draft (incomplete, not submitted)

### Foreign Key Constraints
All foreign key constraints have been updated to use `DROP FOREIGN KEY IF EXISTS` pattern to ensure idempotent database imports:

```sql
-- Example pattern used throughout
ALTER TABLE content_problems DROP FOREIGN KEY IF EXISTS content_problems_fk_ci;
ALTER TABLE content_problems ADD CONSTRAINT content_problems_fk_ci 
  FOREIGN KEY (content_item_id) REFERENCES content_items(content_item_id) ON DELETE CASCADE;
```

---

## Question Creation Modal

### File Location
`src/components/modals/create_question_modal.vue`

### Test Case Count Enforcement

**Constants:**
```javascript
const MIN_CASES = 4  // Minimum required test cases
const MAX_CASES = 7  // Maximum allowed test cases
```

**Computed Properties:**
```javascript
// Controls "Add Test Case" button state
const canAdd = computed(() => testCases.value.length < MAX_CASES)

// Controls "Remove" button state for each test case
const canRemove = computed(() => testCases.value.length > MIN_CASES)
```

**Features:**
- Add button disabled when 7 test cases exist
- Remove button disabled when only 4 test cases remain
- Visual feedback via disabled button states
- Validation prevents submission with fewer than 4 test cases

---

## Test Case Management

### Test Case Structure
```javascript
{
  input: '',       // stdin for the test case
  expected: ''     // expected stdout
}
```

### Add Test Case
```javascript
function addTestCase() {
  if (testCases.value.length < MAX_CASES) {
    testCases.value.push({ input: '', expected: '' })
  }
}
```

### Remove Test Case
```javascript
function removeTestCase(index) {
  if (testCases.value.length > MIN_CASES) {
    testCases.value.splice(index, 1)
  }
}
```

### Default Initialization
When the modal opens, it initializes with exactly 4 empty test cases to meet the minimum requirement.

---

## Code Testing Feature

### Test Button & Modal

**Components:**
- Test button in create question modal
- Separate test modal (`test_code_modal.vue`) for code validation
- Code editor component (`CodeEditor.vue`)
- Language selector (Python, PHP, Java)

### Test Button Handler
```javascript
function handleTest() {
  // Validate: at least 4 test cases with input/expected values
  const validTestCases = testCases.value.filter(tc => 
    tc.input.trim() || tc.expected.trim()
  )
  
  if (validTestCases.length < MIN_CASES) {
    toastError(`You need at least ${MIN_CASES} test cases to run tests`)
    return
  }
  
  // Show test modal
  const modal = new bootstrap.Modal(document.getElementById('testCodeModal'))
  modal.show()
}
```

### Code Execution Flow

1. **User writes code** in CodeEditor component
2. **Selects language** (Python/PHP/Java)
3. **Clicks "Run Tests"** button
4. **Socket emits** to server with:
   ```javascript
   {
     token_session,
     language,
     code,
     testCases: [{ input, expected }, ...]
   }
   ```
5. **Server executes** code with `runWithTimeout()` and `isCodeSafe()` validation
6. **Results returned** for each test case with:
   ```javascript
   {
     passed: boolean,
     actualOutput: string,
     expectedOutput: string,
     error: string (if any)
   }
   ```

### Backend Test Handler
**File:** `server.js`

```javascript
socket.on('request_test_source_code', async ({ language, code, testCases }) => {
  // Validate code safety (no blacklisted commands)
  if (!isCodeSafe(code, language)) {
    socket.emit('response_test_source_code', { 
      success: false, 
      message: 'Code contains forbidden commands' 
    })
    return
  }

  // Run each test case
  const results = []
  for (const testCase of testCases) {
    const result = await runWithTimeout(language, code, testCase.input)
    results.push({
      passed: result.output.trim() === testCase.expected.trim(),
      actualOutput: result.output,
      expectedOutput: testCase.expected,
      error: result.error
    })
  }

  socket.emit('response_test_source_code', { success: true, results })
})
```

### Supported Languages
- **Python**: `.py` extension, `python` command
- **PHP**: `.php` extension, `php` command  
- **Java**: `.java` extension, `javac` + `java` commands

---

## Save Draft Feature

### Frontend Implementation

**Save Draft Button:**
```javascript
function handleSaveDraft() {
  // Minimal validation: only problem name required for drafts
  if (!problemName.value?.trim()) {
    toastError('Problem name is required to save draft')
    return
  }

  socket.emit('request_save_draft', {
    token_session: localStorage.getItem('token'),
    problemName: problemName.value,
    difficulty: difficulty.value,
    description: description.value,
    testCases: testCases.value,
    timeLimit: timeLimit.value,
    memoryLimit: memoryLimit.value
  })
}
```

**Socket Response Handler:**
```javascript
socket.on('response_save_draft', (data) => {
  if (data.success) {
    toastSuccess('Draft saved successfully')
    // Close modal and emit event to parent
    emit('draft-saved')
  } else {
    toastError(data.message || 'Failed to save draft')
  }
})
```

### Backend Handler
**File:** `src/js/conn/dashboard_admin_and_user_socket.js`

```javascript
socket.on('request_save_draft', async ({ token_session, ...data }) => {
  // Validate session
  const session = await verifySession(token_session)
  
  // Minimal validation: only problem_name required
  if (!data.problemName?.trim()) {
    socket.emit('response_save_draft', { 
      success: false, 
      message: 'Problem name required' 
    })
    return
  }

  // Start transaction
  const conn = await db.getConnection()
  await conn.beginTransaction()

  try {
    // 1. Insert into content_items
    const [contentResult] = await conn.query(
      'INSERT INTO content_items (content_type, created_at) VALUES (?, NOW())',
      ['problem']
    )
    const contentItemId = contentResult.insertId

    // 2. Insert into problems (allow NULL for optional fields)
    const [problemResult] = await conn.query(
      `INSERT INTO problems 
       (problem_name, description, difficulty, time_limit_seconds, memory_limit_mb) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.problemName,
        data.description || null,
        data.difficulty || 'Easy',
        data.timeLimit || 5,
        data.memoryLimit || 256
      ]
    )
    const problemId = problemResult.insertId

    // 3. Link content_items to problems
    await conn.query(
      'INSERT INTO content_problems (content_item_id, problem_id) VALUES (?, ?)',
      [contentItemId, problemId]
    )

    // 4. Insert test cases (if any)
    if (data.testCases?.length > 0) {
      for (const tc of data.testCases) {
        await conn.query(
          'INSERT INTO problem_test_cases (problem_id, input, expected_output) VALUES (?, ?, ?)',
          [problemId, tc.input || '', tc.expected || '']
        )
      }
    }

    // 5. Create approval record with status='draft'
    await conn.query(
      `INSERT INTO approvals 
       (content_item_id, requested_by, status, requested_at) 
       VALUES (?, ?, 'draft', NOW())`,
      [contentItemId, session.userId]
    )

    await conn.commit()
    socket.emit('response_save_draft', { success: true })

  } catch (err) {
    await conn.rollback()
    socket.emit('response_save_draft', { 
      success: false, 
      message: 'Server error' 
    })
  } finally {
    conn.release()
  }
})
```

### Key Differences: Draft vs Submit
| Feature | Save Draft | Submit Question |
|---------|-----------|-----------------|
| **Status** | `draft` | `pending` |
| **Validation** | Minimal (name only) | Strict (all fields + 4-7 test cases) |
| **Admin Review** | Not shown in pending | Shown in pending approvals |
| **Visibility** | User only | User + Admin |
| **Test Cases** | Optional | Required (4-7) |

---

## User Dashboard - My Questions

### File Location
`src/components/dashboard/user/content_my_questions.vue`

### Component Structure

**Layout:**
- 4 separate sections grouped by status
- Each section uses `TableList` component
- Computed filters for each status category

**Sections:**
1. **Approved Questions** ✓ (green)
2. **Pending Review** ⏳ (yellow)  
3. **Denied Questions** ✗ (red)
4. **Draft Questions** 📝 (gray)

### Socket Integration

**Request on mount:**
```javascript
onMounted(() => {
  const token = localStorage.getItem('token')
  socket.emit('request_get_my_questions', { token_session: token })
})
```

**Response handler:**
```javascript
socket.on('response_get_my_questions', (data) => {
  if (data.success) {
    allQuestions.value = data.questions || []
  }
})
```

### Computed Filters
```javascript
const approvedQuestions = computed(() => 
  allQuestions.value.filter(q => q.Status === 'approved')
)
const pendingQuestions = computed(() => 
  allQuestions.value.filter(q => q.Status === 'pending')
)
const deniedQuestions = computed(() => 
  allQuestions.value.filter(q => q.Status === 'denied')
)
const draftQuestions = computed(() => 
  allQuestions.value.filter(q => q.Status === 'draft')
)
```

### Data Structure
```javascript
{
  QuestionID: number,
  QuestionName: string,
  QuestionDifficulty: 'Easy' | 'Medium' | 'Hard',
  CreatedAt: timestamp,
  Status: 'approved' | 'pending' | 'denied' | 'draft',
  Reason: string | null  // Only for denied questions
}
```

### Backend Handler
**File:** `src/js/conn/dashboard_admin_and_user_socket.js`

```javascript
socket.on('request_get_my_questions', async ({ token_session }) => {
  const session = await verifySession(token_session)

  // Fetch all questions created by this user
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
  )

  socket.emit('response_get_my_questions', {
    success: true,
    questions: questions.map(q => ({
      QuestionID: q.problem_id,
      QuestionName: q.problem_name,
      QuestionDifficulty: q.difficulty,
      CreatedAt: q.created_at,
      Status: q.status,
      Reason: q.reason
    }))
  })
})
```

---

## Admin Dashboard - Draft Questions

### File Locations
- **Main Component:** `src/components/dashboard/admin/content_approval.vue`
- **Draft Table:** `src/components/dashboard/admin/admin_approval_set/draft_question_table.vue`
- **Parent Dashboard:** `src/AdminDashboard.vue`

### Admin View Structure

**3 Sections:**
1. **Pending Approvals** - Events, Blogs, Problems awaiting review
2. **Approved Items** - Already approved content
3. **Draft Questions** - All user drafts (NEW)

### Draft Questions Table Component

**File:** `admin_approval_set/draft_question_table.vue`

```vue
<template>
  <TableList :column_slot="['question_name', 'difficulty', 'author', 'created_at']">
    <!-- Column headers -->
    <template #question_name>
      <div class="window-table-header">
        <p>Question Name</p>
      </div>
    </template>
    <template #difficulty>
      <div class="window-table-header">
        <p>Difficulty</p>
      </div>
    </template>
    <template #author>
      <div class="window-table-header">
        <p>Author</p>
      </div>
    </template>
    <template #created_at>
      <div class="window-table-header">
        <p>Created Date</p>
      </div>
    </template>

    <!-- Table rows -->
    <template #table_rows>
      <tr 
        v-for="(q, index) in rows" 
        :key="q.approval_id"
        @click="$emit('view-question', q.problem_id)"
        style="cursor: pointer;"
      >
        <td>{{ index + 1 }}. {{ q.question_name }}</td>
        <td>{{ q.question_difficulty }}</td>
        <td>{{ q.author_username }}</td>
        <td>{{ formatDate(q.created_at) }}</td>
      </tr>
      
      <!-- Empty state -->
      <tr v-if="!rows || rows.length === 0">
        <td colspan="4" class="text-center text-muted">No draft questions</td>
      </tr>
    </template>
  </TableList>
</template>
```

### Backend Handler
**File:** `src/js/conn/dashboard_admin_and_user_socket.js`

```javascript
socket.on('request_get_draft_questions', async ({ token_session }) => {
  const session = await verifySession(token_session)
  const isAdmin = await verifyAdmin(session)

  if (!isAdmin) {
    socket.emit('response_get_draft_questions', { 
      success: false, 
      message: 'Admin access required' 
    })
    return
  }

  // Fetch all draft questions from all users
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
  `)

  socket.emit('response_get_draft_questions', {
    success: true,
    questions: draftQuestions
  })
})
```

### Admin Dashboard Integration

**File:** `src/AdminDashboard.vue`

```javascript
// Reactive data
const draft_questions = ref([])

// Watch for approval section navigation
watch(currentContentSection, (newVal) => {
  if (newVal === 'approval') {
    get_pending_approvals((data) => { /* ... */ })
    get_approved_approvals((data) => { /* ... */ })
    get_draft_questions((data) => {
      draft_questions.value = data.questions
    })
  }
})

// Refresh after approve/deny operations
function handleApproveItem(data) {
  approve_item(approval_id, content_type, (response) => {
    if (response.success) {
      get_pending_approvals(/* ... */)
      get_approved_approvals(/* ... */)
      get_draft_questions((data) => {
        draft_questions.value = data.questions
      })
    }
  })
}
```

**Frontend Service Function:**
**File:** `src/js/admin-dashboard.js`

```javascript
export function get_draft_questions(callback) {
    const token_session = localStorage.getItem("token")
    
    socket.emit('request_get_draft_questions', { token_session })
    
    socket.off('response_get_draft_questions')
    socket.on('response_get_draft_questions', (data) => {
        if (!data.success) {
            err(data.message || "Failed to get draft questions")
            return
        }
        callback && callback(data)
    })
}
```

---

## Backend Socket Handlers

### Summary of Socket Events

| Event Name | Direction | Description | Required Role |
|-----------|-----------|-------------|---------------|
| `request_test_source_code` | Client → Server | Test user code against test cases | User |
| `response_test_source_code` | Server → Client | Return test results | - |
| `request_save_draft` | Client → Server | Save question as draft | User |
| `response_save_draft` | Server → Client | Confirm draft saved | - |
| `request_get_my_questions` | Client → Server | Get user's questions (all statuses) | User |
| `response_get_my_questions` | Server → Client | Return user's questions | - |
| `request_get_draft_questions` | Client → Server | Get all draft questions | Admin |
| `response_get_draft_questions` | Server → Client | Return all draft questions | - |

### Code Safety Validation

**Function:** `isCodeSafe(code, language)`

Blacklisted commands per language to prevent malicious code execution:

```javascript
const blacklist = {
  python: ['import os', 'import subprocess', 'exec(', 'eval(', '__import__'],
  php: ['exec(', 'shell_exec(', 'system(', 'passthru(', 'proc_open('],
  java: ['Runtime.getRuntime()', 'ProcessBuilder', 'java.lang.Runtime']
}
```

### Code Execution with Timeout

**Function:** `runWithTimeout(language, code, input, timeout = 5000)`

1. Creates temporary file in `SANDBOX` directory
2. Executes with language-specific command
3. Pipes `input` to stdin
4. Captures stdout/stderr
5. Enforces timeout (default 5s)
6. Cleans up temporary files

```javascript
const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

async function runWithTimeout(language, code, input, timeout = 5000) {
  const fileName = `temp_${Date.now()}.${getExtension(language)}`
  const filePath = path.join(__dirname, 'SANDBOX', fileName)
  
  // Write code to file
  fs.writeFileSync(filePath, code)
  
  return new Promise((resolve) => {
    const cmd = getCommand(language, filePath)
    const proc = spawn(cmd.command, cmd.args)
    
    let output = ''
    let error = ''
    
    // Timeout killer
    const timer = setTimeout(() => {
      proc.kill()
      resolve({ output: '', error: 'Execution timed out' })
    }, timeout)
    
    // Capture output
    proc.stdout.on('data', (data) => { output += data.toString() })
    proc.stderr.on('data', (data) => { error += data.toString() })
    
    // Write input to stdin
    if (input) {
      proc.stdin.write(input)
      proc.stdin.end()
    }
    
    // On completion
    proc.on('close', () => {
      clearTimeout(timer)
      fs.unlinkSync(filePath)  // Cleanup
      resolve({ output, error })
    })
  })
}
```

---

## File Structure

```
DuelCode-Capstone-Project/
│
├── sql/
│   ├── duelcode_capstone_project.sql         # Main schema with draft status
│   └── fix_approvals_table.sql               # Migration for draft status
│
├── server.js                                  # Main Express/Socket server
│   └── request_test_source_code handler      # Code testing endpoint
│
├── src/
│   ├── AdminDashboard.vue                    # Admin main view
│   │   └── draft_questions integration       # Draft questions state
│   │
│   ├── UserDashboard.vue                     # User main view
│   │   └── my_questions section              # Navigation to my questions
│   │
│   ├── components/
│   │   ├── modals/
│   │   │   ├── create_question_modal.vue     # Question creation with test/draft
│   │   │   └── test_code_modal.vue           # Code testing modal
│   │   │
│   │   ├── dashboard/
│   │   │   ├── admin/
│   │   │   │   ├── content_approval.vue      # Approval management
│   │   │   │   └── admin_approval_set/
│   │   │   │       └── draft_question_table.vue    # Draft table component
│   │   │   │
│   │   │   └── user/
│   │   │       └── content_my_questions.vue  # User questions by status
│   │   │
│   │   ├── CodeEditor.vue                    # Monaco-based code editor
│   │   └── table-list.vue                    # Reusable table component
│   │
│   └── js/
│       ├── admin-dashboard.js                # Admin frontend services
│       │   └── get_draft_questions()         # Fetch drafts function
│       │
│       └── conn/
│           └── dashboard_admin_and_user_socket.js   # Socket handlers
│               ├── request_save_draft
│               ├── request_get_my_questions
│               └── request_get_draft_questions
│
└── .azure/QUESTION_MANAGEMENT_DOCUMENTATION.md      # This file
```

---

## Testing Guide

### 1. Test Case Validation
1. Open create question modal
2. Verify 4 test cases by default
3. Try to remove - should be disabled (can't go below 4)
4. Add test cases up to 7
5. Try to add more - should be disabled (can't exceed 7)

### 2. Code Testing
1. Fill in at least 4 test cases with input/expected values
2. Click "Test" button
3. Write code in editor (Python/PHP/Java)
4. Click "Run Tests"
5. Verify results show pass/fail for each test case
6. Check actual vs expected output display

### 3. Save Draft
1. Enter only problem name
2. Click "Save Draft"
3. Verify success toast
4. Check User Dashboard → My Questions → Drafts section
5. Verify question appears in draft table

### 4. User Dashboard
1. Navigate to User Dashboard
2. Click "My Questions" in navigation
3. Verify 4 status sections display
4. Create/submit questions with different outcomes
5. Verify they appear in correct sections

### 5. Admin Dashboard
1. Login as admin
2. Navigate to Approval section
3. Verify 3 tables: Pending, Approved, Draft Questions
4. Check draft questions from all users display
5. Verify click on draft opens question details

### 6. Database Re-import
1. Export current database
2. Drop database
3. Re-import SQL file
4. Verify no foreign key errors (errno 1091, 121, 1061, 1068)
5. Check approvals table has 'draft' in status enum

---

## Common Issues & Solutions

### Issue: Test cases not validating
**Solution:** Ensure `MIN_CASES = 4` and `MAX_CASES = 7` constants are defined in `create_question_modal.vue`

### Issue: Code execution timeout
**Solution:** Increase timeout in `runWithTimeout()` call (default 5000ms)

### Issue: Draft not saving
**Solution:** 
- Check browser console for socket errors
- Verify session token in localStorage
- Check server logs for transaction errors
- Ensure `approvals.status` enum includes 'draft'

### Issue: Draft questions not showing in admin
**Solution:**
- Verify `get_draft_questions()` is called on approval section load
- Check SQL query returns results for status='draft'
- Ensure `draft_questions` prop is passed to `content_approval` component

### Issue: Foreign key errors on re-import
**Solution:**
- All FK constraints use `DROP FOREIGN KEY IF EXISTS` pattern
- Use unique constraint names (e.g., `content_problems_fk_ci` not generic `_ibfk_1`)
- Import order: users → problems → content_items → approvals

---

## Future Enhancements

1. **Edit Draft Functionality**
   - Load draft data into create modal
   - Update instead of insert
   - Track version history

2. **Bulk Operations**
   - Select multiple drafts
   - Batch delete/submit
   - Export as JSON

3. **Draft Auto-save**
   - Periodic save while editing
   - Browser localStorage backup
   - Recover unsaved changes

4. **Advanced Test Features**
   - Hidden test cases (not visible to users)
   - Performance benchmarks (time/memory)
   - Custom test case scoring weights

5. **Collaboration**
   - Share draft with other users
   - Collaborative editing
   - Comment threads on drafts

---

## Maintenance Notes

### Adding a New Status
1. Update `approvals.status` enum in SQL
2. Add filter computed property in `content_my_questions.vue`
3. Create new table section in template
4. Update `request_get_my_questions` query if needed
5. Add admin view section if applicable

### Adding a New Language
1. Add extension mapping in `getExtension(language)`
2. Add command mapping in `getCommand(language, filePath)`
3. Add blacklist rules in `isCodeSafe(code, language)`
4. Update language selector in `test_code_modal.vue`
5. Test with sample code and test cases

### Database Migration Best Practices
- Always use `DROP FOREIGN KEY IF EXISTS`
- Use unique constraint names across all tables
- Test migration on copy of production database
- Document changes in migration file comments
- Keep backup before running ALTER statements

---

## Credits

**Developed by:** DuelCode Capstone Project Team  
**Version:** 1.0.0  
**Last Updated:** 2024

---

## Support

For issues or questions:
- Check browser console for errors
- Review server logs for socket/database errors
- Verify database schema matches documentation
- Test with minimal example to isolate issue

---

**End of Documentation**
