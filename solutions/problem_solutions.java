// ============================================
// SOLUTION CODES FOR ALL PROBLEMS - JAVA
// These solutions work with the judge system
// Test them in your onboarding/sandbox
// ============================================

import java.util.*;
import java.io.*;

// ============================================
// PROBLEM 1: Find First Duplicate
// ============================================
// Input: Array as string like "[2, 1, 3, 5, 3, 2]"
// Output: First duplicate number or -1
/*
import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String input = br.readLine().trim();
        
        // Parse array [1,2,3] format
        input = input.substring(1, input.length() - 1); // Remove []
        String[] parts = input.split(",");
        
        Set<Integer> seen = new HashSet<>();
        int result = -1;
        
        for (String part : parts) {
            int num = Integer.parseInt(part.trim());
            if (seen.contains(num)) {
                result = num;
                break;
            }
            seen.add(num);
        }
        
        System.out.println(result);
    }
}
*/

// ============================================
// PROBLEM 2: Two Sum
// ============================================
// Input: Line 1: Array, Line 2: Target
// Output: [index1, index2]
/*
import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        
        String input = br.readLine().trim();
        input = input.substring(1, input.length() - 1);
        String[] parts = input.split(",");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            nums[i] = Integer.parseInt(parts[i].trim());
        }
        
        int target = Integer.parseInt(br.readLine().trim());
        
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (seen.containsKey(complement)) {
                System.out.println("[" + seen.get(complement) + ", " + i + "]");
                break;
            }
            seen.put(nums[i], i);
        }
    }
}
*/

// ============================================
// PROBLEM 3: Valid Parentheses
// ============================================
// Input: String like "()" or "()[]{}"
// Output: "true" or "false"
/*
import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String s = br.readLine().trim();
        
        Stack<Character> stack = new Stack<>();
        Map<Character, Character> pairs = new HashMap<>();
        pairs.put(')', '(');
        pairs.put(']', '[');
        pairs.put('}', '{');
        
        boolean valid = true;
        for (char ch : s.toCharArray()) {
            if (ch == '(' || ch == '[' || ch == '{') {
                stack.push(ch);
            } else if (ch == ')' || ch == ']' || ch == '}') {
                if (stack.isEmpty() || stack.peek() != pairs.get(ch)) {
                    valid = false;
                    break;
                }
                stack.pop();
            }
        }
        
        if (!stack.isEmpty()) {
            valid = false;
        }
        
        System.out.println(valid ? "true" : "false");
    }
}
*/

// ============================================
// PROBLEM 4: Longest Substring Without Repeating
// ============================================
// Input: String like "abcabcbb"
// Output: Length of longest substring
/*
import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String s = br.readLine().trim();
        
        if (s.length() == 0) {
            System.out.println(0);
        } else {
            Map<Character, Integer> seen = new HashMap<>();
            int maxLen = 0;
            int start = 0;
            
            for (int i = 0; i < s.length(); i++) {
                char ch = s.charAt(i);
                if (seen.containsKey(ch) && seen.get(ch) >= start) {
                    start = seen.get(ch) + 1;
                }
                seen.put(ch, i);
                maxLen = Math.max(maxLen, i - start + 1);
            }
            
            System.out.println(maxLen);
        }
    }
}
*/

// ============================================
// PROBLEM 5: Merge K Sorted Lists
// ============================================
// Input: String like "[[1,4,5],[1,3,4],[2,6]]"
// Output: Merged sorted array
/*
import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String input = br.readLine().trim();
        
        List<Integer> result = new ArrayList<>();
        
        // Parse nested arrays
        input = input.substring(1, input.length() - 1); // Remove outer []
        String[] arrays = input.split("\\],\\[");
        
        for (String arr : arrays) {
            arr = arr.replace("[", "").replace("]", "");
            if (arr.length() > 0) {
                String[] nums = arr.split(",");
                for (String num : nums) {
                    result.add(Integer.parseInt(num.trim()));
                }
            }
        }
        
        Collections.sort(result);
        System.out.println(result);
    }
}
*/

// ============================================
// PROBLEM 18: Sum of Even Numbers
// ============================================
// Input: Array like "[1, 2, 3, 4, 5, 6]"
// Output: Sum of even numbers
/*
import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String input = br.readLine().trim();
        
        input = input.substring(1, input.length() - 1);
        String[] parts = input.split(",");
        
        int total = 0;
        for (String part : parts) {
            int num = Integer.parseInt(part.trim());
            if (num % 2 == 0) {
                total += num;
            }
        }
        
        System.out.println(total);
    }
}
*/

// ============================================
// PROBLEM 21: Count Positive Numbers
// ============================================
// Input: Array like "[1, -2, 3, 0, 5, -7]"
// Output: Count of positive numbers
/*
import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String input = br.readLine().trim();
        
        input = input.substring(1, input.length() - 1);
        String[] parts = input.split(",");
        
        int count = 0;
        for (String part : parts) {
            int num = Integer.parseInt(part.trim());
            if (num > 0) {
                count++;
            }
        }
        
        System.out.println(count);
    }
}
*/

