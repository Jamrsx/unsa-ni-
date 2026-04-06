# 📚 Detailed Refactoring Tutorial: Breaking Down server.js

## Table of Contents
1. [Understanding the Problem](#understanding-the-problem)
2. [What is Modularization?](#what-is-modularization)
3. [How Node.js Modules Work](#how-nodejs-modules-work)
4. [Step-by-Step Refactoring Process](#step-by-step-refactoring-process)
5. [Real Example Walkthrough](#real-example-walkthrough)
6. [Testing Your Changes](#testing-your-changes)
7. [Common Mistakes & Solutions](#common-mistakes--solutions)

---

## Understanding the Problem

### Current Situation: Everything in One Giant File

Your `server.js` file is **4,088 lines long**. Imagine a book with 4,088 pages where every single instruction for your application is written.

**Problems with this approach:**

```
server.js (4088 lines)
├── Database connection setup
├── Authentication logic
├── Points calculation functions
├── Security checking functions
├── Match creation logic
├── Matchmaking queue management
├── Code execution and judging
├── Socket.IO event handlers
├── Database update functions
├── Lobby management
├── Timer calculations
└── ... 50+ other things!
```

**Why this is bad:**

1. **🔍 Hard to Find Stuff**
   - Want to change DP calculation? Good luck finding it among 4000 lines!
   - Takes 5-10 minutes just to scroll and find the right function

2. **🐛 Easy to Break Things**
   - Change one thing → accidentally break 5 other things
   - Functions are all mixed together with no clear separation

3. **👥 Team Collaboration Issues**
   - Two people can't work on the same file without conflicts
   - Merge conflicts are nightmares

4. **🧪 Can't Test Individually**
   - Can't test "just the points calculator" - need to run entire server
   - Bugs hide in the massive file

---

## What is Modularization?

**Modularization = Breaking one big file into many small, focused files**

Think of it like organizing a messy room:

### Before (Messy Room):
```
Everything in one pile:
- Books, clothes, dishes, tools, papers all mixed together
- Takes 30 minutes to find your keys
```

### After (Organized):
```
Organized drawers:
├── Drawer 1: Clothes
├── Drawer 2: Books  
├── Drawer 3: Tools
└── Drawer 4: Papers

Find your keys in 10 seconds!
```

### Applied to Code:

**Before:**
```javascript
// server.js - EVERYTHING HERE
function calculatePoints(x) { ... }
function checkSecurity(code) { ... }
function updateDatabase(user) { ... }
socket.on('submit', (data) => { ... 500 lines ... });
socket.on('join', (data) => { ... 300 lines ... });
// ... 3500 more lines ...
```

**After:**
```javascript
// server.js - JUST COORDINATION
const { calculatePoints } = require('./utils/pointsCalculator');
const { checkSecurity } = require('./utils/security');
const { updateDatabase } = require('./database/operations');

socket.on('submit', (data) => {
    if (!checkSecurity(data.code)) return;
    const points = calculatePoints(data.tests);
    updateDatabase(data.userId, points);
});
```

**Result:** server.js goes from 4088 lines → 500 lines!

---

## How Node.js Modules Work

### The Core Concept: Export & Require

Think of modules like **Lego bricks**:
- Each brick (module) has a specific shape and function
- You can snap bricks together to build something bigger
- You can reuse the same brick in multiple places

### Part 1: Creating a Module (Exporting)

**File: `utils/calculator.js`**

```javascript
// ============================================
// STEP 1: Write your functions
// ============================================
function add(a, b) {
    return a + b;
}

function subtract(a, b) {
    return a - b;
}

function multiply(a, b) {
    return a * b;
}

// ============================================
// STEP 2: Decide what to share (export)
// ============================================
// This is like putting items in a box that others can open

module.exports = {
    add: add,           // Export the add function
    subtract: subtract, // Export the subtract function
    multiply: multiply  // Export the multiply function
};

// Short version (same thing):
module.exports = { add, subtract, multiply };
```

**What `module.exports` means:**
- `module` = The current file
- `exports` = The "box" of things you're sharing
- `{ add, subtract, multiply }` = The items you're putting in the box

### Part 2: Using a Module (Requiring)

**File: `server.js`**

```javascript
// ============================================
// STEP 1: Import (require) the module
// ============================================
const calculator = require('./utils/calculator');

// Now 'calculator' is an object containing:
// {
//     add: function add(a, b) { ... },
//     subtract: function subtract(a, b) { ... },
//     multiply: function multiply(a, b) { ... }
// }

// ============================================
// STEP 2: Use the functions
// ============================================
const result1 = calculator.add(5, 3);        // 8
const result2 = calculator.subtract(10, 4);  // 6
const result3 = calculator.multiply(7, 2);   // 14
```

**Alternative: Destructuring (Cleaner)**

```javascript
// Instead of:
const calculator = require('./utils/calculator');
const sum = calculator.add(5, 3);

// You can do:
const { add, subtract, multiply } = require('./utils/calculator');
const sum = add(5, 3);  // Cleaner!
```

**What destructuring means:**
```javascript
// This line:
const { add, subtract } = require('./utils/calculator');

// Is equivalent to:
const calculator = require('./utils/calculator');
const add = calculator.add;
const subtract = calculator.subtract;
```

### Path Syntax Explained

```javascript
// RELATIVE PATHS (your own files)
require('./utils/calculator')      // Same directory or subdirectory
require('../utils/calculator')     // Go up one directory
require('../../utils/calculator')  // Go up two directories

// PACKAGE PATHS (installed via npm)
require('express')                 // From node_modules folder
require('socket.io')              // From node_modules folder
```

**Visual Example:**
```
project/
├── server.js                  ← You are here
├── utils/
│   └── calculator.js         ← require('./utils/calculator')
├── database/
│   └── operations.js         ← require('./database/operations')
└── node_modules/
    └── express/              ← require('express')
```

---

## Step-by-Step Refactoring Process

### The 5-Step Formula (Do This Every Time)

#### Step 1: Identify a Group of Related Functions

Look for functions that do similar things:

```javascript
// In server.js - These are all about POINTS
function calculateDuelPointsChange(isWinner, isTie, tests, total) { ... }
function calculateCodePoints(passed, total) { ... }
function calculateLevel(totalXP) { ... }
```

**How to identify:**
- Functions with similar names (calculateXXX)
- Functions that work with the same data (points, XP)
- Functions that solve the same problem (scoring system)

#### Step 2: Create a New Module File

```bash
# Create folder if it doesn't exist
mkdir utils

# Create the module file
New-Item utils/pointsCalculator.js
```

#### Step 3: Copy Functions to Module

**Copy from `server.js`:**

```javascript
// server.js (BEFORE - lines 283-318)

// Calculate Duel Points change for ranked matches
function calculateDuelPointsChange(isWinner, isTie, testsPassed, totalTests) {
    if (isTie) return 0;
    
    const passingRate = testsPassed / totalTests;
    
    if (!isWinner) {
        const dpChange = Math.round(-25 + (passingRate * 15));
        return Math.min(dpChange, -10);
    }
    
    return Math.round(10 + (passingRate * 20));
}

// Calculate Code Points (XP)
function calculateCodePoints(testsPassed, totalTests) {
    return Math.round((testsPassed / totalTests) * 10);
}
```

**Paste to `utils/pointsCalculator.js`:**

```javascript
/**
 * Points Calculator Module
 * All functions related to calculating points, XP, and levels
 */

// Calculate Duel Points change for ranked matches
function calculateDuelPointsChange(isWinner, isTie, testsPassed, totalTests) {
    if (isTie) return 0;
    
    const passingRate = testsPassed / totalTests;
    
    if (!isWinner) {
        const dpChange = Math.round(-25 + (passingRate * 15));
        return Math.min(dpChange, -10);
    }
    
    return Math.round(10 + (passingRate * 20));
}

// Calculate Code Points (XP)
function calculateCodePoints(testsPassed, totalTests) {
    return Math.round((testsPassed / totalTests) * 10);
}

// CRITICAL: Export them!
module.exports = {
    calculateDuelPointsChange,
    calculateCodePoints
};
```

#### Step 4: Import in server.js

**At the top of `server.js` (with other requires):**

```javascript
// server.js - Top of file
const express = require('express');
const { Server } = require('socket.io');
// ... other requires ...

// ✨ ADD THIS LINE:
const { calculateDuelPointsChange, calculateCodePoints } = require('./utils/pointsCalculator');
```

#### Step 5: Delete Old Code & Test

1. **Delete** the old function definitions from server.js
2. **Save** both files
3. **Restart** server: `node server.js`
4. **Test** that it still works

---

## Real Example Walkthrough

### Let's Refactor the Security Functions

#### 🎯 Goal: Move security code to `utils/security.js`

### Current Code in server.js (Lines 2765-2796)

```javascript
// server.js - BEFORE

// BLOCK HACK COMMANDS
function isCodeSafe(code, language) {
    // Allow safe eval variants before checking blacklist
    if (language === 'python' && code.includes('ast.literal_eval(')) {
        const codeWithoutLiteralEval = code.replace(/ast\.literal_eval\(/g, 'SAFE_LITERAL_EVAL(');
        
        const blacklists = {
            python: ["import os", "import sys", "subprocess", "eval(", "exec(", "open('", 'open("', "socket"],
            php: ["exec(", "shell_exec", "system(", "passthru", "proc_open", "curl_exec", "unlink", "fopen"],
            java: ["Runtime.getRuntime", "ProcessBuilder", "FileWriter", "Socket", "ServerSocket"]
        };
        
        return !blacklists[language]?.some(word => codeWithoutLiteralEval.includes(word));
    }
    
    const blacklists = {
        python: ["import os", "import sys", "subprocess", "eval(", "exec(", "open('", 'open("', "socket"],
        php: ["exec(", "shell_exec", "system(", "passthru", "proc_open", "curl_exec", "unlink", "fopen"],
        java: ["Runtime.getRuntime", "ProcessBuilder", "FileWriter", "Socket", "ServerSocket"]
    };

    return !blacklists[language]?.some(word => code.includes(word));
}
```

### Step 1: Analyze the Code

**What does this function do?**
- Takes code and language as input
- Checks if code contains dangerous commands
- Returns true (safe) or false (dangerous)

**What does it depend on?**
- Nothing! It's self-contained
- Perfect for extraction

**What depends on it?**
```javascript
// Used in submit_code handler:
if (!isCodeSafe(source_code, language)) {
    socket.emit("judge_result", { success: false, message: "Forbidden commands detected!" });
    return;
}
```

### Step 2: Create the Module File

Create `utils/security.js`:

```javascript
/**
 * Security Module
 * Handles all security checks for user-submitted code
 * 
 * Purpose: Prevent users from running dangerous commands
 * that could harm the server
 */

// ============================================
// CONSTANTS
// ============================================
// List of dangerous commands/patterns to block
const BLACKLIST = [
    'import os',        // Can access file system
    'import sys',       // Can modify system
    'import subprocess',// Can run shell commands
    '__import__',       // Dynamic imports
    'exec(',            // Execute arbitrary code
    "eval('",           // Evaluate strings as code
    'eval("',
    'open(',            // Open files
    'file(',            // Access files
    'input(',           // Can hang the program
    'raw_input(',
    'compile(',         // Compile arbitrary code
    '__builtins__',     // Access to all built-in functions
    'globals(',         // Access global variables
    'locals(',          // Access local variables
    'vars(',            // Get variables
    'dir(',             // List directory contents
    'execfile(',        // Execute file
    'reload(',          // Reload modules
    // ... more dangerous patterns
];

// ============================================
// MAIN SECURITY FUNCTION
// ============================================
/**
 * Check if submitted code is safe to execute
 * @param {string} code - The code to check
 * @param {string} language - Programming language (python, php, javascript, java)
 * @returns {boolean} - true if safe, false if dangerous
 */
function isCodeSafe(code, language) {
    if (!code) return true; // Empty code is safe
    
    const lowerCode = code.toLowerCase(); // Case-insensitive check
    
    // Check each blacklisted pattern
    for (const forbidden of BLACKLIST) {
        if (lowerCode.includes(forbidden.toLowerCase())) {
            // SPECIAL CASE: ast.literal_eval is safe
            if (forbidden === "eval('" || forbidden === 'eval("') {
                if (lowerCode.includes('ast.literal_eval(')) {
                    continue; // Skip this check
                }
            }
            
            console.log(`[SECURITY] Blocked code containing: "${forbidden}"`);
            return false; // Found dangerous pattern!
        }
    }
    
    // Language-specific checks
    if (language === 'php') {
        // Block PHP superglobals
        if (lowerCode.includes('$_get') || lowerCode.includes('$_post') || 
            lowerCode.includes('$_server') || lowerCode.includes('$_cookie')) {
            console.log('[SECURITY] Blocked PHP superglobals');
            return false;
        }
    }
    
    if (language === 'javascript' || language === 'java') {
        // Block Java Runtime execution
        if (lowerCode.includes('java.lang.runtime') || 
            lowerCode.includes('runtime.getruntime')) {
            console.log('[SECURITY] Blocked Java Runtime execution');
            return false;
        }
    }
    
    return true; // All checks passed!
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Sanitize user input to prevent injection attacks
 * @param {string} input - User input to sanitize
 * @returns {string} - Cleaned input
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    
    // Remove null bytes (can cause injection attacks)
    let sanitized = input.replace(/\0/g, '');
    
    // Limit length to prevent DoS attacks
    sanitized = sanitized.substring(0, 10000);
    
    return sanitized;
}

/**
 * Validate match ID format
 * @param {any} matchId - Match ID to validate
 * @returns {boolean} - true if valid
 */
function isValidMatchId(matchId) {
    return Number.isInteger(matchId) && matchId > 0;
}

/**
 * Validate user ID format
 * @param {any} userId - User ID to validate
 * @returns {boolean} - true if valid
 */
function isValidUserId(userId) {
    return Number.isInteger(userId) && userId > 0;
}

// ============================================
// EXPORT FUNCTIONS
// ============================================
// Share these functions with other files
module.exports = {
    isCodeSafe,          // Main security function
    sanitizeInput,       // Input sanitization
    isValidMatchId,      // Match ID validator
    isValidUserId,       // User ID validator
    BLACKLIST            // Export for debugging (optional)
};
```

### Step 3: Import in server.js

**Find this section in server.js (around line 18):**

```javascript
// server.js - BEFORE
const { AbandonmentTracker } = require("./src/js/conn/abandonment_tracker.js");
const { soloSocket } = require("./src/js/conn/solo.js");
const registerHeaderSocket = require("./src/js/conn/header_socket.js");
```

**Add the import:**

```javascript
// server.js - AFTER
const { AbandonmentTracker } = require("./src/js/conn/abandonment_tracker.js");
const { soloSocket } = require("./src/js/conn/solo.js");
const registerHeaderSocket = require("./src/js/conn/header_socket.js");

// ✨ NEW: Import security functions
const { isCodeSafe, sanitizeInput, isValidMatchId, isValidUserId } = require("./utils/security.js");
```

**Why this works:**
- `require('./utils/security.js')` loads the module
- `{ isCodeSafe, ... }` destructures the exported object
- Now `isCodeSafe` is available throughout server.js

### Step 4: Delete Old Code

**Find and DELETE lines 2765-2796 in server.js:**

```javascript
// server.js - DELETE THIS:

// BLOCK HACK COMMANDS
function isCodeSafe(code, language) {
    // ... 30 lines of code ...
}
```

**Replace with a comment:**

```javascript
// server.js - REPLACE WITH:

// NOTE: isCodeSafe function moved to utils/security.js
// Import it at the top: const { isCodeSafe } = require('./utils/security.js')
```

### Step 5: Test Everything

**Test 1: Does server start?**

```bash
node server.js
```

**Expected:** Server starts without errors

**Test 2: Does security work?**

```javascript
// In server.js, find where it's used:
socket.on('submit_code', async (payload) => {
    // ...
    if (!isCodeSafe(source_code, language)) {  // ✅ Should still work!
        socket.emit("judge_result", { success: false, message: "Forbidden commands detected!" });
        return;
    }
    // ...
});
```

**Test 3: Run a quick module test**

Create a test file `test.js`:

```javascript
// test.js
const { isCodeSafe } = require('./utils/security');

console.log('Test 1 - Safe code:', isCodeSafe('x = 5 + 3', 'python'));  // Should be true
console.log('Test 2 - Unsafe code:', isCodeSafe('import os', 'python')); // Should be false
console.log('✅ All tests passed!');
```

Run it:
```bash
node test.js
```

---

## Testing Your Changes

### Test Checklist

After each refactoring, run these tests:

#### ✅ 1. Syntax Test (Does it load?)

```bash
node -c server.js
```

**What this does:** Checks for syntax errors without running the server

**Expected output:** (silence = good)

**If error:** Look at the line number and fix the syntax

#### ✅ 2. Start Test (Does server start?)

```bash
node server.js
```

**Expected output:**
```
Server running on http://localhost:3000
Socket.IO server is running
```

**If error:** Read the error message carefully
- "Cannot find module" → Check the require() path
- "is not a function" → Check module.exports
- "is not defined" → Check import statement

#### ✅ 3. Functionality Test (Does it work?)

1. Open your browser to `http://localhost:3000`
2. Log in
3. Join a match
4. Submit code
5. Check if points are calculated correctly

**What to watch for:**
- No errors in browser console
- No errors in server terminal
- Features work exactly like before

#### ✅ 4. Module Test (Isolated testing)

Create `test-modules.js`:

```javascript
// Test individual modules without running the server

const { calculateDuelPointsChange, calculateCodePoints } = require('./utils/pointsCalculator');
const { isCodeSafe } = require('./utils/security');

console.log('=== Testing Points Calculator ===');
console.log('Winner (13/13):', calculateDuelPointsChange(true, false, 13, 13)); // Should be 30
console.log('Loser (0/13):', calculateDuelPointsChange(false, false, 0, 13));   // Should be -25
console.log('XP (10/13):', calculateCodePoints(10, 13));                        // Should be 8

console.log('\n=== Testing Security ===');
console.log('Safe code:', isCodeSafe('x + y', 'python'));          // Should be true
console.log('Unsafe code:', isCodeSafe('import os', 'python'));    // Should be false

console.log('\n✅ All module tests passed!');
```

Run:
```bash
node test-modules.js
```

---

## Common Mistakes & Solutions

### Mistake 1: Wrong Require Path

**❌ Error:**
```
Error: Cannot find module './utils/pointCalculator'
```

**Why it happens:**
```javascript
// You wrote:
const { calculatePoints } = require('./utils/pointCalculator');

// But file is named:
utils/pointsCalculator.js  (with an 's')
```

**✅ Solution:** Match the filename exactly
```javascript
const { calculatePoints } = require('./utils/pointsCalculator');
```

### Mistake 2: Forgot module.exports

**❌ Error:**
```
TypeError: calculatePoints is not a function
```

**Why it happens:**
```javascript
// utils/pointsCalculator.js
function calculatePoints(x, y) {
    return x + y;
}

// ❌ FORGOT THIS:
// module.exports = { calculatePoints };
```

**✅ Solution:** Always export at the end
```javascript
// utils/pointsCalculator.js
function calculatePoints(x, y) {
    return x + y;
}

module.exports = { calculatePoints };  // ✅ Add this!
```

### Mistake 3: Didn't Delete Old Code

**❌ Problem:**
```javascript
// You have BOTH:

// In server.js:
function calculatePoints(x, y) { return x + y; }  // ❌ Old code still here

// At top of server.js:
const { calculatePoints } = require('./utils/pointsCalculator'); // ❌ Also imported

// Now there are TWO calculatePoints functions!
// JavaScript uses the closest one (the local one), ignoring the import
```

**✅ Solution:** Delete the old function after importing
```javascript
// server.js - ONLY have this:
const { calculatePoints } = require('./utils/pointsCalculator');

// ✅ Delete the old function definition
```

### Mistake 4: Circular Dependencies

**❌ Problem:**
```javascript
// fileA.js
const { funcB } = require('./fileB');
function funcA() { return funcB(); }
module.exports = { funcA };

// fileB.js
const { funcA } = require('./fileA');  // ❌ CIRCULAR!
function funcB() { return funcA(); }
module.exports = { funcB };
```

**Why it's bad:** A requires B, B requires A → infinite loop!

**✅ Solution:** Restructure so dependencies flow one way
```javascript
// utils/shared.js (new file with common code)
function helperFunc() { return 42; }
module.exports = { helperFunc };

// fileA.js
const { helperFunc } = require('./utils/shared');
function funcA() { return helperFunc(); }
module.exports = { funcA };

// fileB.js
const { helperFunc } = require('./utils/shared');
function funcB() { return helperFunc(); }
module.exports = { funcB };
```

### Mistake 5: Forgot to Pass Dependencies

**❌ Problem:**
```javascript
// server.js has database connection 'db'
const db = require('./db');

// You move a function to a module:
// database/operations.js
async function saveUser(userId, data) {
    await db.query('...');  // ❌ 'db' is not defined here!
}
```

**✅ Solution 1:** Pass as parameter
```javascript
// database/operations.js
async function saveUser(db, userId, data) {  // ✅ Pass db
    await db.query('...');
}
module.exports = { saveUser };

// server.js
const db = require('./db');
const { saveUser } = require('./database/operations');
await saveUser(db, userId, data);  // ✅ Pass db
```

**✅ Solution 2:** Import in module
```javascript
// database/operations.js
const db = require('../db');  // ✅ Import directly

async function saveUser(userId, data) {
    await db.query('...');
}
module.exports = { saveUser };

// server.js
const { saveUser } = require('./database/operations');
await saveUser(userId, data);  // ✅ No need to pass db
```

---

## Visual Summary

### Before Refactoring:
```
┌─────────────────────────────┐
│      server.js              │
│        (4088 lines)         │
├─────────────────────────────┤
│ • Database connection       │
│ • calculatePoints()         │
│ • isCodeSafe()             │
│ • updatePlayerStats()      │
│ • matchmaking logic        │
│ • judge code execution     │
│ • socket handlers          │
│ • ... everything else      │
└─────────────────────────────┘
     ↓ Hard to find anything
     ↓ Hard to test
     ↓ Hard to maintain
```

### After Refactoring:
```
┌──────────────────┐
│   server.js      │  ← Main coordinator (500 lines)
│   (imports all)  │
└────────┬─────────┘
         │
         ├─→ ┌──────────────────────┐
         │   │ utils/               │
         │   ├──────────────────────┤
         │   │ pointsCalculator.js  │  ← Points & XP (80 lines)
         │   │ security.js          │  ← Security checks (150 lines)
         │   └──────────────────────┘
         │
         ├─→ ┌──────────────────────┐
         │   │ database/            │
         │   ├──────────────────────┤
         │   │ operations.js        │  ← DB operations (200 lines)
         │   │ queries.js           │  ← SQL queries (150 lines)
         │   └──────────────────────┘
         │
         └─→ ┌──────────────────────┐
             │ handlers/            │
             ├──────────────────────┤
             │ judgeHandler.js      │  ← Code judging (300 lines)
             │ matchmaking.js       │  ← Match logic (250 lines)
             └──────────────────────┘

     ✅ Easy to find (look at folder/filename)
     ✅ Easy to test (test one module)
     ✅ Easy to maintain (change one file)
```

---

## Next Steps

1. **Start Small:** Refactor one module at a time
2. **Test After Each:** Make sure it works before moving to next
3. **Follow the Pattern:** Use the 5-step process every time
4. **Be Patient:** Don't try to refactor everything in one day

**Suggested Order:**
1. ✅ **Points Calculator** (Done!)
2. ✅ **Security Functions** (Done!)
3. 📝 **Database Operations** (Next - updatePlayerStats, etc.)
4. 📝 **Judge Handler** (Code execution and testing)
5. 📝 **Matchmaking** (Queue management)

---

## Questions to Ask Yourself

Before refactoring:
- ✅ Do these functions work together?
- ✅ Would I look for them in the same place?
- ✅ Can they be tested independently?

After refactoring:
- ✅ Does the server still start?
- ✅ Do all features still work?
- ✅ Is it easier to find the code now?

If you answer YES to all, you did it right! 🎉

---

## Final Checklist

- [ ] Created module file in appropriate folder
- [ ] Copied functions to module
- [ ] Added `module.exports` at bottom
- [ ] Added `require()` at top of server.js
- [ ] Deleted old function definitions
- [ ] Tested server starts without errors
- [ ] Tested functionality still works
- [ ] Committed changes to git

**Remember:** Small steps, test often, don't rush!
