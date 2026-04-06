# Phase 5: Manual Testing Checklist

This document provides step-by-step manual testing instructions for Phase 5 validation. All tests can be performed using the browser's DevTools Console (F12).

## Prerequisites

Before starting:
1. Ensure MySQL server is running
2. Ensure Node backend server is running (`node server.js`)
3. Ensure Vite dev server is running (`npm run dev`)
4. Have a faculty user account ready (username and password)
5. Open browser to `http://localhost:5173`

---

## Test Suite 1: Database Verification (Backend Script)

Run this in terminal:
```bash
cd DuelCode-Capstone-Project
node scripts/phase5_db_verify.js
```

**Expected Results:**
- ✓ faculty_pending_changes table exists
- ✓ Faculty permissions count >= 13
- ✓ Faculty role permissions count >= 14
- Faculty users listed (at least one)

---

## Test Suite 2: Authentication & Authorization

### 2.1 Test Unauthorized Access (No Token)

Open DevTools Console on `http://localhost:5173`, run:

```javascript
// Clear any existing tokens
localStorage.removeItem('token');
localStorage.removeItem('jwt_token');

// Try accessing faculty dashboard endpoint
fetch('http://localhost:3000/api/faculty/dashboard')
  .then(r => r.json())
  .then(d => console.log('Unauthorized test:', d))
  .catch(e => console.log('Expected error:', e));
```

**Expected:** Error 401 or 403 (unauthorized)

### 2.2 Test Login & Token Storage

```javascript
// Login with faculty credentials
fetch('http://localhost:3000/signin', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    username: 'YOUR_FACULTY_USERNAME',  // Replace with actual username
    password: 'YOUR_FACULTY_PASSWORD'   // Replace with actual password
  })
})
.then(r => r.json())
.then(data => {
  if (data.success && data.token) {
    localStorage.setItem('jwt_token', data.token);
    localStorage.setItem('token', data.token);
    console.log('✓ Login successful, token stored');
    console.log('User:', data.user);
  } else {
    console.log('✗ Login failed:', data.message);
  }
});
```

**Expected:** 
- `success: true`
- Token saved to localStorage
- User object with role='faculty'

---

## Test Suite 3: Faculty Dashboard Endpoints

**Prerequisites:** Must be logged in (token in localStorage)

### 3.1 Test Dashboard Totals

```javascript
const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');

fetch('http://localhost:3000/api/faculty/dashboard', {
  headers: {'Authorization': `Bearer ${token}`}
})
.then(r => r.json())
.then(data => {
  console.log('Dashboard test:', data.success ? '✓' : '✗');
  console.log('Totals:', data.totals);
});
```

**Expected:**
- `success: true`
- `totals` object with `users`, `problems`, `events` counts

### 3.2 Test Faculty Permissions

```javascript
const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');

fetch('http://localhost:3000/api/faculty/permissions', {
  headers: {'Authorization': `Bearer ${token}`}
})
.then(r => r.json())
.then(data => {
  console.log('Permissions test:', data.success ? '✓' : '✗');
  console.log('Permissions:', data.permissions);
});
```

**Expected:**
- `success: true`
- `permissions` object with boolean flags like:
  - `faculty_view_dashboard`
  - `faculty_create_problems`
  - `faculty_manage_events`
  - `faculty_manage_blogs`
  - `faculty_view_users`

### 3.3 Test Faculty Users List

```javascript
const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');

fetch('http://localhost:3000/api/faculty/users', {
  headers: {'Authorization': `Bearer ${token}`}
})
.then(r => r.json())
.then(data => {
  console.log('Users list test:', data.success ? '✓' : '✗');
  console.log('Users count:', data.users?.length || 0);
  console.log('First 3 users:', data.users?.slice(0,3));
});
```

**Expected:**
- `success: true`
- `users` array with user objects

### 3.4 Test Pending Approvals

