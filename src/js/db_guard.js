// Wrap a mysql2/promise pool to block non-read-only queries when DEBUG_READ_ONLY is enabled
function isReadOnlySql(sql) {
  if (!sql || typeof sql !== 'string') return false;
  return /^\s*(SELECT|SHOW|DESCRIBE|EXPLAIN|WITH)\b/i.test(sql.trim());
}

function wrapDbReadOnly(db) {
  const wrapped = Object.create(db);

  // Override query
  wrapped.query = async function (sql, params) {
    if (!isReadOnlySql(sql)) {
      const err = new Error('Refused to run non-read-only SQL while DEBUG_READ_ONLY is enabled');
      err.code = 'READ_ONLY_VIOLATION';
      throw err;
    }
    return db.query.call(db, sql, params);
  };

  // Override execute as well (some code uses execute)
  wrapped.execute = async function (sql, params) {
    if (!isReadOnlySql(sql)) {
      const err = new Error('Refused to run non-read-only SQL while DEBUG_READ_ONLY is enabled');
      err.code = 'READ_ONLY_VIOLATION';
      throw err;
    }
    return db.execute.call(db, sql, params);
  };

  // Keep getConnection but wrap connection.query/execute too
  wrapped.getConnection = async function () {
    const conn = await db.getConnection();
    const origQuery = conn.query.bind(conn);
    const origExecute = conn.execute ? conn.execute.bind(conn) : null;

    conn.query = async function (sql, params) {
      if (!isReadOnlySql(sql)) {
        const err = new Error('Refused to run non-read-only SQL while DEBUG_READ_ONLY is enabled');
        err.code = 'READ_ONLY_VIOLATION';
        throw err;
      }
      return origQuery(sql, params);
    };

    if (origExecute) {
      conn.execute = async function (sql, params) {
        if (!isReadOnlySql(sql)) {
          const err = new Error('Refused to run non-read-only SQL while DEBUG_READ_ONLY is enabled');
          err.code = 'READ_ONLY_VIOLATION';
          throw err;
        }
        return origExecute(sql, params);
      };
    }

    return conn;
  };

  return wrapped;
}

module.exports = { wrapDbReadOnly };
