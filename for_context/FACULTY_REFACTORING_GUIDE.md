# Faculty Dashboard - Layout Refactoring Guide

**Date:** December 19, 2025  
**Status:** Partial fixes applied, major refactoring required  
**Priority:** HIGH - Frontend doesn't match AdminDashboard structure

---

## ✅ FIXES APPLIED SO FAR

### 1. Backend Connection Fixed
- ✅ Fixed `loadDashboard()` to use `data.totals` instead of `data.data`
- ✅ Fixed `loadPendingApprovals()` to use `data.pending` instead of `data.data`
- ✅ Added debug logging to `refreshPermissions()` with console output
- ✅ Made `onMounted()` async to await permissions before loading data
- ✅ Added permission probe logging for debugging

**Test in browser console:**
```javascript
// Check if permissions load correctly
const token = localStorage.getItem('jwt_token')
const r = await fetch('/api/faculty/users', { headers: { Authorization: `Bearer ${token}` }})
const j = await r.json()
console.log('Permission check:', j) // Should show {success: true, users: [...]}
```

---

## ⚠️ MAJOR REFACTORING REQUIRED

The faculty components are currently SIMPLE TABLES but need to match the complex admin structure with:
- Window wrappers
- SplitMainWindow for tabs
- SearchBarAndSort components
- SearchPanel sidebars
- Complex table components with filtering/sorting

### Complexity Assessment:
- **Current:** ~100-150 lines per component (simple table + guard functions)
- **Required:** ~300-500 lines per component (Windows + tabs + tables + search panels)
- **Estimated Work:** 15-20 hours for full refactoring

---

## 📋 DETAILED REFACTORING TASKS

### Task 1: Refactor content_approvals.vue (HIGHEST PRIORITY)

**Current Structure:**
```vue
<div class="content-approvals">
  <div class="header"><h3>Pending Changes Review</h3></div>
  <div class="approvals-list">
    <div v-for="approval in pending_approvals" class="approval-card">
      <!-- Card-based layout -->
    </div>
  </div>
</div>
```

**Required Structure (Match Admin):**
```vue
<div class="row d-flex flex-row">
  <!-- Section 1: Pending Approvals -->
  <section class="approval-section">
    <Window>
      <template #title>Pending Approvals</template>
      <template #content>
        <SplitMainWindow 
          :sections="pending_sections" 
          default-section="pending_event"
        >
          <template #pending_event>
            <Pending_approval_event_table 
              :rows="pending_events"
              @approve-item="emit('approve-item', $event)"
              @deny-item="emit('deny-item', $event)"
            />
          </template>
          <template #pending_blog>
            <Pending_approval_blog_table :rows="pending_blogs" />
          </template>
          <template #pending_problem>
            <Pending_approval_problem_table :rows="pending_problems" />
          </template>
        </SplitMainWindow>
      </template>
    </Window>
  </section>

  <!-- Section 2: Approved Items -->
  <section class="approval-section">
    <Window>
      <template #title>Approved Items</template>
      <template #content>
        <SplitMainWindow 
          :sections="approved_sections" 
          default-section="approved_event"
        >
          <template #approved_event>
            <Approved_approval_event_table :rows="approved_events" />
          </template>
          <template #approved_blog>
            <Approved_approval_blog_table :rows="approved_blogs" />
          </template>
          <template #approved_problem>
            <Approved_approval_problem_table :rows="approved_problems" />
          </template>
        </SplitMainWindow>
      </template>
    </Window>
  </section>
</div>
```

**Changes Needed:**
1. Create `src/components/dashboard/faculty/faculty_approval_set/` directory
2. Create 6 table components:
   - `pending_approval_event_table.vue` (with TableList + SearchBarAndSort)
   - `pending_approval_blog_table.vue`
   - `pending_approval_problem_table.vue`
   - `approved_approval_event_table.vue`
   - `approved_approval_blog_table.vue`
   - `approved_approval_problem_table.vue`
3. Each table needs:
   - Import TableList, SearchBarAndSort, DateFilter, TextPill
   - Column slots for each field with search/sort
   - filteredAndSortedData computed property
   - formatDateTime helper functions
   - Emit handlers for approve/deny/view
