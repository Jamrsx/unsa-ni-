# 🧪 ABANDONMENT SYSTEM - COMPLETE REFERENCE GUIDE

## 📚 Table of Contents
1. [System Architecture](#system-architecture)
2. [Core Components](#core-components)
3. [How It Works](#how-it-works)
4. [Testing Guide](#testing-guide)
5. [Debugging Reference](#debugging-reference)
6. [Common Issues & Solutions](#common-issues--solutions)

---

# 📐 System Architecture

## Overview
The abandonment system tracks players during matches and applies penalties when they disconnect without completing the match. It uses a **grace period** approach with persistent notifications.

## Key Components

### 1. **AbandonmentTracker Class** (`src/js/conn/abandonment_tracker.js`)
- **Constructor**: `new AbandonmentTracker(io, db, activeSessions)`
  - `io`: Socket.IO instance for real-time communication
  - `db`: MySQL database connection
  - `activeSessions`: Map of userId → Set of socketIds (for multi-tab support)

### 2. **Database Table** (`pending_abandonment_notifications`)
```sql
CREATE TABLE pending_abandonment_notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    match_id INT NOT NULL,
    message TEXT NOT NULL,
    penalty_dp INT DEFAULT 0,
    bonus_dp INT DEFAULT 0,
    abandon_count INT DEFAULT 0,
    is_banned TINYINT DEFAULT 0,
    notification_type ENUM('abandonment', 'opponent_abandon') NOT NULL,
    opponent_username VARCHAR(255),
    mode VARCHAR(50),
    shown_at TIMESTAMP NULL,      -- NULL = not shown yet, NOW() = already shown
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. **Global Notification System** (`src/js/socket.js`)
- Queue-based notification display
- Works across ALL pages (Duel, Onboarding, Result, Dashboard)
- Waits for DOM to be ready before displaying

---

# 🔧 Core Components

## AbandonmentTracker Internal State

### Maps Used:
```javascript
activeMatches = new Map()      // matchId → { mode, player1, player2 }
socketToMatch = new Map()      // socketId → { matchId, userId, playerSlot }
userToMatch = new Map()        // userId → { matchId, playerSlot }
abandonedPlayers = new Set()   // Set of userIds who already abandoned
waitingTimers = new Map()      // matchId → { timerInfo }
```

### Player State Object:
```javascript
{
    userId: 1,
    username: "user0",
    socketId: "abc123",
    onPage: true,              // Currently on onboarding page
    submitted: false,          // Has submitted code
    disconnectTimer: null      // Timer object (null if no timer active)
}
```

---

# ⚙️ How It Works

## 1. Match Registration Flow

### When Player Enters Onboarding:
```javascript
// File: src/Onboarding.vue (lines 146-162)
socket.emit('onboarding_page_loaded', { match_id: matchId, mode });
```

**Server Handler** (`server.js` lines 1895-1960):
```javascript
socket.on('onboarding_page_loaded', async ({ match_id, mode }) => {
    // 1. Authenticate user (200ms delay to ensure socket.user is set)
    if (!socket.user || !socket.user.id) {
        socket.emit('onboarding_access_denied', { 
            reason: 'not_authenticated',
            redirectTo: '/signin.html'
        });
        return;
    }
    
    // 2. Check if player can rejoin (grace period check)
    const accessCheck = abandonmentTracker.canRejoinMatch(userId, match_id);
    if (!accessCheck.allowed) {
        socket.emit('onboarding_access_denied', {...});
        return;
    }
    
    // 3. Register player with abandonment tracker
    const reconnected = abandonmentTracker.playerReconnected(match_id, socket.id, userId);
    if (!reconnected) {
        abandonmentTracker.playerEnteredOnboarding(match_id, socket.id, userId, username, mode);
    }
    
    // 4. Grant access
    socket.emit('onboarding_access_granted', { matchId, mode, graceRemaining });
});
```

**AbandonmentTracker Registration** (`abandonment_tracker.js` lines 90-160):
```javascript
playerEnteredOnboarding(matchId, socketId, userId, username, mode) {
    // Create match record if doesn't exist
    if (!this.activeMatches.has(matchId)) {
        this.activeMatches.set(matchId, {
            mode: mode,
            player1: null,
            player2: null
        });
    }
    
    // Determine player slot (player1 or player2)
    const match = this.activeMatches.get(matchId);
    let playerSlot;
    if (!match.player1) {
        playerSlot = 'player1';
        match.player1 = { userId, username, socketId, onPage: true, submitted: false, disconnectTimer: null };
    } else if (!match.player2) {
        playerSlot = 'player2';
        match.player2 = { userId, username, socketId, onPage: true, submitted: false, disconnectTimer: null };
    }
    
    // Store mappings
    this.socketToMatch.set(socketId, { matchId, userId, playerSlot });
    this.userToMatch.set(userId, { matchId, playerSlot });
}
```

---

## 2. Disconnection Detection

### When Socket Disconnects:
```javascript
// File: server.js (lines 1630-1690)
socket.on('disconnect', () => {
    // Track in activeSessions
    const userId = socket.user?.id;
    if (userId && activeSessions.has(userId)) {
        activeSessions.get(userId).delete(socket.id);
        const isLastSocket = activeSessions.get(userId).size === 0;
        
        // Notify abandonment tracker
        if (abandonmentTracker) {
            abandonmentTracker.handleDisconnect(socket.id, userId);
        }
    }
});
```

**AbandonmentTracker Handler** (`abandonment_tracker.js` lines 161-290):
```javascript
handleDisconnect(socketId, userId) {
    const mapping = this.socketToMatch.get(socketId);
    if (!mapping) {
        console.log(`No mapping found for socket ${socketId}`);
        return;
    }
    
    const { matchId, playerSlot } = mapping;
    const match = this.activeMatches.get(matchId);
    const player = match[playerSlot];
    
    // Check if user has other active sockets
    const userHasOtherSockets = this.activeSessions?.has(userId) && 
                                this.activeSessions.get(userId).size > 0;
    
    if (userHasOtherSockets) {
        console.log(`${player.username} closed a tab but has other sockets open - not starting grace period yet`);
        this.socketToMatch.delete(socketId);
        return;
    }
    
    // Last socket disconnected - start 30s grace period
    console.log(`${player.username} disconnected (last socket) - starting 30s grace period`);
    
    player.onPage = false;
    player.socketId = null;
    
    // Set timer
    player.disconnectTimer = setTimeout(() => {
        this._handleDisconnectTimeout(matchId, playerSlot);
    }, this.RECONNECT_GRACE_PERIOD); // 30 seconds
}
```

---

## 3. Grace Period & Timer Expiry

### Sequential Timer Logic:
```javascript
// File: abandonment_tracker.js (lines 318-500)
async _handleDisconnectTimeout(matchId, playerSlot) {
    const match = this.activeMatches.get(matchId);
    const player = match[playerSlot];
    const opponentSlot = playerSlot === 'player1' ? 'player2' : 'player1';
    const opponent = match[opponentSlot];
    
    console.log(`🚨 TIMER EXPIRED: ${player.username} grace period ended (30s)`);
    
    // CASE 1: Opponent still active (single abandon)
    if (opponent && !opponent.disconnectTimer) {
        console.log(`🎯 SINGLE ABANDON: ${player.username} left, ${opponent.username} still active`);
        await this._applyAbandonmentPenalty(match, player, opponent);
        return;
    }
    
    // CASE 2: Both players disconnected
    if (opponent && opponent.disconnectTimer) {
        console.log(`⏳ WAITING STATE: ${player.username}'s timer expired, but ${opponent.username} also disconnected`);
        
        // Don't penalize yet - wait for opponent's timer
        // Store this player in a waiting state
        this.waitingTimers.set(matchId, {
            firstPlayer: player,
            firstPlayerSlot: playerSlot,
            waitingForOpponent: true
        });
        return;
    }
    
    // CASE 3: Opponent's timer also expired (both abandon)
    const waitingState = this.waitingTimers.get(matchId);
    if (waitingState && waitingState.waitingForOpponent) {
        console.log(`💥 BOTH ABANDONED: Both timers expired for match ${matchId}`);
        
        // Penalize both players (no opponent bonus)
        await this._applyAbandonmentPenalty(match, waitingState.firstPlayer, null);
        await this._applyAbandonmentPenalty(match, player, null);
        
        this.waitingTimers.delete(matchId);
    }
}
```

---

## 4. Penalty Application

```javascript
// File: abandonment_tracker.js (lines 554-710)
async _applyAbandonmentPenalty(match, abandoner, opponent) {
    const { matchId, mode } = match;
    const { userId, username } = abandoner;
    
    // 1. Update abandoner's record
    const abandonCount = await this._incrementAbandonCount(userId);
    const penaltyDP = mode === 'ranked' ? 20 : 0;
    
    await this.db.query(
        'UPDATE statistic SET statistic_duel_point = statistic_duel_point - ? WHERE user_id = ?',
        [penaltyDP, userId]
    );
    
    console.log(`Updated ${username}: abandon_count=${abandonCount}, DP penalty=${penaltyDP}`);
    
    // 2. Store notification for abandoner
    const playerOnline = this._isPlayerOnline(userId);
    const message = `You abandoned a ${mode} match. Penalty: -${penaltyDP} DP. Abandon count: ${abandonCount}`;
    
    const [result] = await this.db.query(
        `INSERT INTO pending_abandonment_notifications 
         (user_id, match_id, message, penalty_dp, abandon_count, is_banned, notification_type, mode, shown_at) 
         VALUES (?, ?, ?, ?, ?, ?, 'abandonment', ?, ?)`,
        [userId, matchId, message, penaltyDP, abandonCount, isBanned ? 1 : 0, mode, playerOnline ? new Date() : null]
    );
    
    if (playerOnline) {
        // Send real-time notification
        this._sendNotificationToAllSockets(userId, 'abandonment_penalty', {...});
    } else {
        console.log(`💤 Player offline - notification will show on reconnect`);
    }
    
    // 3. Handle opponent reward (if opponent exists)
    if (opponent) {
        const opponentBonus = mode === 'ranked' ? 10 : 0;
        
        if (opponentBonus > 0) {
            await this.db.query(
                'UPDATE statistic SET statistic_duel_point = statistic_duel_point + ? WHERE user_id = ?',
                [opponentBonus, opponent.userId]
            );
            console.log(`💰 Awarded ${opponentBonus} DP to ${opponent.username}`);
        }
        
        // ALWAYS notify opponent (regardless of page location)
        const opponentMessage = opponentBonus > 0
            ? `${username} abandoned the match. You received +${opponentBonus} DP!`
            : `${username} abandoned the match. You win by forfeit!`;
        
        await this._notifyOpponent(opponent.userId, {
            message: opponentMessage,
            opponentUsername: username,
            bonusDP: opponentBonus,
            mode: mode,
            matchId: matchId,
            timestamp: Date.now()
        });
    }
    
    // 4. Mark match as abandoned
    await this.db.query(
        'UPDATE duel_matches SET status = ? WHERE match_id = ?',
        ['abandoned', matchId]
    );
}
```

---

## 5. Notification Display System

### Client-Side Socket Listeners (`src/js/socket.js` lines 61-112):
```javascript
// Queue for notifications that arrive before DOM is ready
let notificationQueue = [];
let isDOMReady = document.readyState === 'complete';

// Wait for DOM to be fully loaded
if (!isDOMReady) {
  window.addEventListener('load', () => {
    isDOMReady = true;
    // Process queued notifications
    notificationQueue.forEach(item => {
      if (item.type === 'penalty') {
        showGlobalAbandonmentPenalty(item.data);
      } else if (item.type === 'opponent') {
        showGlobalOpponentAbandoned(item.data);
      }
    });
    notificationQueue = [];
  });
}

// When YOU abandon a match
window.__SHARED_SOCKET__.on('abandonment_penalty', (data) => {
  console.log('[GLOBAL ABANDON] ✉️ Received penalty notification:', data);
  
  if (isDOMReady) {
    showGlobalAbandonmentPenalty(data);
  } else {
    notificationQueue.push({ type: 'penalty', data });
  }
});

// When OPPONENT abandons (you win)
window.__SHARED_SOCKET__.on('opponent_abandoned', (data) => {
  console.log('[GLOBAL OPPONENT_ABANDON] ✉️ Received notification:', data);
  
  if (isDOMReady) {
    showGlobalOpponentAbandoned(data);
  } else {
    notificationQueue.push({ type: 'opponent', data });
  }
});
```

### Authentication Handler (Server) (`server.js` lines 737-780):
```javascript
// When player authenticates (connects/reconnects)
socket.on('connect', async () => {
    // After authentication, check for pending notifications
    if (abandonmentTracker && activeSessions.get(userId).size === 1) {
        const pendingNotifications = await abandonmentTracker.getPendingNotifications(userId);
        
        if (pendingNotifications.length > 0) {
            console.log(`[AUTH] 📬 User ${username} has ${pendingNotifications.length} pending notification(s)`);
            
            // Wait 1.5 seconds for page to fully load
            setTimeout(async () => {
                const userSockets = activeSessions.get(userId);
                
                // Send to ALL user's sockets
                for (const notification of pendingNotifications) {
                    const eventName = notification.notification_type === 'opponent_abandon' 
                        ? 'opponent_abandoned' 
                        : 'abandonment_penalty';
                    
                    for (const socketId of userSockets) {
                        const userSocket = io.sockets.sockets.get(socketId);
                        if (userSocket) {
                            userSocket.emit(eventName, notificationData);
                        }
                    }
                    
                    // Mark as shown
                    await abandonmentTracker.markNotificationShown(notification.notification_id);
                }
            }, 1500);
        }
    }
});
```

---

# 🧪 Testing Guide

## ⚠️ CRITICAL: How to Test Properly

### Why Your Tests Are Failing

The abandonment system **ONLY works when players are in a match**. Based on server logs, you're connecting but NOT:
1. Creating a match
2. Entering onboarding page  
3. Waiting for timers to expire

### ✅ Correct Test Procedure

#### **Step 1: Start Match Creation**
1. Open browser for **user0**
2. Open browser for **user2** (different browser or incognito)
3. Both users login
4. Both users click **"Find Match"** (ranked or casual)
5. **Wait for match to be found**

**What to look for in logs:**
```
User user0 entered ranked queue
Queue ranked now has 1 players
User user2 entered ranked queue  
Queue ranked now has 2 players
Match found in ranked: user0 vs user2
Both players ready in ranked match
[MATCH CREATION] Match created with ID: 236
```

#### **Step 2: Enter Onboarding**
1. Both browsers should automatically redirect to onboarding page
2. **WAIT until you see this in server logs:**

```
[ABANDON] 📄 user0 attempting to load onboarding for match 236 (ranked)
[ABANDON TRACKER] 📝 user0 entered onboarding for match 236
[ABANDON TRACKER] user0 registered as player1 (socket: xyz, userId: 1)

[ABANDON] 📄 user2 attempting to load onboarding for match 236 (ranked)
[ABANDON TRACKER] 📝 user2 entered onboarding for match 236  
[ABANDON TRACKER] user2 registered as player2 (socket: abc, userId: 8)
[ABANDON TRACKER] Match 236 status: P1=user0, P2=user2
```

**If you don't see these logs, the abandonment system CAN'T work!**

---

## 🧪 Test Scenario 1: Single Player Abandons

### Steps:
1. Follow Steps 1-2 above (create match, both enter onboarding)
2. **user0**: Close ALL browser tabs/windows
3. **Look for in logs:**
   ```
   [ABANDON TRACKER] ⏰ user0 disconnected (last socket) - starting 30s grace period
   ```
4. **Wait exactly 30 seconds**
5. **Look for in logs:**
   ```
   [ABANDON TRACKER] 🚨 TIMER EXPIRED: user0 grace period ended (30s)
   [ABANDON TRACKER] 🔍 Opponent check for user0:
   [ABANDON TRACKER] 📨 SINGLE ABANDON: Penalizing user0, rewarding user2
   [ABANDON TRACKER] 🔍 Player user0 online status: false
   [ABANDON TRACKER] 💾 Stored notification 32 for user0 (shown_at: NULL)
   ```
6. **user0**: Reconnect (open browser, login)
7. **Navigate to Duel page or any page**
8. **Look for:**
   ```
   [AUTH] 📬 User user0 has 1 pending notification(s)
   [AUTH] 📤 Sending abandonment_penalty to socket xyz
   [ABANDON TRACKER] ✅ Marked notification 32 as shown
   ```
9. **You should see penalty modal on screen**

### Expected Results:
- ✅ user0 sees penalty notification (-20 DP)
- ✅ user2 sees "opponent forfeited" notification (+10 DP)
- ✅ Clicking "I Understand" → navigate to other pages → NO duplicate notification

---

## 🧪 Test Scenario 2: Opponent on Result Page

### Steps:
1. Follow Steps 1-2 (create match, both enter onboarding)
2. **user0**: Submit code (finish match) → go to result page
3. **user2**: Close ALL browser tabs
4. Wait 30 seconds
5. **user0** (still on result page) should see "Opponent Forfeited" notification

### Expected Logs:
```
[ABANDON TRACKER] 🚨 TIMER EXPIRED: user2 grace period ended
[ABANDON TRACKER] 📨 SINGLE ABANDON: user2 abandoned, user0 gets bonus
[ABANDON TRACKER] 🔍 Player user0 online status: true  ← user0 still online!
[ABANDON TRACKER] 📨 Sending real-time notification to user0
[ABANDON TRACKER] 📢 Notifying opponent on socket [user0's socket]
```

### Expected Results:
- ✅ user0 sees notification on Result page (NEW!)
- ✅ user0 gets +10 DP bonus
- ✅ user2 gets penalty when reconnecting

---

## 🧪 Test Scenario 3: Both Players Abandon

### Steps:
1. Follow Steps 1-2 (create match, both enter onboarding)
2. **user0**: Close ALL tabs
3. **user2**: Close ALL tabs
4. Wait 30 seconds
5. Both reconnect to Duel page

### Expected Logs:
```
[ABANDON TRACKER] ⏰ user0 disconnected - starting 30s grace
[ABANDON TRACKER] ⏰ user2 disconnected - starting 30s grace
[ABANDON TRACKER] 🚨 TIMER EXPIRED: user0 grace period ended
[ABANDON TRACKER] ⏳ WAITING STATE: user0's timer expired, but user2 also disconnected
[ABANDON TRACKER] 🚨 TIMER EXPIRED: user2 grace period ended
[ABANDON TRACKER] 💥 BOTH ABANDONED: Both timers expired for match 236
[ABANDON TRACKER] 🔍 Player user0 online status: false
[ABANDON TRACKER] 🔍 Player user2 online status: false
[ABANDON TRACKER] 💾 Stored notification for user0 (shown_at: NULL)
[ABANDON TRACKER] 💾 Stored notification for user2 (shown_at: NULL)
```

When both reconnect:
```
[AUTH] 📬 User user0 has 1 pending notification(s)
[AUTH] 📬 User user2 has 1 pending notification(s)
[AUTH] 📤 Sending abandonment_penalty to socket [user0]
[AUTH] 📤 Sending abandonment_penalty to socket [user2]
```

### Expected Results:
- ✅ Both players see penalty notification
- ✅ Both lose -20 DP
- ✅ NO "opponent forfeited" notifications (both abandoned)

---

# 🐛 Debugging Reference

## Server Logs to Watch For

### ✅ Successful Flow:
```
[MATCH CREATION] Match created with ID: 240
[ABANDON] 📄 user0 attempting to load onboarding for match 240 (ranked)
[ABANDON TRACKER] 📝 user0 entered onboarding for match 240
[ABANDON TRACKER] user0 registered as player1 (socket: xyz, userId: 1)
[ABANDON TRACKER] Match 240 status: P1=user0, P2=user2

[ABANDON TRACKER] ⏰ user0 disconnected (last socket) - starting 30s grace period
[ABANDON TRACKER] 🚨 TIMER EXPIRED: user0 grace period ended (30s)
[ABANDON TRACKER] 🎯 SINGLE ABANDON: user0 left, user2 still active
[ABANDON TRACKER] Updated user0: abandon_count=2, DP=0→-20, banned=0
[ABANDON TRACKER] 🔍 Player user0 online status: false
[ABANDON TRACKER] 💾 Stored notification 36 for user0 (shown_at: NULL)
[ABANDON TRACKER] 💤 Player offline - notification will show on reconnect

[ABANDON TRACKER] 🎯 Opponent exists: user2 (userId: 8)
[ABANDON TRACKER] 💰 Awarded 10 DP to user2
[ABANDON TRACKER] 📢 Notifying opponent user2 about abandonment
[ABANDON TRACKER] 🔍 Opponent 8 online status: true
[ABANDON TRACKER] 📢 Sending immediate notification to socket abc123
[ABANDON TRACKER] 💾 Stored opponent notification ID 37 (shown: YES)

[AUTH] 📬 User user0 has 1 pending notification(s)
[AUTH] ⏰ Sending pending notifications to user0 after DOM ready delay
[AUTH] 📤 Sending abandonment_penalty to socket xyz
[ABANDON TRACKER] ✅ Marked notification 36 as shown
```

### ❌ Problem Indicators:

**1. No Match Created:**
```
User user0 entered ranked queue
Queue ranked now has 1 players
# ❌ Missing: "Match found" and "Match created" logs
```
→ **Solution**: Both players must click "Find Match" and wait for pairing

**2. Player Not Registered:**
```
[ABANDON TRACKER] 🔍 Socket xyz not found in socketToMatch
[ABANDON TRACKER] ⚠️ No mapping found for socket xyz or user 1 - player not tracked
```
→ **Solution**: Player didn't emit `onboarding_page_loaded` (check 200ms delay fix)

**3. Old Cached Code Running:**
```
[ABANDON TRACKER] ⚠️ Opponent exists but not active - may have already left
# ❌ This message is from old code - should be removed
```
→ **Solution**: Restart Node.js server (`Ctrl+C` then `node server.js`)

**4. Authentication Not Set:**
```
[ABANDON] onboarding_page_loaded called without authenticated user
```
→ **Solution**: Onboarding emitted event too early (200ms delay should fix)

**5. Notification Not Stored:**
```
[ABANDON TRACKER] Processing penalty for: user0 (1)
# ❌ Missing: "💾 Stored notification X for user0"
```
→ **Solution**: Check database connection and table schema

---

## Database Verification Queries

### Check Recent Notifications:
```sql
SELECT 
    n.notification_id,
    n.user_id,
    u.username,
    n.message,
    n.penalty_dp,
    n.bonus_dp,
    n.notification_type,
    n.shown_at,
    n.created_at,
    CASE 
        WHEN n.shown_at IS NULL THEN 'PENDING'
        ELSE 'SHOWN'
    END as status
FROM pending_abandonment_notifications n
JOIN users u ON n.user_id = u.user_id
ORDER BY n.created_at DESC
LIMIT 10;
```

### Check User Abandon Stats:
```sql
SELECT 
    u.username,
    u.user_id,
    s.statistic_duel_point,
    (SELECT COUNT(*) FROM pending_abandonment_notifications 
     WHERE user_id = u.user_id AND notification_type = 'abandonment') as abandon_count,
    (SELECT COUNT(*) FROM pending_abandonment_notifications 
     WHERE user_id = u.user_id AND notification_type = 'opponent_abandon') as opponent_forfeit_count
FROM users u
JOIN statistic s ON u.user_id = s.user_id
WHERE u.username IN ('user0', 'user1', 'user2')
ORDER BY u.username;
```

### Find Unshown Notifications:
```sql
SELECT 
    n.notification_id,
    u.username,
    n.match_id,
    n.message,
    n.notification_type,
    TIMESTAMPDIFF(SECOND, n.created_at, NOW()) as seconds_ago
FROM pending_abandonment_notifications n
JOIN users u ON n.user_id = u.user_id
WHERE n.shown_at IS NULL
ORDER BY n.created_at DESC;
```

### Clean Up Old Notifications (after testing):
```sql
-- Delete shown notifications older than 1 day
DELETE FROM pending_abandonment_notifications
WHERE shown_at IS NOT NULL 
AND shown_at < DATE_SUB(NOW(), INTERVAL 1 DAY);

-- Or delete ALL notifications (reset for testing)
TRUNCATE TABLE pending_abandonment_notifications;
```

---

## Browser Console Debugging

### What to Look For:

**1. Socket Connection:**
```javascript
[Socket] Creating new shared socket instance...
[Socket] Connected: xyz123
[Socket] Requesting pending notifications check...
```

**2. Onboarding Page Load:**
```javascript
[ONBOARDING] ✅ Socket authenticated, notifying server
// or
[ONBOARDING] ⏳ Waiting for socket connection...
[ONBOARDING] ✅ Socket connected & authenticated
```

**3. Notification Received:**
```javascript
[GLOBAL ABANDON] ✉️ Received penalty notification: {message: "...", penaltyDP: 20, ...}
[GLOBAL ABANDON] DOM ready: true
[GLOBAL ABANDON] Showing notification immediately
[NOTIFICATION DISPLAY] 🎨 Showing abandonment penalty modal
[NOTIFICATION DISPLAY] 📌 Appending penalty notification to document.body
[NOTIFICATION DISPLAY] ✅ Penalty notification displayed successfully
```

**4. Notification Queued (DOM not ready):**
```javascript
[GLOBAL ABANDON] ✉️ Received penalty notification: {...}
[GLOBAL ABANDON] DOM ready: false
[GLOBAL ABANDON] Queueing notification until DOM ready
// Later:
[NOTIFICATION] DOM ready, processing 1 queued notifications
```

### Common Browser Console Errors:

**Error: "Cannot read property 'appendChild' of null"**
→ DOM not ready when notification tried to display (should be fixed by queue system)

**Error: "socket.emit is not a function"**
→ Socket not initialized (check if getSocket() returned null)

**No logs at all:**
→ JavaScript not loaded or page using different socket instance

---

# 🔧 Common Issues & Solutions

## Issue 1: "Please sign in to continue" on Onboarding Page

**Symptom:** 
```
[ABANDON] onboarding_page_loaded called without authenticated user
```

**Root Cause:** 
Onboarding.vue emitted `onboarding_page_loaded` before socket authentication completed.

**Fix Applied:** 
`src/Onboarding.vue` lines 146-162 - Added 200ms delay and connection check:
```javascript
const notifyServer = () => {
  if (socket.connected) {
    socket.emit('onboarding_page_loaded', { match_id: matchId, mode });
  } else {
    socket.once('connect', () => {
      setTimeout(() => {
        socket.emit('onboarding_page_loaded', { match_id: matchId, mode });
      }, 200);
    });
  }
};
```

---

## Issue 2: Notifications Not Showing When Player Reconnects

**Symptom:**
```
[AUTH] 📤 Sending abandonment_penalty to socket xyz
# But no notification appears on screen
```

**Root Cause:**
Notifications sent before DOM was fully loaded.

**Fix Applied:**
1. **Server-side** (`server.js` line 737-780): Increased delay from 0ms → 1500ms
2. **Client-side** (`src/js/socket.js` lines 61-112): Added notification queue system

```javascript
let notificationQueue = [];
let isDOMReady = document.readyState === 'complete';

if (!isDOMReady) {
  window.addEventListener('load', () => {
    isDOMReady = true;
    notificationQueue.forEach(item => {
      // Process queued notifications
    });
  });
}
```

---

## Issue 3: Opponent Notification Only Shows on Onboarding Page

**Symptom:**
```
[ABANDON TRACKER] ⚠️ Opponent exists but not active - may have already left
```

**Root Cause:**
Old code checked `opponentStillActive` which was false when opponent was on Result or Duel page.

**Fix Applied:**
`src/js/conn/abandonment_tracker.js` lines 650-710 - Removed `opponentStillActive` check:

```javascript
// OLD CODE (REMOVED):
const opponentStillActive = opponent.onPage || 
    (opponent.disconnectTimer !== null && !opponent.submitted);

if (opponentStillActive) {
    // Only notify if opponent still active
}

// NEW CODE:
if (opponent) {
    // ALWAYS notify opponent regardless of page location
    await this._notifyOpponent(opponent.userId, {...});
}
```

**Also Updated** `_notifyOpponent()` function to check online status and store correctly:
```javascript
async _notifyOpponent(opponentUserId, notificationData) {
    const opponentOnline = this._isPlayerOnline(opponentUserId);
    
    // Send real-time if online
    if (opponentOnline) {
        // Emit to all sockets
    }
    
    // Store with shown_at based on online status
    const shownAt = (opponentOnline && notificationSent) ? new Date() : null;
}
```

---

## Issue 4: Duplicate Notifications (4x repeat)

**Symptom:**
Notification appears 4 times (once per browser tab)

**Root Cause:**
Each socket triggered notification check independently.

**Fix Applied:**
`server.js` line 737 - Only check on FIRST socket:
```javascript
if (abandonmentTracker && activeSessions.get(userId).size === 1) {
    // Only run on first socket connection
    const pendingNotifications = await abandonmentTracker.getPendingNotifications(userId);
}
```

**And** line 805 - Ignore manual checks from secondary sockets:
```javascript
socket.on('check_pending_notifications', async () => {
    const userSockets = activeSessions.get(userId);
    const firstSocket = Array.from(userSockets)[0];
    
    if (socket.id !== firstSocket) {
        console.log(`Ignoring request from secondary socket`);
        return;
    }
}
```

---

## Issue 5: `_isPlayerOnline()` Returns `undefined`

**Symptom:**
```
[ABANDON TRACKER] 🔍 Player user0 online status: undefined
```

**Root Cause:**
Used Socket.IO rooms API incorrectly instead of `activeSessions` Map.

**Fix Applied:**
`src/js/conn/abandonment_tracker.js` lines 700-730:

```javascript
// OLD CODE:
_isPlayerOnline(userId) {
    const userRoom = `user_${userId}`;
    return this.io.sockets.adapter.rooms.get(userRoom); // Returns undefined!
}

// NEW CODE:
_isPlayerOnline(userId) {
    if (!this.activeSessions) {
        // Fallback: check sockets manually
        let hasSocket = false;
        this.io.sockets.sockets.forEach((socket) => {
            if (socket.user && socket.user.id === userId) {
                hasSocket = true;
            }
        });
        return hasSocket;
    }
    
    return this.activeSessions.has(userId) && 
           this.activeSessions.get(userId).size > 0;
}
```

---

# 📝 Code File Reference

## Key Files Modified:

1. **server.js**
   - Lines 666: `new AbandonmentTracker(io, db, activeSessions)`
   - Lines 737-780: Authentication notification check (1.5s delay)
   - Lines 805-850: Manual notification check with de-duplication
   - Lines 1895-1960: `onboarding_page_loaded` handler

2. **src/js/conn/abandonment_tracker.js**
   - Lines 1-7: Constructor accepting `activeSessions`
   - Lines 90-160: `playerEnteredOnboarding()`
   - Lines 161-290: `handleDisconnect()` with grace period
   - Lines 318-500: `_handleDisconnectTimeout()` with sequential timer logic
   - Lines 554-710: `_applyAbandonmentPenalty()` with opponent notification
   - Lines 700-730: `_isPlayerOnline()` using activeSessions
   - Lines 738-790: `_notifyOpponent()` with online status check
   - Lines 810-830: `getPendingNotifications()`
   - Lines 832-849: `markNotificationShown()`

3. **src/Onboarding.vue**
   - Lines 146-162: Delayed `onboarding_page_loaded` emission
   - Lines 165-220: Socket event listeners for access control

4. **src/Result.vue**
   - Lines 463-475: Added abandonment notification listeners
   - Lines 80-180: Notification display functions

5. **src/js/socket.js**
   - Lines 61-112: Notification queue system with DOM ready check
   - Lines 134-240: `showGlobalAbandonmentPenalty()` function
   - Lines 242-360: `showGlobalOpponentAbandoned()` function

---

# 🎯 Quick Reference: Constants

```javascript
RECONNECT_GRACE_PERIOD = 30000; // 30 seconds
DOM_READY_DELAY = 1500;          // 1.5 seconds server-side delay
ONBOARDING_AUTH_DELAY = 200;     // 200ms for socket auth
MAX_SOCKETS_PER_USER = 5;        // Multi-tab limit
```

---

# ✅ Testing Checklist

Before reporting issues, verify:

- [ ] Server is running (`node server.js`)
- [ ] Database table exists (`pending_abandonment_notifications`)
- [ ] Both players created a match (look for "Match created" log)
- [ ] Both players entered onboarding (look for "registered as player1/2" logs)
- [ ] Waited full 30 seconds after disconnection
- [ ] Server restarted after code changes
- [ ] Browser cache cleared (Ctrl+Shift+R)
- [ ] No JavaScript console errors
- [ ] Checked database for notification records
- [ ] Verified `shown_at` values (NULL vs timestamp)

---

**Last Updated:** December 16, 2025  
**System Version:** 2.0 (Multi-socket support, DOM-ready notifications, Global notification system)

### If NO logs appear:
- [ ] Did you actually create a match? (Check for "Match created" log)
- [ ] Did both players enter onboarding? (Check for "entered onboarding" log)
- [ ] Are you testing on the correct server? (Port 3000)
- [ ] Is the server still running? (Check terminal)

### If logs appear but no notifications:
- [ ] Check database: `SELECT * FROM pending_abandonment_notifications ORDER BY created_at DESC LIMIT 5;`
- [ ] Look for "💾 Stored notification" in logs
- [ ] Check if `shown_at` is NULL or has timestamp
- [ ] Verify player reconnected (look for authentication logs)

### If notifications duplicate:
- [ ] Check if `shown_at` is being set when online
- [ ] Look for "🔍 Player online status: true/false" in logs
- [ ] Verify only one "✅ Marked notification as shown" per notification

---

## 📊 Database Verification

After each test, check:
```sql
-- See all notifications
SELECT 
    notification_id,
    user_id,
    message,
    penalty_dp,
    bonus_dp,
    notification_type,
    shown_at,
    created_at
FROM pending_abandonment_notifications
ORDER BY created_at DESC
LIMIT 10;

-- Count notifications by type
SELECT 
    notification_type,
    COUNT(*) as count,
    SUM(CASE WHEN shown_at IS NULL THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN shown_at IS NOT NULL THEN 1 ELSE 0 END) as shown
FROM pending_abandonment_notifications
GROUP BY notification_type;
```

---

## 🎯 Success Criteria

All tests pass when:
1. ✅ Logs show complete flow (match creation → onboarding → disconnection → timer expiry → penalty)
2. ✅ Database has notification records
3. ✅ Players see notifications on ANY page (Duel, Result, Dashboard)
4. ✅ Notifications show ONCE only (no duplicates)
5. ✅ DP values update correctly in database
6. ✅ Abandon count increments
7. ✅ Match status changes to "abandoned"

---

## 🚨 Common Mistakes

1. **NOT entering onboarding** → Abandonment system never activates
2. **Testing without creating a match** → Nothing to abandon
3. **Not waiting 30 seconds** → Timer doesn't expire
4. **Reconnecting before 30s** → Triggers grace period cancellation (correct behavior)
5. **Testing on wrong page** → Must start from matchmaking → onboarding

---

**Follow this guide EXACTLY and report back with server logs if issues persist!**
