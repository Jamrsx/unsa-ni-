<?php
// ============================================
// SOLUTION CODES FOR ALL PROBLEMS - PHP
// These solutions work with the judge system
// Test them in your onboarding/sandbox
// ============================================

// ============================================
// PROBLEM 1: Find First Duplicate
// ============================================
// Input: Array as string like "[2, 1, 3, 5, 3, 2]"
// Output: First duplicate number or -1
/*
<?php
$input = trim(fgets(STDIN));
$arr = json_decode($input);
$seen = [];
$result = -1;

foreach ($arr as $num) {
    if (in_array($num, $seen)) {
        $result = $num;
        break;
    }
    $seen[] = $num;
}

echo $result;
?>
*/

// ============================================
// PROBLEM 2: Two Sum
// ============================================
// Input: Line 1: Array, Line 2: Target
// Output: [index1, index2]
/*
<?php
$nums = json_decode(trim(fgets(STDIN)));
$target = intval(trim(fgets(STDIN)));

$seen = [];
foreach ($nums as $i => $num) {
    $complement = $target - $num;
    if (isset($seen[$complement])) {
        echo json_encode([$seen[$complement], $i]);
        break;
    }
    $seen[$num] = $i;
}
?>
*/

// ============================================
// PROBLEM 3: Valid Parentheses
// ============================================
// Input: String like "()" or "()[]{}"
// Output: "true" or "false"
/*
<?php
$s = trim(fgets(STDIN));

$stack = [];
$pairs = [')' => '(', ']' => '[', '}' => '{'];

$valid = true;
for ($i = 0; $i < strlen($s); $i++) {
    $ch = $s[$i];
    if (in_array($ch, ['(', '[', '{'])) {
        array_push($stack, $ch);
    } elseif (in_array($ch, [')', ']', '}'])) {
        if (empty($stack) || end($stack) !== $pairs[$ch]) {
            $valid = false;
            break;
        }
        array_pop($stack);
    }
}

if (!empty($stack)) {
    $valid = false;
}

echo $valid ? "true" : "false";
?>
*/

// ============================================
// PROBLEM 4: Longest Substring Without Repeating
// ============================================
// Input: String like "abcabcbb"
// Output: Length of longest substring
/*
<?php
$s = trim(fgets(STDIN));

if (strlen($s) == 0) {
    echo 0;
} else {
    $seen = [];
    $max_len = 0;
    $start = 0;
    
    for ($i = 0; $i < strlen($s); $i++) {
        $char = $s[$i];
        if (isset($seen[$char]) && $seen[$char] >= $start) {
            $start = $seen[$char] + 1;
        }
        $seen[$char] = $i;
        $max_len = max($max_len, $i - $start + 1);
    }
    
    echo $max_len;
}
?>
*/

// ============================================
// PROBLEM 5: Merge K Sorted Lists
// ============================================
// Input: String like "[[1,4,5],[1,3,4],[2,6]]"
// Output: Merged sorted array
/*
<?php
$lists = json_decode(trim(fgets(STDIN)));

$result = [];
foreach ($lists as $lst) {
    $result = array_merge($result, $lst);
}
sort($result);

echo json_encode($result);
?>
*/

// ============================================
// PROBLEM 18: Sum of Even Numbers
// ============================================
// Input: Array like "[1, 2, 3, 4, 5, 6]"
// Output: Sum of even numbers
/*
<?php
$arr = json_decode(trim(fgets(STDIN)));
$total = 0;

foreach ($arr as $num) {
    if ($num % 2 == 0) {
        $total += $num;
    }
}

echo $total;
?>
*/

// ============================================
// PROBLEM 21: Count Positive Numbers
// ============================================
// Input: Array like "[1, -2, 3, 0, 5, -7]"
// Output: Count of positive numbers
/*
<?php
$arr = json_decode(trim(fgets(STDIN)));
$count = 0;

foreach ($arr as $num) {
    if ($num > 0) {
        $count++;
    }
}

echo $count;
?>
*/

// ============================================
// PROBLEM 33: Sum of Positive Numbers
// ============================================
// Input: Array like "[1, -2, 3, -4, 5]"
// Output: Sum of positive numbers
/*
<?php
$arr = json_decode(trim(fgets(STDIN)));
$total = 0;

foreach ($arr as $num) {
    if ($num > 0) {
        $total += $num;
    }
}

echo $total;
?>
*/

