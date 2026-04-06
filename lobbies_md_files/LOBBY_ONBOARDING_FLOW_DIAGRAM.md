# 🔍 Lobby Onboarding Debug Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          LOBBY ONBOARDING FLOW                               │
└─────────────────────────────────────────────────────────────────────────────┘

1. USER NAVIGATES TO LOBBY ONBOARDING
   ↓
   URL: /lobby-onboarding.html?lobby_id=X&problem_id=Y&match_duration=300
   
2. HTML LOADS
   ↓
   🔧 [HTML DEBUG] 1-5: Document loaded, mount point checked
   ├── YELLOW BANNER VISIBLE (waiting for Vue)
   └── DOM Mutation Observer ACTIVE

3. MAIN.JS EXECUTES
   ↓
   🔧 [MAIN.JS DEBUG] 1-10: Vue imports, finds #lobby_onboarding_app
   └── createApp(LobbyOnboarding).mount('#lobby_onboarding_app')
        ↓
        ✅ YELLOW BANNER DISAPPEARS (Vue mounted!)

4. LOBBYONBOARDING.VUE MOUNTS
   ↓
   🔧 [DEBUG] 1-12: Component initialization
   ├── Socket connection check
   ├── User authentication check  
   ├── URL parameter parsing
   └── Match duration setup

5. LOAD PROBLEM
   ↓
   🔧 [DEBUG] 13-23: loadProblem() execution
   ├── Emit: socket.emit('get_problem_by_id', { problem_id })
   │
   │   ┌─────────────────────────────────────┐
   │   │         SERVER SIDE                  │
   │   ├─────────────────────────────────────┤
   │   │ 🔧 [SERVER DEBUG] 1-16              │
   │   │ ├── Request received                │
   │   │ ├── Query database                  │
   │   │ ├── Fetch test cases                │
   │   │ └── Send response                   │
   │   └─────────────────────────────────────┘
   │
   └── Callback: response received (step 17)
       ├── Success check (step 18)
       ├── Store problem data (step 20)
       └── Store test cases (step 21)

6. RENDER COMPLETE
   ↓
   ✅ Problem title visible
   ✅ Problem description visible
   ✅ Test cases visible
   ✅ Code editor visible
   ✅ Timer running

┌─────────────────────────────────────────────────────────────────────────────┐
│                          SPECTATOR MODE FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

1. USER OPENS SPECTATOR LINK
   ↓
   URL: /inspector.html?lobby_id=X&code=SPECTATOR_CODE

2. INSPECTOR.VUE MOUNTS
   ↓
   🔧 [INSPECTOR DEBUG] 1-12: Component initialization
   ├── Socket connection check
   ├── Lobby ID check
   └── Spectator code verification

3. JOIN AS SPECTATOR
   ↓
   Emit: socket.emit('join_as_spectator', { lobbyId, spectatorCode })
   │
   │   ┌─────────────────────────────────────┐
   │   │         SERVER SIDE                  │
   │   ├─────────────────────────────────────┤
   │   │ ├── Verify lobby exists             │
   │   │ ├── Verify spectator code           │
   │   │ ├── Join spectator room             │
   │   │ └── Send lobby data                 │
   │   └─────────────────────────────────────┘
   │
   └── Callback: lobby data received
       ├── Store lobby info
       ├── Store players list
       └── Store problem info

4. LISTEN FOR UPDATES
   ↓
   Socket Events:
   ├── lobby_updated → Update lobby state
   ├── player_code_update → Update player's code
   ├── player_submitted → Mark player as submitted
   └── player_judge_result → Show player's results

5. RENDER SPECTATOR VIEW
   ↓
   ✅ Lobby info visible
   ✅ Players list visible
   ✅ Live code visible (if players coding)
   ✅ Results visible (if players submitted)

┌─────────────────────────────────────────────────────────────────────────────┐
│                          DEBUG CHECKPOINTS                                   │
└─────────────────────────────────────────────────────────────────────────────┘

HTML LAYER (lobby-onboarding.html)
├── Step 1-5: Page load, DOM ready, mount point exists
└── Yellow banner: Visual indicator of Vue mount status

