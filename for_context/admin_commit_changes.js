const mysql = require('mysql2/promise');

// Usage: node admin_commit_changes.js 10 12  (list pending change ids)

(async () => {
  const cfg = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'duelcode_capstone_project'
  };

  const adminId = Number(process.argv[process.argv.length-1]) || 4; // optional last arg can be admin id
  const changeIds = process.argv.slice(2, process.argv.length-1).map(x => Number(x)).filter(Boolean);
  // If no changeIds passed, default to [10,12]
  const ids = changeIds.length ? changeIds : [10,12];

  const conn = await mysql.createConnection(cfg);
  try {
    for (const id of ids) {
      const [rows] = await conn.query('SELECT * FROM faculty_pending_changes WHERE id = ? LIMIT 1', [id]);
      if (!rows || rows.length === 0) {
        console.log(`No pending row for id=${id}`);
        continue;
      }
      const row = rows[0];
      if (row.status === 'committed') {
        console.log(`id=${id} already committed -> record_id=${row.record_id}`);
        continue;
      }
      const proposed = row.proposed_data ? JSON.parse(row.proposed_data) : {};
      const table = row.table_name;

      if (table === 'events' || table === 'blogs') {
        // get actual columns for the target table
        const descTable = table === 'events' ? 'events' : 'blogs';
        const [colsDesc] = await conn.query(`DESCRIBE ${descTable}`);
        const tableCols = new Set(colsDesc.map(c => c.Field));

        const props = Object.keys(proposed || {});
        const insertCols = [];
        const insertVals = [];
        for (const p of props) {
          if (tableCols.has(p)) {
            insertCols.push(p);
            insertVals.push(proposed[p]);
          }
        }

        if (insertCols.length === 0) {
          console.log(`No insertable fields found for ${table} (id=${id})`);
        } else {
          const placeholders = insertCols.map(() => '?').join(',');
          const q = `INSERT INTO ${descTable} (${insertCols.join(',')}, created_at) VALUES (${placeholders}, NOW())`;
          const [ins] = await conn.query(q, insertVals);
          const newId = ins.insertId;
          await conn.query(`UPDATE faculty_pending_changes SET status='committed', record_id=?, admin_review_date=NOW(), admin_reviewer_id=?, admin_review_comment=? WHERE id = ?`, [newId, adminId, `Committed by admin ${adminId}`, id]);
          console.log(`Committed ${table} id=${id} -> ${descTable} id=${newId}`);
        }
      } else {
        console.log(`Unsupported table for admin commit: ${table} (id=${id})`);
      }
      // Support problems: insert problem, then nested test_cases and problems_have_topics
      if (table === 'problems') {
        const props = proposed || {};

        // Describe target tables to adapt to actual schema
        const [probDesc] = await conn.query('DESCRIBE problems');
        const probCols = probDesc.map(c => c.Field);
        const probAuto = probDesc.some(c => /auto_increment/i.test(c.Extra || ''));

        // Build insert column list for problems based on available props and table columns
        const insertCols = [];
        const insertVals = [];
        for (const k of Object.keys(props)) {
          if (probCols.includes(k)) {
            insertCols.push(k);
            insertVals.push(props[k]);
          }
        }

        // If problem_id is not auto-increment and not provided, allocate a new id
        let needsExplicitId = false;
        if (!probAuto && probCols.includes('problem_id') && !insertCols.includes('problem_id')) needsExplicitId = true;

        await conn.query('START TRANSACTION');
        try {
          if (needsExplicitId) {
            const [[{ maxid }]] = await conn.query('SELECT COALESCE(MAX(problem_id),0) AS maxid FROM problems');
            const newPid = Number(maxid) + 1;
            insertCols.unshift('problem_id');
            insertVals.unshift(newPid);
          }

          if (insertCols.length === 0) {
            throw new Error('No insertable problem columns found for id=' + id);
          }

          const placeholders = insertCols.map(()=>'?').join(',');
          const q = `INSERT INTO problems (${insertCols.join(',')}) VALUES (${placeholders})`;
          const [ins] = await conn.query(q, insertVals);
          const newId = ins.insertId || (needsExplicitId ? insertVals[0] : null);

          // Insert test_cases if present, adapting to test_cases schema
          if (props.test_cases && Array.isArray(props.test_cases)) {
            const [tcDesc] = await conn.query('DESCRIBE test_cases');
            const tcCols = tcDesc.map(c=>c.Field);
            for (const tc of props.test_cases) {
              const rowCols = [];
              const rowVals = [];
              if (tcCols.includes('problem_id')) { rowCols.push('problem_id'); rowVals.push(newId); }
              if (tcCols.includes('test_case_number')) { rowCols.push('test_case_number'); rowVals.push(tc.TestCaseNumber || tc.test_case_number || 0); }
              if (tcCols.includes('is_sample')) { rowCols.push('is_sample'); rowVals.push(tc.IsSample ? 1 : (tc.is_sample?1:0)); }
              if (tcCols.includes('input_data')) { rowCols.push('input_data'); rowVals.push(tc.InputData || tc.input_data || ''); }
              if (tcCols.includes('expected_output')) { rowCols.push('expected_output'); rowVals.push(tc.ExpectedOutput || tc.expected_output || ''); }
              if (tcCols.includes('score')) { rowCols.push('score'); rowVals.push(tc.Score || tc.score || 0); }
              if (rowCols.length) {
                const ph = rowCols.map(()=>'?').join(',');
                await conn.query(`INSERT INTO test_cases (${rowCols.join(',')}) VALUES (${ph})`, rowVals);
              }
            }
          }

          // Insert topics mapping if table exists
          if (props.topics && Array.isArray(props.topics)) {
            const [pthDesc] = await conn.query('DESCRIBE problems_have_topics');
            const pthCols = pthDesc.map(c=>c.Field);
            for (const t of props.topics) {
              const topicId = (typeof t === 'object' && (t.TopicID || t.topic_id)) ? (t.TopicID || t.topic_id) : Number(t);
              if (isNaN(topicId)) continue;
              const cols = [];
              const vals = [];
              if (pthCols.includes('problem_id')) { cols.push('problem_id'); vals.push(newId); }
              if (pthCols.includes('topic_id')) { cols.push('topic_id'); vals.push(topicId); }
              if (cols.length) {
                const ph = cols.map(()=>'?').join(',');
                await conn.query(`INSERT INTO problems_have_topics (${cols.join(',')}) VALUES (${ph})`, vals);
              }
            }
          }

          // Mark pending as committed
          const commitId = newId || (needsExplicitId ? insertVals[0] : null);
          await conn.query(`UPDATE faculty_pending_changes SET status='committed', record_id=?, admin_review_date=NOW(), admin_reviewer_id=?, admin_review_comment=? WHERE id = ?`, [commitId, adminId, `Committed by admin ${adminId}`, id]);
          await conn.query('COMMIT');
          console.log(`Committed problems id=${id} -> problems id=${commitId}`);
        } catch (e) {
          await conn.query('ROLLBACK');
          console.error('Failed to commit problem id=' + id + ':', e && e.message ? e.message : e);
        }
      }
    }
  } catch (err) {
    console.error('ERR', err && err.message ? err.message : err);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
})();
