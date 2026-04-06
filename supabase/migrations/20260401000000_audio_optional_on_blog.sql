-- ============================================================
-- Audio Optional on Blog Migration
-- Removes 'audiochat' as a category. Audio is now just an
-- optional audio_url field on any blog or baohay post.
-- ============================================================

-- 1. Migrate existing audiochat posts to 'blog' (audio_url preserved)
UPDATE posts SET category = 'blog' WHERE category = 'audiochat';

-- 2. Drop the old check constraint and add a new one without 'audiochat'
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_category_check;
ALTER TABLE posts
  ADD CONSTRAINT posts_category_check
  CHECK (category IN ('blog', 'baohay'));

-- 3. Rebuild posts_with_counts view (no structural change, ensures consistency)
DROP VIEW IF EXISTS posts_with_counts;

CREATE VIEW posts_with_counts AS
  SELECT
    p.*,
    pr.display_name                  AS author_name,
    pr.role                          AS author_role,
    COUNT(DISTINCT l.id)::int        AS like_count,
    COUNT(DISTINCT c.id)::int        AS comment_count
  FROM posts p
  LEFT JOIN profiles pr ON pr.id    = p.author_id
  LEFT JOIN likes l     ON l.post_id = p.id
  LEFT JOIN comments c  ON c.post_id = p.id
  GROUP BY p.id, pr.display_name, pr.role;
