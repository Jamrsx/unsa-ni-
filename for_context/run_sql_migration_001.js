// run_sql_migration_001.js
// Executes the SQL in sql/001_faculty_dashboard_migration.sql using the shared db pool.
// Usage:
//   node for_context/run_sql_migration_001.js [optional_path_to_sql]
// Env:
//   DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME (defaults are set in db.js)

const fs = require('fs');
const path = require('path');
const { pool } = require(path.join(__dirname, '..', 'db'));

function readSqlFile(sqlPath) {
  const raw = fs.readFileSync(sqlPath, 'utf8');
  // Normalize line endings and strip BOM
  const text = raw.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  // Remove single-line comments starting with --
  const noComments = text
    .split('\n')
    .filter((line) => !/^\s*--/.test(line))
    .join('\n');
  return noComments.trim();
}

function splitStatements(sqlText) {
  // Split by semicolons globally; filter out empty segments.
  // Note: Assumes no semicolons inside string literals.
  const parts = sqlText
    .split(/;/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return parts;
}

async function execStatements(statements) {
  const conn = await pool.getConnection();
  let ok = 0;
  let fail = 0;
  const errors = [];
  try {
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      // Skip purely empty or comment blocks
      if (!stmt || /^\s*$/.test(stmt)) continue;
      try {
        await conn.query(stmt);
        ok++;
        console.log(`[OK ${ok}]`, summarize(stmt));
      } catch (err) {
        fail++;
        const msg = err && err.message ? err.message : String(err);
        console.error(`[FAIL ${fail}]`, summarize(stmt), '\n ->', msg);
        errors.push({ index: i + 1, stmt: summarize(stmt), error: msg });
      }
    }
  } finally {
    conn.release();
  }
  return { ok, fail, errors };
}

function summarize(sql) {
  // Compact summary: first line up to 120 chars
  const firstLine = sql.split('\n')[0].trim();
  return firstLine.length > 120 ? firstLine.slice(0, 120) + '…' : firstLine;
}

async function main() {
  try {
    const defaultPath = path.join(__dirname, '..', 'sql', '001_faculty_dashboard_migration.sql');
    const sqlPath = process.argv[2] ? path.resolve(process.argv[2]) : defaultPath;
    console.log('Using SQL file:', sqlPath);
    if (!fs.existsSync(sqlPath)) {
      console.error('SQL file not found:', sqlPath);
      process.exit(2);
    }
    const sqlText = readSqlFile(sqlPath);
    const statements = splitStatements(sqlText);
    if (!statements.length) {
      console.error('No executable SQL statements found.');
      process.exit(2);
    }
    // Pre-check: ensure permissions.category exists to match INSERT column list
    await ensurePermissionsCategory();
    console.log('Executing', statements.length, 'statements on database:', process.env.DB_NAME || 'duelcode_capstone_project');
    const { ok, fail, errors } = await execStatements(statements);
    console.log('\nMigration completed. OK:', ok, 'Failed:', fail);
    if (fail > 0) {
      console.log('Failures summary:');
      errors.forEach((e, idx) => console.log(` ${idx + 1}. [Stmt] ${e.stmt}\n    -> ${e.error}`));
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Migration error:', err && err.message ? err.message : err);
    process.exit(2);
  }
}

if (require.main === module) {
  main();
}

async function ensurePermissionsCategory() {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      "SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'permissions'"
    );
    const cols = rows.map((r) => (r.COLUMN_NAME || r.column_name || '').toLowerCase());
    if (!cols.includes('category')) {
      console.log('Adding permissions.category column (VARCHAR(64) NULL)');
      await conn.query('ALTER TABLE `permissions` ADD COLUMN `category` VARCHAR(64) NULL');
    }
  } catch (err) {
    console.warn('Schema check warning (permissions.category):', err && err.message ? err.message : err);
  } finally {
    conn.release();
  }
}
