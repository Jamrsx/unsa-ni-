# DuelCode Problem Solutions

This directory contains complete reference implementations for all DuelCode competitive programming problems in three languages: **Python**, **PHP**, and **Java**.

## Overview

All solutions are extracted from the DuelCode MySQL database and include:
- Complete implementations for 20+ problems
- Full test case specifications with input/output examples
- Optimal algorithmic approaches with clear comments
- Verified test runs from the database

## Problems Included

### Easy Level (10 problems)
- **Problem 23**: Find the Maximum Number
- **Problem 35**: Sum of Two Numbers
- **Problem 36**: Find Maximum in Array
- **Problem 37**: Count Vowels in String
- **Problem 38**: Reverse a String
- **Problem 39**: Is Number Even  
- **Problem 40**: Count Negative Numbers
- **Problem 41**: Multiply Array Elements
- **Problem 42**: Find Minimum in Array
- **Problem 65**: Sum of Odd Numbers

### Medium Level (10 problems)
- **Problem 1**: Find First Duplicate
- **Problem 2**: Two Sum
- **Problem 3**: Valid Parentheses
- **Problem 18**: Sum of Even Numbers
- **Problem 21**: Count Positive Numbers
- **Problem 33**: Sum of Positive Numbers
- **Problem 34**: Count Numbers Greater Than 10
- **Problem 66**: Longest Increasing Subsequence Length
- **Problem 92**: Reverse Only Even Numbers *(with 13 test cases)*

## File Structure

```
solutions/
├── PYTHON_SOLUTIONS.py      # Python implementations
├── PHP_SOLUTIONS.php        # PHP implementations  
├── JAVA_SOLUTIONS.java      # Java implementations
└── README.md                # This file
```

## Quick Start

### Python
```bash
python PYTHON_SOLUTIONS.py
```

### PHP
```bash
php PHP_SOLUTIONS.php
```

### Java
```bash
javac JAVA_SOLUTIONS.java
java ProblemSolutions
```

## Problem Details

### Problem 92: Reverse Only Even Numbers (Most Complex)
**Difficulty**: Medium  
**Time Limit**: 1 second  
**Memory Limit**: 64 MB

**Description**: Given a list of integers, reverse only the even numbers while keeping odd numbers in their original positions.

**Test Cases** (13 total from database):
```
Input: [1, 2, 3, 4, 5, 6]      Output: [1, 6, 3, 4, 5, 2]
Input: [2, 4, 6, 8]            Output: [8, 6, 4, 2]
Input: [1, 3, 5]               Output: [1, 3, 5]
Input: [6, 5, 4, 3, 2, 1]      Output: [2, 5, 4, 3, 6, 1]
Input: [0, 2, 4]               Output: [4, 2, 0]
Input: [4, 3, 2, 1]            Output: [2, 3, 4, 1]
Input: [1]                     Output: [1]
Input: [7]                     Output: [7]
Input: [2]                     Output: [2]
Input: [1, 2]                  Output: [1, 2]
Input: [2, 1]                  Output: [2, 1]
Input: [-2, -4, -6]            Output: [-6, -4, -2]
Input: [-1, -2, -3, -4]        Output: [-1, -4, -3, -2]
```

**Algorithm** (O(n) time, O(n) space):
1. Extract all even numbers into a list
2. Reverse that list
3. Iterate through the original array
4. For each position: if original value is even, use reversed value; if odd, keep original

### Problem 66: Longest Increasing Subsequence Length
**Difficulty**: Easy  
**Time Limit**: 1 second  
**Memory Limit**: 64 MB

**Description**: Find the length of the longest strictly increasing subsequence.

**Algorithm** (Dynamic Programming O(n²)):
1. Create dp array where dp[i] = length of LIS ending at index i
2. For each element i, check all previous elements j
3. If arr[j] < arr[i], update dp[i] = max(dp[i], dp[j] + 1)
4. Return maximum value in dp array

### Problem 1: Find First Duplicate
**Difficulty**: Medium

**Description**: Find the first element appearing more than once, return -1 if none exists.

**Algorithm** (Hash Set O(n)):
1. Maintain a set of seen numbers
2. Iterate through array
3. If number is in set, return it
4. Otherwise add to set

## Language-Specific Notes

### Python
- Uses list comprehensions for concise filtering
- Slice notation for string reversal (`s[::-1]`)
- Native `max()`, `min()` functions
- Test driver code uses `if __name__ == "__main__"`

### PHP
- Uses associative arrays as hash maps
- String manipulation via `strrev()` and `substr()`
- `array_reverse()` for list reversal
- CLI check: `if (php_sapi_name() == 'cli')`

### Java
- Uses `HashMap` and `HashSet` for O(1) lookups
- `StringBuilder` for efficient string operations
- `Arrays.fill()` and `Collections.reverse()` utilities
- Static methods with descriptive names

## Complexity Analysis

| Problem | Algorithm | Time | Space | Notes |
|---------|-----------|------|-------|-------|
| 92 | Two-pointer extraction | O(n) | O(n) | Extracting + reversing |
| 66 | Dynamic Programming | O(n²) | O(n) | Nested loop comparison |
| 1 | Hash Set | O(n) | O(n) | Single pass with set |
| 2 | Hash Map | O(n) | O(n) | Two-pointer with hash |
| 3 | Stack | O(n) | O(n) | Bracket matching |

## Database Integration

All solutions are derived from `duelcode_capstone_project.sql`:
- **Table**: `problems`
- **Columns**: problem_id, problem_name, description, sample_solution
- **Test Cases**: Verified against `problem_test_runs` table

## Contribution & Maintenance

To add new problems:
1. Add the problem function with documentation
2. Include test cases as comments with input/output
3. Add to all three language files simultaneously
4. Update this README with the new problem

## Testing

Each solution includes inline test cases. To verify correctness:
1. Extract test inputs from the database
2. Run each problem's function
3. Compare output with database expected results
4. All solutions have passed their respective test cases (100% accuracy)

## Version Info

- **Created**: 2025
- **Database Schema**: DuelCode Capstone Project
- **Languages**: Python 3, PHP 7.4+, Java 8+
- **Total Problems**: 20+
- **Total Test Cases**: 100+ (verified from database)

---

**Note**: These solutions are designed for educational purposes and to serve as reference implementations for the DuelCode competitive programming platform.
