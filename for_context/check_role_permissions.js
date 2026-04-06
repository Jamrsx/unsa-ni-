const db = require('../db.js');

const query = `
SELECT 
  r.role_name, 
  p.permission_name,
  p.category
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.role_id
JOIN permissions p ON rp.permission_id = p.permission_id
WHERE r.role_name IN ('admin', 'faculty')
ORDER BY r.role_name, p.category, p.permission_name
`;

db.queryReadOnly(query)
  .then(results => {
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(err.message);
    process.exit(1);
  });
