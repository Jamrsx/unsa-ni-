# Progress Tracking Feature - Updated Implementation

## Overview

The progress tracking feature integrates with your existing `problem_user_progression` and `problem_user_progression_draft_code` tables to display each user's problem-solving status in the Solo.vue component.

## Table Structure

### problem_user_progression
- **id**: Primary key (auto-increment)
- **problem_id**: References problems table
- **user_id**: References users table
- **progress**: ENUM('complete', 'unfinished', 'untouch') - User's status on this problem

### problem_user_progression_draft_code
- **id**: Primary key (auto-increment)
- **problem_user_progress_id**: Foreign key to problem_user_progression.id
- **problem_user_progress_code**: Text field containing draft code

## Progress Status Values

- **complete**: User has successfully completed the problem
- **unfinished**: User started but hasn't finished the problem
- **untouch**: User hasn't started the problem yet (default for no record)

## Backend Implementation

### File: `src/js/conn/solo.js`

Two socket events handle progress tracking:

#### 1. `request_get_solo_questions`
Fetches all approved problems with user's progress status.

**Query Logic:**
- Uses LEFT JOIN with `problem_user_progression`
- Default progress is 'untouch' if no record exists
- Returns: `QuestionID, QuestionName, QuestionDifficulty, ProgressStatus`

**Example Response:**
```javascript
{
  success: true,
  questions: [
    {
      QuestionID: 1,
      QuestionName: "Two Sum",
      QuestionDifficulty: "Easy",
      ProgressStatus: "complete"
    },
    {
      QuestionID: 2,
      QuestionName: "Reverse String",
      QuestionDifficulty: "Easy",
      ProgressStatus: "unfinished"
    },
    {
      QuestionID: 3,
      QuestionName: "Palindrome",
      QuestionDifficulty: "Medium",
      ProgressStatus: "untouch"
    }
  ]
}
```

#### 2. `request_filter_solo_questions`
Filters problems by search, difficulty, and topics while including progress status.

## Frontend Implementation

### File: `src/Solo.vue`

#### Progress Column
The "Progress" column displays formatted status with color coding:

```vue
<td>
  <span :class="getProgressClass(data.ProgressStatus)">
    {{ formatProgressStatus(data.ProgressStatus) }}
  </span>
</td>
```

#### Helper Functions

**`formatProgressStatus(status)`**
- Maps enum values to user-friendly display text:
  - `complete` → "✓ Completed"
  - `unfinished` → "◐ Unfinished"
  - `untouch` → "○ Untouched"

**`getProgressClass(status)`**
- Returns CSS class for styling:
  - `complete` → 'progress-completed' (green #28a745)
  - `unfinished` → 'progress-unfinished' (yellow #ffc107)
  - `untouch` → 'progress-untouched' (gray #6c757d)

#### CSS Styling
```css
.progress-completed { color: #28a745; font-weight: bold; }
.progress-unfinished { color: #ffc107; font-weight: bold; }
.progress-untouched { color: #6c757d; font-weight: normal; }
```

## Sample Data

Use `sql/sample_user_progress_data.sql` to populate test data:

```sql
-- User 4 completed problem 1
INSERT INTO problem_user_progression (problem_id, user_id, progress) 
VALUES (1, 4, 'complete');

-- User 4 is working on problem 2
INSERT INTO problem_user_progression (problem_id, user_id, progress) 
VALUES (2, 4, 'unfinished');

-- Draft code for problem 2
INSERT INTO problem_user_progression_draft_code 
(problem_user_progress_id, problem_user_progress_code) 
VALUES (..., 'function solution() { ... }');
```

## Integration Flow

1. **User loads Solo.vue**
   - Vue component calls `get_solo_questions()`
   - Socket event `request_get_solo_questions` is triggered

2. **Backend processes request**
   - Queries problems with LEFT JOIN to problem_user_progression
   - Uses COALESCE to default to 'untouch' for no records
   - Returns questions with ProgressStatus

3. **Frontend renders**
   - Maps ProgressStatus to display text and CSS class
   - Shows "✓ Completed", "◐ Unfinished", or "○ Untouched"
   - Color-codes each status for quick visual identification

## Testing

### View User's Progress
```sql
SELECT 
  p.problem_id,
  p.problem_name,
  p.difficulty,
  COALESCE(pup.progress, 'untouch') AS user_progress
FROM problems p
LEFT JOIN problem_user_progression pup 
  ON p.problem_id = pup.problem_id 
  AND pup.user_id = 4
ORDER BY p.problem_id;
```

### View Completed Problems Count
```sql
SELECT COUNT(*) as completed_count 
FROM problem_user_progression 
WHERE user_id = 4 AND progress = 'complete';
```

### View User's Draft Code
```sql
SELECT 
  pup.problem_id,
  pup.progress,
  pupdc.problem_user_progress_code
FROM problem_user_progression pup
LEFT JOIN problem_user_progression_draft_code pupdc 
  ON pup.id = pupdc.problem_user_progress_id
WHERE pup.user_id = 4 AND pup.progress = 'unfinished';
```

## Future Enhancements

- Update progress status when user submits/completes a problem
- Display progress percentage (e.g., test cases passed)
- Show draft code alongside problems
- Track time spent on each problem
- Implement difficulty-based statistics

## Notes

- Progress status is per-user, per-problem
- Default status is 'untouch' if no record exists in the database
- Draft code is optional and stored separately for unfinished problems
- All status mappings use the existing enum values from your schema
