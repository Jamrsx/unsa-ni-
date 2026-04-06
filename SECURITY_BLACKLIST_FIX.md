# Security Blacklist Issue & Fix

## Problem
The current blacklist in server.js blocks `"open("` for Python, which can interfere with legitimate code. While `open()` is dangerous for file access, the blacklist is too broad.

## Current Blacklist (Line 2763)
```javascript
const blacklists = {
    python: ["import os", "import sys", "subprocess", "eval(", "exec(", "open(", "socket"],
    php: ["exec(", "shell_exec", "system(", "passthru", "proc_open", "curl_exec", "unlink", "fopen"],
    java: ["Runtime.getRuntime", "ProcessBuilder", "FileWriter", "Socket", "ServerSocket"]
};
```

## Issue
- `"open("` can match legitimate variable names or string content
- Example: `my_open_function()` or `"Please open the door"` would be blocked

## Solutions

### Option 1: Remove `"open("` from blacklist (RECOMMENDED)
The sandbox directory already isolates code execution, and the 2-second timeout prevents abuse.

**Change:**
```javascript
python: ["import os", "import sys", "subprocess", "eval(", "exec(", "socket"],
```

### Option 2: Make it more specific
Only block file operations:
```javascript
python: ["import os", "import sys", "subprocess", "eval(", "exec(", "open('", 'open("', "socket"],
```

This only blocks `open('filename')` or `open("filename")`, not the word "open" in general.

## Why the Solutions Work
All solutions in `problem_solutions.py` use:
- `input()` - Safe, reads from stdin
- `ast.literal_eval()` - Safe, only evaluates literals
- No file system access
- No dangerous imports

## Quick Fix
If you want to test immediately without changing server.js, ensure your code:
1. Uses `input()` for reading (not `open()`)
2. Doesn't contain the string "open(" anywhere
3. Doesn't import `os`, `sys`, `subprocess`, etc.

## Recommended Action
Apply Option 1 or Option 2 fix to server.js line 2764.
