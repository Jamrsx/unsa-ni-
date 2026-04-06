# Progress Filter Feature - Visual Implementation Guide

## User Interface

### SearchPanel with Progress Filter

```
┌──────────────────────────────────────────┐
│        Search & Filter Panel              │
├──────────────────────────────────────────┤
│                                          │
│ 🔍 [Search Problems...]  ↕️ Sort Order   │
│                                          │
├──────────────────────────────────────────┤
│ Topics                                   │
│ ☐ Basic Programming  ☐ Data Structures  │
│ ☐ Algorithms         ☐ Math & Theory    │
│ ☐ String Processing  ☐ Other Topics     │
│                                          │
├──────────────────────────────────────────┤
│ Filters                                  │
│                                          │
│ Progress: [All ▼]                        │
│           ┌──────────────┐               │
│           │ All          │ ← Selected    │
│           │ Complete     │               │
│           │ Unfinished   │               │
│           │ Untouched    │               │
│           └──────────────┘               │
│                                          │
│ Difficulty: [All ▼]                      │
│            ┌──────────────┐              │
│            │ All          │ ← Selected   │
│            │ Easy         │              │
│            │ Medium       │              │
│            │ Hard         │              │
│            └──────────────┘              │
│                                          │
└──────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                  USER INTERACTION                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  User clicks Progress dropdown                          │
│          ↓                                               │
│  Selects "Unfinished"                                   │
│          ↓                                               │
└──────────┬──────────────────────────────────────────────┘
           │
           ↓
┌─────────────────────────────────────────────────────────┐
│              SEARCHPANEL COMPONENT                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  progress.value = "Unfinished"                          │
│          ↓                                               │
│  emitFilters() called                                   │
│          ↓                                               │
│  Map display name to enum:                              │
│  "Unfinished" → 'unfinished'                            │
│          ↓                                               │
│  emit('filters-updated', {                              │
│    progress: 'unfinished',  ← enum value                │
│    ...other filters                                      │
│  })                                                      │
│          ↓                                               │
└──────────┬──────────────────────────────────────────────┘
           │
           ↓
┌─────────────────────────────────────────────────────────┐
│             SOLO.VUE COMPONENT                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  @filters-updated="handleFiltersUpdated"                │
│          ↓                                               │
│  filter_solo_questions(filters, callback)               │
│          ↓                                               │
│  Socket emits: request_filter_solo_questions            │
│          ↓                                               │
└──────────┬──────────────────────────────────────────────┘
           │
           ↓
┌─────────────────────────────────────────────────────────┐
│               BACKEND (NODEJS)                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  socket.on('request_filter_solo_questions', ...)        │
│          ↓                                               │
│  Extract: { progress: 'unfinished' }                    │
│          ↓                                               │
│  Build SQL query with filter:                           │
│  AND COALESCE(pup.progress, 'untouch') = ?              │
│          ↓                                               │
│  Execute with params: ['unfinished']                    │
│          ↓                                               │
│  Emit: response_filter_solo_questions                   │
│  {                                                       │
│    success: true,                                       │
│    questions: [                                         │
│      { ..., ProgressStatus: 'unfinished' }              │
│    ]                                                    │
│  }                                                       │
│          ↓                                               │
└──────────┬──────────────────────────────────────────────┘
           │
           ↓
┌─────────────────────────────────────────────────────────┐
│           FRONTEND (SOLO.VUE RENDERS)                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  solo_question_rows updated with filtered results       │
│          ↓                                               │
│  Display: Only unfinished problems                      │
│                                                          │
│  ┌────────────────────────────────────┐                 │
│  │ Problem Name    │ Difficulty │ Status │              │
│  ├────────────────────────────────────┤                 │
│  │ Arrays          │ Easy       │ ◐ Unf. │              │
│  │ Binary Tree     │ Medium     │ ◐ Unf. │              │
│  │ Graph Traversal │ Hard       │ ◐ Unf. │              │
│  └────────────────────────────────────┘                 │
│          ↑                                               │
│  (Only unfinished problems shown)                       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Enum Value Mapping

```
┌──────────────────────────────────────────────────────┐
│       Display Name ↔ Database Enum Value              │
├──────────────────┬─────────────┬──────────────────────┤
│   Display        │   Enum      │   Meaning            │
├──────────────────┼─────────────┼──────────────────────┤
│   All            │   null      │ No filter applied    │
│                  │             │ (show all)           │
├──────────────────┼─────────────┼──────────────────────┤
│   Complete       │  'complete' │ Problem solved       │
│                  │             │ ✓ Completed         │
├──────────────────┼─────────────┼──────────────────────┤
│   Unfinished     │'unfinished' │ Started, not done    │
│                  │             │ ◐ Unfinished        │
├──────────────────┼─────────────┼──────────────────────┤
│   Untouched      │  'untouch'  │ Not started          │
│                  │             │ ○ Untouched         │
└──────────────────┴─────────────┴──────────────────────┘
```

## Filter Application Examples

### Example 1: View Only Completed Problems

```
Step 1: User selects "Complete" from Progress dropdown
        ↓
Step 2: SearchPanel emits:
        { progress: 'complete', ... }
        ↓
Step 3: Backend query adds:
        AND COALESCE(pup.progress, 'untouch') = 'complete'
        ↓
Step 4: Result: Only completed problems shown
        
        ┌────────────────────────────────────┐
        │ Problem Name    │ Status           │
        ├────────────────────────────────────┤
        │ Two Sum         │ ✓ Completed      │
        │ Palindrome      │ ✓ Completed      │
        │ Fibonacci       │ ✓ Completed      │
        └────────────────────────────────────┘
