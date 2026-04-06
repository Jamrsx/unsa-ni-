// db_get_tables.js
// Simple dev helper: lists tables in the configured database.
// Usage (dev only):
//   node for_context/db_get_tables.js [database_name]
// The script uses `../db.js` pool and queryReadOnly helper.

const path = require('path')
const { queryReadOnly } = require(path.join(__dirname, '..', 'db'))

const argvDb = process.argv[2]
const DB_NAME = process.env.DB_NAME || argvDb || 'duelcode_capstone_project'

async function listTables(dbName) {
	const sql = `SELECT TABLE_NAME as table_name
		FROM information_schema.tables
		WHERE table_schema = ?
		ORDER BY TABLE_NAME`;
	const rows = await queryReadOnly(sql, [dbName]);
	return rows.map(r => r.table_name || r.TABLE_NAME)
}

async function main() {
	try {
		console.log('Listing tables for database:', DB_NAME)
		const tables = await listTables(DB_NAME)
		if (!tables || tables.length === 0) {
			console.log('No tables found or database does not exist.')
			process.exit(0)
		}
		console.log('Found', tables.length, 'tables:')
		tables.forEach((t) => console.log(' -', t))
	} catch (err) {
		console.error('Error listing tables:', err && err.message ? err.message : err)
		process.exit(2)
	}
}

if (require.main === module) main()

module.exports = { listTables }