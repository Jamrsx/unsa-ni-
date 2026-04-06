# 🛡️ Utils Module - Protected Core Functions

This directory contains **mission-critical utility functions** that power the DuelCode matching system. These modules are **isolated and protected** to prevent accidental modifications during routine server updates.

---

## 📦 Module Overview

### **matchScoring.js** ⚡ [NEW - PROTECTED]
**Purpose:** Complete match result calculation and scoring system

**Functions:**
- `determineWinner(p1Data, p2Data)` - Winner determination logic
- `calculateMatchScores(p1Data, p2Data, mode)` - Calculate all scores (XP, DP, time bonus)
- `createMatchResult(p1Data, p2Data, scores, mode)` - Generate result payload for clients
- `mapScoresToDatabasePlayers(scores, ...)` - Map scores to correct database player IDs

**⚠️ CRITICAL:** This module handles:
- ✅ Time bonus calculation and application (+0-50 XP for speed)
- ✅ Winner determination (tests passed → duration tiebreaker)
- ✅ DP changes for ranked mode
- ✅ Database player ID mapping (prevents DP/XP swap bugs)

**DO NOT MODIFY** unless fixing a confirmed bug or adding new scoring features.

---

### **pointsCalculator.js**
**Purpose:** XP and DP calculation formulas

**Functions:**
- `calculateCodePoints(passed, total)` - XP from test cases
- `calculateDuelPointsChange(isWinner, isTie, passed, total)` - DP changes
- `calculateLevel(totalXP)` - Level from cumulative XP

---

### **security.js**
**Purpose:** Code safety validation before judge execution

**Functions:**
- `isCodeSafe(code, language)` - Check for dangerous patterns
- `sanitizeInput(input)` - Clean user input

**⚠️ CRITICAL:** Allows `ast.literal_eval()` for Python array problems!

---

### **timeUtils.js**
**Purpose:** Time parsing and bonus calculations

**Functions:**
- `parseDuration(duration)` - Convert "M:SS" to seconds
- `calculateTimeBonus(duration)` - Speed bonus (0-50 XP)
- `formatDuration(seconds)` - Convert seconds to "M:SS"

**Bonus Scale (Ranked Only):**
- ≤30s = +50 XP ⚡⚡⚡
- ≤1m = +40 XP ⚡⚡
- ≤2m = +25 XP ⚡
- ≤5m = +10 XP
- >5m = 0 XP

---

### **validation.js**
**Purpose:** Input validation for all data types

**Functions:** 15 validators (isValidMode, isValidLanguage, etc.)

---

## 🚀 Usage Example

```javascript
// In server.js - Match completion handler
const { calculateMatchScores, createMatchResult } = require('./utils/matchScoring.js');

// Calculate all scores in one call
const scores = calculateMatchScores(p1Data, p2Data, 'ranked');

// Extract values
const { winnerId, player1, player2 } = scores;
console.log(`Winner: Player ${winnerId}`);
console.log(`P1 XP: ${player1.totalXP} (${player1.codePoints} + ${player1.timeBonus} bonus)`);
console.log(`P2 XP: ${player2.totalXP} (${player2.codePoints} + ${player2.timeBonus} bonus)`);

// Create result for clients
const finalResult = createMatchResult(p1Data, p2Data, scores, 'ranked');
socket.emit('match_finished', finalResult);
```

---

## 🔒 Why These Modules Are Protected

### Before Modularization (❌ Problems):
- 4,032 lines in server.js - easy to accidentally break scoring logic
- Time bonus code scattered across 80+ lines
- Manual score mapping prone to player ID swap bugs
- Testing individual features required running full server

### After Modularization (✅ Benefits):
- **Isolated Logic:** Scoring code in one place, can't be accidentally touched
- **Testable:** Each function can be unit tested independently
- **Documented:** Clear purpose, inputs, outputs for each function
- **Bug-Resistant:** Player ID mapping encapsulated, reduces swap errors
- **Maintainable:** Changes to scoring don't affect other server logic

---

## 📝 Recent Fixes (Committed to Module)

### **Performance Bonus Fix (Dec 22, 2024)**
**Problem:** Time bonus calculated but never applied to winner  
**Solution:** 
1. `calculateMatchScores()` now calculates time bonus for winner
2. Bonus added to `totalXP` (affects level progression)
3. Bonus included in `finalResult` (displays on result page)

**Impact:** Winners in ranked mode now properly receive +0-50 XP speed bonus

---

## ⚙️ Testing

```bash
# Validate module syntax
node -c utils/matchScoring.js
node -c utils/pointsCalculator.js
node -c utils/security.js
node -c utils/timeUtils.js
node -c utils/validation.js

# Test imports (in Node REPL)
node
> const scoring = require('./utils/matchScoring.js');
> const p1 = { passed: 10, total: 13, duration: '0:45' };
> const p2 = { passed: 8, total: 13, duration: '1:20' };
> const result = scoring.calculateMatchScores(p1, p2, 'ranked');
> console.log(result);
```

---

## 🚨 Modification Guidelines

### Safe Changes ✅
- Adding new validation functions (validation.js)
- Adjusting bonus scales (timeUtils.js - but document reason!)
- Adding logging/debugging output (all modules)
- Creating new utility modules following this pattern

### Dangerous Changes ⚠️
- Modifying winner determination logic (matchScoring.js)
- Changing XP/DP formulas (pointsCalculator.js)
- Altering security blacklist (security.js - may break valid code!)
- Adjusting player ID mapping (matchScoring.js - can cause point swap bugs!)

### Before Any Change:
1. **Document** why the change is needed (bug report, feature request)
2. **Test** the module independently first
3. **Validate** syntax: `node -c utils/<module>.js`
4. **Run** a full match test in ranked mode
5. **Verify** XP, DP, and time bonus all display correctly

---

## 📚 Related Documentation

- **COMPLETE_REFACTORING_SUMMARY.md** - Full refactoring overview
- **MODULE_FLOW_GUIDE.md** - Visual data flow diagrams
- **QUICK_REFERENCE.md** - Function cheat sheet

---

## 🎯 Module Philosophy

> "A function should do one thing, do it well, and be impossible to break accidentally."

These modules follow strict single-responsibility principle:
- **One module** = One category of functionality
- **One function** = One specific calculation or operation
- **Zero side effects** = Pure functions that return values, don't modify globals

This makes the codebase:
- **Predictable** - Same inputs always produce same outputs
- **Debuggable** - Issues isolated to specific modules
- **Scalable** - New features add modules, don't modify existing ones

---

**Last Updated:** December 22, 2024  
**Modules:** 5 core utilities (1,687 lines)  
**Server.js Reduction:** -123 lines (cleaner, more maintainable)
