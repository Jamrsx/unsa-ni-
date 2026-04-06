# Permission Save Debug Guide

## Issues Being Debugged

1. **CSS Color Display**: Toggle buttons should show gray (inherited), blue (allowed), or red (denied) based on permission state
2. **Permission Save Not Persisting**: When you edit a role/permission and click Save, the changes revert after the modal closes

## How to Test

### Setup
1. Start MySQL/XAMPP if not already running
2. Ensure Node.js server is running: `node server.js`
3. Start Vite dev server: `npm run dev`
4. Open http://localhost:5173 in browser

### CSS Color Test
1. Log in as admin
2. Go to Admin Dashboard → Manage Users/Admins section
3. Click "Edit" on an admin user
4. Look at the permission toggles in the modal
5. Expected: 
   - Inherited permissions should appear **gray**
   - Allowed (user override) should appear **blue**
   - Denied (user override) should appear **red**
6. If you don't see colors, check browser DevTools: Inspect → Elements and look for color values in .slider elements

### Permission Save Test
1. Log in as admin
2. Go to Admin Dashboard → Manage Users/Admins
3. Click "Edit" on an admin user
4. **Change one toggle** (e.g., click a denied permission to enable it)
5. **Open Browser DevTools** (F12) → Console tab
6. Click the **Save** button
7. **Watch the console** for these log messages (in order):
   - `[Admin Permissions] Saving for admin: [ID] [Name]`
   - `[Admin Permissions] Current form state: [...]` (should show your changed toggle)
   - `[Admin Permissions] Computed overrides: [...]` (should show the permission_id you changed)
   - `[Socket] Emitting request_update_admin_permissions...`
   - `[Socket] Received response_update_admin_permissions: {success: true, ...}`
   - `[Admin Permissions] Save successful`
   - `[Admin Permissions] Updated groupedPermissions, now closing modal`
8. The modal should close
9. Click "Edit" again on the same admin
10. Expected: Your permission change should be saved (toggle should be in the new state)
11. If it reverted, check console for any error messages

## Debug Checklist

If save is not persisting:
- [ ] All socket logs appear in correct order?
- [ ] Does response say `{success: true}`?
- [ ] Is callback being executed ("Save successful" message)?
- [ ] Try clearing browser localStorage and re-logging in
- [ ] Check server.js logs for any error messages from request_update_admin_permissions handler

If colors are not showing:
- [ ] Open DevTools → Elements
- [ ] Find a toggle slider element
- [ ] Check its computed styles - what is the actual background-color?
- [ ] Are you seeing the !important overrides being applied?

## Key Code Files

- Frontend form logic: `src/components/dashboard/admin/content_admin.vue` (handleSavePermissions function)
- Socket client: `src/js/admin-dashboard.js` (update_admin_permissions function)
- Socket server: `src/js/conn/socket/dashboard-admin-socket.js` (request_update_admin_permissions handler)
- Toggle styling: `src/components/toggle-button.vue` (CSS for inherited/allowed/denied states)
