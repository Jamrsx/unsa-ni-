# Quick Start: Faculty Dashboard

## Current Status
✅ **Faculty Dashboard Implementation Complete**

## How to Access

### 1. Start Backend Server (Port 3000)
```bash
cd DuelCode-Capstone-Project
npm start
```
✓ Server running on http://localhost:3000
✓ APIs available at /api/faculty/*

### 2. Start Frontend Dev Server (Port 5174)
```bash
cd DuelCode-Capstone-Project
npm run dev
```
✓ Vite dev server running on http://localhost:5174

### 3. Generate Fresh Faculty Token
```bash
npm run seed:faculty
```
This will:
- Create a test faculty user (if needed)
- Output a fresh JWT token
- Print to console for use in frontend

### 4. Access Faculty Dashboard
Open in browser:
```
http://localhost:5174/faculty-dashboard.html
```

## Dashboard Sections

| Section | Purpose | Features |
|---------|---------|----------|
| **Dashboard** | Overview stats | Total Users, Problems, Events, Pending Approvals |
| **Edit Account** | Profile management | Update name, email, password |
| **Users** | User management | View all users, manage roles |
| **Problems** | Problem CRUD | Create, edit, delete coding problems |
| **Events** | Event management | Schedule events, manage participants |
| **Blogs** | Blog management | Write, edit, delete blog posts |
| **Approvals** | Two-level review | Review pending changes, approve/reject |

## Two-Level Approval Workflow

### How It Works
1. **Faculty Creates Change**: E.g., "Create new problem"
2. **Change Queued**: Sent to faculty_pending_changes table
3. **Faculty Reviews**: In "Approvals" tab, can approve or reject
4. **Forwarded to Admin**: If approved, shows in admin's queue
5. **Admin Commits**: Admin finalizes and applies change
6. **Real-time Sync**: Socket.io broadcasts updates to all clients

### Test the Workflow

**Step 1: Create a Problem**
```bash
curl -X POST http://localhost:3000/api/faculty/problems \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "problem_name": "Test Problem",
    "difficulty": "Medium",
    "time_limit_seconds": 5,
    "memory_limit_mb": 128,
    "description": "Test problem for approval workflow"
  }'
```

**Step 2: Check Pending Approvals (Faculty)**
```bash
curl -H "Authorization: Bearer <FACULTY_TOKEN>" \
  http://localhost:3000/api/faculty/pending-approvals
```

**Step 3: Approve the Change (Faculty)**
```bash
curl -X POST http://localhost:3000/api/faculty/approve-change/1 \
  -H "Authorization: Bearer <FACULTY_TOKEN>"
```

**Step 4: Check Admin Queue**
```bash
curl -H "Authorization: Bearer <ADMIN_TOKEN>" \
  http://localhost:3000/api/admin/pending-faculty-approvals
```

**Step 5: Commit the Change (Admin)**
```bash
curl -X POST http://localhost:3000/api/admin/commit-change/1 \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

## Available npm Scripts

```bash
npm start              # Start backend server on port 3000
npm run dev            # Start Vite dev server on port 5174
npm run build          # Build for production
npm run seed:faculty   # Generate faculty token
npm run flow:admin     # Run admin approval workflow demo
npm run cleanup:demo   # Remove demo data
```

## File Changes Summary

**Created Files:**
- `src/FacultyDashboard.vue` - Main faculty dashboard component
- `src/components/dashboard/faculty/content_dashboard.vue`
- `src/components/dashboard/faculty/content_users.vue`
- `src/components/dashboard/faculty/content_problems.vue`
- `src/components/dashboard/faculty/content_events.vue`
- `src/components/dashboard/faculty/content_blogs.vue`
- `src/components/dashboard/faculty/content_approvals.vue`
- `FACULTY_DASHBOARD_COMPLETE.md` - Implementation summary

**Updated Files:**
- `src/js/faculty-dashboard.js` - Already had all endpoints
- `server.js` - Updated to pass `io` to registerFacultyHttp
- `package.json` - Added seed scripts

## Database Tables

### faculty_pending_changes
Stores all pending faculty changes with original and proposed data:
- `id` - Primary key
- `faculty_id` - Faculty user ID
- `change_type` - Type of change (problem, event, blog, user_edit)
- `table_name` - Which table the change affects
- `record_id` - The record ID being changed
- `action_type` - create, update, or delete
- `original_data` - JSON of original state
- `proposed_data` - JSON of proposed changes
- `status` - pending, approved_by_faculty, approved_by_admin, committed, etc.
- `created_at`, `updated_at` - Timestamps

## Socket.io Events

The dashboard listens for real-time updates:
- `faculty_change_forwarded` - Change submitted for review
- `faculty_change_approved` - Faculty approved the change
- `faculty_change_committed` - Admin committed the change
- `faculty_change_rejected` - Change was rejected

## Testing Checklist

- [ ] Start backend server - `npm start`
- [ ] Start dev server - `npm run dev`
- [ ] Open http://localhost:5174/faculty-dashboard.html
- [ ] Seed faculty token - `npm run seed:faculty`
- [ ] Create a test problem
- [ ] Navigate to Approvals tab
- [ ] Approve the pending change
- [ ] Check socket notifications appear
- [ ] View change in Dashboard summary

## Troubleshooting

**"Port 3000 already in use"**
- Backend is already running
- Either restart or change PORT env variable

**"Port 5173 is in use, trying another one..."**
- Normal behavior - Vite falls back to 5174

**"Cannot POST /api/faculty/problems"**
- Check backend server is running on port 3000
- Verify Authorization header has valid JWT token

**"Socket not connecting"**
- Check browser console for errors
- Verify JWT token is valid
- Ensure server is running

## Next Session

To continue development:
1. Start backend: `npm start`
2. Start frontend: `npm run dev`
3. Open dashboard: http://localhost:5174/faculty-dashboard.html
4. Implement additional features as needed

---

**Ready to test!** Open the faculty dashboard and try the approval workflow.
