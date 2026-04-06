# 📋 Module Refactoring Quick Reference

## 🎯 The 5-Step Process

```
1. IDENTIFY  → Find related functions
2. CREATE    → Make new module file
3. COPY      → Copy functions to module + add exports
4. IMPORT    → Add require() in server.js
5. DELETE    → Remove old code + test
```

---

## 📝 Template: Creating a Module

### Basic Module Template

```javascript
/**
 * [Module Name]
 * [Description of what this module does]
 */

// ============================================
// CONSTANTS (if needed)
// ============================================
const MY_CONSTANT = 'value';

// ============================================
// MAIN FUNCTIONS
// ============================================

/**
 * [Function description]
 * @param {type} paramName - Description
 * @returns {type} - Description
 */
function myFunction(paramName) {
    // Function code here
    return result;
}

/**
 * [Another function description]
 */
function anotherFunction() {
    // Function code here
}

// ============================================
// EXPORT FUNCTIONS
// ============================================
module.exports = {
    myFunction,
    anotherFunction,
    MY_CONSTANT  // Optional: export constants
};
```

---

## 🔧 Common Patterns

### Pattern 1: Simple Function Export

```javascript
// utils/helper.js
function add(a, b) {
    return a + b;
}

module.exports = { add };
```

```javascript
// server.js
const { add } = require('./utils/helper');
const result = add(5, 3);  // 8
```

### Pattern 2: Multiple Functions

```javascript
// utils/math.js
function add(a, b) { return a + b; }
function subtract(a, b) { return a - b; }
function multiply(a, b) { return a * b; }

module.exports = { add, subtract, multiply };
```

```javascript
// server.js
const { add, subtract, multiply } = require('./utils/math');

const sum = add(5, 3);       // 8
const diff = subtract(10, 4); // 6
const prod = multiply(7, 2);  // 14
```

### Pattern 3: With Database Connection

```javascript
// database/operations.js
async function saveUser(db, userId, data) {
    await db.query('INSERT INTO users ...', [userId, data]);
}

module.exports = { saveUser };
```

```javascript
// server.js
const db = require('./db');
const { saveUser } = require('./database/operations');

await saveUser(db, 123, 'userdata');  // Pass db as parameter
```

### Pattern 4: With Configuration

```javascript
// utils/config.js
module.exports = {
    MAX_POINTS: 100,
    MIN_POINTS: -50,
    DEFAULT_TIMEOUT: 5000
};
```

```javascript
// server.js
const config = require('./utils/config');

console.log(config.MAX_POINTS);     // 100
console.log(config.DEFAULT_TIMEOUT); // 5000
```

---

## 🔍 Troubleshooting Guide

### Error: "Cannot find module"

```
Error: Cannot find module './utils/calculator'
```

**Causes & Solutions:**

