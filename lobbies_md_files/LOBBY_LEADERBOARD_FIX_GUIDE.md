# LOBBY LEADERBOARD & SPECTATOR FIX - TESTING GUIDE

## Issues Fixed

### 1. ✅ Live Leaderboard Not Appearing After Submission
**Problem**: When players returned to the room after submitting, the leaderboard was empty.

**Solution**:
- Added `score`, `completion_time`, and `verdict` columns to `duel_lobby_players` table
- Server now saves player scores to database when they submit
- Server sends existing leaderboard scores when a player rejoins
- Room.vue initializes `playerScores` with existing scores on join

**How It Works**:
1. Player submits code → Score saved to database
2. Player returns to room → Server sends all existing scores
3. Leaderboard populates with all submitted scores
4. New submissions update leaderboard in real-time

---

### 2. ✅ Result Modal Shows Points/Score
**Problem**: Result modal wasn't clearly showing the score.

**Status**: The result modal already displays:
- Verdict (Accepted/Partially Accepted)
- Tests Passed (e.g., "10/13")
- **Score Percentage** (e.g., "76%")
- Completion Time
- Individual test results

**What You See**:
```
┌─────────────────────────────┐
│      Partially Accepted      │ ← Verdict
├─────────────────────────────┤
│ Tests Passed: 10/13         │
│ Score: 76%                  │ ← Your Score!
│ Duration: 45s               │
├─────────────────────────────┤
│ ✓ Test 1: Accepted          │
│ ✓ Test 2: Accepted          │
│ ✗ Test 3: Wrong Answer      │
│ ... (all test results)       │
└─────────────────────────────┘
```

---

### 3. ✅ Spectator View in Inspector Page
**Problem**: How should spectators see results?

**Solution**: Inspector.vue displays:

**During Match**:
- Live code updates as players type
- Language selection
- Player status (Coding/Pending/Done)

**After Submission**:
- ✅ Verdict badge (Accepted/Partial)
- 📊 Tests Passed (10/13)
- 🎯 Score percentage (76%)
- ⏱️ Completion time
- Individual test results (✓✗ indicators)

**Example Spectator View**:
```
┌────────────────────────────────────────┐
│ Player: user0                          │
│ Status: ✓ Submitted (Done)            │
├────────────────────────────────────────┤
│ Language: Python    Status: Ready      │
│                                        │
│ [Code Editor - Live Updates]           │
│ import ast                             │
│ arr = ast.literal_eval(...)            │
│                                        │
├────────────────────────────────────────┤
│ Results:                               │
│ [Partially Accepted] 10/13 Tests 76%  │
│ 🕐 45 seconds                          │
│ ✓✓✗✓✓✓✗✓✓✓✗✓✓  ← Test indicators     │
└────────────────────────────────────────┘
```

---

## Database Setup

**CRITICAL**: Run this SQL before testing:

```bash
# Navigate to your MySQL
mysql -u root -p duelcode_capstone_project

# Or use phpMyAdmin/HeidiSQL and run:
```

```sql
ALTER TABLE `duel_lobby_players`
ADD COLUMN `score` INT NULL DEFAULT NULL COMMENT 'Player score percentage (0-100)' AFTER `is_ready`,
ADD COLUMN `completion_time` INT NULL DEFAULT NULL COMMENT 'Time taken to complete in seconds' AFTER `score`,
ADD COLUMN `verdict` VARCHAR(50) NULL DEFAULT NULL COMMENT 'Judge verdict' AFTER `completion_time`;

ALTER TABLE `duel_lobby_players`
ADD INDEX `idx_lobby_score` (`lobby_id`, `score`, `completion_time`);
```

**File**: `sql/add_lobby_scores.sql` (already created)

---

## Testing Steps

### Test 1: Leaderboard Appears After Submission

1. **Setup**: 
   - Run the SQL ALTER TABLE statements above
   - Start server: `node server.js`
   - Start dev server: `npm run dev`

2. **Create Lobby**:
   - User1: Create private lobby (password: "test123")
   - Copy spectator link from Room page

3. **Open Spectator** (Optional):
   - Open spectator link in new tab/window
   - Should see: "Waiting for players to write code..."

4. **Start Match**:
   - User1: Click "Start Match"
   - Redirects to onboarding page

5. **Submit Code**:
   - Copy solution from `sql/problem_solutions.py`
   - Paste into editor
   - Click "Submit Code"
   - Wait for judge results

6. **Check Result Modal** ✅:
   - Should see verdict
   - Should see "Score: XX%"  ← **This is your points!**
   - Should see tests passed
   - Should see completion time

