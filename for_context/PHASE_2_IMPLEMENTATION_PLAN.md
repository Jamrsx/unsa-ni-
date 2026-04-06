# Phase 2: Frontend Wiring Implementation Plan
**Date:** December 19, 2025  
**Status:** Starting  
**Reference:** See PHASE_1_COMPLETION.md, FACULTY_CRUD_WIRING_PLAN.md for backend architecture

---

## Phase 2 Objectives

### Primary Goals
1. Wire Vue components with socket helpers from Phase 1
2. Create modal forms for CRUD operations
3. Integrate notifications into UI
4. Test complete end-to-end workflows

### Components to Wire
1. `content_edit_account.vue` - Profile editing (SIMPLE)
2. `content_users.vue` - User management (SIMPLE - read-only)
3. `content_problems.vue` - Problems CRUD (COMPLEX)
4. `content_events.vue` - Events CRUD (COMPLEX)
5. `content_blogs.vue` - Blogs CRUD (COMPLEX)
6. `content_approvals.vue` - Approvals workflow (EXISTING - verify)

---

## Implementation Pattern

### Step 1: Import Socket Helper
```javascript
import * as facultySocket from '@/js/faculty-socket-helpers.js'
```

### Step 2: Initialize on Mount
```javascript
onMounted(() => {
  facultySocket.initSocket(socket)
  loadData()
})
```

### Step 3: Create Handler Functions
```javascript
function handleCreate() {
  facultySocket.createFacultyProblem({
    token_session: sessionToken,
    problem_name: form.name,
    ...
  }, (response) => {
    if (response.success) {
      problems.push(response)
      showToast('Problem created successfully')
    } else {
      showToastError(response.message)
    }
  })
}
```

### Step 4: Connect to Buttons/Modals
- Use ButtonText component for triggers
- Modal-button.vue to open modals
- Form fields in modal body
- Cancel/Save buttons in footer

---

## Wiring Sequence

### Priority 1: Edit Account (No modals needed)
- ✅ Simplest component
- Direct form on page
- One button to save
- No approval needed

### Priority 2: Users Management (Read-only)
- List with View button
- Modal shows user details (read-only)
- No edit/delete in Phase 2

### Priority 3: Problems CRUD
- List with search/filter
- Create → ProblemCreateModal
- Edit → ProblemEditModal
- View → ProblemViewModal
- Delete → Confirm

### Priority 4: Events CRUD
- Same pattern as Problems
- Add date pickers for starts_at/ends_at

### Priority 5: Blogs CRUD
- Same pattern as Problems
- Add rich text editor for content

### Priority 6: Approvals (Verify existing)
- Should already be wired
- May need enhancement for notifications

---

## Component Checklist Template

For each component, update:

- [ ] Import socket helpers
- [ ] Add socket initialization in onMounted()
- [ ] Get token_session from store/props
- [ ] Create load handler: `getFacultyX()`
- [ ] Create CRUD handlers: `onCreate()`, `onEdit()`, `onDelete()`
- [ ] Connect buttons to handlers
- [ ] Add modal form fields
- [ ] Wire modal submit to socket
- [ ] Add error handling with toastError
- [ ] Add success handling with toast
- [ ] Test with backend

---

## Form Validation

### Client-side
- Required fields check before emit
- Field type validation
- Message display

### Server-side (Already implemented)
- Field validation in backend
- Permission checks
- Database constraints

---

## Expected Outcome

After Phase 2:
- ✅ All 5 components wired with socket helpers
- ✅ Full CRUD workflows functional
- ✅ Notifications appear when operations complete
- ✅ Error messages shown for failures
- ✅ Two-level approval workflow working (faculty review)
- ✅ All permissions verified

---

## Session Estimate

- Content_edit_account.vue: 20 min
- Content_users.vue: 15 min
- Content_problems.vue: 45 min
- Content_events.vue: 30 min
- Content_blogs.vue: 30 min
- Testing & refinement: 30 min

**Total: 2.5 - 3 hours**

