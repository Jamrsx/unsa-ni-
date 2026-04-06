-- One-off cleanup for corrupt blog with blog_id = 16
-- This script removes the blog row, its content/approval wiring, and any
-- faculty_pending_changes entries that reference it.

START TRANSACTION;

-- Remove any faculty pending changes that target this blog
DELETE FROM faculty_pending_changes
WHERE change_type = 'blog'
  AND (
    record_id = 16
    OR JSON_EXTRACT(proposed_data, '$.blog_id') = 16
  );

-- Remove approvals tied to the blog's content_item
DELETE a
FROM approvals a
JOIN content_items ci ON a.content_item_id = ci.content_item_id
JOIN content_blogs cb ON cb.content_item_id = ci.content_item_id
WHERE cb.blog_id = 16;

-- Remove content_items rows wired only to this blog
DELETE ci
FROM content_items ci
JOIN content_blogs cb ON cb.content_item_id = ci.content_item_id
WHERE cb.blog_id = 16;

-- Remove the content_blogs mapping row(s)
DELETE FROM content_blogs WHERE blog_id = 16;

-- Finally remove the blog row itself
DELETE FROM blogs WHERE blog_id = 16;

COMMIT;
