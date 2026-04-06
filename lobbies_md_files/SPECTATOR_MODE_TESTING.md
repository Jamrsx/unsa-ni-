# Spectator Mode Testing Checklist

## Pre-Test Setup
- [ ] Database migration applied: `source sql/add_host_spectator_mode.sql`
- [ ] Server restarted: `npm start` or `node server.js`
- [ ] Browser cache cleared
- [ ] Multiple test accounts available (host + 2 players minimum)

---

## Test Suite 1: Basic Host Role Selection

### Test 1.1: Default State (Host as Player)
**Steps:**
1. Login as User A (host)
2. Create new lobby
3. Navigate to room

**Expected Results:**
- [ ] Room Settings panel visible (host only)
- [ ] "Join as Player" radio button is selected by default
- [ ] Host appears in player list with crown 👑
- [ ] Player count shows 1
- [ ] Host has checkmark ✓ (auto-ready)

### Test 1.2: Switch to Spectator Mode
**Steps:**
1. In Room Settings, click "Spectate Only" radio button
2. Observe page behavior

**Expected Results:**
- [ ] Radio button selection changes to "Spectate Only"
- [ ] Warning message appears: "⚠️ As spectator, you won't take a player slot..."
- [ ] Page automatically reloads after ~500ms
- [ ] After reload, host NOT in player list
- [ ] Player count shows 0
- [ ] Room Settings still shows "Spectate Only" selected

### Test 1.3: Switch Back to Player Mode
**Steps:**
1. While in spectator mode, click "Join as Player" radio button
2. Wait for update

**Expected Results:**
- [ ] Radio button selection changes immediately
- [ ] Host reappears in player list with crown 👑
- [ ] Player count increases to 1
- [ ] Host shows checkmark ✓ (auto-ready)
- [ ] No page reload needed

---

## Test Suite 2: Multi-Player Scenarios

### Test 2.1: Host Spectating, Players Join
**Steps:**
1. Host (User A) creates lobby and switches to "Spectate Only"
2. User B joins lobby
3. User C joins lobby

**Expected Results:**
- [ ] Host not in player list
- [ ] User B appears in player list (slot 1)
- [ ] User C appears in player list (slot 2)
- [ ] Player count shows 2 (not including host)
- [ ] Both players show hourglass ⏳ (not ready)

### Test 2.2: Start Match Without Host
**Steps:**
1. Host in spectator mode
2. 2 players joined and both click Ready
3. Host clicks "Start Match"

**Expected Results:**
- [ ] Match starts successfully
- [ ] Only 2 players redirected to LobbyOnboarding
- [ ] Host remains in Room (or can view Inspector)
- [ ] Spectators can view live code

### Test 2.3: Host Joins During Active Match
**Steps:**
1. Match in progress with 2 players
2. Host tries to switch from "Spectate Only" to "Join as Player"

**Expected Results:**
- [ ] Host can switch role
- [ ] Host added to player list but cannot join active match
- [ ] OR: Disable role switching during active match

---

## Test Suite 3: Persistence & Reconnection

### Test 3.1: Role Persistence on Reload
**Steps:**
1. Host creates lobby, switches to "Spectate Only"
2. Copy room URL
3. Close browser tab
4. Open new tab, paste room URL

**Expected Results:**
- [ ] Host still in spectator mode (not in player list)
- [ ] Room Settings shows "Spectate Only" selected
- [ ] Database column `host_spectator_mode = 1`

### Test 3.2: Role Persistence After Server Restart
**Steps:**
1. Host creates lobby, switches to "Spectate Only"
2. Players join
3. Restart server
4. All users refresh/rejoin

**Expected Results:**
- [ ] Lobby data loaded from database
- [ ] Host spectator mode persists
- [ ] Players still in correct positions

---

## Test Suite 4: Spectator Features

### Test 4.1: Inspector Access (Host Spectating)
**Steps:**
1. Host in spectator mode
2. Enable spectators in Room Settings
3. Copy spectator link
4. Open Inspector view

**Expected Results:**
- [ ] Inspector page loads
- [ ] Can see all players' code in real-time
- [ ] Can see player status (idle/typing/submitted/passed/failed)
- [ ] Can view problem details
- [ ] Can see chat messages (read-only)

### Test 4.2: Code Streaming to Spectators
**Steps:**
1. Host spectating, 2 players in match
2. Players start coding
3. Open Inspector view

**Expected Results:**
- [ ] Code updates appear with ~500ms delay
- [ ] Language selector changes reflected
- [ ] Each player has separate code panel
- [ ] Status badges update correctly

---

## Test Suite 5: Edge Cases

### Test 5.1: Role Toggle Spam Prevention
**Steps:**
1. Rapidly click between "Join as Player" and "Spectate Only"

**Expected Results:**
- [ ] Buttons disabled during role change (`isChangingRole = true`)
- [ ] Only one request sent at a time
- [ ] No race conditions or duplicate database entries

### Test 5.2: Non-Host Cannot See Role Selector
**Steps:**
1. Login as regular player (not host)
2. Join someone else's lobby

**Expected Results:**
- [ ] Room Settings panel NOT visible
- [ ] No access to role selector
- [ ] Cannot toggle spectator mode

### Test 5.3: Host Leaves and Rejoins
**Steps:**
1. Host creates lobby, switches to spectator
2. Players join
3. Host leaves room (back to lobbies page)
4. Host rejoins using room code