// ============================================
// PROBLEM 33: Sum of Positive Numbers
// ============================================
// Input: Array like "[1, -2, 3, -4, 5]"
// Output: Sum of positive numbers
/*
import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String input = br.readLine().trim();
        
        input = input.substring(1, input.length() - 1);
        String[] parts = input.split(",");
        
        int total = 0;
        for (String part : parts) {
            int num = Integer.parseInt(part.trim());
            if (num > 0) {
                total += num;
            }
        }
        
        System.out.println(total);
    }
}
*/

// ============================================
// PROBLEM 34: Count Numbers Greater Than 10
// ============================================
// Input: Array like "[5, 12, 8, 20, 11]"
// Output: Count of numbers > 10
/*
import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String input = br.readLine().trim();
        
        input = input.substring(1, input.length() - 1);
        String[] parts = input.split(",");
        
        int count = 0;
        for (String part : parts) {
            int num = Integer.parseInt(part.trim());
            if (num > 10) {
                count++;
            }
        }
        
        System.out.println(count);
    }
}
*/

// ============================================
// PROBLEM 35: Sum of Two Numbers
// ============================================
// Input: "5 3"
// Output: 8
/*
import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String[] parts = br.readLine().trim().split(" ");
        int a = Integer.parseInt(parts[0]);
        int b = Integer.parseInt(parts[1]);
        System.out.println(a + b);
    }
}
*/

// ============================================
// PROBLEM 36: Find Maximum in Array
// ============================================
// Input: Array like "[3, 7, 2, 9, 1]"
// Output: Maximum number
/*
import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String input = br.readLine().trim();
        
        input = input.substring(1, input.length() - 1);
        String[] parts = input.split(",");
        
        int max = Integer.MIN_VALUE;
        for (String part : parts) {
            int num = Integer.parseInt(part.trim());
            max = Math.max(max, num);
        }
        
        System.out.println(max);
    }
}
*/

// ============================================
// PROBLEM 37: Count Vowels in String
// ============================================
// Input: String like "Hello World"
// Output: Count of vowels
/*
import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String s = br.readLine().trim();
        
        String vowels = "aeiouAEIOU";
        int count = 0;
        
        for (char ch : s.toCharArray()) {
            if (vowels.indexOf(ch) != -1) {
                count++;
            }
        }
        
        System.out.println(count);
    }
}
*/

// ============================================
// PROBLEM 38: Reverse a String
// ============================================
// Input: String like "hello"
// Output: Reversed string
/*
import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String s = br.readLine().trim();
        System.out.println(new StringBuilder(s).reverse().toString());
    }
}
*/

// ============================================
// PROBLEM 39: Is Number Even
// ============================================
// Input: Integer like "4"
// Output: "true" or "false"
/*
import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine().trim());
        System.out.println(n % 2 == 0 ? "true" : "false");
    }
}
*/

// ============================================
// PROBLEM 40: Count Negative Numbers
// ============================================
// Input: Array like "[1, -2, 3, -4, -5, 6]"
// Output: Count of negative numbers
/*
import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String input = br.readLine().trim();
        
        input = input.substring(1, input.length() - 1);
        String[] parts = input.split(",");
        
        int count = 0;
        for (String part : parts) {
            int num = Integer.parseInt(part.trim());
            if (num < 0) {
                count++;
            }
        }
        
        System.out.println(count);
    }
}
*/

// ============================================
// PROBLEM 41: Multiply Array Elements
// ============================================
// Input: Array like "[2, 3, 4]"
// Output: Product of all elements
/*
import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String input = br.readLine().trim();
        
        input = input.substring(1, input.length() - 1);
        String[] parts = input.split(",");
        
        int result = 1;
        for (String part : parts) {
            int num = Integer.parseInt(part.trim());
            result *= num;
        }
        
        System.out.println(result);
    }
}
*/

// ============================================
// PROBLEM 42: Find Minimum in Array
// ============================================
// Input: Array like "[3, 7, 2, 9, 1]"
// Output: Minimum number
/*
import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String input = br.readLine().trim();
        
        input = input.substring(1, input.length() - 1);
        String[] parts = input.split(",");
        
        int min = Integer.MAX_VALUE;
        for (String part : parts) {
            int num = Integer.parseInt(part.trim());
            min = Math.min(min, num);
        }
        
        System.out.println(min);
    }
}
*/

// ============================================
// TESTING INSTRUCTIONS
// ============================================
/*
HOW TO TEST JAVA SOLUTIONS:

1. Go to your onboarding page (casual/ranked mode)
2. Select Java as the language
3. Copy the solution code for the problem you want to test
4. Remove the comment delimiters (slash-asterisk and asterisk-slash)
5. Make sure the class name is "Main" (your system should handle this)
6. Paste it into the code editor
7. Click Submit/Run

IMPORTANT JAVA NOTES:
- Class must be named "Main" with main method
- Use BufferedReader for input reading
- Use System.out.println() for output
- Parse arrays by removing [] and splitting by comma
- Import java.util.* and java.io.* at the top
- Handle IOException in main method signature

QUICK COMPILE & TEST:
# Test Problem 35 (compile and run)
javac Main.java && echo "5 3" | java Main

# Test Problem 39
javac Main.java && echo "4" | java Main

# Test Problem 18 (array)
javac Main.java && echo "[2,4,6]" | java Main

DEBUGGING TIPS:
- If compilation fails, check import statements
- Make sure class name is exactly "Main"
- Verify main method signature is correct
- Use .trim() on all inputs to remove whitespace
- Test locally with echo commands before submitting
*/
