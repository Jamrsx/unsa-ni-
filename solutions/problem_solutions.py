# ============================================
# SOLUTION CODES FOR ALL PROBLEMS
# These solutions work with the judge system
# Test them in your onboarding/sandbox
# ============================================

# ============================================
# PROBLEM 1: Find First Duplicate
# ============================================
# Input: Array as string like "[2, 1, 3, 5, 3, 2]"
# Output: First duplicate number or -1
"""
import ast
arr = ast.literal_eval(input().strip())
seen = set()
result = -1
for num in arr:
    if num in seen:
        result = num
        break
    seen.add(num)
print(result)
"""

# ============================================
# PROBLEM 2: Two Sum
# ============================================
# Input: Line 1: Array, Line 2: Target
# Output: [index1, index2]
"""
import ast
nums = ast.literal_eval(input().strip())
target = int(input().strip())

seen = {}
for i, num in enumerate(nums):
    complement = target - num
    if complement in seen:
        print([seen[complement], i])
        break
    seen[num] = i
"""

# ============================================
# PROBLEM 3: Valid Parentheses
# ============================================
# Input: String like "()" or "()[]{}"
# Output: "true" or "false"
"""
s = input().strip()

stack = []
pairs = {')': '(', ']': '[', '}': '{'}

valid = True
for ch in s:
    if ch in "([{":
        stack.append(ch)
    elif ch in ")]}":
        if not stack or stack[-1] != pairs[ch]:
            valid = False
            break
        stack.pop()

if stack:
    valid = False

print("true" if valid else "false")
"""

# ============================================
# PROBLEM 4: Longest Substring Without Repeating
# ============================================
# Input: String like "abcabcbb"
# Output: Length of longest substring
"""
s = input().strip()

if not s:
    print(0)
else:
    seen = {}
    max_len = 0
    start = 0

    for i, char in enumerate(s):
        if char in seen and seen[char] >= start:
            start = seen[char] + 1
        seen[char] = i
        max_len = max(max_len, i - start + 1)
    
    print(max_len)
"""

# ============================================
# PROBLEM 5: Merge K Sorted Lists
# ============================================
# Input: String like "[[1,4,5],[1,3,4],[2,6]]"
# Output: Merged sorted array
"""
import ast
lists = ast.literal_eval(input().strip())

# Flatten all lists and sort
result = [] 
for lst in lists:
    result.extend(lst)
result.sort()

print(result)
"""

# ============================================
# PROBLEM 18: Sum of Even Numbers
# ============================================
# Input: Array like "[1, 2, 3, 4, 5, 6]"
# Output: Sum of even numbers
"""
import ast
arr = ast.literal_eval(input().strip())
total = sum(num for num in arr if num % 2 == 0)
print(total)
"""

# ============================================
# PROBLEM 21: Count Positive Numbers
# ============================================
# Input: Array like "[1, -2, 3, 0, 5, -7]"
# Output: Count of positive numbers
"""
import ast
arr = ast.literal_eval(input().strip())
count = sum(1 for num in arr if num > 0)
print(count)
"""

# ============================================
# PROBLEM 33: Sum of Positive Numbers
# ============================================
# Input: Array like "[1, -2, 3, -4, 5]"
# Output: Sum of positive numbers
"""
import ast
arr = ast.literal_eval(input().strip())
total = sum(num for num in arr if num > 0)
print(total)
"""

# ============================================
# PROBLEM 34: Count Numbers Greater Than 10
# ============================================
# Input: Array like "[5, 12, 8, 20, 11]"
# Output: Count of numbers > 10
"""r
import ast
arr = ast.literal_eval(input().strip())
count = sum(1 for num in arr if num > 10)
print(count)
"""

# ============================================
# PROBLEM 35: Sum of Two Numbers
# ============================================
# Input: "5 3"
# Output: 8
"""
a, b = map(int, input().strip().split())
print(a + b)
"""

# ============================================
# PROBLEM 36: Find Maximum in Array
# ============================================
# Input: Array like "[3, 7, 2, 9, 1]"
# Output: Maximum number
"""
import ast
arr = ast.literal_eval(input().strip())
print(max(arr))
"""

# ============================================
# PROBLEM 37: Count Vowels in String
# ============================================
# Input: String like "Hello World"
# Output: Count of vowels
"""
s = input().strip()
vowels = "aeiouAEIOU"
count = sum(1 for char in s if char in vowels)
print(count)
"""

# ============================================
# PROBLEM 38: Reverse a String
# ============================================
# Input: String like "hello"
# Output: Reversed string
"""
s = input().strip()
print(s[::-1])
"""

# ============================================
# PROBLEM 39: Is Number Even
# ============================================
# Input: Integer like "4"
# Output: "true" or "false"
"""
n = int(input().strip())
print("true" if n % 2 == 0 else "false")
"""

# ============================================
# PROBLEM 40: Count Negative Numbers
# ============================================
# Input: Array like "[1, -2, 3, -4, -5, 6]"
# Output: Count of negative numbers
"""
import ast
arr = ast.literal_eval(input().strip())
count = sum(1 for num in arr if num < 0)
print(count)
"""

# ============================================
# PROBLEM 41: Multiply Array Elements
# ============================================
# Input: Array like "[2, 3, 4]"
# Output: Product of all elements
"""
import ast
arr = ast.literal_eval(input().strip())
result = 1
for num in arr:
    result *= num
print(result)
"""

# ============================================
# PROBLEM 42: Find Minimum in Array
# ============================================
# Input: Array like "[3, 7, 2, 9, 1]"
# Output: Minimum number
"""
import ast
arr = ast.literal_eval(input().strip())
print(min(arr))
"""

# ============================================
# TESTING INSTRUCTIONS
# ============================================
"""
HOW TO TEST IN YOUR ONBOARDING:

1. Go to your onboarding page (casual/ranked mode)
2. Copy the solution code for the problem you want to test
3. Paste it into the code editor
4. Make sure the language is set to Python
5. Click Submit/Run
6. The judge should execute it against all 13 test cases

EXPECTED RESULTS:
- Sample test cases (3): Should show input/output for learning
- Hidden test cases (10): Should show pass/fail with score

TIPS FOR DEBUGGING:
- If a solution fails, check the input format in test_cases table
- Use print() statements to debug (they'll show in console)
- Make sure input().strip() is used to remove whitespace
- Array inputs use ast.literal_eval() to parse safely

QUICK TEST COMMANDS:
# Test Problem 35 (easiest)
python -c "print(5 + 3)"  # Should output: 8

# Test Problem 1 (array parsing)
python -c "import ast; print(ast.literal_eval('[1,2,3]'))"

# Test Problem 39 (even check)
python -c "print('true' if 4 % 2 == 0 else 'false')"
"""
