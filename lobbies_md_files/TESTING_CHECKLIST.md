# 🧪 COMPREHENSIVE TESTING CHECKLIST
## DuelCode Capstone Project - Post-Merge Testing Guide

**Date**: December 21, 2025  
**Branch**: `debugging-matches(casual&Ranked),--complete-lobbies`  
**Testing Focus**: Duel, Onboarding, Result, Lobbies, Room pages

---

## ✅ FIXES APPLIED

### 1. ✅ **FIXED: Room Start Match Functionality**
- **Files Modified**:
  - `src/Room.vue` - Added complete `startMatch()` implementation
  - `server.js` - Added `start_lobby_match` socket handler
- **What Was Fixed**:
  - Room start button now properly validates players and starts matches
  - Server creates/assigns problems to lobbies
  - Lobbies update status to 'in_progress' when started
  - All players receive `lobby_started` event and redirect properly

### 2. ✅ **FIXED: Lobby to Game Flow**
- **Files Modified**:
  - `src/Room.vue` - Updated `lobby_started` event handler
- **What Was Fixed**:
  - Players now redirect to `/onboarding.html` (game page) with lobby context
  - Lobby match data stored in localStorage for game session
  - Proper problem_id passed to game instance

### 3. ✅ **IMPROVED: Private Lobby Password Management**
- **Files Modified**:
  - `src/Lobby.vue` - Enhanced `createLobby()` function
- **What Was Fixed**:
  - Host sees password in alert when creating private lobby
  - Password stored in sessionStorage for easy access
  - Password displayed in Room Settings panel for host

---

## 🧪 TESTING PROCEDURES

### **TEST 1: Casual 1v1 Duel Matchmaking**

#### Test Steps:
1. ✅ **Login as User 1**
   - Navigate to `/duel.html`
   - Click "Casual Mode"
   - Verify queue entry confirmation

2. ✅ **Login as User 2** (different browser/incognito)
   - Navigate to `/duel.html`
   - Click "Casual Mode"
   - **Expected**: Both see "Match Found" modal

3. ✅ **Ready Phase**
   - Both players click "Ready"
   - **Expected**: 10-second countdown appears
   - **Expected**: Auto-redirect to `/onboarding.html?mode=casual&match_id=XXX`

4. ✅ **Onboarding Page**
   - **Expected**: Both see same random problem
   - **Expected**: Timer starts (if configured)
   - Write solution and submit
   - **Expected**: Judge results appear

5. ✅ **Result Page**
   - **Expected**: Automatic redirect after both submit
   - **Expected**: Stats show correctly (winner, scores, XP, DP)
   - **Expected**: Database updates correctly

#### Database Checks:
```sql
-- Check match was created
SELECT * FROM duel_matches WHERE match_id = XXX;

-- Check match records (submissions)
SELECT * FROM match_records WHERE match_id = XXX;

-- Check player stats updated
SELECT * FROM statistic WHERE user_id IN (user1_id, user2_id);
```

---

### **TEST 2: Ranked 1v1 Duel Matchmaking**

#### Test Steps:
1. ✅ **Same as TEST 1** but click "Ranked Mode"
2. ✅ **Verify** mode parameter: `?mode=ranked&match_id=XXX`
3. ✅ **Check** Duel Points (DP) changes are larger than casual
4. ✅ **Check** `statistic.statistic_duel_point` increases for winner

#### Database Checks:
```sql
-- Check match has correct mode tracking
SELECT * FROM duel_matches WHERE match_id = XXX;

-- Check DP changes (should be significant for ranked)
SELECT user_id, statistic_duel_point FROM statistic WHERE user_id IN (user1_id, user2_id);
```

---

### **TEST 3: Lobby Creation & Management**

#### Test Steps:
1. ✅ **Create Public Lobby**
   - Navigate to `/lobbies.html`
   - Click "Create new private match"
   - Fill form:
     - Room Name: "Test Public Room"
     - Description: "Testing"
     - Private: **NO**
     - Max Players: 10
   - Click "Create"
   - **Expected**: Redirect to `/room.html?code=XXXXXX&created=true`

2. ✅ **Verify Room Details**
   - **Expected**: You see yourself as host
   - **Expected**: "Start Match" button visible (host only)
   - **Expected**: Room code displayed
   - **Expected**: 1/10 players shown

