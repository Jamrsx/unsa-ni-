# Quick Testing Guide for Scoring System

## Test Scenario 1: Basic Score Display (3 Players)

### Setup
1. Create a lobby with 3 players
2. Assign a problem with 4 test cases
3. Start the match

### Test Steps

**Player 1 - Perfect Score:**
1. Write code that passes all 4 test cases
2. Submit
3. **Expected Results:**
   - Result modal shows: "Accepted (4/4)" and "100%"
   - Player sees "Back to Room" button
   - Clicking button returns to room.html

**Player 2 - Partial Score:**
1. Write code that passes 3 out of 4 test cases
2. Submit
3. **Expected Results:**
   - Result modal shows: "Wrong Answer (3/4)" and "75%"
   - Can return to room

**Player 3 - Failed Score:**
1. Write code that passes 0 out of 4 test cases
2. Submit
3. **Expected Results:**
   - Result modal shows: "Wrong Answer (0/4)" and "0%"
   - Can return to room

### Verification
**In Room Leaderboard:**
- Player 1 (100%) shows in 🥇 **gold** with pulsing glow
- Player 2 (75%) shows in 🥈 **silver**
- Player 3 (0%) shows with standard rank #3
- All show completion times (e.g., "12:34")
- Sorted correctly: 100% → 75% → 0%

---

## Test Scenario 2: Spectator View

### Setup
1. Open inspector mode as spectator
2. Watch 3 players coding

### Test Steps

**Phase 1 - Coding:**
1. Players start typing code
2. **Expected:** Status badges show "💻 Coding"

**Phase 2 - Submission:**
1. Players click submit
2. **Expected:** Status changes to "📤 Submitted"

**Phase 3 - Results:**
1. Judge returns results
2. **Expected:**
   - Status changes to "✅ Done"
   - Score displays (e.g., "75%")
   - Completion time shows (e.g., "🕐 2:45:32 PM")
   - Test indicators show: ✓✓✓✗ (for 3 passed, 1 failed)

**Phase 4 - All Done:**
1. All players receive results
2. **Expected:**
   - Green "✓ Done - Back to Room" button appears in header
   - Button pulses with animation
   - Clicking navigates to room.html

---

## Test Scenario 3: Tie-Breaking by Time

### Setup
1. Create lobby with 3 players
2. Problem with 2 test cases

### Test Steps

**Player A:**
1. Submit at 12:00:00 with 50% score (1/2 tests)
2. **Expected:** completionTime = timestamp of 12:00:00

**Player B:**
1. Submit at 12:00:05 with 50% score (1/2 tests)
2. **Expected:** completionTime = timestamp of 12:00:05

**Player C:**
1. Submit at 12:00:02 with 100% score (2/2 tests)
2. **Expected:** completionTime = timestamp of 12:00:02