```javascript
const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');

fetch('http://localhost:3000/api/faculty/pending-approvals', {
  headers: {'Authorization': `Bearer ${token}`}
})
.then(r => r.json())
.then(data => {
  console.log('Pending approvals test:', data.success ? '✓' : '✗');
  console.log('Pending count:', data.pending?.length || 0);
  if (data.pending?.length > 0) {
    console.log('First pending item:', data.pending[0]);
  }
});
```

**Expected:**
- `success: true`
- `pending` array (may be empty if no pending changes)

---

## Test Suite 4: Frontend Component Tests

### 4.1 Test Faculty Dashboard Loads

1. Navigate to `http://localhost:5173/faculty-dashboard.html`
2. Open DevTools Console

**Expected:**
- Page loads without redirect
- If no token: Toast message "Sign in to enable editing and management features"
- If token present: Dashboard sections visible

**Console checks:**
```javascript
// Check if dashboard component loaded
console.log('Faculty dashboard loaded:', !!document.querySelector('.split-main-window'));

// Check active sections
const sections = ['dashboard', 'edit_account', 'users', 'problems', 'events', 'blogs', 'approvals'];
sections.forEach(s => {
  const el = document.querySelector(`[data-section="${s}"]`) || document.getElementById(s);
  console.log(`Section ${s}:`, el ? 'exists' : 'missing');
});
```

### 4.2 Test Edit Account Profile Picture

1. Navigate to `http://localhost:5173/faculty-dashboard.html`
2. Ensure logged in with valid token
3. Click "Edit Account" section
4. Open profile picture cropper
5. Upload new image
6. Save

**Console monitoring:**
```javascript
// Monitor socket events
const socket = window.__SHARED_SOCKET__;
if (socket) {
  socket.on('response_change_user_account_profile_avatar', (data) => {
    console.log('✓ Avatar update received:', data);
  });
  socket.on('response_change_user_account_profile', (data) => {
    console.log('✓ Profile update received:', data);
  });
}
```

**Expected:**
- Image uploads successfully
- Header avatar updates immediately
- Edit account preview updates immediately
- Both show same image (no mismatch)
- Image URL has cache-busting timestamp `?t=...`

### 4.3 Test Form Submissions

Navigate to different sections and test forms:

**Problems:**
```javascript
// Monitor problem creation (after submitting form in UI)
const socket = window.__SHARED_SOCKET__;
socket.on('response_create_problem', (data) => {
  console.log('Problem creation:', data.success ? '✓' : '✗');
  console.log('Data:', data);
});
```

**Events:**
```javascript
// Monitor event creation
socket.on('response_create_event', (data) => {
  console.log('Event creation:', data.success ? '✓' : '✗');
  console.log('Data:', data);
});
```

**Blogs:**
```javascript
// Monitor blog creation
socket.on('response_create_blog', (data) => {
  console.log('Blog creation:', data.success ? '✓' : '✗');
  console.log('Data:', data);
});
```

---

## Test Suite 5: End-to-End Approval Workflow

### 5.1 Setup Test Data

Run in terminal:
```bash
node -e "
const mysql = require('mysql2/promise');
require('dotenv').config();
(async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });
  const conn = await pool.getConnection();
  
  // Insert test blog pending approval
  const [result] = await conn.query(\`
    INSERT INTO faculty_pending_changes (
      user_id, change_type, entity_type, entity_id,
      proposed_data, status, created_at
    ) VALUES (
      21, 'create', 'blog', NULL,
      JSON_OBJECT('title', 'Test Blog Post', 'content', 'This is a test'),
      'pending_faculty_review', NOW()
    )
  \`);
  
  console.log('✓ Test pending change created, ID:', result.insertId);
  
  conn.release();
  await pool.end();
})().catch(console.error);
"
```

### 5.2 Faculty Approval Test

1. Login as faculty user
2. Navigate to `http://localhost:5173/faculty-dashboard.html`
3. Click "Approvals" section
4. Verify test blog appears in pending list
5. Click "Approve" or "Forward to Admin"

