# 🧪 QUICK TESTING GUIDE

## 🚀 Fast Test Setup (5 minutes)

### Step 1: Start Server
```bash
node server.js
```
✅ Look for: `Server is running on port 3000`

---

### Step 2: Open 4 Browser Windows

**Window 1 - Host (user0)**
- URL: `http://localhost:3000/signin.html`
- Login: user0 / password
- Role: Host & Player

**Window 2 - Player (user1)**
- URL: `http://localhost:3000/signin.html` (incognito)
- Login: user1 / password
- Role: Player

**Window 3 - Player (user2)**
- URL: `http://localhost:3000/signin.html` (incognito)
- Login: user2 / password
- Role: Player

**Window 4 - Spectator (user3)**
- Keep this tab ready (we'll paste spectator link here)
- No login needed initially

---

### Step 3: Create Lobby (Window 1 - user0)
1. Click **"Lobbies"** → **"Create Room"**
2. Settings:
   - Room Type: **Private**
   - Password: `test123`
   - Language: **Python**
3. Click **"Create Room"**
4. ✅ Verify: Redirected to room.html

---

### Step 4: Configure Settings (Window 1)
1. Find **"Room Settings (Host Only)"** panel
2. **Set Timer**:
   - Minutes: `3`
   - Seconds: `30`
   - ✅ Verify: Shows "Total: 210 seconds"
3. **Enable Spectators**:
   - Toggle **"Allow spectator"** → ON
4. **Host Role**:
   - Select **"Join as Player"** (🎮)
   - Wait for confirmation
   - Now select **"Spectate Only"** (👁️)
   - ✅ Verify: Spectator link appears below
5. **Copy Spectator Link**:
   - Click **"Copy"** button
   - ✅ Verify: Shows "✓ Copied!"

---

### Step 5: Join as Players (Windows 2 & 3)
**Window 2 (user1)**:
1. Go to **Lobbies** → Find the private room
2. Enter password: `test123`
3. Click **"Join"**
4. Click **"I'm Ready"** button
5. ✅ Verify: Green "READY" badge appears

**Window 3 (user2)**:
1. Same as user1
2. Click **"I'm Ready"**
3. ✅ Verify: Both players show READY

---

### Step 6: Join as Spectator (Window 4)
1. Paste spectator link (copied from Step 4)
2. ✅ Verify: Loads inspector.html
3. ✅ Verify: See 2 player panels (user1, user2)
4. ✅ Verify: Code editors are empty

---

### Step 7: Start Match (Window 1 - user0)
1. Click **"Start Match"** button
2. Confirm spectator mode dialog
3. ✅ Verify: Redirected to lobby-onboarding.html
4. ✅ Verify: Problem loads
5. ✅ Verify: Left panel shows lobby badge and empty leaderboard

**All Players (Windows 2 & 3)**:
- ✅ Verify: Also redirected to lobby-onboarding.html
- ✅ Verify: Same problem loaded
- ✅ Verify: Left panel shows leaderboard section

**Spectator (Window 4)**:
- ✅ Verify: Still on inspector.html
- ✅ Verify: Player panels update with problem info

---

### Step 8: Code & Watch (All Windows)

**Window 2 (user1) - Type Code**:
```python
def solution(n):
    return n * 2
```
✅ **Spectator View**: Should see code appearing in real-time!

**Window 3 (user2) - Type Different Code**:
```python
def solution(x):
    return x + x
```
✅ **Spectator View**: Should see both players' code!

---

### Step 9: Submit & Check Results

**Window 2 (user1) - Submit First**:
1. Click **"Run Code"** or **"Submit"**
2. ✅ Verify: Results overlay appears
3. ✅ Verify: Shows verdict (Accepted/Partial/Wrong)
4. ✅ Verify: Shows tests passed (e.g., "3/5 Tests")
5. ✅ Verify: Shows score percentage
6. ✅ Verify: Leaderboard shows user1 with score

**Spectator (Window 4)**:
- ✅ Verify: user1's panel shows results summary
- ✅ Verify: Verdict badge appears (green/yellow)
- ✅ Verify: Score and test indicators visible

**Window 3 (user2) - Submit Second**:
1. Submit code
2. ✅ Verify: Results appear
3. ✅ Verify: Leaderboard updates with user2
4. ✅ Verify: Leaderboard sorts by score
5. ✅ Verify: Top player gets 🥇 medal

**All Players**:
- ✅ Verify: Leaderboard shows both players ranked
- ✅ Verify: Higher score is #1
- ✅ Verify: Your row highlighted in blue

---

### Step 10: Test Navigation (Window 2 or 3)

**From Results Overlay**:
1. Hover over **"Back to Lobby Room"** button
   - ✅ Verify: Cursor changes to pointer
2. Click **"Back to Lobby Room"**
   - ✅ Verify: Navigates to room.html
   - ✅ Verify: Shows room code in URL
3. Return to results page
4. Click **"View All Lobbies"**
   - ✅ Verify: Navigates to lobbies.html

---

### Step 11: Test Spectator Link Toggle (Window 1)

**Back to Room Settings**:
1. Navigate to room.html (if not there)
2. **Host Role**: Switch to **"Spectate Only"**
   - ✅ Verify: Spectator link visible
3. **Host Role**: Switch to **"Join as Player"**
   - ✅ Verify: Spectator link disappears
4. **Host Role**: Switch back to **"Spectate Only"**
   - ✅ Verify: Spectator link reappears

---

## ⚡ QUICK VERIFICATION CHECKLIST

### Timer Settings
- [x] Can input minutes (0-60)
- [x] Can input seconds (0-59)
- [x] Shows total in seconds
- [x] Duration sent to server on match start

### Spectator Link
- [x] Only shows in spectator mode
- [x] Copy button works
- [x] Link loads inspector.html
- [x] Link includes lobby_id and code

### Spectator View Results
- [x] Shows verdict badge (color-coded)
- [x] Shows score percentage
- [x] Shows tests passed/total
- [x] Shows ✓/✗ for each test
- [x] Updates in real-time when player submits

### Results Overlay
- [x] Overlay covers full screen
- [x] Buttons are clickable
- [x] Cursor changes to pointer on hover
- [x] "Back to Lobby Room" works
- [x] "View All Lobbies" works

### Live Leaderboard
- [x] Shows in left panel during match
- [x] Updates when player submits
- [x] Sorts by score (highest first)
- [x] Shows 🥇🥈🥉 for top 3
- [x] Highlights current user in blue
- [x] Shows username and score %
- [x] Updates for all players simultaneously

---

## 🐛 TROUBLESHOOTING

### Issue: Spectator link not showing
**Fix**: Make sure host selected "Spectate Only" (👁️) radio button

### Issue: Buttons not clickable
**Fix**: Hard refresh (Ctrl+F5) to clear CSS cache

### Issue: Leaderboard empty
**Fix**: Players need to submit code (not just type it)

### Issue: Spectator view blank
**Fix**: Match must be started (status: in_progress)

### Issue: Code not streaming
**Fix**: Check socket connection (F12 → Network → WS)

---

## ⏱️ EXPECTED TESTING TIME

- **Setup**: 2 minutes
- **Create & Join**: 3 minutes
- **Match & Submit**: 5 minutes
- **Navigation Tests**: 2 minutes
- **Total**: ~12 minutes

---

## ✅ SUCCESS CRITERIA

**ALL features working = SUCCESS!**
- ✅ Timer settings accepted
- ✅ Spectator link toggles properly
- ✅ Spectator sees live results
- ✅ Result buttons work
- ✅ Leaderboard updates live

If any feature fails, check:
1. Server console for errors
2. Browser console (F12) for errors
3. Network tab for failed requests
4. Socket connections (WS tab)

---

**Happy Testing! 🎉**
