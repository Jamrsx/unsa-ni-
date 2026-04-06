# End-to-End Test Workflow: Faculty Problems Pending Flow

## Objective
Validate that faculty-created problems with test cases and topics flow through:
1. **Faculty create** → pending_faculty_review
2. **Faculty approve** → pending_admin
3. **Admin commit** → persists test cases and topics
4. **Admin delete** → cascades delete test cases and topic links

## Prerequisites
- Server running on `localhost:3000` or vite dev on `localhost:5173`
- Two browser sessions or tabs:
  - **Faculty Tab**: Faculty user (role: `faculty`)
  - **Admin Tab**: Admin user (role: `admin`)
- Access to browser DevTools Console and Application tab for localStorage inspection

---

## Test Sequence

### Step 1: Faculty Create Problem with Test Cases & Topics

1. **In Faculty Tab**, navigate to **Dashboard → Problems → + Create Problem**
2. Fill in problem details:
   - **Name**: `E2E Test Problem`
   - **Difficulty**: `Medium`
   - **Description**: `Test problem for end-to-end validation`
   - **Sample Solution**: `print("Hello")`
   - **Time Limit**: 1 second
   - **Memory Limit**: 64 MB
3. **Add Test Cases** (2+ cases):
   - TC1: Input=`5`, Expected=`5`, Sample=✓, Score=10
   - TC2: Input=`10`, Expected=`20`, Sample=✗, Score=20
4. **Add Topics**:
   - Add 2 topics (e.g., `Arrays`, `Sorting`)
5. **Click Create**
   - Expected: Toast "Problem created and pending approval" (status: `pending_faculty_review`)
   - Check console: Socket should emit `request_create_faculty_problem` and receive `response_create_faculty_problem`

**Verify in DB**:
```sql
SELECT id, faculty_id, table_name, action_type, status, proposed_data 
FROM faculty_pending_changes 
WHERE table_name = 'problems' 
ORDER BY id DESC LIMIT 1;
```
- Confirm: `status = 'pending_faculty_review'`, `proposed_data` includes `test_cases` and `topics`

---

### Step 2: Faculty Approve Change (Move to pending_admin)

1. **In Faculty Tab**, navigate to **Dashboard → Approvals → Pending (Approvals tab)**  
   - Source: `FacultyDashboard.vue` → `loadPendingApprovals()` uses `adminSocket.getPendingApprovals` (Level 1 `approvals` table via `request_get_pending_approvals` in `src/js/conn/dashboard_admin_and_user_socket.js`).
2. Find the problem created in Step 1
3. **Click Approve** (green checkmark)
   - Expected: Toast "Change approved and sent to admin"
   - DB: `faculty_pending_changes.status` → `pending_admin`, `faculty_reviewer_id` set

**Verify in DB**:
```sql
SELECT id, status, faculty_reviewer_id, faculty_review_date 
FROM faculty_pending_changes 
WHERE table_name = 'problems'
ORDER BY id DESC LIMIT 1;
```
- Confirm: `status = 'pending_admin'`

---

### Step 3: Admin Commit Change (Create/Persist Problem with Test Cases & Topics)

1. **In Admin Tab**, navigate to **Dashboard → Approvals (Admin) → Pending**  
   - Source: `AdminDashboard.vue` / `admin-dashboard.js` using `request_get_pending_approvals` (Level 1 `approvals` table) defined in `src/js/conn/dashboard_admin_and_user_socket.js`.
2. Find the problem from Step 2
3. **Click Commit** (or **Approve & Commit**)
   - Expected: Toast "Change committed successfully"
   - DB: `faculty_pending_changes.status` → `committed`, `admin_reviewer_id` set, `record_id` populated

**Verify in DB**:

Check pending status:
```sql
SELECT id, status, admin_reviewer_id, admin_review_date, record_id 
FROM faculty_pending_changes 
WHERE table_name = 'problems'
ORDER BY id DESC LIMIT 1;
```
- Confirm: `status = 'committed'`, `record_id` is not null (problem_id)

