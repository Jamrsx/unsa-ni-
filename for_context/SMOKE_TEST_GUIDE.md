# Option A Smoke Test & Permission Debug Guide

**Date:** December 19, 2025  
**Status:** Permission setup complete; ready for UI testing

---

## ✅ COMPLETED

1. **Permissions Fixed**: All faculty permissions now assigned to Faculty role
2. **Backend Running**: `node server.js` on port 3000
3. **Frontend Running**: `npm run dev` on port 5173

---

## 📋 SMOKE TEST CHECKLIST

### Part 1: Dashboard Load & Stats
- [ ] Login as `faculty_test_user` (no "permission denied" toast)
- [ ] Dashboard page loads without errors
- [ ] **Total Users** > 0
- [ ] **Total Problems** > 0
- [ ] **Total Events** > 0
- [ ] **Total Blogs** > 0
- [ ] Check browser console: No JS errors

### Part 2: Users Section
- [ ] Click Users tab → table shows rows
- [ ] Test search filters (username/email/role)
- [ ] Search highlights relevant rows
- [ ] No "you do not have permission" toast

### Part 3: Problems Section
- [ ] Click Problems tab → table shows rows
- [ ] Tab switching works (All/Faculty/Pending)
- [ ] Tab counts update correctly
- [ ] No permission toasts

### Part 4: Events Section
- [ ] Click Events tab → table shows rows
- [ ] Tab switching works (All/Faculty/Pending)
- [ ] Tab counts update correctly
- [ ] **NEW:** Window + SplitMainWindow layout visible

### Part 5: Blogs Section
- [ ] Click Blogs tab → table shows rows
- [ ] Tab switching works (All/Faculty/Pending)
- [ ] Tab counts update correctly
- [ ] No permission toasts

### Part 6: Approvals Section (Option A)
- [ ] Click Approvals tab → Pending Approvals section shows
- [ ] **NEW:** 3-tab navigation visible (Events/Blogs/Problems)
- [ ] Switching tabs loads correct table (may be empty if no pending items)
- [ ] Approved Items section below Pending section
- [ ] Action buttons visible (View, Approve, Reject, Forward)
- [ ] No JS errors in console
- [ ] **NEW:** Window/SplitMainWindow structure visible (not card-based)

### Part 7: Backend Logs
In terminal with `node server.js`, check for:
- [ ] No error messages
- [ ] Requests logged like: `GET /api/faculty/users 200`
- [ ] Permission check logs if enabled

---

## 🔍 DEBUG CONSOLE COMMANDS

If issues arise, paste these in browser DevTools Console (F12):

```javascript
// Check permissions
const token = localStorage.getItem('jwt_token')
console.log('Token exists:', !!token)

// Check dashboard data
const r = await fetch('/api/faculty/dashboard', {
  headers: { Authorization: `Bearer ${token}` }
})
const data = await r.json()
console.log('Dashboard:', data)

// Check users data
const r2 = await fetch('/api/faculty/users', {
  headers: { Authorization: `Bearer ${token}` }
})
const users = await r2.json()
console.log('Users:', users)

// Check approvals data
const r3 = await fetch('/api/faculty/pending-approvals', {
  headers: { Authorization: `Bearer ${token}` }
})
const approvals = await r3.json()
console.log('Pending Approvals:', approvals)
```

---

## ⚠️ EXPECTED CURRENT STATE

**What SHOULD work:**
- ✅ Dashboard loads, shows stats
- ✅ All sections accessible without permission errors
- ✅ Search/filter work on Users
- ✅ Tab switching works on Problems/Events/Blogs
- ✅ **NEW:** Approvals uses Window + SplitMainWindow (not card layout)
- ✅ Tables render with data rows

**What is NOT YET implemented:**
- ❌ Action buttons don't save (backend routes exist but full CRUD not wired)
- ❌ Create modals not yet added to Option A
- ❌ SearchPanel sidebars not yet added
- ❌ Edit account save doesn't persist (permission only, not backend)
- ❌ Notifications system not implemented
- ❌ Some table components still placeholder (simple TableList, not full admin structure)

---

## 📝 NEXT STEPS AFTER SMOKE TEST

1. **If all checks ✅:** Proceed to Option A step 2 (wrap remaining components with Window/SplitMainWindow)
2. **If permission toasts still show:** Run `/for_context/FACULTY_PERMISSIONS_FIX.js` again and hard-refresh browser
3. **If data shows as 0 or empty:** Check backend logs for query errors
4. **If JS errors in console:** Report in for_context/ and fix specific issue

---

## 🚀 Quick Restart

If needed, restart both processes:

```bash
# Terminal 1: Kill and restart backend
# Kill: Ctrl+C in node server.js terminal
# Restart: node server.js

# Terminal 2: Kill and restart frontend
# Kill: Ctrl+C in npm run dev terminal
# Restart: npm run dev
```

Then hard-refresh browser: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
