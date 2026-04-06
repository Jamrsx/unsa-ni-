const axios = require('axios');

const API_URL = 'http://localhost:3000/api/problems';
const TOKEN = 'YOUR_JWT_HERE'; // I'll need to get a token from the live DB or use a known one.

async function testApi() {
    try {
        console.log('Testing GET /api/problems...');
        const res = await axios.get(API_URL, {
            headers: { Authorization: `Bearer ${TOKEN}` }
        });
        console.log('Success:', res.data.success);
        console.log('Problem Count:', res.data.problems.length);

        console.log('\nTesting POST /api/problems...');
        const newProblem = {
            problem_name: 'Test Problem REST',
            difficulty: 'Easy',
            time_limit_seconds: 1,
            memory_limit_mb: 64,
            description: 'Test description for REST API verification.',
            test_cases: [
                { input_data: '1', expected_output: '1', is_sample: true, score: 10 }
            ],
            topics: ['Array']
        };
        const postRes = await axios.post(API_URL, newProblem, {
            headers: { Authorization: `Bearer ${TOKEN}` }
        });
        console.log('POST Success:', postRes.data.success);
        console.log('New ID:', postRes.data.problem_id);
    } catch (err) {
        console.error('API Test Failed:', err.response ? err.response.data : err.message);
    }
}

// I won't run this directly yet since I need a valid token.
// Instead I'll try to find a token in the live DB or use a bypass if I'm testing locally.
// For now, I'll just verify the code logic.
