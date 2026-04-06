const path = require('path');
const { queryReadOnly } = require(path.join(__dirname, '..', 'db'));

(async () => {
  try {
    console.log('--- recent pending events/blogs ---');
    const pend = await queryReadOnly(
      `SELECT id, faculty_id, table_name, action_type, status, record_id, created_at
       FROM faculty_pending_changes
       WHERE table_name IN ('events','blogs')
       ORDER BY id DESC
       LIMIT 10`
    );
    console.log(JSON.stringify(pend, null, 2));

    console.log('\n--- describe events ---');
    try {
      const de = await queryReadOnly('DESCRIBE events');
      console.log(JSON.stringify(de.map(c=>c.Field), null, 2));
    } catch(e) { console.log('events table missing or DESCRIBE failed:', e.message); }

    console.log('\n--- describe blogs ---');
    try {
      const dbs = await queryReadOnly('DESCRIBE blogs');
      console.log(JSON.stringify(dbs.map(c=>c.Field), null, 2));
    } catch(e) { console.log('blogs table missing or DESCRIBE failed:', e.message); }

    // If there are committed rows, list sample committed records
    const recentCommitted = await queryReadOnly(
      `SELECT id, table_name, record_id FROM faculty_pending_changes
       WHERE status = 'committed' AND table_name IN ('events','blogs')
       ORDER BY id DESC LIMIT 5`
    );
    console.log('\n--- recent committed events/blogs pending rows ---');
    console.log(JSON.stringify(recentCommitted, null, 2));

    for (const r of recentCommitted) {
      if (r.table_name === 'events'){
        try{
          const ev = await queryReadOnly('SELECT * FROM events WHERE event_id = ? LIMIT 1', [r.record_id]);
          console.log('\nEVENT record for record_id=' + r.record_id + ':', JSON.stringify(ev, null, 2));
        }catch(e){ console.log('Failed to fetch event record:', e.message); }
      }
      if (r.table_name === 'blogs'){
        try{
          const bl = await queryReadOnly('SELECT * FROM blogs WHERE blog_id = ? LIMIT 1', [r.record_id]);
          console.log('\nBLOG record for record_id=' + r.record_id + ':', JSON.stringify(bl, null, 2));
        }catch(e){ console.log('Failed to fetch blog record:', e.message); }
      }
    }

  } catch (err) {
    console.error('ERR', err && err.message ? err.message : err);
    process.exitCode = 1;
  }
})();