3. ✅ **Join from Another Browser**
   - Open `/lobbies.html` in different browser
   - Find "Test Public Room" in list
   - Click "Join"
   - **Expected**: Instant join (no password)
   - **Expected**: Both browsers see 2/10 players

4. ✅ **Chat Test**
   - Send message from User 1: "Hello!"
   - **Expected**: User 2 sees message instantly
   - Send message from User 2: "Hi back!"
   - **Expected**: User 1 sees message instantly

#### Database Checks:
```sql
-- Check lobby was created
SELECT * FROM duel_lobby_rooms WHERE room_code = 'XXXXXX';

-- Check players joined
SELECT * FROM duel_lobby_players WHERE lobby_id = (SELECT lobby_id FROM duel_lobby_rooms WHERE room_code = 'XXXXXX');

-- Check chat messages
SELECT * FROM duel_lobby_messages WHERE lobby_id = (SELECT lobby_id FROM duel_lobby_rooms WHERE room_code = 'XXXXXX');
```

---

### **TEST 4: Private Lobby with Password**

#### Test Steps:
1. ✅ **Create Private Lobby**
   - Navigate to `/lobbies.html`
   - Click "Create new private match"
   - Fill form:
     - Room Name: "Secret Room"
     - Private: **YES** (password auto-generates)
     - Note the password (e.g., "ABC123")
   - Click "Create"
   - **Expected**: Alert shows: "Room Code: XXXXXX, Password: ABC123"

2. ✅ **Verify Password Display**
   - In room settings panel (host only)
   - **Expected**: Password field shows "ABC123"

3. ✅ **Join with Wrong Password**
   - Different browser: Navigate to `/lobbies.html`
   - Find "Secret Room" (🔒 lock icon)
   - Click "Join"
   - **Expected**: Password prompt appears
   - Enter wrong password: "WRONG"
   - **Expected**: Error message + re-prompt

4. ✅ **Join with Correct Password**
   - Enter correct password: "ABC123"
   - **Expected**: Successfully join room
   - **Expected**: See host and other players

---

### **TEST 5: Lobby Start Match Flow**

#### Test Steps:
1. ✅ **Setup** (continue from TEST 3 or 4)
   - Have at least 2 players in lobby
   - User 1 is HOST

2. ✅ **Try Start Without Ready**
   - Host clicks "Start Match"
   - **Expected**: Alert "All players must be ready"

3. ✅ **Ready Up**
   - User 2 clicks "Ready Up" button
   - **Expected**: Button changes to "✓ Ready"
   - **Expected**: Host sees User 2 ready status

4. ✅ **Start Match**
   - Host (always ready) clicks "Start Match"
   - **Expected**: All players receive `lobby_started` event
   - **Expected**: Auto-redirect to `/onboarding.html?mode=lobby&lobby_id=XXX&problem_id=YYY`

5. ✅ **Play Match**
   - All players see same problem
   - Write and submit solutions
   - **Expected**: Results calculated properly
   - **Expected**: Redirect to result page

#### Database Checks:
```sql
-- Check lobby status changed
SELECT status, started_at, problem_id FROM duel_lobby_rooms WHERE lobby_id = XXX;
-- Should show: status='in_progress', started_at=NOW(), problem_id=YYY

-- Check problem exists
SELECT * FROM problems WHERE problem_id = YYY;

-- Check all players marked ready
SELECT user_id, is_ready FROM duel_lobby_players WHERE lobby_id = XXX;
-- All should have is_ready = 1
```

---

### **TEST 6: Abandonment Tracking (1v1)**

#### Test Steps:
1. ✅ **Start Casual Match**
   - User 1 and User 2 match
   - Both click "Ready"
   - Redirect to onboarding

2. ✅ **User 2 Closes Browser** (abandons)
   - Close tab or navigate away
   - **Expected**: User 1 sees notification after grace period
   - **Expected**: User 1 awarded bonus DP
   - **Expected**: Match status = 'abandoned'

3. ✅ **Check Database**
   ```sql
   -- Check match abandoned
   SELECT status, winner_id FROM duel_matches WHERE match_id = XXX;
   -- Should show: status='abandoned', winner_id=User1_id
   
   -- Check abandoner penalty
   SELECT abandon_count, statistic_duel_point, is_banned 
   FROM statistic WHERE user_id = User2_id;
   -- abandon_count should increase, DP decreased
   
   -- Check opponent bonus
   SELECT statistic_duel_point FROM statistic WHERE user_id = User1_id;
   -- DP should increase
   ```