| Cause | Solution |
|-------|----------|
| Wrong path | Check `./` for same level, `../` for up one level |
| Wrong filename | Match exactly: `calculator.js` not `Calculator.js` |
| File doesn't exist | Create the file first |
| Missing `.js` (shouldn't need it) | Add `.js`: `require('./utils/calculator.js')` |

### Error: "X is not a function"

```
TypeError: calculatePoints is not a function
```

**Causes & Solutions:**

| Cause | Solution |
|-------|----------|
| Forgot `module.exports` | Add at bottom: `module.exports = { calculatePoints }` |
| Wrong export name | Check spelling matches |
| Imported wrong | Check `const { calcPoints }` matches export name |
| Circular dependency | Restructure to avoid A → B → A |

### Error: "X is not defined"

```
ReferenceError: db is not defined
```

**Causes & Solutions:**

| Cause | Solution |
|-------|----------|
| Variable not passed | Pass as parameter: `myFunc(db, userId)` |
| Variable not imported | Import in module: `const db = require('../db')` |
| Wrong scope | Move variable to right scope |

---

## 📁 Recommended File Structure

```
project/
│
├── server.js               ← Main file (500-800 lines)
├── db.js                   ← Database connection
├── package.json
│
├── utils/                  ← Helper functions
│   ├── pointsCalculator.js
│   ├── security.js
│   ├── validation.js
│   └── formatters.js
│
├── database/               ← Database operations
│   ├── matchOperations.js
│   ├── statsOperations.js
│   ├── userOperations.js
│   └── queries.js
│
├── handlers/               ← Business logic
│   ├── judgeHandler.js
│   ├── matchmakingHandler.js
│   ├── submissionHandler.js
│   └── lobbyHandler.js
│
├── middleware/             ← Express middleware
│   ├── auth.js
│   └── errorHandler.js
│
└── src/                    ← Frontend code
    └── ...
```

---

## 🧪 Testing Commands

### Test 1: Syntax Check
```bash
node -c server.js
```
**Expected:** No output (silence = good)

### Test 2: Start Server
```bash
node server.js
```
**Expected:** `Server running on http://localhost:3000`

### Test 3: Test Module Directly
```bash
node -e "const {add} = require('./utils/math'); console.log(add(2,3));"
```
**Expected:** `5`

### Test 4: Full Module Test
```javascript
// test.js
const { calculateDuelPointsChange } = require('./utils/pointsCalculator');
const { isCodeSafe } = require('./utils/security');

console.log('Winner DP:', calculateDuelPointsChange(true, false, 13, 13));
console.log('Safe code:', isCodeSafe('x = 5', 'python'));
console.log('✅ Tests passed!');
```

```bash
node test.js
```

---

## 💡 Tips & Best Practices

### ✅ DO

```javascript
// ✅ Use descriptive names
const { calculateUserScore } = require('./utils/scoring');

// ✅ Group related functions
// utils/scoring.js contains ALL scoring functions

// ✅ Add comments
/**
 * Calculate final score
 * @param {number} tests - Tests passed
 * @returns {number} - Final score
 */

// ✅ Keep modules focused
// One module = One purpose

// ✅ Export only what's needed
module.exports = { publicFunction };
// privateFunction stays private
```

### ❌ DON'T

```javascript
// ❌ Don't use vague names
const stuff = require('./thing');

// ❌ Don't put unrelated things together
// utils/random.js with security, math, and database code

// ❌ Don't create deep nesting
require('../../../../utils/deep/nested/file');

// ❌ Don't export everything
module.exports = { 
    everyFunction,
    allVariables,
    everything 
};

// ❌ Don't have circular dependencies
// a.js requires b.js, b.js requires a.js
```

---

## 🎓 Learning Path

### Week 1: Simple Modules
- [ ] Extract 1 utility function
- [ ] Extract 1 calculation function
- [ ] Test both work

### Week 2: Group Modules
- [ ] Extract all calculation functions → `utils/calculator.js`
- [ ] Extract all security functions → `utils/security.js`
- [ ] Test all features work

### Week 3: Complex Modules
- [ ] Extract database operations → `database/operations.js`
- [ ] Extract handlers → `handlers/matchmaking.js`
- [ ] Clean up server.js to < 1000 lines

### Week 4: Polish
- [ ] Add comments to all modules
- [ ] Write tests for each module
- [ ] Create documentation

---

## 📊 Progress Tracker

```
Before:
├── server.js (4088 lines) ███████████████████████████

After Step 1:
├── server.js (3918 lines) ██████████████████████████
└── utils/pointsCalculator.js (80 lines)

After Step 2:
├── server.js (3768 lines) ████████████████████████
├── utils/pointsCalculator.js (80 lines)
└── utils/security.js (150 lines)

After Step 3:
├── server.js (3568 lines) ██████████████████████
├── utils/pointsCalculator.js (80 lines)
├── utils/security.js (150 lines)
└── database/operations.js (200 lines)

Goal:
├── server.js (500 lines) ███
├── utils/ (400 lines)
├── database/ (600 lines)
├── handlers/ (800 lines)
└── ...
```

---

## 🆘 Need Help?

### Common Questions

**Q: How big should a module be?**
A: 50-300 lines is ideal. If bigger, split it up.

**Q: How many functions per module?**
A: 3-10 related functions. Not too few, not too many.

**Q: Should I use folders?**
A: Yes! Group by purpose: `utils/`, `database/`, `handlers/`

**Q: Can modules import other modules?**
A: Yes! But avoid circular dependencies (A → B → A).

**Q: Do I need to restart the server after changes?**
A: Yes! Node.js caches modules. Restart to reload.

---

## ✨ Success Checklist

After refactoring, you should have:

- [ ] server.js < 1000 lines
- [ ] Organized folder structure
- [ ] Each module does ONE thing well
- [ ] All features still work
- [ ] Easy to find any function
- [ ] Tests pass
- [ ] No errors in console
- [ ] Code is documented

---

## 🎯 Final Reminder

**The Golden Rule:**
> If you're scrolling for more than 10 seconds to find a function,
> it's time to refactor into modules!

**The Test:**
> Can a new developer find the "calculate points" function in under 30 seconds?
> - Before: NO (buried in 4000 lines)
> - After: YES (it's in `utils/pointsCalculator.js`)

---

**You've got this! Start with one small module and build from there.** 🚀
