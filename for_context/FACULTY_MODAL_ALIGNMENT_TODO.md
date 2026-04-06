# Faculty Modal Alignment TODO - Phase 4

## Status
✅ **Socket Errors Fixed**: All `arguments.callee` strict mode violations have been resolved in `faculty-socket-helpers.js` using a safe listener pattern. Build passes successfully.

**Remaining Work**: Modal UI/form structure alignment with AdminDashboard (design/UX parity, not functional errors).

---

## Summary of Issues by Component

### 1. **Problems (Question Set)**
- ✅ View modal now opens and fetches data
- ⚠️ **TODO**: Create/Edit/View modal forms don't match `admin_question_set/problem_view_modal.vue`
  - Missing fields: more detailed structure, test cases section, score indicators
  - Reference: [src/components/dashboard/admin/admin_question_set/problem_view_modal.vue](../../../src/components/dashboard/admin/admin_question_set/problem_view_modal.vue)
  - Faculty modals: 
    - [problem-form-modal.vue](../../../src/components/dashboard/faculty/modals/problem-form-modal.vue) (create/edit)
    - [content_problems.vue](../../../src/components/dashboard/faculty/content_problems.vue) (view modal inline)

### 2. **Events**
- ✅ View modal now opens and fetches data
- ⚠️ **TODO**: Create/Edit/View modal forms don't match AdminDashboard event modals
  - Reference: Look at `content_event.vue` admin event modals
  - Faculty modals:
    - [event-form-modal.vue](../../../src/components/dashboard/faculty/modals/event-form-modal.vue) (create/edit)
    - [content_events.vue](../../../src/components/dashboard/faculty/content_events.vue) (view modal inline)

### 3. **Blogs**
- ✅ View modal now opens and fetches data
- ⚠️ **TODO**: Create/Edit/View modal forms missing fields (thumbnail image, content type, etc.)
  - Reference: `content_blog.vue` admin blog modals
  - Faculty modals:
    - [blog-form-modal.vue](../../../src/components/dashboard/faculty/modals/blog-form-modal.vue) (create/edit)
    - [content_blogs.vue](../../../src/components/dashboard/faculty/content_blogs.vue) (view modal inline)

### 4. **Users**
- ✅ View modal already implemented
- ✅ Properly wired with socket fetch
- Status: Appears functional, confirm in Phase 4 manual testing

### 5. **Approvals**
- ✅ Review modal already implemented
- ✅ Properly wired with socket fetch
- Status: Appears functional, confirm in Phase 4 manual testing

---

## Next Steps (Phase 4 - Manual Testing & Refinement)

1. **Copy Admin Modal Structures**: For Problems, Events, and Blogs, copy the input form structures from the corresponding admin modals to match:
   - Form fields and labels
   - Input types (text, textarea, select, date, etc.)
   - Field validation rules
   - Placeholder text
   - Helper text/descriptions

2. **Test All CRUD Flows**:
   - Create → check form opens and submits via socket
   - View → check modal populates with fetched data
   - Edit → check form populates and submits via socket
   - Delete → check confirmation and socket call

3. **Verify Socket Integration**:
   - All create/edit/delete operations use sessionToken properly
   - Responses update UI correctly (show success/error toasts)
   - Data refreshes in tables after operations

4. **Test Edge Cases**:
   - Empty/missing data fallbacks
   - Long text truncation in modals
   - Date/time formatting
   - Permission guards (canManageProblems, canManageEvents, etc.)

---

## Files Modified This Session

### Fixed (Socket Errors)
- `src/js/faculty-socket-helpers.js` - Replaced all `arguments.callee` with safe listener pattern

### Enhanced (View Modals)
- `src/components/dashboard/faculty/content_problems.vue` - Added view modal + socket fetch
- `src/components/dashboard/faculty/content_events.vue` - Added view modal + socket fetch
- `src/components/dashboard/faculty/content_blogs.vue` - Added view modal + socket fetch
- `src/components/dashboard/faculty/content_approvals.vue` - Enhanced view handler with socket fetch

### To Be Enhanced (Modal Forms)
- `src/components/dashboard/faculty/modals/problem-form-modal.vue`
- `src/components/dashboard/faculty/modals/event-form-modal.vue`
- `src/components/dashboard/faculty/modals/blog-form-modal.vue`
- `src/components/dashboard/faculty/modals/user-view-modal.vue` (verify)
- `src/components/dashboard/faculty/modals/approval-review-modal.vue` (verify)

---

## Admin Modal References

For copying form structures, reference these admin modals:
- **Problems**: `/src/components/dashboard/admin/admin_question_set/problem_view_modal.vue`
- **Events**: `/src/components/dashboard/admin/content_event.vue` (look for EventViewModal, EventEditModal, EventCreateModal)
- **Blogs**: `/src/components/dashboard/admin/content_blog.vue` (look for blog modals)
- **Users**: `/src/components/dashboard/admin/content_user.vue`
- **Approvals**: `/src/components/dashboard/admin/content_approval.vue`

---

## Notes

- Build now passes without errors ✅
- All socket communication uses proper safe listener pattern ✅
- View buttons now fetch fresh data and open modals locally ✅
- Parent components still receive emitted events for awareness ✅
- Permission guards are in place for all actions ✅
- Toast notifications for success/error feedback ✅

**This is cosmetic/UX alignment work—no functional blocking issues remain.**