4. ✅ **Check Notifications Table**
   ```sql
   SELECT * FROM pending_abandonment_notifications 
   WHERE user_id IN (User1_id, User2_id);
   -- Should show penalty for User2, bonus for User1
   ```

---

### **TEST 7: Multiple Abandonment Ban**

#### Test Steps:
1. ✅ **Abandon 3 Matches Consecutively**
   - As User 2, join and abandon 3 matches in a row
   
2. ✅ **Check Ban Status**
   ```sql
   SELECT abandon_count, is_banned FROM statistic WHERE user_id = User2_id;
   -- Should show: abandon_count=3, is_banned=1
   ```

3. ✅ **Try to Queue**
   - User 2 tries to queue for casual/ranked
   - **Expected**: `matchmaking_banned` event received
   - **Expected**: Alert shows "You are temporarily banned"

---

### **TEST 8: Result Page Stats Display**

#### Test Steps:
1. ✅ **Complete a Match** (casual or ranked)
2. ✅ **On Result Page**, verify display:
   - ✅ Winner highlighted (1 or 2)
   - ✅ Player 1 stats: completion %, duration, tests done, language
   - ✅ Player 2 stats: completion %, duration, tests done, language
   - ✅ Score breakdown:
     - Code Points (based on tests passed)
     - Time Bonus (if finished quickly)
     - Total XP gained
   - ✅ Duel Points change (+/- DP)
   - ✅ Level progress bar

3. ✅ **Check Console Logs**
   - No errors should appear
   - Stats calculation logs should show correct values

---

### **TEST 9: Leaderboard Updates**

#### Test Steps:
1. ✅ **Open `/duel.html`**
2. ✅ **Check Leaderboard Section**
   - **Expected**: Top 5 players displayed
   - **Expected**: Sorted by `statistic_duel_point` DESC

3. ✅ **Complete a Ranked Match**
4. ✅ **Refresh `/duel.html`**
   - **Expected**: Leaderboard updates with new DP
   - **Expected**: Rankings re-sorted

#### Database Checks:
```sql
-- Check leaderboard query
SELECT u.username, s.statistic_duel_point,
       RANK() OVER (ORDER BY s.statistic_duel_point DESC) as rank_number
FROM statistic s
JOIN users u ON s.user_id = u.user_id
ORDER BY s.statistic_duel_point DESC
LIMIT 5;
```

---

### **TEST 10: Database Schema Validation**

#### Test Steps:
1. ✅ **Run Schema Check**
   ```sql
   -- Check all tables exist
   SHOW TABLES;
   ```

2. ✅ **Check Critical Tables**
   ```sql
   -- duel_matches
   DESC duel_matches;
   -- Expected columns: match_id, player1_id, player2_id, winner_id, match_date, status
   
   -- duel_lobby_rooms
   DESC duel_lobby_rooms;
   -- Expected: lobby_id, room_code, room_name, host_user_id, problem_id, status, etc.
   
   -- duel_lobby_players
   DESC duel_lobby_players;
   -- Expected: lobby_player_id, lobby_id, user_id, is_ready, joined_at, left_at
   
   -- match_records
   DESC match_records;
   -- Expected: record_id, match_id, player_id, code_submitted, result, submitted_at
   ```

3. ✅ **Check Foreign Keys**
   ```sql
   SELECT * FROM information_schema.KEY_COLUMN_USAGE 
   WHERE TABLE_SCHEMA = 'duelcode_capstone_project'
   AND REFERENCED_TABLE_NAME IS NOT NULL;
   -- Verify all FKs are correct
   ```

---

## 🚨 KNOWN ISSUES & LIMITATIONS

### Issue 1: Lobby Problem Selection
- **Status**: ⚠️ **Needs Enhancement**
- **Problem**: Lobbies currently use random problem assignment. No UI to select specific problems when creating lobby.
- **Workaround**: Problem assigned automatically on match start
- **TODO**: Add problem selector dropdown in create lobby modal

### Issue 2: Lobby Abandonment Tracking
- **Status**: ⚠️ **Not Implemented**
- **Problem**: Abandonment tracking only works for 1v1 matches, not for lobby matches
- **Impact**: Players can leave lobby matches without penalty
- **TODO**: Extend abandonment tracker to handle lobby matches

