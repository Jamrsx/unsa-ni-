# LOBBY SYSTEM - COMPLETE DOCUMENTATION

## 📋 Table of Contents
1. [Overview](#overview)
2. [Recent Fixes](#recent-fixes)
3. [Leaderboard System](#leaderboard-system)
4. [Test Cases & Difficulty](#test-cases-difficulty)
5. [Spectator Mode](#spectator-mode)
6. [Onboarding Flow](#onboarding-flow)
7. [Troubleshooting](#troubleshooting)
8. [Technical Reference](#technical-reference)

---

## 🎯 Overview

The lobby system enables multiplayer coding matches with real-time updates, spectator mode, and comprehensive leaderboards. Players can create lobbies, invite others, and compete on coding problems with live scoring.

### Key Features
- **Real-time Leaderboards**: Live score updates for all players
- **Spectator Mode**: Watch matches without participating
- **Difficulty Filtering**: Easy/Medium/Hard problem selection
- **Match Duration Control**: Customizable time limits
- **Role Switching**: Host can toggle between player/spectator
- **Rejoin Support**: Automatic room rejoining after navigation

---

## 🔧 Recent Fixes

### ✅ Leaderboard Not Updating (FIXED - Dec 30, 2024)

**Problem**: Leaderboard showed only opponents, not the submitting player. No updates for host or participants.

**Root Cause**: When players navigated from Room.vue to LobbyOnboarding.vue, they never rejoined the `lobby_${lobbyId}` socket room. Server was broadcasting updates, but clients weren't in the room to receive them.

**Solution**:
1. **Client Side** ([LobbyOnboarding.vue](src/LobbyOnboarding.vue#L168)):
   ```javascript
   // 🔧 CRITICAL: Rejoin lobby room to receive leaderboard updates
   socket.emit('rejoin_lobby_match', {
     lobbyId: parseInt(lobbyId.value),
     userId: getUserId()
   });
   ```

2. **Server Side** ([server.js](server.js#L2359)):
   ```javascript
   socket.on('rejoin_lobby_match', ({ lobbyId, userId }) => {
       socket.join(`lobby_${lobbyId}`);
       socket.emit('lobby_rejoined', { success: true, lobbyId });
   });
   ```

**How It Works Now**:
1. Host starts match → Players navigate to LobbyOnboarding.vue
2. **NEW**: LobbyOnboarding.vue automatically emits `rejoin_lobby_match`
3. **NEW**: Server joins socket to `lobby_${lobbyId}` room
4. Player submits code → Server broadcasts to `lobby_${lobbyId}`
5. **FIXED**: All players receive `lobby_leaderboard_update` event
6. Leaderboard updates in real-time with medals (🥇🥈🥉)

**Testing**:
- Create lobby with 2+ players
- Start match
- Submit code (both players)
- Verify leaderboard appears for ALL players immediately
- Check for "(You)" badge on own score
- Verify medals for top 3

---

### ✅ Match Not Starting (FIXED - Dec 30, 2024)

**Problem**: Clicking "Start Match" multiple times did nothing. Error: "Not authenticated"

**Root Cause**: Legacy `start_lobby_match` event handler was forwarding to `start_lobby` improperly, losing socket context and authentication.

**Solution**: Fixed event forwarding to preserve socket.user context properly.

---

## 🏆 Leaderboard System

### Display Features
- **Live Updates**: Real-time score changes as players submit
- **Rankings**: 🥇 Gold (1st), 🥈 Silver (2nd), 🥉 Bronze (3rd), #4+ for others
- **Player Identification**: "(You)" badge for current user
- **Score Percentage**: Shows percentage of tests passed
- **Completion Time**: Displays when code was submitted
- **Auto-Sorting**: By score (descending), then completion time (ascending)

### Components

**LobbyOnboarding.vue** (Match Page):
- Lines 534-590: Leaderboard display template
- Lines 492-513: Helper functions (formatCompletionTime, getPlaceClass)
- Lines 1174-1333: Complete CSS styling (160 lines)
- Line 455: Socket listener for `lobby_leaderboard_update`

**Room.vue** (Lobby Room):
- Lines 868-1030: Leaderboard CSS (identical to LobbyOnboarding.vue)
- Real-time updates when returning from match

**server.js** (Backend):
- Line 3242: Broadcasts `lobby_leaderboard_update` after code submission
- Data structure: `{ userId, username, score, completionTime, avatar_url }`

### Socket Events

**Broadcast Event**: `lobby_leaderboard_update`
```javascript
io.to(`lobby_${lobby_id}`).emit('lobby_leaderboard_update', {
    userId: actualUserId,
    username: usernameForSpectator,
    score: score,
    completionTime: completionTime,
    avatar_url: socket.user?.avatar_url || null
});
```

**Client Listener**:
```javascript
socket.on('lobby_leaderboard_update', (data) => {
  const { userId, username, score, completionTime, avatar_url } = data;
  // Update playerScores array
  // Sort by score descending
});
```

---

## 📝 Test Cases & Difficulty

### SQL Script
File: [sql/fix_missing_testcases_and_difficulty.sql](sql/fix_missing_testcases_and_difficulty.sql)

### Difficulty Assignments
- **Easy** (8 problems): 35-42
  - Sum of Two Numbers, Find Max/Min, Count Vowels, Reverse String, etc.
  
- **Medium** (8 problems): 1-4, 18, 21, 33-34
  - Find First Duplicate, Two Sum, Valid Parentheses, Longest Substring, etc.
  
- **Hard** (1 problem): 5
  - Merge K Sorted Lists

### Test Case Structure
Each problem has **13 test cases**:
- **3 Sample Test Cases** (visible, is_sample=1): For learning/debugging
- **10 Hidden Test Cases** (is_sample=0): For scoring

### Database Schema
```sql
test_cases:
  - test_case_id (PK)
  - problem_id (FK)
  - input_data (TEXT) -- NOT 'input'!
  - expected_output (TEXT)
  - is_sample (BOOLEAN)
  - score (INT)

problems:
  - problem_id (PK)
  - problem_name (VARCHAR) -- NOT 'title'!
  - difficulty (VARCHAR: Easy/Medium/Hard)
  - description (TEXT)
```

### How to Execute SQL Script

**Option 1: MySQL Command Line**
```powershell
cd C:\xampp\mysql\bin
.\mysql.exe -u root duelcode_capstone_project < C:\xampp\htdocs\DuelCode-Capstone-Project\sql\fix_missing_testcases_and_difficulty.sql
```

**Option 2: phpMyAdmin**
1. Open http://localhost/phpmyadmin
2. Select `duelcode_capstone_project` database
3. Click "SQL" tab
4. Copy/paste script contents
5. Click "Go"

**Option 3: MySQL Workbench**
1. Open MySQL Workbench
2. Connect to database
3. Open script file
4. Execute (⚡ icon)

### Verification Query
```sql
SELECT 
    p.problem_id, 
    p.problem_name, 
    p.difficulty,
    COUNT(tc.test_case_id) as test_count,
    SUM(CASE WHEN tc.is_sample = 1 THEN 1 ELSE 0 END) as sample_count,
    SUM(CASE WHEN tc.is_sample = 0 THEN 1 ELSE 0 END) as hidden_count
FROM problems p 
LEFT JOIN test_cases tc ON p.problem_id = tc.problem_id 
WHERE p.problem_id IN (1,2,3,4,5,18,21,33,34,35,36,37,38,39,40,41,42)
GROUP BY p.problem_id 
ORDER BY p.problem_id ASC;
```

Expected: All problems show test_count=13, sample_count=3, hidden_count=10

---

## 👁️ Spectator Mode

### Features
- **Host Spectator Mode**: Host can watch without playing
- **Public Spectators**: External viewers with spectator code
- **Role Switching**: Host toggles between player/spectator roles
- **Real-time Updates**: See all players' submissions and scores
- **Results Display**: Complete test results for all players

### How It Works

**1. Enable Spectators** (Room.vue):
```javascript
lobby.value.allow_spectators = true;
lobby.value.spectator_code = 'ABC123';
```

**2. Host Switches to Spectator**:
```javascript
socket.emit('switch_role', {
  lobbyId: lobby.value.lobby_id,
  newRole: 'spectator'
});
```

**3. Spectator Joins**:
```javascript
socket.emit('join_as_spectator', {
  lobbyId: lobbyId,
  spectatorCode: code
});
```

**4. Server Broadcasts to Spectators**:
```javascript
io.to(`lobby_spectator_${lobby_id}`).emit('player_judge_result', {
    userId, username, verdict, score, results
});
```

### Files Modified
- [server.js](server.js): Lines 1847-1950 (role switching logic)
- [Room.vue](src/Room.vue): Lines 300-400 (UI controls)
- [inspector.html](public/inspector.html): Spectator view page

### Key Socket Events
- `switch_role`: Host changes role (player ↔ spectator)
- `join_as_spectator`: External spectator joins
- `player_judge_result`: Broadcast player results to spectators
- `match_started`: Notify spectators when match begins

---

## 🎮 Onboarding Flow

### Complete Match Flow

**1. Lobby Creation**:
```
User clicks "Create Lobby" 
→ POST /create_lobby 
→ Lobby created in database
→ User redirected to /room.html?lobby_id=X
```

**2. Players Join**:
```
Player enters room code 
→ socket.emit('join_lobby', { roomCode })
→ Server validates and adds player
→ Broadcast 'lobby_updated' to all
```

**3. Ready Up**:
```
Player clicks "Ready" 
→ socket.emit('player_ready', { lobbyId })
→ Update database: is_ready = 1
→ Broadcast player list update
```

**4. Match Start**:
```
Host clicks "Start Match" 
→ socket.emit('start_lobby_match', { lobbyId, matchDuration })
→ Server validates all players ready
→ Select random problem (filtered by difficulty)
→ Update lobby status to 'in_progress'
→ Register players in socketToMatch
→ Broadcast 'lobby_started' event
→ Players navigate to /lobby-onboarding.html
```

**5. Match Page Load**:
```
LobbyOnboarding.vue mounts
→ Parse URL params (lobby_id, problem_id, match_duration)
→ Socket reconnects and authenticates
→ 🔧 NEW: Emit 'rejoin_lobby_match'
→ Server joins socket to lobby_${lobbyId} room
→ Load problem from database
→ Start countdown timer
```

**6. Code Submission**:
```
Player clicks "Submit"
→ socket.emit('submit_code', { problem_id, language, source_code, lobby_id, user_id, mode: 'lobby' })
→ Server executes judge with test cases
→ Save score to duel_lobby_players
→ Broadcast 'lobby_leaderboard_update' to lobby_${lobbyId}
→ 🔧 ALL players receive update (including submitter)
→ Leaderboard refreshes with new score
```

**7. Match End**:
```
Timer expires OR all players submit
→ Player clicks "Return to Lobby Room"
→ Navigate to /room.html?lobby_id=X
→ Leaderboard persists in Room.vue
→ Host can start new match
```

### Critical Points

**Authentication Flow**:
```
1. Page loads → socket connects
2. Token sent via query or storage
3. Server validates token
4. Socket.user populated with { id, username, decoded }
5. Emit 'authenticated' event
6. Client receives confirmation
```

**Problem Loading**:
```
- Must wait for authentication before loading problem
- loadProblem() called AFTER socket.user exists
- Timeout fallback: 5 seconds max wait
- Falls back to token_session if socket not ready
```

**Socket Rooms**:
```
- lobby_${lobbyId}: For players in match
- lobby_spectator_${lobbyId}: For spectators
- Players must rejoin room after navigation
```

---

## 🔍 Troubleshooting

### Leaderboard Not Showing

**Symptoms**: Leaderboard empty or only shows opponents

**Checks**:
1. Browser console: Look for `[LOBBY REJOIN]` log
2. Server console: Check for socket join confirmation
3. Verify `lobbyId` in URL matches database
4. Check `playerScores` array in Vue devtools

**Solution**:
```javascript
// Verify socket is in room (server console)
[LOBBY REJOIN] ✓ Socket xyz123 joined room lobby_159

// Verify listener exists (browser console)
socket._callbacks['$lobby_leaderboard_update']
```

### Match Not Starting

**Symptoms**: Button click does nothing or error message

**Checks**:
1. All players marked as ready?
2. Host authenticated? (check `socket.user`)
3. Server console: Look for `[LOBBY START]` logs
4. Browser console: Check callback response

**Common Errors**:
- "Not authenticated": `socket.user` is undefined
- "Only host can start": User is not the host
- "Not all players ready": Check `is_ready` in database
- "No problems available": Check difficulty filter

**Solution**:
```javascript
// Server should log:
[LOBBY START] user0 (1) attempting to start lobby 159
[LOBBY START] ✓ All 2 players ready, proceeding...
[LOBBY START] Selected problem 35 (difficulty: Easy)
```

### Problem Not Loading

**Symptoms**: "Loading problem..." stuck or error

**Checks**:
1. Socket authenticated? (`socket.user` exists)
2. Problem ID in URL valid?
3. Database has problem data?
4. Network tab: Check API calls

**Solution**:
```javascript
// Check authentication
console.log('Socket user:', socket.user);

// Manually load
fetch('/api/get_problem?problem_id=35')
  .then(r => r.json())
  .then(data => console.log(data));
```

### Test Cases Not Running

**Symptoms**: Judge shows 0/0 tests or wrong count

**Checks**:
1. SQL script executed? (should be 13 tests per problem)
2. Column names correct? (`input_data` not `input`)
3. Language normalized? (Python → python)
4. Test cases in database?

**Solution**:
```sql
-- Check test cases
SELECT COUNT(*) FROM test_cases WHERE problem_id = 35;
-- Should return 13

-- Check columns
DESCRIBE test_cases;
-- Should show: input_data (not input)
```

### Difficulty Filter Not Working

**Symptoms**: Wrong difficulty problems appear

**Checks**:
1. Difficulty set in lobby creation?
2. SQL script ran? (sets difficulty column)
3. Problems have difficulty value?

**Solution**:
```sql
-- Check difficulty values
SELECT problem_id, problem_name, difficulty 
FROM problems 
WHERE problem_id IN (35,36,37,38,39,40,41,42);
-- Should all show 'Easy'
```

---

## 🛠️ Technical Reference

### Database Schema

**duel_lobby_rooms**:
```sql
lobby_id INT PRIMARY KEY AUTO_INCREMENT
room_code VARCHAR(10) UNIQUE
host_user_id INT
status ENUM('waiting', 'in_progress', 'completed')
problem_id INT
difficulty VARCHAR(20) -- Easy/Medium/Hard
max_players INT DEFAULT 45
allow_spectators BOOLEAN DEFAULT 0
spectator_code VARCHAR(10)
host_spectator_mode BOOLEAN DEFAULT 0
match_duration_minutes INT DEFAULT 5
created_at TIMESTAMP
started_at TIMESTAMP
```

**duel_lobby_players**:
```sql
player_id INT PRIMARY KEY AUTO_INCREMENT
lobby_id INT FOREIGN KEY
user_id INT
is_ready BOOLEAN DEFAULT 0
score INT DEFAULT 0
completion_time BIGINT
verdict VARCHAR(50)
joined_at TIMESTAMP
left_at TIMESTAMP
```

**test_cases**:
```sql
test_case_id INT PRIMARY KEY AUTO_INCREMENT
problem_id INT FOREIGN KEY
input_data TEXT  -- NOT 'input'
expected_output TEXT
is_sample BOOLEAN DEFAULT 0
score INT DEFAULT 0
```

**problems**:
```sql
problem_id INT PRIMARY KEY AUTO_INCREMENT
problem_name VARCHAR(255)  -- NOT 'title'
difficulty VARCHAR(20)
description TEXT
time_limit_seconds INT
memory_limit_mb INT
```

### Socket Event Reference

**Lobby Management**:
- `create_lobby`: Create new lobby
- `join_lobby`: Join existing lobby
- `leave_lobby`: Leave current lobby
- `player_ready`: Toggle ready state
- `switch_role`: Change player/spectator role

**Match Control**:
- `start_lobby_match`: Start match (legacy)
- `start_lobby`: Start match (current)
- `rejoin_lobby_match`: Rejoin after navigation
- `register_for_lobby_match`: Register socket for match

**Code Submission**:
- `submit_code`: Submit code for judging
- `judge_result`: Personal result feedback
- `lobby_leaderboard_update`: Broadcast score update

**Spectator**:
- `join_as_spectator`: Join as spectator
- `player_judge_result`: Broadcast to spectators
- `match_started`: Notify spectators

### File Structure

**Frontend**:
- `src/Room.vue`: Lobby room page (waiting area)
- `src/LobbyOnboarding.vue`: Match page (coding interface)
- `public/room.html`: Room entry point
- `public/lobby-onboarding.html`: Match entry point
- `public/inspector.html`: Spectator view

**Backend**:
- `server.js`: Main server (lines 1300-2700 for lobby logic)
- `handlers/lobbyBroadcast.js`: Broadcast helper
- `database/lobbyOperations.js`: DB operations

**Database**:
- `sql/duelcode_capstone_project.sql`: Main schema
- `sql/fix_missing_testcases_and_difficulty.sql`: Test cases update
- `sql/problem_solutions.py`: Solution reference

### Key Variables

**Server State**:
```javascript
activeLobbies: Map<lobbyId, {
  lobbyData: {...},      // DB row data
  players: Map<userId, playerData>,
  spectators: Set<userId>,
  sockets: Set<socketId>,
  matchDuration: number
}>

socketToMatch: {
  [socketId]: {
    lobbyId, mode, problemId, userId, username
  }
}

activeSessions: Map<userId, Set<socketId>>
```

**Client State (LobbyOnboarding.vue)**:
```javascript
lobbyId: ref(null)
problemId: ref(null)
problem: ref({ title, description, testcases })
playerScores: ref([{ userId, username, score, completionTime, avatar_url }])
matchDuration: ref(300)
remainingTime: ref(300)
showResults: ref(false)
judgeResult: ref(null)
```

### Important Logs

**Server Console**:
```
[LOBBY REJOIN] ✓ Socket xyz123 joined room lobby_159
[LOBBY START] user0 (1) attempting to start lobby 159
[LOBBY START] Selected problem 35 (difficulty: Easy)
[LOBBY START] ✅ Registered 2 players in socketToMatch
[LOBBY LEADERBOARD] Broadcasted score update for user1 to lobby 159
```

**Browser Console**:
```
[LobbyOnboarding] Rejoining lobby room: 159
[Leaderboard] Update received: { userId: 3, score: 100, ... }
[LobbyOnboarding] showResults set to: true
🔧 [DEBUG] Socket authenticated successfully
```

---

## 📚 Related Files

### Consolidated From:
- LOBBY_ONBOARDING_GUIDE.md
- LOBBY_ONBOARDING_FLOW_DIAGRAM.md
- LOBBY_ONBOARDING_DEBUG_SUMMARY.md
- LOBBY_ONBOARDING_DEBUG_GUIDE.md
- LOBBY_SPECTATOR_FIX_COMPLETE.md
- LOBBY_SPECTATOR_FIXES.md
- FIXES_APPLIED_LOBBY_SPECTATOR.md
- LOBBY_LEADERBOARD_FIX_GUIDE.md
- LEADERBOARD_TESTCASES_FIX_COMPLETE.md

### See Also:
- [QUICK_TEST_GUIDE.md](QUICK_TEST_GUIDE.md) - Testing procedures
- [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) - Comprehensive test cases
- [refactoring-docs/LOBBY_MODULARIZATION_PLAN.md](refactoring-docs/LOBBY_MODULARIZATION_PLAN.md) - Architecture plans

---

## 🎉 Status Summary

### ✅ Working Features
- Lobby creation and joining
- Player ready system
- Match starting
- Problem loading with difficulty filter
- Code submission and judging
- **Real-time leaderboard for ALL players**
- Spectator mode
- Host role switching
- Socket room rejoining
- Test case execution (13 per problem)

### 🚀 Recent Updates (Dec 30, 2024)
- Fixed leaderboard not showing for submitting player
- Fixed match not starting ("Not authenticated" error)
- Added automatic lobby room rejoining
- Improved socket event forwarding
- Enhanced authentication logging
- Consolidated documentation

---

*Last Updated: December 30, 2024*