VUE MOUNT LAYER (main.js)
├── Step 1-2: Imports loaded
├── Step 3-5: Mount mappings defined
├── Step 6: Mount point found
└── Step 8: Component mounted successfully

COMPONENT LAYER (LobbyOnboarding.vue)
├── Step 1-12: Initialization & URL parsing
├── Step 13-17: Problem request cycle
└── Step 20-24: Problem data storage

SERVER LAYER (server.js)
├── Step 1-5: Request reception & validation
├── Step 7-10: Database queries
└── Step 13-16: Response construction & sending

INSPECTOR LAYER (Inspector.vue)
├── Step 1-5: Initialization
├── Step 9-11: Socket connection
└── Spectator join & data reception

┌─────────────────────────────────────────────────────────────────────────────┐
│                          FAILURE SCENARIOS                                   │
└─────────────────────────────────────────────────────────────────────────────┘

SCENARIO 1: Yellow Banner Stays Visible
└── STOPS AT: HTML DEBUG Step 5 or MAIN.JS Step 6
    └── CAUSE: Vue can't find mount point or Vue import failed
        └── FIX: Check browser console for errors, verify Vite running

SCENARIO 2: Mount Succeeds But Blank Page
└── STOPS AT: DEBUG Step 12
    └── CAUSE: Missing URL parameters
        └── FIX: Verify URL has lobby_id and problem_id parameters

SCENARIO 3: Problem Doesn't Load
└── STOPS AT: DEBUG Step 17 (no response)
    └── CAUSE: Server not responding or socket disconnected
        └── FIX: Check socket.connected, restart server

SCENARIO 4: Problem Not Found
└── SERVER DEBUG shows Step 9: Problem not found
    └── CAUSE: problem_id doesn't exist in database
        └── FIX: Check problems table, verify problem_id

SCENARIO 5: Spectator Can't Connect
└── STOPS AT: INSPECTOR DEBUG Step 11
    └── CAUSE: Socket connection failed or lobby doesn't exist
        └── FIX: Verify lobby exists, check spectator code

┌─────────────────────────────────────────────────────────────────────────────┐
│                          QUICK REFERENCE                                     │
└─────────────────────────────────────────────────────────────────────────────┘

🔧 = Debug log (all debug logs have this emoji)
✅ = Success indicator
❌ = Error indicator
⏩ = Skipped operation

[HTML DEBUG] = lobby-onboarding.html inline scripts
[MAIN.JS DEBUG] = src/main.js Vue mounting
[DEBUG] = LobbyOnboarding.vue component
[INSPECTOR DEBUG] = Inspector.vue component
[SERVER DEBUG] = server.js backend

Total Debug Steps:
- HTML: 10 steps
- Main.js: 10 steps
- LobbyOnboarding: 24 steps
- Inspector: 12 steps
- Server: 16 steps
= 72 total diagnostic checkpoints!

┌─────────────────────────────────────────────────────────────────────────────┐
│                          TESTING COMMAND                                     │
└─────────────────────────────────────────────────────────────────────────────┘

# 1. Start server
node server.js

# 2. Open browser with console (F12)
http://localhost:3000/lobbies.html

# 3. Create lobby → Start match → Watch console logs

# 4. Look for these patterns:
#    - Numbers should go 1, 2, 3, 4... in sequence
#    - Yellow banner should disappear
#    - Problem title should appear

# 5. If stuck, note the last step number and check the guide!
```

## Legend

- **Solid lines** (─│┌└) = Required flow
- **Dashed lines** (╎╏) = Event listeners
- **Arrows** (↓→) = Flow direction
- **Boxes** (┌─┐) = System boundaries
- **Checkpoints** (├──) = Debug steps

## Reading the Flow

1. Start at the top (USER NAVIGATES)
2. Follow the arrows (↓)
3. Each section shows:
   - What happens
   - Which debug logs appear
   - What to check
4. If flow stops, that's your bug location!

## Pro Tip

Open this file in VS Code with Markdown Preview (Ctrl+Shift+V) for better formatting!