### Issue 3: Lobby Match Result Storage
- **Status**: ⚠️ **Needs Verification**
- **Problem**: Result page and stats calculation may not properly handle lobby (multi-player) matches
- **TODO**: Test lobby match result page with 3+ players

---

## 📊 TEST RESULTS LOG

### Test Execution Date: _____________

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| TEST 1 | Casual 1v1 Duel | ⬜ PASS / ⬜ FAIL | |
| TEST 2 | Ranked 1v1 Duel | ⬜ PASS / ⬜ FAIL | |
| TEST 3 | Lobby Creation | ⬜ PASS / ⬜ FAIL | |
| TEST 4 | Private Lobby | ⬜ PASS / ⬜ FAIL | |
| TEST 5 | Lobby Start Match | ⬜ PASS / ⬜ FAIL | |
| TEST 6 | Abandonment (1v1) | ⬜ PASS / ⬜ FAIL | |
| TEST 7 | Ban System | ⬜ PASS / ⬜ FAIL | |
| TEST 8 | Result Page | ⬜ PASS / ⬜ FAIL | |
| TEST 9 | Leaderboard | ⬜ PASS / ⬜ FAIL | |
| TEST 10 | DB Schema | ⬜ PASS / ⬜ FAIL | |

---

## 🔍 SQL DEBUGGING QUERIES

### Check Active Matches
```sql
SELECT m.match_id, m.status, m.match_date,
       u1.username as player1, u2.username as player2
FROM duel_matches m
JOIN users u1 ON m.player1_id = u1.user_id
JOIN users u2 ON m.player2_id = u2.user_id
ORDER BY m.match_date DESC
LIMIT 10;
```

### Check Active Lobbies
```sql
SELECT lr.lobby_id, lr.room_code, lr.room_name, lr.status,
       u.username as host,
       (SELECT COUNT(*) FROM duel_lobby_players WHERE lobby_id = lr.lobby_id AND left_at IS NULL) as player_count
FROM duel_lobby_rooms lr
JOIN users u ON lr.host_user_id = u.user_id
WHERE lr.status = 'waiting'
ORDER BY lr.created_at DESC;
```

### Check User Stats
```sql
SELECT u.username, s.statistic_level, s.statistic_level_xp, 
       s.statistic_duel_point, s.abandon_count, s.is_banned
FROM statistic s
JOIN users u ON s.user_id = u.user_id
ORDER BY s.statistic_duel_point DESC;
```

### Check Abandonment Penalties
```sql
SELECT n.notification_id, n.notification_type, n.message,
       n.penalty_dp, n.bonus_dp, n.abandon_count, n.is_banned,
       u.username, n.created_at
FROM pending_abandonment_notifications n
JOIN users u ON n.user_id = u.user_id
ORDER BY n.created_at DESC
LIMIT 20;
```

---

## ✅ FINAL CHECKLIST

Before declaring code READY FOR PRODUCTION:

- ⬜ All 10 tests passed
- ⬜ No console errors on any page
- ⬜ Database queries execute without errors
- ⬜ All foreign keys valid (no orphaned records)
- ⬜ Socket connections stable (no disconnection spam)
- ⬜ Abandonment tracking working correctly
- ⬜ Stats calculation accurate
- ⬜ Leaderboard updates in real-time
- ⬜ Private lobbies secure
- ⬜ Chat messages persist and display
- ⬜ Code runs without warnings
- ⬜ Mobile responsiveness verified (bonus)

---

## 🎯 SUCCESS CRITERIA

Your merged code is FULLY FUNCTIONAL if:

1. ✅ **1v1 Duels** work end-to-end (matchmaking → game → results)
2. ✅ **Lobby System** allows creating, joining, and starting matches
3. ✅ **Abandonment Penalties** apply correctly
4. ✅ **Stats & Leaderboard** update in real-time
5. ✅ **Database** has no orphaned records or FK violations
6. ✅ **No Critical Bugs** in any of the 5 pages

---

## 📝 NOTES

- Test with at least 2 different browsers (Chrome + Firefox/Edge)
- Use incognito mode to avoid session conflicts
- Monitor server.js console logs during testing
- Check browser console for client-side errors
- Always verify database state after each test

**Good luck testing! 🚀**
