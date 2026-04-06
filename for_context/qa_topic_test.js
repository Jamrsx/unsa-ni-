const io = require('socket.io-client');

// Replace this token with the FACULTY_TOKEN printed by seed_faculty_token.js
const FACULTY_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjEsInVzZXJuYW1lIjoiZmFjdWx0eV90ZXN0X3VzZXIiLCJlbWFpbCI6ImZhY3VsdHlfdGVzdF91c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6ImZhY3VsdHkiLCJpYXQiOjE3NjYzMDc1NDMsImV4cCI6MTc2NjkxMjM0M30.3YgAKK24H1bjcR-Y3389kBvaz685BjG_0WtWY8PR6Tg";

const socket = io('http://localhost:3000', { reconnection: false, transports: ['polling'], auth: { token: FACULTY_TOKEN } });

socket.on('connect', () => {
  console.log('QA: connected to server, socket id', socket.id);

  // Create a problem with topics
  const payload = {
    token_session: FACULTY_TOKEN,
    problem_name: 'QA Topic Persistence Test',
    description: 'Problem created by QA script',
    difficulty: 'Medium',
    time_limit_seconds: 1,
    memory_limit_mb: 64,
    sample_solution: '',
    topics: ['Dynamic Programming', 'Math'],
    test_cases: [ { TestCaseNumber: 1, InputData: '[]', ExpectedOutput: '', IsSample: 1, Score: 0 } ]
  };

  console.log('QA: emitting request_create_faculty_problem');
  socket.emit('request_create_faculty_problem', payload);

  socket.on('response_create_faculty_problem', (res) => {
    console.log('QA: response_create_faculty_problem ->', res);
    if (!res || !res.success) {
      console.error('QA: create failed');
      socket.close();
      process.exit(1);
      return;
    }

    const createdId = res.problem_id;
    // Fetch faculty problems to verify topics
    socket.emit('request_get_faculty_problems', { token_session: FACULTY_TOKEN });

    socket.on('response_get_faculty_problems', (data) => {
      if (!data || !data.success) {
        console.error('QA: failed to fetch faculty problems');
        socket.close();
        process.exit(1);
        return;
      }

      const rows = data.problems || data.rows || [];
      const found = rows.find(r => r.problem_id === createdId || r.problem_name === 'QA Topic Persistence Test');
      if (!found) {
        console.error('QA: created problem not found in faculty problems result');
        console.log('Total problems returned:', rows.length);
      } else {
        console.log('QA: Found created problem:', found.problem_id || found.ProblemID, found.problem_name || found.ProblemName);
        console.log('QA: Topics for the problem:', found.topics || found.Topics || found.problem_topics || '(none)');
      }

      socket.close();
      process.exit(0);
    });
  });
});

socket.on('connect_error', (err) => {
  console.error('QA: connect_error', err && err.message);
  process.exit(1);
});

socket.on('error', (e) => { console.error('QA socket error', e); });