// ============================================
// PROBLEM 34: Count Numbers Greater Than 10
// ============================================
// Input: Array like "[5, 12, 8, 20, 11]"
// Output: Count of numbers > 10
/*
<?php
$arr = json_decode(trim(fgets(STDIN)));
$count = 0;

foreach ($arr as $num) {
    if ($num > 10) {
        $count++;
    }
}

echo $count;
?>
*/

// ============================================
// PROBLEM 35: Sum of Two Numbers
// ============================================
// Input: "5 3"
// Output: 8
/*
<?php
$line = trim(fgets(STDIN));
$parts = explode(' ', $line);
$a = intval($parts[0]);
$b = intval($parts[1]);
echo $a + $b;
?>
*/

// ============================================
// PROBLEM 36: Find Maximum in Array
// ============================================
// Input: Array like "[3, 7, 2, 9, 1]"
// Output: Maximum number
/*
<?php
$arr = json_decode(trim(fgets(STDIN)));
echo max($arr);
?>
*/

// ============================================
// PROBLEM 37: Count Vowels in String
// ============================================
// Input: String like "Hello World"
// Output: Count of vowels
/*
<?php
$s = trim(fgets(STDIN));
$vowels = "aeiouAEIOU";
$count = 0;

for ($i = 0; $i < strlen($s); $i++) {
    if (strpos($vowels, $s[$i]) !== false) {
        $count++;
    }
}

echo $count;
?>
*/

// ============================================
// PROBLEM 38: Reverse a String
// ============================================
// Input: String like "hello"
// Output: Reversed string
/*
<?php
$s = trim(fgets(STDIN));
echo strrev($s);
?>
*/

// ============================================
// PROBLEM 39: Is Number Even
// ============================================
// Input: Integer like "4"
// Output: "true" or "false"
/*
<?php
$n = intval(trim(fgets(STDIN)));
echo ($n % 2 == 0) ? "true" : "false";
?>
*/

// ============================================
// PROBLEM 40: Count Negative Numbers
// ============================================
// Input: Array like "[1, -2, 3, -4, -5, 6]"
// Output: Count of negative numbers
/*
<?php
$arr = json_decode(trim(fgets(STDIN)));
$count = 0;

foreach ($arr as $num) {
    if ($num < 0) {
        $count++;
    }
}

echo $count;
?>
*/

// ============================================
// PROBLEM 41: Multiply Array Elements
// ============================================
// Input: Array like "[2, 3, 4]"
// Output: Product of all elements
/*
<?php
$arr = json_decode(trim(fgets(STDIN)));
$result = 1;

foreach ($arr as $num) {
    $result *= $num;
}

echo $result;
?>
*/

// ============================================
// PROBLEM 42: Find Minimum in Array
// ============================================
// Input: Array like "[3, 7, 2, 9, 1]"
// Output: Minimum number
/*
<?php
$arr = json_decode(trim(fgets(STDIN)));
echo min($arr);
?>
*/

// ============================================
// TESTING INSTRUCTIONS
// ============================================
/*
HOW TO TEST PHP SOLUTIONS:

1. Go to your onboarding page (casual/ranked mode)
2. Select PHP as the language
3. Copy the solution code for the problem you want to test
4. Remove the comment delimiters (the slash-asterisk and asterisk-slash)
5. Paste it into the code editor
6. Click Submit/Run

IMPORTANT PHP NOTES:
- Always use trim(fgets(STDIN)) to read input
- Use json_decode() for array inputs (not eval)
- Use echo for output (not print or var_dump)
- Don't use var_dump or print_r for final output
- Remove <?php tags if your system auto-adds them

QUICK TEST COMMANDS:
# Test Problem 35 (command line)
echo "5 3" | php -r '$line = trim(fgets(STDIN)); $parts = explode(" ", $line); echo intval($parts[0]) + intval($parts[1]);'

# Test Problem 39
echo "4" | php -r '$n = intval(trim(fgets(STDIN))); echo ($n % 2 == 0) ? "true" : "false";'

# Test Problem 18 (array)
echo "[2,4,6]" | php -r '$arr = json_decode(trim(fgets(STDIN))); $sum = 0; foreach($arr as $n) if($n%2==0) $sum+=$n; echo $sum;'
*/
?>
