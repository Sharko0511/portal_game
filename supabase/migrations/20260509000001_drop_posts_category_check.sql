-- Remove legacy fixed category constraint to support dynamic categories.
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_category_check;
