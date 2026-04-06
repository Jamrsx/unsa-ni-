// test_queries.js - Test the "my items" queries
const path = require('path');
const { queryReadOnly } = require(path.join(__dirname, '..', 'db'));

async function main() {
    try {
        const userId = 20; // faculty_test_user
        
        console.log('=== TESTING "MY PROBLEMS" QUERY ===');
        const problems = await queryReadOnly(`
            SELECT p.problem_id, p.problem_name, p.difficulty, a.status, ci.content_item_id, a.requested_by, a.approval_id
            FROM problems p
            LEFT JOIN content_problems cp ON p.problem_id = cp.problem_id
            LEFT JOIN content_items ci ON cp.content_item_id = ci.content_item_id
            LEFT JOIN approvals a ON ci.content_item_id = a.content_item_id
            WHERE a.requested_by = ? OR a.approved_by = ?
            ORDER BY p.problem_id DESC
            LIMIT 10
        `, [userId, userId]);
        console.log(`Found ${problems.length} problems:`);
        problems.forEach(p => {
            console.log(`  [${p.problem_id}] ${p.problem_name} - Status: ${p.status} (Approval: ${p.approval_id}, Requested by: ${p.requested_by})`);
        });
        
        console.log('\n=== TESTING "MY EVENTS" QUERY ===');
        const events = await queryReadOnly(`
            SELECT e.event_id, e.event_name, a.status, ci.content_item_id, a.requested_by, a.approval_id
            FROM events e
            LEFT JOIN content_events ce ON e.event_id = ce.event_id
            LEFT JOIN content_items ci ON ce.content_item_id = ci.content_item_id
            LEFT JOIN approvals a ON ci.content_item_id = a.content_item_id
            WHERE a.requested_by = ? OR a.approved_by = ?
            ORDER BY e.event_id DESC
            LIMIT 10
        `, [userId, userId]);
        console.log(`Found ${events.length} events:`);
        events.forEach(e => {
            console.log(`  [${e.event_id}] ${e.event_name} - Status: ${e.status} (Approval: ${e.approval_id})`);
        });
        
        console.log('\n=== TESTING "MY BLOGS" QUERY ===');
        const blogs = await queryReadOnly(`
            SELECT b.blog_id, b.title, a.status, ci.content_item_id, a.requested_by, a.approval_id
            FROM blogs b
            LEFT JOIN content_blogs cb ON b.blog_id = cb.blog_id
            LEFT JOIN content_items ci ON cb.content_item_id = ci.content_item_id
            LEFT JOIN approvals a ON ci.content_item_id = a.content_item_id
            WHERE a.requested_by = ? OR a.approved_by = ?
            ORDER BY b.blog_id DESC
            LIMIT 10
        `, [userId, userId]);
        console.log(`Found ${blogs.length} blogs:`);
        blogs.forEach(b => {
            console.log(`  [${b.blog_id}] ${b.title} - Status: ${b.status} (Approval: ${b.approval_id})`);
        });
        
        console.log('\n=== DEBUGGING APPROVALS FOR USER 20 ===');
        const approvals = await queryReadOnly(`
            SELECT approval_id, content_item_id, requested_by, approved_by, status, created_at
            FROM approvals
            WHERE requested_by = 20
            ORDER BY created_at DESC
            LIMIT 10
        `);
        console.log(`Found ${approvals.length} approvals:` );
        approvals.forEach(a => {
            console.log(`  [${a.approval_id}] Content: ${a.content_item_id} - Status: ${a.status} - Req: ${a.requested_by}, Approved: ${a.approved_by}`);
        });
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

if (require.main === module) main();
