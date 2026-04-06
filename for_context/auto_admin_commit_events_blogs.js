const mysql = require('mysql2/promise');

(async ()=>{
  const cfg = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'duelcode_capstone_project'
  };
  const adminId = Number(process.argv[2] || 4);
  const conn = await mysql.createConnection(cfg);
  try {
    const [rows] = await conn.query(`SELECT id, table_name, proposed_data, status FROM faculty_pending_changes WHERE table_name IN ('events','blogs') AND status IN ('pending_admin','pending_faculty_review') ORDER BY id ASC`);
    if (!rows || rows.length === 0) { console.log('NO_PENDING_EVENTS_OR_BLOGS'); return; }
    console.log('Found pending rows:', rows.map(r=>({id:r.id,table:r.table_name,status:r.status})));
    for (const r of rows) {
      try {
        const proposed = r.proposed_data ? JSON.parse(r.proposed_data) : {};
        const table = r.table_name;
        const [colsDesc] = await conn.query(`DESCRIBE ${table}`);
        const tableCols = new Set(colsDesc.map(c=>c.Field));
        const props = Object.keys(proposed || {});
        const insertCols = [];
        const insertVals = [];
        for (const p of props) {
          if (tableCols.has(p)) { insertCols.push(p); insertVals.push(proposed[p]); }
        }
        if (insertCols.length === 0) {
          console.log(`No insertable fields for ${table} id=${r.id}`);
          continue;
        }
        const placeholders = insertCols.map(()=>'?').join(',');
        const q = `INSERT INTO ${table} (${insertCols.join(',')}, created_at) VALUES (${placeholders}, NOW())`;
        const [ins] = await conn.query(q, insertVals);
        const newId = ins.insertId;
        await conn.query(`UPDATE faculty_pending_changes SET status='committed', record_id=?, admin_review_date=NOW(), admin_reviewer_id=?, admin_review_comment=? WHERE id = ?`, [newId, adminId, `Auto-committed by script admin ${adminId}`, r.id]);
        console.log(`Committed ${table} pending id=${r.id} -> ${table} id=${newId}`);
      } catch(e) { console.error('Failed to commit pending id=' + r.id + ':', e && e.message ? e.message : e); }
    }
  } catch(e){ console.error('ERR', e && e.message ? e.message : e); process.exitCode=1; }
  finally { await conn.end(); }
})();