4. Update FacultyDashboard.vue to:
   - Add `approved_approval_events`, `approved_approval_blogs`, `approved_approval_problems` arrays
   - Add `loadApprovedApprovals()` function
   - Pass data to content_approvals component
5. Update backend to add `/api/faculty/approved-items` endpoint

**Estimated Time:** 6-8 hours

---

### Task 2: Refactor content_users.vue

**Current Structure:**
```vue
<div class="content-users">
  <table>
    <thead><tr><th>User ID</th><th>Username</th>...</tr></thead>
    <tbody><tr v-for="user in user_rows">...</tr></tbody>
  </table>
</div>
```

**Required Structure (Match Admin):**
```vue
<ScrollVerticalCarousel>
  <TableList class="user-table" :column_slot="['user_player','user_duelpoint','user_email','user_country','user_action']">
    <template #user_player>
      <div>
        <p>Player username</p>
        <SearchBarAndSort
          placeholder="Search username"
          :search="filters.username"
          @update:search="onSearch('username', $event)"
          @update:sort="onSort('username', $event)"
        />
      </div>
    </template>
    <!-- More column slots... -->
    <template #content>
      <tr v-for="data in displayedRows" class="user-table-row">
        <td class="user-table-data-user">
          <ButtonImg class="user-table-data-user-profile-pic">
            <ProfilePic :imgSrc="data.UserImg" />
          </ButtonImg>
          <p>{{ data.UserName }}</p>
          <PlayerStatLevelMini :value="data.Level" />
        </td>
        <!-- More cells... -->
      </tr>
    </template>
  </TableList>
</ScrollVerticalCarousel>
```

**Changes Needed:**
1. Import: TableList, SearchBarAndSort, ScrollVerticalCarousel, ProfilePic, PlayerStatLevelMini, ButtonImg
2. Add reactive filters object: `{ username: '', email: '', country: '' }`
3. Add sortState object: `{ field: '', order: 'asc' }`
4. Add onSearch(field, value) and onSort(field, order) handlers
5. Add displayedRows computed property with filter/sort logic
6. Wrap everything in ScrollVerticalCarousel

**Estimated Time:** 3-4 hours

---

### Task 3: Refactor content_problems.vue

**Current Structure:**
```vue
<div class="content-problems">
  <button>+ Create Problem</button>
  <table>
    <thead><tr><th>Problem ID</th>...</tr></thead>
  </table>
</div>
```

**Required Structure (Match Admin question_set):**
```vue
<div class="row d-flex flex-row">
  <!-- Left Section: Tables with Tabs -->
  <section>
    <Window>
      <template #content>
        <SplitMainWindow 
          :sections="problem_sections" 
          default-section="admin_problem"
        >
          <template #admin_problem>
            <Admin_problem_table 
              :problem_rows="admin_problem_rows"
              @view-problem="$emit('view-problem', $event)"
              @edit-problem="$emit('edit-problem', $event)"
              @delete-problem="$emit('delete-problem', $event)"
            />
          </template>
          <template #user_problem>
            <User_problem_table :problem_rows="user_problem_rows" />
          </template>
          <template #pending_problem>
            <Pending_problem_table :problem_rows="pending_problem_rows" />
          </template>
        </SplitMainWindow>
      </template>
    </Window>
  </section>

  <!-- Right Section: Search Panel + Create Button -->
  <section>
    <Window>
      <template #title>Search & Filter</template>
      <template #content>
        <SearchPanel @filters-updated="onFiltersUpdated"/>
      </template>
    </Window>
    <Window>
      <template #title>Your Set Problems</template>
      <template #content>
        <ModalButton
          modal_btn_id="facultyCreateProblemModal"
          modal_btn_title="Create New Problem +"
          @click="onCreateNewProblem"
        />
        <CreateProblemModal
          modalId="facultyCreateProblemModal"
          @create-problem="$emit('create-problem', $event)"
        />
      </template>
    </Window>
  </section>

  <!-- View Modal -->
  <ProblemViewModal :problemData="currentProblem" />
</div>
```

