@echo off
REM End-to-End Test Workflow - Quick Verification Script
REM Windows batch file to run DB queries and verify faculty pending flow

setlocal enabledelayedexpansion

REM Configuration
set MYSQL_HOST=localhost
set MYSQL_USER=root
set MYSQL_PASSWORD=
set MYSQL_DB=duelcode_capstone

echo ========================================
echo E2E Test Workflow - Database Verification
echo ========================================
echo.

REM Check if mysql is available
mysql --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: MySQL client not found. Please ensure MySQL is installed and in PATH.
    pause
    exit /b 1
)

echo Connecting to MySQL database...
echo.

REM STEP 1: Check pending faculty review changes
echo [1] Checking pending_faculty_review changes...
mysql -h %MYSQL_HOST% -u %MYSQL_USER% %MYSQL_DB% << EOF
SELECT id, faculty_id, table_name, action_type, status, DATE_FORMAT(created_at, '%%Y-%%m-%%d %%H:%%i:%%s') as created_at 
FROM faculty_pending_changes 
WHERE status = 'pending_faculty_review' 
ORDER BY id DESC LIMIT 5;
EOF
echo.

REM STEP 2: Check pending admin review changes
echo [2] Checking pending_admin changes...
mysql -h %MYSQL_HOST% -u %MYSQL_USER% %MYSQL_DB% << EOF
SELECT id, faculty_id, table_name, action_type, status, faculty_reviewer_id, DATE_FORMAT(faculty_review_date, '%%Y-%%m-%%d %%H:%%i:%%s') as faculty_review_date
FROM faculty_pending_changes 
WHERE status = 'pending_admin' 
ORDER BY id DESC LIMIT 5;
EOF
echo.

REM STEP 3: Check committed changes
echo [3] Checking committed changes...
mysql -h %MYSQL_HOST% -u %MYSQL_USER% %MYSQL_DB% << EOF
SELECT id, table_name, action_type, record_id, status, admin_reviewer_id, DATE_FORMAT(admin_review_date, '%%Y-%%m-%%d %%H:%%i:%%s') as admin_review_date
FROM faculty_pending_changes 
WHERE status = 'committed' 
ORDER BY id DESC LIMIT 5;
EOF
echo.

REM STEP 4: Check test cases for recently created problems
echo [4] Checking test cases for recent problems...
mysql -h %MYSQL_HOST% -u %MYSQL_USER% %MYSQL_DB% << EOF
SELECT p.problem_id, p.problem_name, COUNT(tc.test_case_id) as test_case_count 
FROM problems p
LEFT JOIN test_cases tc ON p.problem_id = tc.problem_id
WHERE p.problem_id IN (SELECT record_id FROM faculty_pending_changes WHERE status = 'committed' AND table_name = 'problems' ORDER BY id DESC LIMIT 5)
GROUP BY p.problem_id, p.problem_name;
EOF
echo.

REM STEP 5: Check topics for recently created problems
echo [5] Checking topics for recent problems...
mysql -h %MYSQL_HOST% -u %MYSQL_USER% %MYSQL_DB% << EOF
SELECT p.problem_id, p.problem_name, GROUP_CONCAT(pt.topic_name SEPARATOR ', ') as topics
FROM problems p
LEFT JOIN problems_have_topics pht ON p.problem_id = pht.problem_id
LEFT JOIN problem_topics pt ON pht.topic_id = pt.topic_id
WHERE p.problem_id IN (SELECT record_id FROM faculty_pending_changes WHERE status = 'committed' AND table_name = 'problems' ORDER BY id DESC LIMIT 5)
GROUP BY p.problem_id, p.problem_name;
EOF
echo.

echo ========================================
echo E2E Verification Complete
echo ========================================
echo.
echo Manual Verification Steps:
echo 1. Open Faculty Dashboard and create a test problem with test cases and topics
echo 2. Approve the change in Faculty Approvals
echo 3. Commit the change in Admin Approvals
echo 4. Run this script to verify test cases and topics were persisted
echo 5. Edit the problem in Faculty Dashboard to confirm test cases and topics load
echo.

pause