**Console monitoring:**
```javascript
fetch('http://localhost:3000/api/faculty/pending-approvals', {
  headers: {'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`}
})
.then(r => r.json())
.then(data => {
  console.log('Pending items:', data.pending);
  const testItem = data.pending?.find(p => p.proposed_data?.title === 'Test Blog Post');
  console.log('Test item found:', testItem ? '✓' : '✗');
  if (testItem) {
    console.log('Change ID:', testItem.change_id);
    console.log('Status:', testItem.status);
  }
});
```

### 5.3 Approve Change

```javascript
const changeId = YOUR_CHANGE_ID; // Replace with actual ID from above

fetch(`http://localhost:3000/api/faculty/approve-change/${changeId}`, {
  method: 'POST',
  headers: {'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`}
})
.then(r => r.json())
.then(data => {
  console.log('Approval result:', data.success ? '✓' : '✗');
  console.log('Message:', data.message);
});
```

**Expected:**
- `success: true`
- Status changed to `pending_admin`

### 5.4 Admin Commit Test

1. Login as admin user
2. Navigate to admin dashboard
3. Go to approvals section
4. Find the item (now pending_admin)
5. Click "Commit"

**Console test:**
```javascript
const changeId = YOUR_CHANGE_ID;

fetch(`http://localhost:3000/api/admin/commit-change/${changeId}`, {
  method: 'POST',
  headers: {'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`}
})
.then(r => r.json())
.then(data => {
  console.log('Commit result:', data.success ? '✓' : '✗');
  console.log('Message:', data.message);
});
```

**Expected:**
- `success: true`
- Status changed to `committed`
- Actual blog created in `blogs` table
- Audit trail entry created

---

## Test Suite 6: Permission Tests

### 6.1 Test Permission Denied (User without Faculty Role)

1. Create/login with regular user account (not faculty)
2. Try accessing faculty endpoint:

```javascript
const token = localStorage.getItem('jwt_token');

fetch('http://localhost:3000/api/faculty/dashboard', {
  headers: {'Authorization': `Bearer ${token}`}
})
.then(r => r.json())
.then(data => {
  console.log('Permission test:', !data.success ? '✓' : '✗');
  console.log('Expected error:', data.message);
});
```

**Expected:** `success: false`, permission denied message

### 6.2 Test Specific Permission Checks

```javascript
// Test specific permission
const token = localStorage.getItem('jwt_token');

fetch('http://localhost:3000/api/faculty/users', {
  headers: {'Authorization': `Bearer ${token}`}
})
.then(r => r.json())
.then(data => {
  if (data.success) {
    console.log('✓ User has faculty_view_users permission');
  } else {
    console.log('✗ Permission denied:', data.message);
  }
});
```

---

## Test Suite 7: Error Handling

### 7.1 Test Invalid Token

```javascript
fetch('http://localhost:3000/api/faculty/dashboard', {
  headers: {'Authorization': 'Bearer invalid_token_here'}
})
.then(r => r.json())
.then(data => {
  console.log('Invalid token test:', !data.success ? '✓' : '✗');
  console.log('Error:', data.message);
});
```

**Expected:** 401 Unauthorized

### 7.2 Test Missing Parameters

```javascript
const token = localStorage.getItem('jwt_token');

fetch('http://localhost:3000/api/faculty/approve-change/999999', {
  method: 'POST',
  headers: {'Authorization': `Bearer ${token}`}
})
.then(r => r.json())
.then(data => {
  console.log('Invalid ID test:', !data.success ? '✓' : '✗');
  console.log('Error:', data.message);
});
```

**Expected:** 404 Not Found or error message

---

## Test Suite 8: Performance & Security

### 8.1 Check Dashboard Load Time

```javascript
const start = performance.now();

fetch('http://localhost:3000/api/faculty/dashboard', {
  headers: {'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`}
})
.then(r => r.json())
.then(data => {
  const duration = performance.now() - start;
  console.log('Load time:', duration.toFixed(2), 'ms');
  console.log('Performance test:', duration < 2000 ? '✓' : '✗ (should be < 2000ms)');
});
```

**Expected:** < 2000ms

### 8.2 Test SQL Injection Prevention

```javascript
const token = localStorage.getItem('jwt_token');

// Try SQL injection in query parameter
fetch('http://localhost:3000/api/faculty/approve-change/1%27%20OR%20%271%27=%271', {
  method: 'POST',
  headers: {'Authorization': `Bearer ${token}`}
})
.then(r => r.json())
.then(data => {
  console.log('SQL injection test:', !data.success ? '✓ (blocked)' : '✗ (vulnerable!)');
});
```

**Expected:** Error, not success (should be blocked by parameterized queries)

---

## Quick Test Summary Script

Run this all-in-one test in console after logging in:

```javascript
(async () => {
  const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
  
  if (!token) {
    console.log('❌ No token found. Please login first.');
    return;
  }
  
  console.log('=== Running Phase 5 Quick Tests ===\n');
  
  const tests = [
    { name: 'Dashboard', url: '/api/faculty/dashboard' },
    { name: 'Permissions', url: '/api/faculty/permissions' },
    { name: 'Users', url: '/api/faculty/users' },
    { name: 'Pending Approvals', url: '/api/faculty/pending-approvals' }
  ];
  
  for (const test of tests) {
    try {
      const res = await fetch(`http://localhost:3000${test.url}`, {
        headers: {'Authorization': `Bearer ${token}`}
      });
      const data = await res.json();
      console.log(`${data.success ? '✓' : '✗'} ${test.name}`);
    } catch (e) {
      console.log(`✗ ${test.name}: ${e.message}`);
    }
  }
  
  console.log('\n=== Tests Complete ===');
})();
```

---

## Checklist Summary

Use this checklist to track testing progress:

### Database
- [ ] faculty_pending_changes table exists
- [ ] Faculty permissions configured (>= 13)
- [ ] Faculty role permissions configured (>= 14)
- [ ] Faculty test user exists

### Authentication
- [ ] Unauthorized access rejected
- [ ] Login works and stores token
- [ ] Token verified on subsequent requests

### Faculty Endpoints
- [ ] GET /api/faculty/dashboard
- [ ] GET /api/faculty/permissions
- [ ] GET /api/faculty/users
- [ ] GET /api/faculty/pending-approvals
- [ ] POST /api/faculty/approve-change/:id

### Frontend
- [ ] Faculty dashboard loads without redirect
- [ ] Anonymous toast shows when no token
- [ ] All sections visible when authenticated
- [ ] Edit account profile picture updates correctly
- [ ] Forms submit successfully

### Approval Workflow
- [ ] Create pending change
- [ ] Faculty can view pending items
- [ ] Faculty can approve/forward
- [ ] Admin can commit
- [ ] Audit trail created

### Permissions
- [ ] Non-faculty users blocked
- [ ] Specific permission checks work
- [ ] Error messages clear

### Performance & Security
- [ ] Dashboard loads < 2s
- [ ] SQL injection blocked
- [ ] XSS attempts sanitized
- [ ] Invalid tokens rejected

---

## Troubleshooting

### Server Won't Start
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process if needed
taskkill /PID <PID> /F

# Restart server
node server.js
```

### Connection Refused
- Verify server running: check terminal output
- Verify port: should see "Server running on http://localhost:3000"
- Check firewall: may need to allow Node.js

### Token Issues
```javascript
// Clear all tokens
localStorage.clear();

// Re-login
// (use login script from Test Suite 2.2)
```

### Database Connection Errors
- Verify MySQL running: check XAMPP control panel
- Verify credentials in `.env` file
- Test connection: `mysql -u root -p`

---

## Next Steps After Phase 5

Once all tests pass:
1. Document any bugs found
2. Fix critical issues
3. Prepare for deployment
4. Create user documentation
5. Plan Phase 6 features
