const io = require('socket.io-client');
const jwt = require('jsonwebtoken');

// Create a valid JWT token for testing (admin user)
const adminToken = jwt.sign(
  { id: 1, username: 'Admin User', role: 'admin' },
  'supersecretkey',
  { expiresIn: '1h' }
);

const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

async function testSocketHandler(eventName, payload, expectedFields = []) {
  return new Promise((resolve) => {
    const socket = io('http://localhost:3000', {
      reconnection: false,
      forceNew: true
    });

    const timeout = setTimeout(() => {
      socket.disconnect();
      testResults.tests.push({
        event: eventName,
        status: 'TIMEOUT',
        message: `No response within 5 seconds`
      });
      testResults.failed++;
      resolve();
    }, 5000);

    socket.on('connect', () => {
      console.log(`  ↳ Connected to server`);
      
      // Send request and listen for response
      const responseEvent = eventName.replace('request_', 'response_');
      socket.emit(eventName, payload);

      socket.on(responseEvent, (data) => {
        clearTimeout(timeout);
        const hasSuccess = data.success !== false;
        const hasExpectedFields = expectedFields.every(field => field in data);
        
        if (hasSuccess && hasExpectedFields) {
          testResults.tests.push({
            event: eventName,
            status: 'PASS',
            message: `Received valid response`,
            dataPreview: JSON.stringify(data).substring(0, 100)
          });
          testResults.passed++;
        } else {
          testResults.tests.push({
            event: eventName,
            status: 'FAIL',
            message: `success=${hasSuccess}, hasFields=${hasExpectedFields}, error="${data.message || 'N/A'}"`,
            response: JSON.stringify(data).substring(0, 250)
          });
          testResults.failed++;
        }
        socket.disconnect();
        resolve();
      });

      socket.on('error', (err) => {
        clearTimeout(timeout);
        testResults.tests.push({
          event: eventName,
          status: 'ERROR',
          message: err.message || 'Socket error'
        });
        testResults.failed++;
        socket.disconnect();
        resolve();
      });
    });

    socket.on('error', (err) => {
      clearTimeout(timeout);
      testResults.tests.push({
        event: eventName,
        status: 'ERROR',
        message: err.message || 'Connection error'
      });
      testResults.failed++;
      resolve();
    });
  });
}

async function runTests() {
  console.log('\n========== SOCKET HANDLER TESTS ==========\n');
  
  // Test 1: Dashboard Details
  console.log('1. Testing request_get_dashboard_details...');
  await testSocketHandler('request_get_dashboard_details', { token_session: adminToken }, ['total_users', 'total_question_sets']);

  // Test 2: All Users
  console.log('2. Testing request_get_all_users...');
  await testSocketHandler('request_get_all_users', { token_session: adminToken }, ['users']);

  // Test 3: All Admins
  console.log('3. Testing request_get_all_admins...');
  await testSocketHandler('request_get_all_admins', { token_session: adminToken }, ['admins']);

  // Test 4: Global Blogs
  console.log('4. Testing request_get_global_blogs...');
  await testSocketHandler('request_get_global_blogs', { token_session: adminToken }, ['blogs']);

  // Test 5: Pending Blogs
  console.log('5. Testing request_get_pending_blogs...');
  await testSocketHandler('request_get_pending_blogs', { token_session: adminToken }, ['blogs']);

  // Test 6: Global Events
  console.log('6. Testing request_get_global_events...');
  await testSocketHandler('request_get_global_events', { token_session: adminToken }, ['events']);

  // Test 7: Pending Questions
  console.log('7. Testing request_get_pending_questions...');
  await testSocketHandler('request_get_pending_questions', { token_session: adminToken }, ['questions']);

  // Print results
  console.log('\n========== TEST RESULTS ==========\n');
  
  testResults.tests.forEach((test, i) => {
    const icon = { 'PASS': '✓', 'FAIL': '✗', 'ERROR': '⚠', 'TIMEOUT': '⏱' }[test.status] || '?';
    console.log(`${icon} [${test.status}] ${test.event}`);
    if (test.message) console.log(`    ${test.message}`);
    if (test.dataPreview) console.log(`    Data: ${test.dataPreview}...`);
  });

  console.log(`\n\nSummary: ${testResults.passed} PASSED, ${testResults.failed} FAILED`);
  console.log(`\n========== END TEST ==========\n`);

  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