7. **Return to Room**:
   - Click "← Back to Lobby Room"
   - Redirects to Room page

8. **Verify Leaderboard** ✅:
   - Should see "🏆 Live Leaderboard" section
   - Should show your username
   - Should show your score percentage
   - Should show completion time
   - Position: 🥇 (first place)

### Test 2: Multiple Players & Live Updates

1. **Add Second Player**:
   - User2: Join lobby with password "test123"
   - User1: Start match (both go to onboarding)

2. **Submit at Different Times**:
   - User1: Submit code immediately (fast time)
   - User2: Submit code after 30 seconds (slower time)

3. **Check Leaderboards**:
   - Both should see leaderboard update in real-time
   - If same score: Faster time ranks higher
   - Should see: 🥇 User1, 🥈 User2

4. **Return and Verify**:
   - Both click "Return to Room"
   - Leaderboard should persist with both scores

### Test 3: Spectator View

1. **Open Spectator Before Match**:
   - Copy spectator link from Room
   - Open in incognito/private window

2. **During Match**:
   - Watch as players type code (live updates)
   - See language selections
   - See status change to "Pending" when submitted

3. **After Submission**:
   - See verdict badge appear
   - See score percentage
   - See test results indicators (✓✗✓✗...)
   - See completion time

### Test 4: Rejoin After Closing Tab

1. **Submit Score**: User1 submits code (gets score)
2. **Close All Tabs**: Close browser/all tabs
3. **Rejoin Room**: Navigate to `/room.html?code=ROOMCODE`
4. **Verify**: Leaderboard should show your previous score

---

## Expected Console Logs

### Player Browser (After Submission):
```
[LobbyOnboarding] Judge result received: {verdict: "Partially Accepted", score: 76, ...}
[Judge Result] Broadcasting to spectators - userId: 1
[Code Update] Broadcasting to spectators - userId: 1
```

### Room.vue (After Returning):
```
[Room] ✓ Successfully joined lobby
[Room] Loaded 1 existing scores
[Room] Leaderboard update: {userId: 1, username: "user0", score: 76, ...}
```

### Server Console:
```
[LOBBY] Saved score for user 1 in lobby 111
[SPECTATOR] Player user0 (1) got Partially Accepted (76%) in lobby 111
[LOBBY] Sending 1 existing scores to user0
```

### Spectator Browser:
```
[Inspector] Player judge result: {userId: 1, username: "user0", verdict: "Partially Accepted", score: 76, ...}
```

---

## Troubleshooting

### ❌ Leaderboard Still Empty
**Check**:
1. Did you run the SQL ALTER TABLE?
2. Check server console for "Saved score for user X"
3. Check Room.vue console for "Loaded N existing scores"
4. Try refreshing the room page

### ❌ Score Shows NULL
**Check**:
1. Database columns exist: `SELECT * FROM duel_lobby_players LIMIT 1`
2. Server logs show UPDATE query success
3. Verify judge is returning score in results

### ❌ Spectator Shows "Unknown" User
**Check**:
1. LobbyOnboarding console for "[getUserId] From window.user.id: X"
2. Make sure authenticated event fires
3. Check server broadcasts include username

---

## File Changes Summary

**Modified Files**:
1. `server.js`:
   - Added score saving to database in `player_judge_result` handler
   - Added leaderboard loading in `join_lobby` callback
   - Returns `leaderboard` array with existing scores

2. `src/Room.vue`:
   - Initialize `playerScores` with response.leaderboard
   - Leaderboard section remains visible with scores

3. `src/Inspector.vue`:
   - Already displays player results
   - Shows verdict, score, tests, completion time

**New Files**:
1. `sql/add_lobby_scores.sql`:
   - ALTER TABLE script to add score columns

**Database Changes**:
1. `duel_lobby_players` table:
   - Added `score` INT column
   - Added `completion_time` INT column
   - Added `verdict` VARCHAR(50) column
   - Added index for performance

---

## Success Criteria

✅ **Test Passed When**:
1. Result modal clearly shows "Score: XX%"
2. Leaderboard appears after returning to room
3. Leaderboard shows all players who submitted
4. Leaderboard persists after refreshing/rejoining
5. Spectator can see live code updates
6. Spectator can see player results after submission
7. Multiple players appear in correct rank order
8. Faster completion time breaks score ties

---

## Notes

- Scores are saved permanently in database
- Leaderboard loads on every room join
- Real-time updates broadcast to all players
- Spectators see everything except private chat
- Rankings: Higher score wins, tie-break by faster time
- Medals: 🥇 1st, 🥈 2nd, 🥉 3rd, #4 and beyond
