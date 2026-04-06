# Spectator Mode Redirect - Deep Fix Documentation

## Problem
When a host in spectator mode started a match and was redirected to the inspector page, they would receive a "Lobby doesn't exist" error repeatedly, even with retry logic. Investigation revealed three critical issues:

1. **Table Name Mismatch**: Using wrong table name `duel_lobby_room_players` instead of `duel_lobby_players`
2. **Premature Lobby Deletion**: Lobbies were deleted when all players left, even if match was in progress
3. **Missing Lobby Persistence**: Spectator redirection happened but lobby was already gone from database

## Root Causes

### Issue 1: Wrong Table Name
**Location**: `server.js` line ~2078
```javascript
// WRONG - table doesn't exist
FROM duel_lobby_room_players dlrp

// CORRECT - actual table name
FROM duel_lobby_players dlp
```
This caused the spectator join to fail when trying to load players from database, making lobby restoration incomplete.

### Issue 2: Lobby Deletion During Active Match
**Location**: `server.js` leave_lobby and disconnect handlers
- When all players left a lobby, it was immediately deleted
- Didn't check if match was `in_progress` or `completed`
- Spectators (including host) couldn't join because lobby was gone

### Issue 3: Lobby Not Persisting
- Host starts match in spectator mode
- All players redirected to onboarding page
- Host redirected to inspector page
- Players might disconnect or leave quickly
- Lobby deleted before host could join as spectator

## Solution

### Fix 1: Correct Table Name (CRITICAL)

**File**: `server.js` (line ~2078-2086)

**Changed**:
```javascript
// Load players from database
const [playerRows] = await db.query(
    `SELECT dlp.*, u.username, u.avatar_url 
     FROM duel_lobby_players dlp
     JOIN users u ON dlp.user_id = u.user_id
     WHERE dlp.lobby_id = ? AND dlp.left_at IS NULL`,
    [lobbyId]
);
```

**Impact**: This allows lobby restoration from database to work correctly by querying the actual table.

### Fix 2: Prevent Deletion of Active Match Lobbies

**File**: `server.js` - `leave_lobby` handler (line ~1750)

**Changed**:
```javascript
// Check if lobby is now empty
if (lobby.players.size === 0) {
    // Don't delete if match is in progress or completed - keep for spectators
    if (lobby.lobbyData.status === 'in_progress' || lobby.lobbyData.status === 'completed') {
        console.log(`[LOBBY] Lobby ${lobbyId} is empty but match is ${lobby.lobbyData.status} - keeping for spectators`);
        callback({ success: true });
        return;
    }
    
    // Only delete if status is 'waiting'
    await db.query(`DELETE FROM duel_lobby_rooms WHERE lobby_id = ?`, [lobbyId]);
    // ... rest of deletion code
}
```

**Same fix applied to disconnect handler** (line ~2507)

**Impact**: Lobbies with active or completed matches persist even when all players leave, allowing spectators to join.

### Fix 3: Enhanced Lobby Restoration with Better Logging

**File**: `server.js` - `join_as_spectator` handler (line ~2046-2070)

**Added**:
```javascript
if (lobbyRows.length === 0) {
    console.log(`[SPECTATOR] ✗ Lobby ${lobbyId} doesn't exist in database`);
    // List all active lobbies for debugging
    const [allLobbies] = await db.query(
        `SELECT lobby_id, room_code, status FROM duel_lobby_rooms ORDER BY lobby_id DESC LIMIT 10`
    );
    console.log(`[SPECTATOR] Recent lobbies in database:`, 
        allLobbies.map(l => `#${l.lobby_id} (${l.room_code}, ${l.status})`).join(', '));
    console.log(`[SPECTATOR] Active lobbies in memory:`, 
        Array.from(activeLobbies.keys()).join(', '));
    return callback({ success: false, error: 'Lobby doesn\'t exist' });
}
```

**Impact**: Better debugging information to diagnose issues quickly.

### Fix 4: Server-Side Lobby Restoration

**File**: `server.js` - `join_as_spectator` handler

**Changes** (Already implemented):
- Check both activeLobbies and database for lobby existence
- Restore lobby from database if not in memory
- Load all players from database with proper table name
- Re-add lobby to activeLobbies for future access

### Fix 5: Host Spectator Permission

**File**: `server.js` - `join_as_spectator` handler

**Added**:
- Added fallback to database when lobby not found in `activeLobbies`
- Automatically restores lobby from database with all player data
- Re-adds lobby to `activeLobbies` for future access
- Adds comprehensive logging for debugging

**Key Code**:
```javascript
let lobby = activeLobbies.get(lobbyId);

// If lobby not in memory, check database and try to restore it
if (!lobby) {
    console.log(`[SPECTATOR] Lobby ${lobbyId} not in activeLobbies, checking database...`);
    
    // Query database for lobby details
    const [lobbyRows] = await db.query(
        `SELECT * FROM duel_lobby_rooms WHERE lobby_id = ?`,
        [lobbyId]
    );
    
    if (lobbyRows.length === 0) {
        return callback({ success: false, error: 'Lobby doesn\'t exist' });
    }
    
    // Create lightweight lobby object and restore players
    lobby = {
        lobbyData: lobbyRows[0],
        players: new Map(),
        sockets: new Set(),
        spectators: new Set(),
        createdAt: new Date(lobbyRows[0].created_at)
    };
    
    // Load players from database...
    
    // Restore to activeLobbies
    activeLobbies.set(lobbyId, lobby);
}
```

### 2. Host Spectator Permission (`server.js`)

**Changes**:
- Added special case to always allow host in spectator mode to join
- Host can join even if `allow_spectators` is disabled for the lobby
- Host doesn't need to provide spectator code

**Key Code**:
```javascript
// Check if this is the host in spectator mode (always allowed)
const isHostSpectating = lobby.lobbyData.host_user_id === userId && 
                         (lobby.lobbyData.host_spectator_mode === 1 || 
                          lobby.lobbyData.host_spectator_mode === true);