```

### Example 2: Find Unfinished Medium Problems

```
Step 1: Select "Unfinished" in Progress filter
Step 2: Select "Medium" in Difficulty filter
        ↓
Step 3: SearchPanel emits:
        {
          progress: 'unfinished',
          difficulty: 'Medium',
          ...
        }
        ↓
Step 4: Backend query applies:
        AND COALESCE(pup.progress, 'untouch') = 'unfinished'
        AND p.difficulty = 'Medium'
        ↓
Step 5: Result: Medium-level unfinished problems
        
        ┌────────────────────────────────────┐
        │ Problem Name      │ Status         │
        ├────────────────────────────────────┤
        │ Binary Tree       │ ◐ Unfinished   │
        │ DFS/BFS Algorithm │ ◐ Unfinished   │
        └────────────────────────────────────┘
```

### Example 3: Combine with Topic Filter

```
Step 1: Select "Untouched" in Progress
Step 2: Select "Algorithms" in Topics
        ↓
Step 3: Backend applies:
        AND COALESCE(pup.progress, 'untouch') = 'untouch'
        AND pht.topic_id = 3  (Algorithms)
        ↓
Step 4: Result: Unstarted algorithm problems
        
        Topics: [Algorithms]
        Progress: [Untouched]
        
        ┌────────────────────────────────────┐
        │ Problem Name        │ Status       │
        ├────────────────────────────────────┤
        │ Quick Sort          │ ○ Untouched  │
        │ Merge Sort          │ ○ Untouched  │
        │ Topological Sort    │ ○ Untouched  │
        └────────────────────────────────────┘
```

## SQL Query Construction

### Base Query
```sql
SELECT DISTINCT p.problem_id, p.problem_name, ...
FROM problems p
LEFT JOIN problem_user_progression pup ON ...
WHERE ci.content_type = 'problem'
  AND a.status = 'approved'
```

### With Progress Filter = 'complete'
```sql
... WHERE ...
  AND COALESCE(pup.progress, 'untouch') = 'complete'
```

### With Progress + Difficulty Filter
```sql
... WHERE ...
  AND COALESCE(pup.progress, 'untouch') = 'unfinished'
  AND p.difficulty = 'Medium'
```

### With Progress + Topics Filter
```sql
... WHERE ...
  AND COALESCE(pup.progress, 'untouch') = 'untouch'
  AND pht.topic_id IN (3, 4)  -- Algorithms, Math
```

## Component Interaction Diagram

```
┌────────────────────────────┐
│   SearchPanel.vue          │
│                            │
│ Progress Dropdown:         │
│ [All ▼]                    │
│                            │
│ Difficulty Dropdown:       │
│ [All ▼]                    │
│                            │
│ Topics Checkboxes:         │
│ ☐ Algorithms               │
│                            │
│ on change → emitFilters()  │
│              ↓              │
└─────────┬──────────────────┘
          │
    filters-updated
          ↓
┌─────────────────────────────────┐
│   Solo.vue                      │
│                                 │
│ @filters-updated               │
│ → handleFiltersUpdated()        │
│                                 │
│ filter_solo_questions(filters)  │
│              ↓                   │
└──────────────┬──────────────────┘
               │
         Socket Event
               ↓
┌──────────────────────────────────┐
│  Backend (src/js/conn/solo.js)   │
│                                  │
│ request_filter_solo_questions    │
│ → Extract filters                │
│ → Build SQL with conditions      │
│ → Execute query                  │
│ → response_filter_solo_questions │
│              ↓                    │
└──────────────┬───────────────────┘
               │
         Socket Response
               ↓
┌──────────────────────────────────┐
│  Frontend (Solo.vue)             │
│                                  │
│ solo_question_rows = data        │
│ → Vue Re-renders table           │
│ → Display filtered results       │
│              ↓                    │
└──────────────┬───────────────────┘
               │
┌──────────────────────────────────┐
│         USER SEES                │
│  Filtered Problem List           │
│  (matching progress filter)      │
└──────────────────────────────────┘
```

## Filter State Management

```
SearchPanel (Child)
├─ search = ""
├─ sortOrder = "asc"
├─ difficulty = "All" (local state)
├─ progress = "All" (local state) ← NEW
└─ filters = [] (topics)

      on change
           ↓
    emitFilters()
           ↓
    emit('filters-updated', {
      search: "",
      sortOrder: "asc",
      difficulty: null,
      progress: null,          ← NEW
      selectedTopics: []
    })
           ↓
    
Solo.vue (Parent)
├─ Receives filters object
├─ Calls filter_solo_questions()
├─ Solo_question_rows gets updated
└─ Component re-renders table
```

## Visual Progress Status Legend

```
┌─────────────────────────────────────┐
│  Progress Status Display Legend      │
├─────────────────────────────────────┤
│                                     │
│  ✓ Completed        ← Green (#28a745)
│  (Problem solved, tests passed)     │
│                                     │
│  ◐ Unfinished       ← Yellow (#ffc107)
│  (Started, draft saved)             │
│                                     │
│  ○ Untouched        ← Gray (#6c757d)
│  (Not yet attempted)                │
│                                     │
└─────────────────────────────────────┘
```

## Performance Flow

```
User selects filter (instant)
        ↓
Component state updates (instant)
        ↓
emitFilters() called (instant)
        ↓
Socket event sent (ms)
        ↓
Backend processes (ms)
        ↓
Database query executes (ms)
        ↓
Results sent back (ms)
        ↓
Vue updates table (instant)
        ↓
User sees filtered results (1-2 seconds typical)
```

---

**Feature Status**: ✅ Complete
**Complexity**: Low (simple dropdown filter)
**Performance**: Excellent (server-side filtering)
