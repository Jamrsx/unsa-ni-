@echo off
echo ====================================
echo Faculty Approval Permissions Setup
echo ====================================
echo.
echo This will guide you through setting up faculty approval permissions.
echo.
echo STEP 1: Run SQL Migration
echo --------------------------
echo Open phpMyAdmin (http://localhost/phpmyadmin) or MySQL Workbench
echo Select database: duelcode_capstone_project
echo Run the SQL file: sql\001_faculty_dashboard_migration.sql
echo.
echo STEP 2: Apply Backend Changes
echo -----------------------------
echo Follow instructions in these files:
echo   - APPLY_PERMISSION_CHANGES_server.txt
echo   - APPLY_PERMISSION_CHANGES_socket.txt
echo.
echo STEP 3: Restart Node Server
echo ---------------------------
echo Press Ctrl+C in the node terminal and run: node server.js
echo.
echo STEP 4: Grant Permissions via Admin Dashboard
echo --------------------------------------------
echo 1. Login as Admin
echo 2. Go to Admin Dashboard ^> Admin
echo 3. Click Edit on a faculty user
echo 4. Toggle permissions under Question Set, Event, and Blog sections
echo 5. Click Save
echo.
echo STEP 5: Test
echo -----------
echo 1. Login as the faculty user
echo 2. Go to Faculty Dashboard ^> Problems ^> Pending Question
echo 3. You should see green/red approve/deny buttons
echo 4. Click approve - should work!
echo.
echo Press any key to exit...
pause > nul