### Verification
**Leaderboard Order:**
1. 🥇 **Player C** - 100% - 🕐 00:02 (highest score, gold)
2. 🥈 **Player A** - 50% - 🕐 00:00 (same score as B, but faster, silver)
3. **Player B** - 50% - 🕐 00:05 (same score as A, but slower, rank #3)

---

## Test Scenario 4: Podium Styling Verification

### Visual Checks

**First Place (Gold):**
- [ ] Background: Gold gradient (yellow-ish shine)
- [ ] Border: 3px solid gold (#ffb800)
- [ ] Scale: Slightly larger than others (1.05x)
- [ ] Shadow: Glowing gold shadow
- [ ] Animation: Pulsing glow effect every 2 seconds
- [ ] Medal: 🥇 Large size (2.5rem) with bounce animation
- [ ] Name: Black text, larger font (1.3rem), bold (800)

**Second Place (Silver):**
- [ ] Background: Silver gradient (gray-white shine)
- [ ] Border: 2px solid gray (#a8a8a8)
- [ ] Shadow: Subtle gray shadow
- [ ] Medal: 🥈 Medium size (2.2rem)
- [ ] Name: Dark text, medium font (1.2rem), bold (700)

**Third Place (Bronze):**
- [ ] Background: Bronze gradient (orange-brown shine)
- [ ] Border: 2px solid dark bronze (#a0621f)
- [ ] Shadow: Warm bronze shadow
- [ ] Medal: 🥉 Smaller size (2rem)
- [ ] Name: White text with shadow, font (1.15rem), bold (700)

**Other Ranks:**
- [ ] Standard white background
- [ ] No special border
- [ ] Rank number displayed (e.g., "#4")
- [ ] Normal text styling

---

## Test Scenario 5: Edge Cases

### Test 5.1: Single Player Lobby
1. Create lobby with 1 player
2. Player submits code
3. **Expected:**
   - Score calculates correctly
   - Shows as 🥇 first place with gold styling
   - Completion time displays
   - No errors or crashes

### Test 5.2: All Players Same Score
1. 3 players all get 100%
2. Submit at different times: 00:10, 00:05, 00:15
3. **Expected:**
   - 🥇 Player who submitted at 00:05 (fastest)
   - 🥈 Player who submitted at 00:10 (second fastest)
   - 🥉 Player who submitted at 00:15 (slowest)

### Test 5.3: Player Doesn't Submit
1. 2 players submit, 1 doesn't
2. **Expected:**
   - 2 players show in leaderboard with scores
   - 3rd player not in leaderboard (no entry)
   - Spectator Done button does NOT appear (not all done)

### Test 5.4: Zero Test Cases (Edge)
1. Problem with 0 test cases (shouldn't happen, but test it)
2. **Expected:**
   - No division by zero error
   - Score shows as 0% or handles gracefully
   - System doesn't crash

---

## Quick Manual Test Procedure

### 5-Minute Smoke Test
1. **Create lobby** → Verify room loads
2. **Add 2 players** → Verify both join successfully
3. **Start match** → Verify both navigate to problem
4. **Player 1 submit wrong code** → Verify 0% score shows
5. **Player 2 submit correct code** → Verify 100% score shows
6. **Check room leaderboard** → Verify:
   - Player 2 shows 🥇 gold with 100%
   - Player 1 shows 🥈 silver with 0%
   - Both show completion times
7. **Open inspector** → Verify:
   - Both players show "✅ Done"
   - Scores visible
   - "✓ Done - Back to Room" button appears
8. **Click Done button** → Verify navigates to room

### Expected Duration: 5 minutes
**Pass Criteria:** All steps work without errors

---

## Automated Testing (Future)

### Unit Tests Needed
```javascript
// Score Calculation
test('calculateScore returns correct percentage', () => {
  expect(calculateScore(4, 4)).toBe(100);
  expect(calculateScore(3, 4)).toBe(75);
  expect(calculateScore(0, 4)).toBe(0);
});

// Leaderboard Sorting
test('sorts by score then time', () => {
  const players = [
    { score: 50, completionTime: 1000 },
    { score: 100, completionTime: 2000 },
    { score: 50, completionTime: 500 }
  ];
  const sorted = sortLeaderboard(players);
  expect(sorted[0].score).toBe(100);
  expect(sorted[1].completionTime).toBe(500); // faster 50%
  expect(sorted[2].completionTime).toBe(1000); // slower 50%
});

// Time Formatting
test('formats completion time correctly', () => {
  const date = new Date('2024-01-01T12:05:30');
  expect(formatCompletionTime(date.getTime())).toBe('05:30');
});
```

---

## Common Issues & Solutions

### Issue 1: Scores show as NaN or undefined
**Cause:** Server not calculating score
**Solution:** Verify server.js line ~3020 has `const score = Math.round((passed / testCases.length) * 100);`

### Issue 2: Completion time not displaying
**Cause:** completionTime not passed in socket events
**Solution:** Check server.js broadcasts include completionTime field

### Issue 3: Leaderboard not sorting correctly
**Cause:** Missing sort comparison for ties
**Solution:** Verify sort function compares score first, then completionTime

### Issue 4: Podium styling not visible
**Cause:** CSS classes not applied or CSS file not loaded
**Solution:** Check lobbyroom.css has .first-place, .second-place, .third-place classes

### Issue 5: Done button doesn't appear for spectator
**Cause:** allPlayersDone computed not detecting all results
**Solution:** Verify all players emit player_judge_result with complete data

---

## Browser Compatibility

### Tested Browsers
- ✅ Chrome 100+ (Recommended)
- ✅ Firefox 90+
- ✅ Edge 100+
- ⚠️ Safari 14+ (Animations may vary)

### Known Issues
- Safari: Gold pulse animation may appear less smooth
- Old browsers: Gradient backgrounds may show solid colors

### Minimum Requirements
- Modern browser with ES6 support
- WebSocket support
- CSS animations support
- localStorage support

---

## Performance Metrics

### Expected Timings
- Score calculation: < 1ms
- Leaderboard sort (45 players): < 5ms
- Socket broadcast: < 50ms
- UI update: < 100ms

### Memory Usage
- Per player result: ~1KB
- Leaderboard data (45 players): ~45KB
- Total overhead: Negligible

### Network Traffic
- Score update event: ~200 bytes
- Complete result payload: ~2KB
- Negligible bandwidth impact

---

## Rollback Plan

If issues arise, revert these commits:
1. server.js score calculation
2. Inspector.vue status changes
3. Room.vue leaderboard enhancements
4. lobbyroom.css podium styling
5. LobbyOnboarding.vue result handling

**Critical files to backup before testing:**
- server.js
- src/Inspector.vue
- src/Room.vue
- src/LobbyOnboarding.vue
- public/css/lobbyroom.css

---

## Success Criteria

✅ **All tests pass without errors**
✅ **Scores display correctly (no undefined/NaN)**
✅ **Leaderboard sorts by score, then time**
✅ **Podium styling visible for top 3**
✅ **Spectator Done button appears when appropriate**
✅ **Completion times display accurately**
✅ **No console errors or warnings**
✅ **System stable under normal load (≤45 players)**

