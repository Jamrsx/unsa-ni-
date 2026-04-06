# Faculty Dashboard Issues & Fixes - Smoke Check Reference

**Date:** December 19, 2025  
**Purpose:** Track all issues discovered and fixes applied to FacultyDashboard.vue and related components

---

## SMOKE CHECK STATUS

### Issue 1: Documentation Location ✅ FIXED
- **Problem:** Documentation scattered in root directory
- **Solution:** Moved all FACULTY_*.md files to `for_context/` directory
- **Files Moved:**
  - FACULTY_FRONTEND_COMPLETE.md → for_context/
  - FACULTY_DASHBOARD_STYLING_COMPLETE.md → for_context/
  - FACULTY_DASHBOARD_QUICKSTART.md → for_context/
  - FACULTY_DASHBOARD_COMPLETE.md → for_context/

---

### Issue 2: Approvals Navigation Layout ⏳ IN PROGRESS
- **Problem:** Faculty approvals section does NOT match AdminDashboard structure
- **Expected:** Should have:
  1. **Pending Approvals Table** (with sub-tabs: Events, Blogs, Problems)
  2. **Approved Items Table** (with sub-tabs: Events, Blogs, Problems)
  3. Proper Window + SplitMainWindow layout
- **Current:** Single card-based list with no table structure
- **Status:** TODO #3 in progress
- **Fix Required:**
  - Refactor `content_approvals.vue` to match `content_approval.vue` (admin version)
  - Create faculty-specific approval table components
  - Use Window + SplitMainWindow for navigation
  - Add approved_approvals data array to FacultyDashboard.vue

**Admin Structure Reference:**
```vue
<!-- src/components/dashboard/admin/content_approval.vue -->
<section class="approval-section">
  <Window>
    <template #title>Pending Approvals</template>
    <SplitMainWindow :sections="pending_sections">
      <template #pending_event>
        <Pending_approval_event_table />
      </template>
    </SplitMainWindow>
  </Window>
</section>
<section class="approval-section">
  <Window>
    <template #title>Approved Items</template>
    <SplitMainWindow :sections="approved_sections">
      <template #approved_event>
        <Approved_approval_event_table />
      </template>
    </SplitMainWindow>
  </Window>
</section>
```

---

### Issue 3: Backend Permission Errors ✅ FIXED
- **Problem:** Faculty user `faculty_test_user` has permissions in `role_permissions` table but frontend shows "You do not have permission" errors
- **Symptoms:**
  - Errors for: users, problems, events, blogs sections
  - `refreshPermissions()` function returns false for all endpoints
- **Root Cause:** 
  1. Dashboard data API response structure mismatch (expected `data.data` but backend returns `data.totals`)
  2. Pending approvals response mismatch (expected `data.data` but backend returns `data.pending`)
  3. Permissions not awaited in onMounted causing race condition

**Fixes Applied:**
1. ✅ Updated `loadDashboard()` to use `data.totals` instead of `data.data`
2. ✅ Updated `loadPendingApprovals()` to use `data.pending` instead of `data.data`
3. ✅ Added debug logging to `refreshPermissions()` to track permission probes
4. ✅ Made `onMounted()` async and await `refreshPermissions()` before loading other data
5. ✅ Added console logging for permission probe results

**Testing:**
Open browser console and check for:
```
[Faculty] Probing permission: /api/faculty/users
[Faculty] Permission response for /api/faculty/users: {success: true, users: [...]}
[Faculty] Permissions loaded: {canViewUsers: true, ...}
```

---