**Expected Results:**
- [ ] Still recognized as host
- [ ] Spectator mode persists
- [ ] Room Settings panel visible
- [ ] "Spectate Only" still selected

### Test 5.4: Maximum Players with Host Spectating
**Steps:**
1. Create lobby with max_players = 4
2. Host switches to spectator
3. Try to join 5 players

**Expected Results:**
- [ ] 4 players can join (host not counted)
- [ ] 5th player gets "Room is full" error
- [ ] Host can still switch to player if slot available

---

## Test Suite 6: Database Verification

### Test 6.1: Column Exists
**SQL Query:**
```sql
DESCRIBE duel_lobby_rooms;
```

**Expected:**
- [ ] Column `host_spectator_mode` exists
- [ ] Type: TINYINT(1)
- [ ] Default: 0
- [ ] Nullable: YES or has default

### Test 6.2: Data Integrity
**SQL Queries:**
```sql
-- Check default value on new lobby
SELECT host_spectator_mode FROM duel_lobby_rooms WHERE lobby_id = [new_lobby_id];

-- Check value after switching to spectator
SELECT host_spectator_mode FROM duel_lobby_rooms WHERE lobby_id = [lobby_id];

-- Check host not in players when spectating
SELECT * FROM duel_lobby_players WHERE lobby_id = [lobby_id] AND user_id = [host_user_id];
```

**Expected:**
- [ ] Default value is 0
- [ ] Value is 1 when host spectating
- [ ] No player record when host spectating

---

## Test Suite 7: UI/UX Validation

### Test 7.1: Visual Design
**Check:**
- [ ] Role selector has gradient blue background
- [ ] Active option has highlighted border
- [ ] Hover effect works (shift right + shadow)
- [ ] Icons displayed: 🎮 for player, 👁️ for spectator
- [ ] Warning box appears with yellow background
- [ ] Text is readable and centered

### Test 7.2: Responsive Layout
**Test on:**
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768px width)
- [ ] Mobile (375px width)

**Expected:**
- [ ] Role selector doesn't overflow
- [ ] Radio buttons remain clickable
- [ ] Text wraps appropriately

---

## Test Suite 8: Server Logging

### Test 8.1: Check Console Logs
**When switching to spectator:**
```
[LOBBY] Host <username> (<userId>) switched to SPECTATOR mode in lobby <lobbyId>
```

**When joining as host in spectator mode:**
```
[LOBBY] Host <username> is in spectator mode, not adding as player
```

**When switching back to player:**
```
[LOBBY] Host <username> (<userId>) switched to PLAYER mode in lobby <lobbyId>
```

**Expected:**
- [ ] All logs appear correctly
- [ ] No error messages
- [ ] Correct userId and lobbyId values

---

## Regression Tests

### Regression 1: Regular Player Join
**Steps:**
1. Non-host player joins lobby
2. Check player list

**Expected:**
- [ ] Player added normally
- [ ] No spectator mode issues
- [ ] Ready button works

### Regression 2: Ready Status
**Steps:**
1. Players click Ready button
2. Check ready icons

**Expected:**
- [ ] Hourglass ⏳ → Checkmark ✓
- [ ] "Waiting for X players" updates correctly
- [ ] Start Match button enables at correct time

### Regression 3: Match Start Flow
**Steps:**
1. 2+ players ready
2. Start match
3. Navigate to LobbyOnboarding

**Expected:**
- [ ] Match creates successfully
- [ ] Problem loads correctly
- [ ] All players see same problem
- [ ] Code submission works

---

## Bug Scenarios to Verify Fixed

### ✅ Bug 1: Host Always Added as Player
**Original Issue:** Host added to players even with spectators enabled

**Verification:**
- [ ] Create lobby
- [ ] Toggle "Allow spectator" ON
- [ ] Switch to "Spectate Only"
- [ ] Verify host NOT in player list
- [ ] Verify `join_lobby` doesn't add host

### ✅ Bug 2: No UI for Host Role
**Original Issue:** No way for host to choose role

**Verification:**
- [ ] Room Settings panel has role selector
- [ ] Two clear options: Player vs Spectator
- [ ] Selection persists across page reloads

---

## Performance Tests

### Perf 1: Role Switch Speed
**Measure:**
- [ ] Click "Spectate Only" → Time to reload
- [ ] Click "Join as Player" → Time to update UI

**Expected:**
- [ ] < 1 second for spectator switch (includes reload)
- [ ] < 300ms for player switch (no reload)

### Perf 2: Database Query Time
**Measure:**
- [ ] Time for `set_host_role` UPDATE query
- [ ] Time for `join_lobby` SELECT query

**Expected:**
- [ ] < 50ms for each query
- [ ] No N+1 query issues

---

## Sign-Off Checklist

Before marking as complete:
- [ ] All Test Suites passed (1-8)
- [ ] No console errors in browser
- [ ] No server errors in logs
- [ ] Database migration applied successfully
- [ ] Code reviewed for security issues
- [ ] Documentation updated (SPECTATOR_MODE_FIX.md)
- [ ] User guide created
- [ ] Stakeholder demo completed

---

## Known Limitations

Document any expected limitations:
- [ ] Role switch during active match behavior
- [ ] Spectator count limits (if any)
- [ ] Browser compatibility issues
- [ ] Mobile viewport constraints

---

**Tester Name:** _________________
**Date:** _________________
**Test Environment:** _________________
**Pass/Fail:** _________________
**Notes:** _________________
