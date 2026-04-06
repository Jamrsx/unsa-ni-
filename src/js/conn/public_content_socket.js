module.exports = function registerPublicContentSocket(socket, db, bcrypt, jwt) {
    // Helper to ensure thumbnail urls start with '/'
    function normalizeUrl(u) {
        if (!u) return '';
        if (u.startsWith('/')) return u;
        return '/' + u;
    }

    // Return a list of approved blogs
    socket.on('request_get_blogs', async () => {
        try {
            const [rows] = await db.query(
                `SELECT blog_id, author_id, thumbnail_url, title, content_type, published_at
                 FROM blogs
                 WHERE status = 'approved'
                 ORDER BY published_at DESC
                 LIMIT 50`
            );

            const blogs = rows.map(r => ({
                blog_id: r.blog_id,
                author_id: r.author_id,
                thumbnail_url: normalizeUrl(r.thumbnail_url),
                title: r.title,
                content_type: r.content_type,
                published_at: r.published_at
            }));

            socket.emit('response_get_blogs', { success: true, blogs });
        } catch (err) {
            console.error('Error in request_get_blogs:', err);
            socket.emit('response_get_blogs', { success: false, message: 'Server error' });
        }
    });

    // Return a single blog by id (only latest approved version)
    socket.on('request_get_blog_by_id', async ({ blog_id }) => {
        try {
            // Prefer the blog version whose latest approval row is approved.
            const [rows] = await db.query(
                `SELECT b.*
                 FROM blogs b
                 JOIN content_blogs cb ON b.blog_id = cb.blog_id
                 JOIN content_items ci ON cb.content_item_id = ci.content_item_id
                 JOIN approvals a ON ci.content_item_id = a.content_item_id
                 WHERE b.blog_id = ?
                   AND a.approval_id = (
                         SELECT MAX(a2.approval_id)
                         FROM approvals a2
                         WHERE a2.content_item_id = ci.content_item_id
                   )
                   AND a.status = 'approved'
                 LIMIT 1`,
                [blog_id]
            );
            if (rows.length === 0) {
                socket.emit('response_get_blog_by_id', { success: false, message: 'Not found' });
                return;
            }
            const r = rows[0];
            r.thumbnail_url = normalizeUrl(r.thumbnail_url);
            socket.emit('response_get_blog_by_id', { success: true, blog: r });
        } catch (err) {
            console.error('Error in request_get_blog_by_id:', err);
            socket.emit('response_get_blog_by_id', { success: false, message: 'Server error' });
        }
    });

    // Return a list of approved events
    socket.on('request_get_events', async () => {
        try {
            const [rows] = await db.query(
                `SELECT event_id, event_name, thumbnail_url, host_id, reward_points, reward_level, created_at
                 FROM events
                 WHERE status = 'approved'
                 ORDER BY created_at DESC
                 LIMIT 50`
            );

            const events = rows.map(r => ({
                event_id: r.event_id,
                event_name: r.event_name,
                thumbnail_url: normalizeUrl(r.thumbnail_url),
                host_id: r.host_id,
                reward_points: r.reward_points,
                reward_level: r.reward_level,
                created_at: r.created_at
            }));

            socket.emit('response_get_events', { success: true, events });
        } catch (err) {
            console.error('Error in request_get_events:', err);
            socket.emit('response_get_events', { success: false, message: 'Server error' });
        }
    });

    // Return single event by id (only latest approved version)
    socket.on('request_get_event_by_id', async ({ event_id }) => {
        try {
            const [rows] = await db.query(
                `SELECT e.*
                 FROM events e
                 JOIN content_events ce ON e.event_id = ce.event_id
                 JOIN content_items ci ON ce.content_item_id = ci.content_item_id
                 JOIN approvals a ON ci.content_item_id = a.content_item_id
                 WHERE e.event_id = ?
                   AND a.approval_id = (
                         SELECT MAX(a2.approval_id)
                         FROM approvals a2
                         WHERE a2.content_item_id = ci.content_item_id
                   )
                   AND a.status = 'approved'
                 LIMIT 1`,
                [event_id]
            );
            if (rows.length === 0) {
                socket.emit('response_get_event_by_id', { success: false, message: 'Not found' });
                return;
            }
            const r = rows[0];
            r.thumbnail_url = normalizeUrl(r.thumbnail_url);
            socket.emit('response_get_event_by_id', { success: true, event: r });
        } catch (err) {
            console.error('Error in request_get_event_by_id:', err);
            socket.emit('response_get_event_by_id', { success: false, message: 'Server error' });
        }
    });

    // Home content: latest approved blogs + events, driven by approvals table
    socket.on('request_get_home_content', async () => {
        try {
            // Blogs: pick items whose latest approval row is approved
            const [blogsRows] = await db.query(
                `SELECT b.blog_id, b.title, b.thumbnail_url, b.published_at
                 FROM blogs b
                 JOIN content_blogs cb ON b.blog_id = cb.blog_id
                 JOIN content_items ci ON cb.content_item_id = ci.content_item_id
                 JOIN approvals a ON ci.content_item_id = a.content_item_id
                 WHERE a.approval_id = (
                         SELECT MAX(a2.approval_id)
                         FROM approvals a2
                         WHERE a2.content_item_id = ci.content_item_id
                 )
                   AND a.status = 'approved'
                 ORDER BY b.published_at DESC
                 LIMIT 6`
            );

            // Events: same pattern, using latest approved approval row
            const [eventsRows] = await db.query(
                `SELECT e.event_id, e.event_name, e.thumbnail_url, e.created_at
                 FROM events e
                 JOIN content_events ce ON e.event_id = ce.event_id
                 JOIN content_items ci ON ce.content_item_id = ci.content_item_id
                 JOIN approvals a ON ci.content_item_id = a.content_item_id
                 WHERE a.approval_id = (
                         SELECT MAX(a2.approval_id)
                         FROM approvals a2
                         WHERE a2.content_item_id = ci.content_item_id
                 )
                   AND a.status = 'approved'
                 ORDER BY e.created_at DESC
                 LIMIT 6`
            );

            const blogs = blogsRows.map(r => ({ blog_id: r.blog_id, title: r.title, thumbnail_url: normalizeUrl(r.thumbnail_url), published_at: r.published_at }));
            const events = eventsRows.map(r => ({ event_id: r.event_id, event_name: r.event_name, thumbnail_url: normalizeUrl(r.thumbnail_url), created_at: r.created_at }));

            socket.emit('response_get_home_content', { success: true, blogs, events });
        } catch (err) {
            console.error('Error in request_get_home_content:', err);
            socket.emit('response_get_home_content', { success: false, message: 'Server error' });
        }
    });
};