Check problem created:
```sql
SELECT problem_id, problem_name, difficulty, description 
FROM problems 
WHERE problem_id = <record_id from above>;
```
- Confirm: Problem exists with correct fields

**CRITICAL: Verify test cases persisted**:
```sql
SELECT problem_id, test_case_number, is_sample, input_data, expected_output, score 
FROM test_cases 
WHERE problem_id = <record_id>;
```
- Confirm: 2 test cases from Step 1 exist with correct data

**CRITICAL: Verify topics persisted**:
```sql
SELECT pht.problem_id, pt.topic_id, pt.topic_name 
FROM problems_have_topics pht
JOIN problem_topics pt ON pht.topic_id = pt.topic_id
WHERE pht.problem_id = <record_id>;
```
- Confirm: 2 topics from Step 1 are linked

---

### Step 4: Verify Problem in Faculty Dashboard

1. **In Faculty Tab**, navigate to **Dashboard → Problems → Global Problem** or **My Problem**
2. Search for `E2E Test Problem`
3. **Click View**
   - Expected: Modal shows problem details + test cases + topics pills

4. **Click Edit**
   - Expected: Modal loads with test cases and topics pre-populated
   - Verify: All 2 test cases visible with correct Input/Expected/Sample/Score
   - Verify: Topics displayed as pills

---

### Step 5: Admin Delete Commit (Cascade Delete Test Cases & Topics)

1. **In Admin Tab**, create another pending problem (repeat Step 1 in Faculty Tab, then Step 2 for faculty approval)
2. **In Admin Tab**, find the new pending problem
3. **Click Delete** (or icon)
   - Confirm deletion prompt
   - Expected: Toast "Change deleted successfully" or status → `rejected`

**Verify Cascade Delete in DB**:

Test cases should be deleted:
```sql
SELECT COUNT(*) as tc_count 
FROM test_cases 
WHERE problem_id = <deleted_problem_id>;
```
- Confirm: 0 rows

Topics links should be deleted:
```sql
SELECT COUNT(*) as topic_count 
FROM problems_have_topics 
WHERE problem_id = <deleted_problem_id>;
```
- Confirm: 0 rows

Problem should be deleted:
```sql
SELECT COUNT(*) as problem_count 
FROM problems 
WHERE problem_id = <deleted_problem_id>;
```
- Confirm: 0 rows

---

## Expected Outcomes

✅ **Test Cases Persist**: After admin commit, test cases appear in both DB and edit modal  
✅ **Topics Persist**: After admin commit, topics appear in both DB and edit modal  
✅ **Cascade Delete**: Admin delete removes problem, test cases, and topic links atomically  
✅ **Approval Flow**: Faculty → Admin → Committed transitions occur smoothly  

## Troubleshooting

| Issue | Check |
|-------|-------|
| "Socket not connected" during create | Ensure JWT token is valid, server socket listening, browser DevTools shows connected |
| Pending change not appearing in admin | Check `faculty_pending_changes.status = 'pending_admin'` and `faculty_reviewer_id` is set |
| Test cases not persisted | Verify `test_cases` array in `proposed_data` JSON, check transaction in commit logs |
| Topics not persisted | Verify `topics` array in `proposed_data`, confirm `problem_topics` table has entries |
| Cascade delete failed | Check transaction logs; confirm connection support for `beginTransaction()` |

---

## Notes

- **Transaction Safety**: Commit and delete use DB transactions to ensure atomicity.
- **Topic Resolution**: Topics are resolved by name (created if missing) or by ID.
- **Field Mapping**: `test_cases` and `topics` are nested in `proposed_data`, extracted during commit.

---

## Quick CLI Commands (Optional)

```bash
# Tail server logs if available
npm run dev  # or watch logs

# Connect to MySQL and inspect
mysql -h localhost -u root -p duelcode_capstone
```

Then run the SQL queries above to verify persistence.
