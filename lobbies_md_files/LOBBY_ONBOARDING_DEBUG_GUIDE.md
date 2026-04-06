# 🔧 Lobby Onboarding & Spectator Debug Guide

## What We Fixed

### 1. **LobbyOnboarding.vue** - Hard-Coded Debug Logging
Added extensive console logging with 🔧 emoji prefix to track:
- Component mounting (steps 1-24)
- Socket connection status
- User authentication
- URL parameters parsing
- Problem loading from server
- Response handling

**Key Debug Points:**
- Check if socket exists and is connected
- Verify URL parameters (lobby_id, problem_id, match_duration)
- Track get_problem_by_id request/response cycle
- Monitor problem data storage

### 2. **lobby-onboarding.html** - Visual Debug Mount Point
Added:
- Visible yellow debug banner showing "MOUNT POINT VISIBLE"
- DOM mutation observer to track Vue mounting
- Script logging for page load sequence

**What to Look For:**
- Yellow banner should disappear when Vue mounts successfully
- Console should show HTML DEBUG steps 1-10
- If banner stays visible, Vue failed to mount

### 3. **main.js** - Vue Mount Tracking
Enhanced logging to show:
- Import success
- Mount point detection
- Component mounting attempts
- Success/failure for each mount

**Key Debug Points:**
- Verify main.js loads (step 1)
- Check if #lobby_onboarding_app is found (step 6)
- Confirm successful mount (step 8)
- Watch for mount errors (step 9)

### 4. **Inspector.vue** - Spectator Debug
Added 🔧 debug logging for:
- Component initialization
- Socket connection verification
- join_as_spectator event emission
- Lobby data reception

### 5. **server.js** - Backend Problem Loading
Enhanced get_problem_by_id handler with:
- Request reception logging
- Database query tracking
- Response construction details
- Error handling with stack traces

---

## Testing Sequence

### **Test 1: Lobby Onboarding Page Load**

1. **Create a lobby** (from /lobbies.html)
2. **Start the match** (as host in room)
3. **Open browser console** (F12)
4. **Check for these debug logs in order:**

```
🔧 [HTML DEBUG] 1. Document loaded
🔧 [HTML DEBUG] 2. URL: http://localhost:3000/lobby-onboarding.html?lobby_id=X&problem_id=Y...
🔧 [HTML DEBUG] 4. DOM Content Loaded
🔧 [HTML DEBUG] 5. Mount point exists: true
🔧 [MAIN.JS DEBUG] 1. main.js loaded
🔧 [MAIN.JS DEBUG] 6. ✅ Found mount point #lobby_onboarding_app
🔧 [MAIN.JS DEBUG] 8. ✅ Successfully mounted LobbyOnboarding
🔧 [DEBUG] 1. Component onMounted called
🔧 [DEBUG] 11. URL Parameters parsed
```

5. **Check for problem loading:**
```
🔧 [DEBUG] 13. loadProblem() called
🔧 [DEBUG] 16. Emitting get_problem_by_id event...
🔧 [DEBUG] 17. get_problem_by_id RESPONSE received
🔧 [DEBUG] 20. Problem data stored
```

6. **Server-side verification:**
```
🔧 [SERVER DEBUG] 1. get_problem_by_id received
🔧 [SERVER DEBUG] 10. Problem found: [problem name]
🔧 [SERVER DEBUG] 13. ✅ Sending response
```

### **Test 2: Spectator Mode (Inspector)**

1. **Copy spectator link** from room page
2. **Open in new tab/window**
3. **Check console for:**

```
🔧 [INSPECTOR DEBUG] 1. Component onMounted called
🔧 [INSPECTOR DEBUG] 5. Lobby ID from URL: X
🔧 [INSPECTOR DEBUG] 9. Socket already connected - joining as spectator
```

---

## Common Issues & Solutions

### ❌ **Yellow Banner Stays Visible**
**Problem:** Vue failed to mount  
**Check:**
- Console shows main.js errors?
- Is #lobby_onboarding_app found?
- Check for Vue compilation errors

**Fix:** Look at step 9 in main.js debug for error details

### ❌ **Problem Not Loading**
**Problem:** get_problem_by_id failed  
**Check:**
- Step 14: problemId.value has a value?
- Step 15: Socket connected = true?
- Step 17: Response received?
- Server DEBUG 10: Problem found in DB?

**Fix:** 
- Verify problem_id in URL
- Check database has that problem
- Restart server to ensure latest code

### ❌ **Blank Page (No Yellow Banner)**
**Problem:** HTML didn't load or mount point missing  
**Check:**
- HTML DEBUG steps 1-5 appear?
- Step 5 should show: Mount point exists: true

**Fix:**
- Check HTML file saved correctly
- Verify Vite dev server running
- Hard refresh (Ctrl+Shift+R)

### ❌ **Socket Not Connected**
**Problem:** Authentication/connection failed  
**Check:**
- DEBUG step 3: Socket connected should be true
- Check localStorage for 'token'
- Verify server is running

**Fix:**
- Sign in again
- Clear localStorage and re-authenticate
- Check server console for connection logs

---

## Debug Log Reference

### 🔧 **Emoji Prefixes**
- `🔧` = Debug/diagnostic log (safe to ignore in production)
- `✅` = Success indicator
- `❌` = Error/failure indicator
- `⏩` = Skipped operation

### **Log Locations**
- **HTML DEBUG** = lobby-onboarding.html inline scripts
- **MAIN.JS DEBUG** = src/main.js Vue mounting
- **DEBUG** (no prefix) = LobbyOnboarding.vue component
- **INSPECTOR DEBUG** = Inspector.vue spectator component
- **SERVER DEBUG** = server.js backend handlers

---

## Quick Diagnostic Command

Open console and run:
```javascript
// Check current state
console.log({
  url: window.location.href,
  mountPoint: document.getElementById('lobby_onboarding_app'),
  socket: window.socket,
  localStorage: {
    token: localStorage.getItem('token') ? 'EXISTS' : 'MISSING',
    user: localStorage.getItem('user')
  }
});
```

---

## Next Steps After Testing

1. **If onboarding loads but problem doesn't appear:**
   - Check server DEBUG logs for database query results
   - Verify problem_id exists in problems table
   - Check test_cases table has sample cases

2. **If spectator mode doesn't connect:**
   - Verify lobby is in 'active' status
   - Check spectator code matches
   - Ensure server spectator handlers registered

3. **If page loads but is completely blank:**
   - Check browser console for Vue errors
   - Verify CSS files loaded
   - Check network tab for 404s on assets

---

## Cleanup (After Debugging)

Once issues are resolved, you can:
1. Remove 🔧 debug logs (search for `🔧`)
2. Remove yellow banner from HTML
3. Remove DOM mutation observer
4. Reduce main.js logging verbosity

**Or keep them** - they only appear in console and help future debugging!

---

## Contact Points

- **Vue mounting issues** → main.js DEBUG logs
- **Component lifecycle** → LobbyOnboarding.vue DEBUG logs
- **Server responses** → server.js SERVER DEBUG logs
- **DOM rendering** → HTML DEBUG logs in browser console
