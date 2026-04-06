# SearchPanel Filter - Complete Implementation Flow

## 1. User Interaction Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│ USER ACTIONS IN SEARCHPANEL                                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Type Search  │  │ Click Sort   │  │Select Topics │              │
│  │ "Two Sum"    │  │ ⬆️ / ⬇️       │  │ Array, Math  │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                  │                       │
│         └─────────────────┼──────────────────┘                       │
│                           ▼                                          │
│                  ┌────────────────────┐                             │
│                  │  emitFilters()     │                             │
│                  │ (SearchPanel)      │                             │
│                  └─────────┬──────────┘                             │
│                            │                                        │
└────────────────────────────┼────────────────────────────────────────┘
                             │
```

## 2. Component Communication Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│ COMPONENT HIERARCHY & EVENT FLOW                                         │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  AdminDashboard.vue                                                       │
│  ├─ Imports: filter_questions() from admin-dashboard.js                 │
│  ├─ Defines: handleFilterQuestions(filters) method                       │
│  │                                                                        │
│  └─ Template:                                                             │
│     └─ content_question_set (component)                                  │
│        ├─ Receives: admin_question_rows, user_question_rows, etc        │
│        ├─ Emits:   @filter-questions="handleFilterQuestions"            │
│        │                                                                  │
│        └─ Template:                                                       │
│           ├─ SplitMainWindow (tabs for Admin/User/Pending)              │
│           │  └─ Displays: Tables with filtered data                      │
│           │                                                              │
│           └─ Window (right panel)                                        │
│              └─ SearchPanel (component)                                  │
│                 ├─ Local State:                                          │
│                 │  ├─ search: ref('')                                    │
│                 │  ├─ sortOrder: ref('asc')                              │
│                 │  ├─ difficulty: ref('')                                │
│                 │  └─ selectedTopics: ref([])                            │
│                 │                                                        │
│                 ├─ Emits:                                                │
│                 │  └─ @filters-updated={search, sortOrder, ...}         │
│                 │                                                        │
│                 └─ UI Elements:                                          │
│                    ├─ <input v-model="search">                          │
│                    ├─ <button> Sort: ⬆️ / ⬇️                             │
│                    ├─ <select> Difficulty dropdown                       │
│                    ├─ <input type="checkbox"> Topics (x6)               │
│                    └─ Debug section                                      │
│                                                                            │
└──────────────────────────────────────────────────────────────────────────┘
```

## 3. Socket Communication Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│ FRONTEND ← SOCKET.IO ← BACKEND                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ FRONTEND (JavaScript)              BACKEND (Node.js)                   │
│ ─────────────────────              ──────────────────                  │
│                                                                          │
│ AdminDashboard.vue                                                      │
│  └─ handleFilterQuestions(filters)                                     │
│     └─ filter_questions() [admin-dashboard.js]                        │
│        │                                                                │
│        ├─ socket.emit('request_filter_questions', {                   │
│        │   token_session,                                             │
│        │   tableType: 'admin',                    ──────────────────► │
│        │   search: 'Two Sum',                  ●  socket.on()         │
│        │   sortOrder: 'asc',                   ●                      │
│        │   difficulty: 'Easy',                 ●  1. Verify admin     │
│        │   topicIds: [1, 2]                    ●  2. Build SQL        │
│        │ })                                    ●  3. Execute query    │
│        │                                       ●  4. Build response   │
│        │                                          ●                   │
│        │                                          ▼                   │
│        │◄─────────────────────────────────────────────────────────── │
│        │ socket.emit('response_filter_questions', {                   │
│        │   success: true,                                             │
│        │   questions: [                                               │
│        │     {problem_id, problem_name, difficulty, ...},             │
│        │     {problem_id, problem_name, difficulty, ...}              │
│        │   ]                                                          │
│        │ })                                                            │
│        │                                                                │
│        └─ callback(data) ◄──────────────────────────────────────────   │
│           ├─ admin_question_rows.value = data.questions                │
│           ├─ user_question_rows.value = data.questions                 │
│           └─ pending_question_rows.value = data.questions              │
│              │                                                          │
│              └─ ▼ Vue Reactivity                                        │
│                 └─ Tables re-render with filtered data                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## 4. State Management Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│ SEARCHPANEL STATE → FILTER OBJECT → SOCKET → DATABASE QUERY             │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│ SearchPanel (Composition API)                                            │
│ ──────────────────────────────────────────────────────────────────────   │
│                                                                            │
│  const search = ref('')                    ┐                            │
│  const sortOrder = ref('asc')              │                            │
│  const difficulty = ref('')                ├─ Reactive State           │
│  const selectedTopics = ref([])            │                            │
│                                            ┘                            │
│           │                                                              │
│           │ (user types/clicks/selects)                                 │
│           ▼                                                              │
│  emitFilters() function                                                 │
│           │                                                              │
│           │ Builds filter object:                                       │
│           ▼                                                              │
│  {                                                                       │
│    search: 'Two Sum',                                                   │
│    sortOrder: 'asc',                                                    │
│    difficulty: 'Easy',                                                  │
│    selectedTopics: [1, 2]                                              │
│  }                                                                       │
│           │                                                              │
│           │ Emits to parent                                             │
│           ▼                                                              │
│  @filters-updated                                                       │
│           │                                                              │
│  content_question_set.vue                                               │
│           │                                                              │
│           │ Re-emits                                                    │
│           ▼                                                              │
│  @filter-questions                                                      │
│           │                                                              │
│  AdminDashboard.vue                                                     │
│           │                                                              │
│           │ Calls filter_questions(tableType, filters, callback)       │
│           ▼                                                              │
│  admin-dashboard.js (Socket Layer)                                      │
│           │                                                              │
│           │ socket.emit('request_filter_questions', {                  │
│           │   token_session,                                           │
│           │   tableType,                                               │
│           │   ...filters                                               │
│           │ })                                                          │
│           ▼                                                              │
│  Backend (server.js)                                                    │
│           │                                                              │
│           │ socket.on('request_filter_questions', async (payload) => {  │
│           │   // 1. Verify admin                                       │
│           │   // 2. Build SQL:                                         │
│           │   //    SELECT ... FROM problems p                         │
│           │   //    LEFT JOIN problems_have_topics ...                 │
│           │   //    WHERE problem_name LIKE '%Two Sum%'               │
│           │   //    AND difficulty = 'Easy'                            │
│           │   //    AND topic_id IN (1, 2)                             │
│           │   //    ORDER BY problem_name ASC                          │
│           │   // 3. Execute query                                      │
│           │   // 4. Emit response                                      │
│           │ })                                                          │
│           ▼                                                              │
│  Database (MySQL)                                                       │
│           │                                                              │
│           │ Returns: 3 problems matching filters                        │
│           ▼                                                              │
│  Frontend receives response_filter_questions                            │
│           │                                                              │
│           │ callback(data) updates:                                     │
│           │ - admin_question_rows.value = data.questions               │
│           │ - user_question_rows.value = data.questions                │
│           │ - pending_question_rows.value = data.questions             │
│           ▼                                                              │
│  Vue Reactivity Triggers                                                │
│           │                                                              │
│           │ Tables components detect prop changes                       │
│           ▼                                                              │
│  Tables Re-render                                                       │
│           │                                                              │
│           │ Admin_question_table shows: [filtered 3 problems]          │
│           │ User_question_table shows: [filtered 3 problems]           │
│           │ Pending_question_table shows: [filtered 3 problems]        │
│           ▼                                                              │
│  USER SEES UPDATED TABLES (Immediate!)                                 │
│                                                                            │
└──────────────────────────────────────────────────────────────────────────┘
```

## 5. Data Flow Timeline

```
Time →

