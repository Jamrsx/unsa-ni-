const path = require('path');
const { queryReadOnly } = require(path.join(__dirname, '..', 'db'));

(async () => {
  try {
    const problemId = Number(process.argv[2] || 116);

    const rows = await queryReadOnly(
      `SELECT pht.topic_id, pt.topic_name, pt.description
       FROM problems_have_topics pht
       LEFT JOIN problem_topics pt ON pht.topic_id = pt.topic_id
       WHERE pht.problem_id = ?`, [problemId]
    );

    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error('ERR', err && err.message ? err.message : err);
    process.exitCode = 1;
  }
})();
