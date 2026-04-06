// check_blogs.js
const path = require('path');
const { queryReadOnly } = require(path.join(__dirname, '..', 'db'));

async function main() {
    try {
        const blogs = await queryReadOnly('SELECT blog_id, author_id, title FROM blogs ORDER BY blog_id DESC LIMIT 5');
        console.log('Recent 5 blogs:', blogs);
        
        const contentBlogs = await queryReadOnly(`
            SELECT cb.blog_id, cb.content_item_id, ci.content_type, a.requested_by, a.status
            FROM content_blogs cb
            LEFT JOIN content_items ci ON cb.content_item_id = ci.content_item_id
            LEFT JOIN approvals a ON ci.content_item_id = a.content_item_id
            ORDER BY cb.blog_id DESC
            LIMIT 5
        `);
        console.log('\nRecent 5 content_blogs links:', contentBlogs);
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

if (require.main === module) main();
