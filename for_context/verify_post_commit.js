const path = require('path');
const { queryReadOnly } = require(path.join(__dirname, '..', 'db'));

(async () => {
  try {
    const changeId = 14;
    const problemId = 116;

    console.log('--- pending row (id=' + changeId + ') ---');
    const pending = await queryReadOnly(
      `SELECT id, faculty_id, status, record_id, admin_reviewer_id, admin_review_date
       FROM faculty_pending_changes
       WHERE id = ?`, [changeId]
    );
    console.log(JSON.stringify(pending, null, 2));

    console.log('\n--- problem row (problem_id=' + problemId + ') ---');
    const problems = await queryReadOnly(
      `SELECT * FROM problems WHERE problem_id = ? LIMIT 1`, [problemId]
    );
    console.log(JSON.stringify(problems, null, 2));

    console.log('\n--- test_cases for problem_id=' + problemId + ' ---');
    const tcs = await queryReadOnly(
      `SELECT test_case_id, test_case_number, is_sample, input_data, expected_output, score
       FROM test_cases
       WHERE problem_id = ?
       ORDER BY test_case_number`, [problemId]
    );
    console.log(JSON.stringify(tcs, null, 2));

    console.log('\n--- problems_have_topics for problem_id=' + problemId + ' ---');
    const pht = await queryReadOnly(
      `SELECT topic_id FROM problems_have_topics WHERE problem_id = ?`, [problemId]
    );
    console.log(JSON.stringify(pht, null, 2));

    console.log('\n--- topic names for problem_id=' + problemId + ' ---');
    const tnames = await queryReadOnly(
      `SELECT t.topic_id, t.name
       FROM topics t
       JOIN problems_have_topics pht ON t.topic_id = pht.topic_id
       WHERE pht.problem_id = ?`, [problemId]
    );
    console.log(JSON.stringify(tnames, null, 2));

  } catch (err) {
    console.error('ERR', err && err.message ? err.message : err);
    process.exitCode = 1;
  }
})();
