# 🔄 How Module Flow Works: Visual Guide

## Complete Example: From User Submission to Database Update

Let's trace **exactly** what happens when a user submits code, showing how modules work together.

---

## The Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER SUBMITS CODE                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ server.js - Socket Handler                                   │
│                                                              │
│ socket.on('submit_code', async (payload) => {               │
│     // Step 1: Extract data                                 │
│     const { code, language, user_id } = payload;            │
│                                                              │
│     console.log('Received code from user:', user_id);       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
         ┌─────────────────────────────┐
         │  Need to check if safe?     │
         │  Call security module!      │
         └─────────────┬───────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ server.js                                                    │
│                                                              │
│     // Step 2: Import security function (at top of file)    │
│     const { isCodeSafe } = require('./utils/security');     │
│                                                              │
│     // Step 3: Call the function                            │
│     if (!isCodeSafe(code, language)) {                      │
│         socket.emit('error', 'Forbidden commands');         │
│         return;  // Stop here if unsafe                     │
│     }                                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓ (Data flows to utils/security.js)
┌─────────────────────────────────────────────────────────────┐
│ utils/security.js                                            │
│                                                              │
│ function isCodeSafe(code, language) {                       │
│     console.log('Checking security for:', language);        │
│                                                              │
│     // Check blacklist                                      │
│     if (code.includes('import os')) {                       │
│         return false;  // Dangerous!                        │
│     }                                                        │
│                                                              │
│     return true;  // Safe!                                  │
│ }                                                            │
│                                                              │
│ module.exports = { isCodeSafe };                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓ (Returns true/false back to server.js)
┌─────────────────────────────────────────────────────────────┐
│ server.js                                                    │
│                                                              │
│     // Step 4: Code is safe, continue...                    │
│     console.log('Code is safe! Running tests...');          │
│                                                              │
│     // Run tests (simplified)                               │
│     const testsPassed = 10;                                 │
│     const totalTests = 13;                                  │
│     const isWinner = true;                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
         ┌─────────────────────────────┐
         │  Need to calculate points?  │
         │  Call points module!        │
         └─────────────┬───────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ server.js                                                    │
│                                                              │
│     // Step 5: Import points functions                      │
│     const { calculateDuelPointsChange, calculateCodePoints }│
│         = require('./utils/pointsCalculator');              │
│                                                              │
│     // Step 6: Calculate points                             │
│     const dpChange = calculateDuelPointsChange(             │
│         isWinner,    // true                                │
│         false,       // not a tie                           │
│         10,          // tests passed                        │
│         13           // total tests                         │
│     );                                                       │
│                                                              │
│     const xp = calculateCodePoints(10, 13);                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓ (Data flows to utils/pointsCalculator.js)
┌─────────────────────────────────────────────────────────────┐
│ utils/pointsCalculator.js                                    │
│                                                              │
│ function calculateDuelPointsChange(isWinner, isTie, passed, │
│                                    total) {                 │
│     const passingRate = passed / total;  // 10/13 = 0.77    │
│                                                              │
│     if (isWinner) {                                         │
│         return Math.round(10 + (passingRate * 20));         │
│         // Returns: 10 + (0.77 * 20) = 25                   │
│     }                                                        │
│ }                                                            │
│                                                              │
│ function calculateCodePoints(passed, total) {               │
│     return Math.round((passed / total) * 10);               │
│     // Returns: (10/13) * 10 = 8                            │
│ }                                                            │
│                                                              │
│ module.exports = {                                           │
│     calculateDuelPointsChange,                              │
│     calculateCodePoints                                     │
│ };                                                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓ (Returns: dpChange=25, xp=8)
┌─────────────────────────────────────────────────────────────┐
│ server.js                                                    │
│                                                              │
│     // Step 7: Got the results!                             │
│     console.log('DP Change:', dpChange);  // 25             │
│     console.log('XP Earned:', xp);        // 8              │
│                                                              │
│     // Step 8: Update database                              │
│     await updatePlayerStats(db, user_id, xp, dpChange);     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
         ┌─────────────────────────────┐
         │  Need to update database?   │
         │  Use existing function      │
         └─────────────┬───────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ server.js                                                    │
│                                                              │
│     // Step 9: Database update (this is still in server.js) │
│     // Could be moved to database/operations.js later!      │
│     async function updatePlayerStats(db, userId, xp, dp) {  │
│         await db.query(                                     │
│             'UPDATE statistic SET ... WHERE user_id = ?',   │
│             [xp, dp, userId]                                │
│         );                                                   │
│     }                                                        │
│                                                              │
│     // Step 10: Send result to user                         │
│     socket.emit('judge_result', {                           │
│         passed: 10,                                         │
│         total: 13,                                          │
│         dpChange: 25,                                       │
│         xpEarned: 8                                         │
│     });                                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                    USER SEES RESULT                         │
│              "You earned 25 DP and 8 XP!"                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Breakdown with Code

### Step 1: User Submits Code

**Frontend (browser):**
```javascript
// Onboarding.vue
socket.emit('submit_code', {
    code: 'def solution(x): return x + 1',
    language: 'python',
    user_id: 123
});
```

### Step 2: Server Receives Data

**server.js:**
```javascript
socket.on('submit_code', async (payload) => {
    const { code, language, user_id } = payload;
    
    console.log('User', user_id, 'submitted', language, 'code');
    // Logs: User 123 submitted python code
```

### Step 3: Security Check (Module Call)

**server.js continues:**
```javascript
    // This line JUMPS to utils/security.js
    if (!isCodeSafe(code, language)) {
        socket.emit('error', 'Forbidden commands detected!');
        return;
    }
    // If we get here, code is safe ✅
```

**What happens inside the module:**
```javascript
// utils/security.js
function isCodeSafe(code, language) {
    console.log('[SECURITY] Checking code...');
    
    // Check if code contains 'import os'
    if (code.includes('import os')) {
        console.log('[SECURITY] Blocked: import os');
        return false;  // This false goes back to server.js
    }
    
    console.log('[SECURITY] Code is safe');
    return true;  // This true goes back to server.js
}
```

**Back in server.js:**
```javascript
    // Result comes back here:
    if (!isCodeSafe(code, language)) {  // Got 'true'
        // This block is SKIPPED because !true = false
    }
    // Continue to next step...
```

### Step 4: Run Tests

**server.js:**
```javascript
    // Simplified - normally you'd run actual tests
    const testResults = await runTests(code, testCases);
    
    const testsPassed = 10;
    const totalTests = 13;
    const isWinner = true;
```

### Step 5: Calculate Points (Module Call)

**server.js:**
```javascript
    // This line JUMPS to utils/pointsCalculator.js
    const dpChange = calculateDuelPointsChange(
        isWinner,     // true
        false,        // not a tie
        testsPassed,  // 10
        totalTests    // 13
    );
    
    // This also JUMPS to the module
    const xp = calculateCodePoints(testsPassed, totalTests);
```

**What happens inside the module:**
```javascript
// utils/pointsCalculator.js

// First function call:
function calculateDuelPointsChange(isWinner, isTie, passed, total) {
    console.log('[CALC] Winner:', isWinner, 'Passed:', passed, '/', total);
    // Logs: [CALC] Winner: true Passed: 10 / 13
    
    const passingRate = passed / total;  // 10 / 13 = 0.769...
    
    if (isWinner) {
        const result = Math.round(10 + (passingRate * 20));
        // result = Math.round(10 + (0.769 * 20))
        // result = Math.round(10 + 15.38)
        // result = Math.round(25.38)
        // result = 25
        
        console.log('[CALC] Result:', result);
        return 25;  // This 25 goes back to server.js
    }
}

// Second function call:
function calculateCodePoints(passed, total) {
    console.log('[CALC] XP for', passed, '/', total);
    // Logs: [CALC] XP for 10 / 13
    
    const result = Math.round((passed / total) * 10);
    // result = Math.round((10 / 13) * 10)
    // result = Math.round(0.769 * 10)
    // result = Math.round(7.69)
    // result = 8
    
    return 8;  // This 8 goes back to server.js
}
```

**Back in server.js:**
```javascript
    // Values come back here:
    const dpChange = 25;  // ← Came from module
    const xp = 8;         // ← Came from module
    
    console.log('Calculated:', dpChange, 'DP and', xp, 'XP');
    // Logs: Calculated: 25 DP and 8 XP
```

### Step 6: Update Database

**server.js:**
```javascript
    // Update player stats in database
    await db.query(`
        UPDATE statistic 
        SET statistic_duel_point = statistic_duel_point + ?,
            statistic_level_xp = statistic_level_xp + ?
        WHERE user_id = ?
    `, [dpChange, xp, user_id]);
    
    console.log('Database updated for user', user_id);
```

### Step 7: Send Result to User

**server.js:**
```javascript
    // Send back to browser
    socket.emit('judge_result', {
        success: true,
        passed: testsPassed,
        total: totalTests,
        dpChange: dpChange,
        xpEarned: xp
    });
    
    console.log('Result sent to user');
});  // End of socket.on handler
```

### Step 8: User Sees Result

**Frontend (browser):**
```javascript
// Onboarding.vue
socket.on('judge_result', (data) => {
    console.log('Got result:', data);
    // Shows: { success: true, passed: 10, total: 13, dpChange: 25, xpEarned: 8 }
    
    alert(`You earned ${data.dpChange} DP and ${data.xpEarned} XP!`);
});
```

---

## Understanding the Data Flow

### How Data Moves Between Files

```
Step 1: server.js calls function
┌─────────────────────────┐
│ server.js               │
│                         │
│ const result =          │
│   isCodeSafe(code, 'py')│──┐
│                         │  │
└─────────────────────────┘  │
                             │ Data flows →
                             │ (code='x+y', language='py')
                             ↓
Step 2: Module receives data, processes it
                    ┌────────────────────────┐
                    │ utils/security.js      │
                    │                        │
                    │ function isCodeSafe(   │
                    │   code,      ← 'x+y'  │
                    │   language   ← 'py'   │
                    │ ) {                    │
                    │   // Check code...     │
                    │   return true;         │
                    │ }                      │
                    └────────────────────────┘
                             │
                             │ Result flows back ←
                             │ (true)
                             ↓
Step 3: server.js receives result
┌─────────────────────────┐
│ server.js               │
│                         │
│ const result = true ←───┘
│                         │
│ if (!result) {          │
│   // This is skipped    │
│ }                       │
└─────────────────────────┘
```

---

## Variable Scope: What Can See What?

### Example 1: Variables in Modules are Isolated

```javascript
// utils/security.js
const SECRET_KEY = 'abc123';  // Only this file can see this

function isCodeSafe(code) {
    console.log('Secret:', SECRET_KEY);  // ✅ Works
    return true;
}

module.exports = { isCodeSafe };  // Only export function, NOT SECRET_KEY
```

```javascript
// server.js
const { isCodeSafe } = require('./utils/security');

isCodeSafe('test');              // ✅ Works
console.log(SECRET_KEY);         // ❌ Error: SECRET_KEY is not defined
```

**Why?** `SECRET_KEY` stays private in the module!

### Example 2: Parameters Pass Data

```javascript
// utils/calculator.js
function add(a, b) {
    return a + b;
}

module.exports = { add };
```

```javascript
// server.js
const { add } = require('./utils/calculator');

const x = 5;
const y = 3;
const result = add(x, y);  // Pass x and y as parameters

console.log(result);  // 8
```

**Data flow:**
1. `x=5, y=3` exist in server.js
2. Call `add(x, y)` → sends 5 and 3 to module
3. Module receives as `a=5, b=3`
4. Module returns `8`
5. Server receives `result=8`

---

## Memory Diagram: What's Loaded Where?

```
┌─────────────────────────────────────────────────────┐
│ Node.js Memory                                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ server.js (loaded once)                     │   │
│ │                                             │   │
│ │ - Variable: db (database connection)       │   │
│ │ - Variable: io (socket.io server)          │   │
│ │ - Import: isCodeSafe ──┐                   │   │
│ │ - Import: calcPoints ──┼──┐                │   │
│ └─────────────────────────┼──┼────────────────┘   │
│                           │  │                     │
│                           │  │ References point to:│
│                           ↓  ↓                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ utils/security.js (loaded once)             │   │
│ │                                             │   │
│ │ - Constant: BLACKLIST (array)              │   │
│ │ - Function: isCodeSafe ←──────────────┐    │   │
│ │ - Function: sanitizeInput              │    │   │
│ └────────────────────────────────────────────┘   │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ utils/pointsCalculator.js (loaded once)     │   │
│ │                                             │   │
│ │ - Function: calcDuelPoints ←───────────┐   │   │
│ │ - Function: calcCodePoints             │   │   │
│ └────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘

When you call isCodeSafe() from server.js:
1. Node looks up the reference
2. Finds the function in utils/security.js memory
3. Executes it there
4. Returns result to server.js
```

---

## Real Console Output Example

Let's see what actually prints when everything runs:

```javascript
// Terminal output when user submits code:

Server started on port 3000
[SUBMIT] User 123 submitted python code
[SECURITY] Checking code: python
[SECURITY] Checking for dangerous patterns...
[SECURITY] Code is safe ✓
[JUDGE] Running tests...
[JUDGE] Passed: 10/13
[CALC] Calculating DP: isWinner=true, passed=10, total=13
[CALC] Passing rate: 0.769
[CALC] Result: 25 DP
[CALC] Calculating XP: passed=10, total=13
[CALC] Result: 8 XP
[DB] Updating user 123: +25 DP, +8 XP
[DB] Update successful
[SOCKET] Sending result to user 123
✓ Match completed successfully
```

**Each line came from a different place:**
- `[SUBMIT]` → server.js
- `[SECURITY]` → utils/security.js
- `[JUDGE]` → server.js
- `[CALC]` → utils/pointsCalculator.js
- `[DB]` → server.js
- `[SOCKET]` → server.js

---

## Summary: The Magic Behind Modules

1. **`require()` loads the file once**
   - File is read and executed
   - Result is cached (not loaded again)
   
2. **`module.exports` makes things public**
   - Only exported things are accessible
   - Everything else stays private
   
3. **Function calls cross file boundaries**
   - JavaScript doesn't care which file the function is in
   - It just executes it and returns the result
   
4. **Each file has its own scope**
   - Variables in one file don't affect another
   - Unless you explicitly pass them as parameters

**It's like having multiple workers:**
- Security Worker: "Is this code safe?"
- Calculator Worker: "How many points?"
- Database Worker: "Save this data!"
- Main Coordinator (server.js): Tells everyone what to do

Each worker does their job and reports back! 🎯