### Issue 4: Users Table Layout ⏳ IN PROGRESS
- **Problem:** Faculty users table missing search/filter components (doesn't match admin layout)
- **Expected:** Should have:
  - Left side: `TableList` with user rows
  - Right side: `Window` with search/filter panel
  - SearchBarAndSort for username, email, country columns
  - Action buttons per row
- **Current:** Simple table without search/filter sidebar
- **Fix Required:**
  - Refactor `content_users.vue` to match `content_user.vue` (admin version)
  - Add SearchBarAndSort components
  - Add right-side Window with search panel
  - Import: TableList, SearchBarAndSort, DropdownArray, ScrollVerticalCarousel

**Admin Structure Reference:**
```vue
<!-- src/components/dashboard/admin/content_user.vue -->
<div class="row d-flex flex-row">
  <section>
    <Window>
      <ScrollVerticalCarousel>
        <TableList>
          <template #user_player>
            <SearchBarAndSort placeholder="Search username" />
          </template>
        </TableList>
      </ScrollVerticalCarousel>
    </Window>
  </section>
</div>
```

---

### Issue 5: Problems Table Layout ⏳ IN PROGRESS
- **Problem:** Faculty problems table doesn't match admin question_set layout
- **Expected:** Should have:
  - Left side: Window with SplitMainWindow (Admin Problems, User Problems, Pending Problems tabs)
  - Right side: Window with Search & Filter panel + "Create New Question" button
  - Table components: Admin_question_table, User_question_table, Pending_question_table
- **Current:** Single flat table with no navigation/filter
- **Fix Required:**
  - Refactor `content_problems.vue` to match `content_question_set.vue` structure
  - Create 3 table components (admin/user/pending)
  - Add SearchPanel component on right
  - Add CreateQuestionModal trigger

---

### Issue 6: Events Table Layout ⏳ IN PROGRESS
- **Problem:** Faculty events table doesn't match admin event layout
- **Expected:** Should have:
  - Window with SplitMainWindow (Global Events, User Events, Pending Events tabs)
  - SearchPanel on right side
  - Table components for each event type
- **Current:** Single flat table
- **Fix Required:**
  - Refactor `content_events.vue` to match `content_event.vue` structure
  - Add navigation tabs
  - Add search/filter panel

---

### Issue 7: Blogs Table Layout ⏳ IN PROGRESS
- **Problem:** Faculty blogs table doesn't match admin blog layout
- **Expected:** Should have:
  - Window with SplitMainWindow (Global Blogs, User Blogs, Pending Blogs tabs)
  - SearchPanel on right side
  - Table components for each blog type
- **Current:** Single flat table
- **Fix Required:**
  - Refactor `content_blogs.vue` to match `content_blog.vue` structure
  - Add navigation tabs
  - Add search/filter panel

---

## CSS REFERENCES (DO NOT EDIT)

### Files to Reference for Styling:
1. **public/css/style.css** - Global CSS variables, color palette, base styles
2. **public/css/mainpage.css** - General page layout classes
3. **public/css/dashboard_admin.css** - Admin dashboard specific selectors (#admin-dash_app namespace)
4. **public/css/dashboard_faculty.css** - Faculty dashboard specific selectors (#faculty-dash_app namespace) - ALREADY CREATED

### Key CSS Variables from style.css:
```css
--c_darkgreen: #1a3a2e
--c_backgroundcoding: #0f1419
--c_mediumcoding: #1e2328
--c_whitemain: #ffffff
--c_lightcoding: #2d333b
--c_slightlightcoding: #444c56
```

---

## COMPONENT IMPORTS NEEDED

### For Users Table:
```javascript
import TableList from '../../table-list.vue'
import SearchBarAndSort from '../../search-bar-and-sort.vue'
import DropdownArray from '../../dropdown-array.vue'
import ScrollVerticalCarousel from '../../scroll-vertical-carousel.vue'
import ProfilePic from '../../profile-pic.vue'
import PlayerStatLevelMini from '../../player-stat-level-mini.vue'
```

### For Problems/Events/Blogs:
```javascript
import Window from '../../window.vue'
import SplitMainWindow from '../../split-main-window.vue'
import SearchPanel from '../../search-panel.vue'
import ModalButton from '../../modal-button.vue'
```

### For Approvals:
```javascript
import Window from '../../window.vue'
import SplitMainWindow from '../../split-main-window.vue'
// Create faculty-specific table components in:
// src/components/dashboard/faculty/faculty_approval_set/
```

---

## BACKEND ENDPOINTS TO VERIFY

```javascript
// Permission checks (GET)
GET /api/faculty/users              → {success: true/false}
GET /api/faculty/problems           → {success: true/false}
GET /api/faculty/events             → {success: true/false}
GET /api/faculty/blogs              → {success: true/false}
GET /api/faculty/pending-approvals  → {success: true/false}

// Data fetching (GET)
GET /api/faculty/dashboard          → {success, data: {total_users, total_problems, total_events}}
GET /api/faculty/profile            → {success, data: {UserName, Email, ...}}

// CRUD operations (POST/PATCH/DELETE)
POST   /api/faculty/problems        → Create problem (forward to admin)
PATCH  /api/faculty/problems/:id    → Update problem (forward to admin)
DELETE /api/faculty/problems/:id    → Delete request (forward to admin)
```

---

## TESTING CHECKLIST

### Permission Testing:
- [ ] Login as `faculty_test_user`
- [ ] Check browser console for permission probe results
- [ ] Verify token contains correct user ID and role
- [ ] Check backend logs for permission middleware execution
- [ ] Verify `role_permissions` table has correct entries for faculty role

### Layout Testing:
- [ ] Approvals section shows 2 tables (Pending + Approved) with tabs
- [ ] Users table has search bars in column headers
- [ ] Problems table has 3-tab navigation (Admin/User/Pending)
- [ ] Events table has 3-tab navigation (Global/User/Pending)
- [ ] Blogs table has 3-tab navigation (Global/User/Pending)
- [ ] All tables match admin dashboard visual style
- [ ] CSS from dashboard_faculty.css applied correctly

---

## NEXT STEPS (TODO LIST)

1. ✅ Move documentation to for_context/
2. ⏳ Fix approvals layout (2 tables with tabs)
3. ⏳ Debug backend permission errors
4. ⏳ Fix users table layout (add search/filter)
5. ⏳ Fix problems table layout (add tabs + search panel)
6. ⏳ Fix events table layout (add tabs + search panel)
7. ⏳ Fix blogs table layout (add tabs + search panel)
8. ⏳ Create faculty approval table components
9. ⏳ Test all layouts match admin dashboard
10. ⏳ Verify backend permissions work correctly