User Types "Two Sum"
         │
         ▼
SearchPanel: search.value = "Two Sum"
         │
         ▼
@input event triggered
         │
         ▼
emitFilters() called
         │
         ▼
Emit @filters-updated
         │
         ▼
content_question_set receives event
         │
         ▼
Emit @filter-questions
         │
         ▼
AdminDashboard.handleFilterQuestions() called
         │
         ▼
Call filter_questions('admin', filters, callback)
Call filter_questions('user', filters, callback)
Call filter_questions('pending', filters, callback)
         │
         ▼
socket.emit('request_filter_questions') x3
         │
         ▼
──────────────────────────────────────┼────────── (Network)
         │ Backend receives request
         ▼
socket.on('request_filter_questions')
         │
         ├─ Verify admin session
         ├─ Build SQL query
         ├─ Execute query
         └─ Prepare response
         │
         ▼
socket.emit('response_filter_questions')
         │
         ▼
──────────────────────────────────────┼────────── (Network)
         │ Frontend receives response
         ▼
socket.on('response_filter_questions') callback
         │
         ├─ admin_question_rows.value = data.questions
         ├─ user_question_rows.value = data.questions
         └─ pending_question_rows.value = data.questions
         │
         ▼
Vue detects prop changes
         │
         ▼
Admin_question_table detects :question_rows change
User_question_table detects :question_rows change
Pending_question_table detects :question_rows change
         │
         ▼
Tables re-render with new data
         │
         ▼
USER SEES 3 TABLES UPDATED INSTANTLY ✓
```

## 6. File Dependencies

```
SearchPanel.vue
    ↑
    └─ imports (none - self-contained)

content_question_set.vue
    ├─ imports: SearchPanel.vue
    └─ emits: @filter-questions

AdminDashboard.vue
    ├─ imports: 
    │   ├─ content_question_set.vue
    │   └─ filter_questions() from admin-dashboard.js
    └─ listens: @filter-questions from content_question_set

admin-dashboard.js
    ├─ exports: filter_questions()
    └─ uses: socket.io-client

Backend (server.js)
    ├─ socket.on('request_filter_questions')
    ├─ MySQL query to problems/problems_have_topics
    └─ socket.emit('response_filter_questions')

Database (MySQL)
    ├─ problems table
    ├─ problem_topics table (NEW)
    ├─ problems_have_topics table (NEW)
    └─ problems_have_topics indexes (NEW)
```

## 7. Key Implementation Points

✅ **SearchPanel is self-contained and reusable**
✅ **No modifications to existing table components needed**
✅ **Event-driven approach (no watchers for filtering)**
✅ **All three tables update simultaneously**
✅ **Immediate feedback (no page reload)**
✅ **Debug section preserved for troubleshooting**
✅ **Socket pattern consistent with existing code**
✅ **Type-safe token handling**
✅ **Proper async error handling**