if (!isHostSpectating) {
    // For non-host spectators, check permissions
    if (!lobby.lobbyData.allow_spectators) {
        return callback({ success: false, error: 'Spectators are not allowed' });
    }
} else {
    console.log(`[SPECTATOR] ✓ Host joining as spectator (always allowed)`);
}
```

### 3. Auto-Enable Spectators for Host (`server.js`)

**Location**: `start_lobby_match` event handler (line ~2375)

**Changes**:
- When host starts match in spectator mode, automatically enable spectators
- Generates spectator code if not already present
- Updates both database and memory

**Key Code**:
```javascript
// If host is in spectator mode but spectators aren't enabled, enable them
if (hostSpectatorMode && !allowSpectators) {
    console.log(`[LOBBY START] Host in spectator mode - enabling spectators automatically`);
    
    if (!spectatorCode) {
        spectatorCode = generateRoomCode();
    }
    
    await db.query(
        `UPDATE duel_lobby_rooms SET allow_spectators = 1, spectator_code = ? WHERE lobby_id = ?`,
        [spectatorCode, lobbyId]
    );
    
    lobby.lobbyData.allow_spectators = 1;
    lobby.lobbyData.spectator_code = spectatorCode;
    allowSpectators = true;
}
```

### 4. Client-Side Retry Logic (`Inspector.vue`)

**Changes**:
- Added exponential backoff retry mechanism (up to 5 attempts)
- Delays between retries: 1s, 2s, 4s, 5s, 5s
- Shows retry progress to user
- Better error messages

**Key Code**:
```javascript
function joinAsSpectator(retryAttempt = 0) {
  socket.emit('join_as_spectator', { 
    lobbyId: parseInt(lobbyId),
    spectatorCode 
  }, (response) => {
    if (response.success) {
      // Success - initialize spectator view
      lobby.value = response.lobby;
      // ...
    } else {
      // Retry with exponential backoff
      if (retryAttempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryAttempt), 5000);
        setTimeout(() => {
          joinAsSpectator(retryAttempt + 1);
        }, delay);
      } else {
        // Max retries reached
        errorMessage.value = 'Failed to join after multiple attempts';
      }
    }
  });
}
```

### 5. Enhanced UI Feedback (`Inspector.vue`)

**Changes**:
- Loading state shows connection progress
- Retry state shows attempt number
- Clear error messages with countdown to redirect
- Visual feedback for each retry attempt

## Testing

### Test Case 1: Host Spectator Mode
1. Create a lobby as host
2. Enable spectator mode from Room Settings
3. Have at least 2 players ready
4. Start the match
5. **Expected**: Host redirected to inspector, successfully joins as spectator

### Test Case 2: Lobby Not in Memory
1. Start a match
2. Restart server (clearing `activeLobbies`)
3. Try to join as spectator
4. **Expected**: Lobby restored from database, spectator joins successfully

### Test Case 3: Connection Timing
1. Start match with slow network
2. Host redirected immediately
3. **Expected**: Retry mechanism kicks in, successfully connects within 5 attempts

### Test Case 4: Spectators Disabled
1. Create lobby with spectators disabled
2. Enable host spectator mode
3. Start match
4. **Expected**: Spectators auto-enabled, host joins successfully

## Logs to Monitor

Key log messages to verify the fix is working:

```
[SPECTATOR] {username} ({userId}) attempting to join lobby {lobbyId} as spectator
[SPECTATOR] Lobby {lobbyId} not in activeLobbies, checking database...
[SPECTATOR] ✓ Found lobby {lobbyId} in database (status: in_progress)
[SPECTATOR] ✓ Restored lobby {lobbyId} to activeLobbies with {n} players
[SPECTATOR] ✓ Host {username} joining as spectator (always allowed)
[LOBBY START] Host in spectator mode - enabling spectators automatically
```

## Files Modified

1. **server.js**
   - `join_as_spectator` handler: Added database fallback and lobby restoration
   - `join_as_spectator` handler: Added host permission bypass
   - `start_lobby_match` handler: Added auto-enable spectators for host

2. **src/Inspector.vue**
   - Added retry mechanism with exponential backoff
   - Enhanced error handling and user feedback
   - Added loading/retry states in template

## Benefits

✅ **Reliability**: Handles edge cases where lobby not in memory  
✅ **User Experience**: No more confusing "lobby doesn't exist" errors  
✅ **Performance**: Automatic retry with smart backoff  
✅ **Debugging**: Comprehensive logging for troubleshooting  
✅ **Host Experience**: Seamless spectator mode activation  
✅ **Flexibility**: Works with various network conditions and timing scenarios

## Future Enhancements

- Add WebSocket reconnection handling
- Implement lobby state synchronization on server restart
- Add visual indicator for spectator connection status
- Persist spectator sessions across page refreshes
