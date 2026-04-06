# 🎯 Quick Fix Reference - Socket Timing Issue

## The Problem (1 sentence)
**Socket wasn't connected when loadProblem() was called, causing silent failure.**

## The Solution (1 sentence)
**Wait for socket.connect event before calling loadProblem().**

---

## Testing Checklist

```bash
# 1. Restart server
node server.js

# 2. Open browser + console (F12)

# 3. Create lobby → Start match

# 4. Look for these logs:
```

### ✅ **Must See These NEW Logs:**
```
[🔧 DEBUG] 12.7. ⏳ Socket not connected yet - waiting
🔧 [SOCKET DEBUG] 5. ✅ Socket CONNECTED
[🔧 DEBUG] 12.8. ✅ Socket connected! Now loading problem
[🔧 DEBUG] 15.3. ✅ Connection verified
[🔧 DEBUG] 17. ✅ RESPONSE RECEIVED ← THIS WAS MISSING!
[🔧 DEBUG] 20. Problem data stored
```

### ✅ **Page Should:**
- Yellow banner disappears
- Problem title appears
- Code editor loads
- Timer starts

---

## What Changed

| File | Change |
|------|--------|
| **LobbyOnboarding.vue** | Wait for socket connection before loadProblem() |
| **socket.js** | Added connection event logging |
| **server.js** | Added authentication confirmation logs |

---

## If Still Broken

### Check These:
1. **Server running?** `node server.js`
2. **Token exists?** Check localStorage
3. **Port correct?** Should be 3000
4. **Browser cache?** Hard refresh (Ctrl+Shift+R)

### Debug Command:
```javascript
// Run in browser console
console.log({
  socket: !!window.__SHARED_SOCKET__,
  connected: window.__SHARED_SOCKET__?.connected,
  token: !!localStorage.getItem('token')
});
```

---

## Key Logs to Watch

### **Player Side:**
```
Step 12.7 → Waiting for socket
Step 12.8 → Socket connected!
Step 17 → Response received ← KEY!
```

### **Spectator Side:**
```
Step 10 → Waiting for socket
Step 11 → Socket connected!
Successfully joined as spectator ← KEY!
```

---

## Success = Step 17 Appears! 🎉

Before: Steps 1-16, 23 (missing 17)
After: Steps 1-24 complete ✅

---

**Test it now, partner! 🚀**