**Changes Needed:**
1. Create `src/components/dashboard/faculty/faculty_problem_set/` directory
2. Create 3 table components:
   - `admin_problem_table.vue`
   - `user_problem_table.vue`
   - `pending_problem_table.vue`
3. Import: Window, SplitMainWindow, SearchPanel, ModalButton, CreateProblemModal, ProblemViewModal
4. Update FacultyDashboard.vue to split problem_rows into:
   - `admin_problem_rows` (faculty-created approved problems)
   - `user_problem_rows` (student-created problems)
   - `pending_problem_rows` (problems pending approval)
5. Add navigation sections array: `[{ id: 'admin_problem', name: 'Admin Problems' }, ...]`

**Estimated Time:** 5-6 hours

---

### Task 4: Refactor content_events.vue

**Same pattern as problems** - needs Window + SplitMainWindow with 3 tabs:
- Global Events (all events)
- User Events (faculty-created events)
- Pending Events (awaiting approval)

**Estimated Time:** 4-5 hours

---

### Task 5: Refactor content_blogs.vue

**Same pattern as problems/events** - needs Window + SplitMainWindow with 3 tabs:
- Global Blogs (all blogs)
- User Blogs (faculty-created blogs)
- Pending Blogs (awaiting approval)

**Estimated Time:** 4-5 hours

---

## 🛠️ IMPLEMENTATION STRATEGY

### Option A: Full Refactoring (15-20 hours)
**Pros:**
- Complete UI consistency with admin dashboard
- Professional appearance
- All features (search, sort, filter) working

**Cons:**
- Time-intensive
- Complex component creation
- High risk of introducing bugs

### Option B: Minimal Viable Fix (3-4 hours)
**Pros:**
- Quick to implement
- Gets faculty dashboard functional
- Lower risk

**Cons:**
- Won't match admin UI exactly
- Missing advanced features (search/sort)
- May need refactoring later

**Recommended:** Start with Option B for immediate functionality, then upgrade to Option A incrementally.

---

## 📝 MINIMAL VIABLE FIX (Quick Solution)

For each component, keep the current simple structure but:

1. **content_approvals.vue:** Add a second simple table for "Approved Items"
2. **content_users.vue:** Add basic text input search boxes above table
3. **content_problems.vue:** Keep single table, add tabs using simple div navigation
4. **content_events.vue:** Keep single table, add tabs using simple div navigation
5. **content_blogs.vue:** Keep single table, add tabs using simple div navigation

This gets the layouts "closer" to admin without full refactoring.

---

## 🔍 TESTING CHECKLIST

After ANY changes, test:
- [ ] Faculty login works
- [ ] Dashboard loads stats correctly
- [ ] Permissions load (check browser console for debug logs)
- [ ] Users section shows table
- [ ] Problems section shows data
- [ ] Events section shows data
- [ ] Blogs section shows data
- [ ] Approvals section shows pending items
- [ ] No JavaScript errors in console
- [ ] No Vue compilation errors
- [ ] Backend endpoints return 200 OK (check Network tab)

---

## 📌 NEXT IMMEDIATE STEPS

1. **Test current fixes:**
   - Start dev server: `npm run dev`
   - Start backend: `node server.js`
   - Login as faculty_test_user
   - Check browser console for permission logs
   - Verify data loads in Dashboard section

2. **Choose implementation path:**
   - Option A (full refactor) or Option B (minimal fix)?
   - Discuss with team/stakeholders

3. **If choosing Option B (recommended for now):**
   - Start with approvals - add second table div for approved items
   - Move to users - add simple search inputs
   - Test incrementally after each fix

4. **Document decision:**
   - Update this file with chosen path
   - Add time estimates
   - Track progress

---

## 🚨 IMPORTANT NOTES

1. **DO NOT EDIT** `style.css`, `mainpage.css`, or `dashboard_admin.css`
2. **USE** existing components from `src/components/`
3. **TEST** after every change
4. **COMMIT** frequently to avoid losing work
5. **REFER** to admin components as templates, don't copy blindly

---

**Last Updated:** December 19, 2025  
**Status:** Awaiting decision on implementation path
