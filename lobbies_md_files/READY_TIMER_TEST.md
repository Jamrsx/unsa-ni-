# Ready Timer Feature - Test Guide

## Feature Implementation Complete ✓

### What Was Implemented

#### Client-Side (Duel.vue)
- **10-second countdown timer** after "Waiting for opponent" state is found (match_found event)
- **Visual countdown display** in the modal with ⏱️ emoji
- **Auto-requeue on timeout**: When timer hits 0, modal closes and player is re-added to matching queue
- **Timer cleanup**: Clears timer on Ready click, modal exit, or opponent cancellation

#### Server-Side (server.js)
- **ready_timeout event handler**: Listens for `ready_timeout` event from clients
- **Opponent notification**: When one player times out, server notifies opponent with `opponent_cancelled` event
- **Automatic requeue**: Both players are re-added to their respective match queues
- **State cleanup**: Removes both sockets from matchPairs when timeout occurs

### How It Works

1. **Match Found**: Both players receive "match_found" event and modal appears
2. **Timer Starts**: 10-second countdown begins immediately
3. **Two Paths**:
   - **Path A (Ready before timeout)**: Player clicks Ready → server marks ready → if both ready → match starts
   - **Path B (Timeout at 0s)**: Player doesn't click Ready → timer reaches 0 → socket emits `ready_timeout` → server broadcasts `opponent_cancelled` to opponent → both players re-added to queue → modal closes and search restarts

### Test Scenarios

#### Test 1: Both Players Ready (Happy Path)
1. User 1 clicks "Ranked/Casual" → waits for opponent
2. User 2 clicks "Ranked/Casual" → both see modal with 10s countdown
3. User 1 clicks "Ready" → both players see match starts, go to Onboarding
4. ✓ Should proceed to duel

#### Test 2: Player 1 Timeout
1. User 1 clicks "Ranked/Casual" → waits
2. User 2 clicks "Ranked/Casual" → both see modal with countdown
3. Neither player clicks Ready, wait 10 seconds
4. ✓ Both players' modals close automatically
5. ✓ Both players return to "Waiting for opponent" state
6. ✓ Can see timer countdown on modal before close

#### Test 3: Player 1 Clicks Ready, Player 2 Times Out
1. User 1 clicks "Ranked/Casual" → waits
2. User 2 clicks "Ranked/Casual" → both see modal with countdown
3. User 1 clicks "Ready" → opponent sees "Opponent ready, waiting for you" message (or equivalent)
4. User 2 doesn't click Ready after 10s
5. ✓ User 1's modal should stay open (match waiting) or show opponent timed out
6. ✓ User 2 is requeued automatically

#### Test 4: Player Exits Modal During Countdown
1. User 1 clicks "Ranked/Casual" → waits
2. User 2 clicks "Ranked/Casual" → both see modal with countdown
3. User 1 clicks "Exit/Cancel" button
4. ✓ User 1 returns to "Waiting for opponent" (requeue)
5. ✓ User 2 returns to "Waiting for opponent" (requeue)
6. ✓ Both can search again

### Browser Console Logs to Check

**Server-side (terminal):**
```
Both players matched in [mode] match
Both players ready in [mode] match
Player ready timeout: [socket.id]
```

**Client-side (DevTools Console):**
```
match_found event received
both_ready event received
ready_timeout event emitted
opponent_cancelled event received
```

### Files Modified

1. **server.js** (Lines ~417-450)
   - Added `socket.on('ready_timeout', ...)` handler
   - Notifies opponent and requeues both players

2. **Duel.vue** (Previously updated)
   - `readyCountdown` ref with initial value 10
   - `startReadyTimer()` function with 1000ms interval
   - Timer display in modal template: `⏱️ {{ readyCountdown }}s`
   - Timer cleanup on Ready click, modal exit, opponent cancel

### Key Variables & Events

**Socket Events:**
- `match_found` → countdown starts
- `player_ready` → server marks ready
- `ready_timeout` → client sends on timeout
- `opponent_cancelled` → server broadcasts to opponent
- `opponent_ready` → sent when one player clicks ready (optional UX enhancement)

**Client State:**
- `matchFound` (boolean) - tracks if match has been found
- `readyCountdown` (ref) - timer value (0-10)
- `readyTimer` (variable) - interval ID for cleanup
- `searchingMode` (ref) - tracks "ranked" or "casual" mode

**Server State:**
- `matchPairs` (Map) - stores {opponentId, player1_id, player2_id, opponentUsername, mode, ...}
- `matchQueues` (object) - queues for "ranked" and "casual" modes

### Expected Behavior Summary

| Scenario | Player 1 | Player 2 | Result |
|----------|----------|----------|--------|
| Both click Ready | Clicks Ready | Clicks Ready | Match starts ✓ |
| 1 clicks Ready, 2 times out | Clicks Ready | Does nothing | Both requeue ✓ |
| Both timeout | Does nothing | Does nothing | Both requeue ✓ |
| 1 exits | Clicks Exit | Waiting | Both requeue ✓ |

### Troubleshooting

**Timer not showing?**
- Check if `readyCountdown` is in return object of setup()
- Verify template has `{{ readyCountdown }}` in modal

**Timer not counting down?**
- Check if `startReadyTimer()` is called on match_found
- Verify interval is 1000ms

**Not requeuing?**
- Check if `startMatch(searchingMode.value)` is called on timeout
- Verify matchQueues are properly managed on server

**Opponent not notified?**
- Check if `opponent_cancelled` listener exists in opponent's Duel.vue
- Check server console for ready_timeout logs

