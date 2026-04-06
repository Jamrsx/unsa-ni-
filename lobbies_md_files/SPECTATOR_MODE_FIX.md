# Spectator Mode Host Role Fix

## Bug Fixed
**Issue**: Host was always added as a player even when spectator mode was enabled.

**Root Cause**: The `join_lobby` handler didn't check if the host wanted to spectate instead of play.

## Solution Implemented

### 1. Database Changes
Added new column to persist host's role preference:
```sql
ALTER TABLE duel_lobby_rooms 
ADD COLUMN host_spectator_mode TINYINT(1) DEFAULT 0 
COMMENT 'Whether the host is in spectator mode (not playing)';
```

**Migration File**: `sql/add_host_spectator_mode.sql`

### 2. Server Changes (server.js)

#### A. New Socket Handler: `set_host_role`
- Allows host to switch between 'player' and 'spectator' roles
- When switching to spectator:
  - Removes host from players list (memory + database)
  - Adds host to spectators list
  - Sets `host_spectator_mode = true` in lobbyData and database
- When switching to player:
  - Removes from spectators
  - Adds host back to players with `isReady = true`
  - Sets `host_spectator_mode = false`

#### B. Modified `join_lobby` Handler
Added check before adding host as player:
```javascript
// If host is in spectator mode, don't add them as player
if (isHost && lobby.lobbyData.host_spectator_mode) {
    console.log(`[LOBBY] Host ${username} is in spectator mode, not adding as player`);
    return callback({ 
        success: true, 
        lobby: getLobbyDetails(lobbyId),
        chatHistory: [],
        isSpectatorMode: true
    });
}
```

#### C. Updated `create_lobby`
- Initializes `host_spectator_mode = 0` in database INSERT
- Adds `host_spectator_mode: false` to in-memory lobbyData

### 3. Frontend Changes

#### A. Room Settings Panel (room-setting-panel.vue)
Added host role selector UI:
- **Radio buttons**: "Join as Player" 🎮 vs "Spectate Only" 👁️
- **Visual indicators**: 
  - Active state highlighting
  - Role descriptions
  - Warning message when spectating
- **Auto-sync**: Changes emit `set_host_role` to server
- **State persistence**: Initializes based on whether host is in players list

#### B. Room Component (Room.vue)
- Passes `currentUserId` prop to RoomSettingPanel
- Enables proper role initialization

## How to Test

### Prerequisites
1. Run database migration:
   ```sql
   source sql/add_host_spectator_mode.sql
   ```
2. Restart server: `npm start`

### Test Steps

#### Scenario 1: Host joins as player (default)
1. Create a new lobby as host
2. In Room Settings, verify "Join as Player" is selected
3. Check player list - host should appear with crown 👑
4. Verify ready status shows checkmark ✓

#### Scenario 2: Host switches to spectator
1. In Room Settings, select "Spectate Only"
2. Page should refresh automatically
3. Check player list - host should NOT appear
4. Open Inspector view (spectator link)
5. Verify host can see all players' code
6. Verify host cannot join as player until switching back

#### Scenario 3: Host switches back to player
1. While in spectator mode, select "Join as Player" in Room Settings
2. Host should reappear in player list with crown 👑
3. Ready status should be automatically set
4. Player count should increase by 1

#### Scenario 4: Spectator mode persistence
1. Create lobby, enable spectators, switch to "Spectate Only"
2. Leave room and rejoin using room code
3. Verify host remains in spectator mode (not added to players)
4. Verify `host_spectator_mode` flag persists

#### Scenario 5: Match starting
1. Host in spectator mode
2. Add 2 other players
3. Both players click ready
4. Verify match can start without host
5. Verify host doesn't receive onboarding page (only players do)

## Key Features

✅ **Host role selection**: Clear UI for choosing player vs spectator role  
✅ **Database persistence**: Role choice saved in `host_spectator_mode` column  
✅ **Auto-refresh**: Page reloads when switching to spectator mode  
✅ **Player slot management**: Host doesn't take a player slot when spectating  
✅ **Spectator access**: Host can view all players' code in real-time  
✅ **Role flexibility**: Host can switch back to player anytime  
✅ **Visual feedback**: Warning message when in spectator mode  

## Technical Details

### Data Flow
1. **Role Change**: User clicks radio button → Vue watch() triggers → emit('set_host_role')
2. **Server Processing**: 
   - Validates host permission
   - Updates database (`host_spectator_mode` column)
   - Updates in-memory lobby (`lobbyData.host_spectator_mode`)
   - Removes/adds host from players list
   - Broadcasts lobby update
3. **Client Update**: 
   - Receives lobby_updated event
   - Refreshes UI
   - For spectator mode, triggers page reload

### Important Flags
- `lobby.lobbyData.host_spectator_mode` (boolean/int): In-memory flag
- `duel_lobby_rooms.host_spectator_mode` (TINYINT): Database column
- `hostRole` (ref): Vue component state ('player' or 'spectator')

### Socket Events
- `set_host_role`: Change host role (player ↔ spectator)
- `lobby_updated`: Broadcasts lobby state changes to all players
- `spectator_count_update`: Updates spectator count in UI

## Known Behaviors

1. **Auto-refresh on spectator switch**: Page reloads to ensure clean state
2. **Host always ready**: When host switches to player, `isReady` is automatically `true`
3. **Spectator link visibility**: Only shows when spectator mode is enabled
4. **Role initialization**: Based on presence in players list on component mount

## Files Modified

- `sql/add_host_spectator_mode.sql` (NEW)
- `server.js` (modified: create_lobby, join_lobby, added set_host_role handler)
- `src/components/room-setting-panel.vue` (added host role selector)
- `src/Room.vue` (pass currentUserId prop)

## Debugging Tips

Check server logs for:
```
[LOBBY] Host <username> switched to SPECTATOR mode in lobby <id>
[LOBBY] Host <username> is in spectator mode, not adding as player
[LOBBY] Host <username> switched to PLAYER mode in lobby <id>
```

Check browser console for:
```
[RoomSettings] Host role changed to: spectator
[RoomSettings] Host role updated successfully
```

## Next Steps (Optional Enhancements)

- [ ] Add toast notification when switching roles
- [ ] Show spectator icon next to host in spectator list
- [ ] Add "kick spectator" option for host
- [ ] Limit number of spectators
- [ ] Add spectator chat (separate from player chat)
