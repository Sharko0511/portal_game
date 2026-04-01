-- Add breadcrumb translation keys
INSERT INTO translations (language, namespace, key, value) VALUES
-- blog namespace (baohay page)
('vi', 'blog', 'breadcrumb.home',   'Trang chủ'),
('vi', 'blog', 'breadcrumb.baohay', 'Báo hay'),
('vi', 'blog', 'breadcrumb.tag',    'Thẻ'),
('en', 'blog', 'breadcrumb.home',   'Home'),
('en', 'blog', 'breadcrumb.baohay', 'Blog'),
('en', 'blog', 'breadcrumb.tag',    'Tag'),
-- common namespace (games / leaderboard pages)
('vi', 'common', 'breadcrumb.home', 'Trang chủ')
ON CONFLICT (language, namespace, key) DO UPDATE SET value = EXCLUDED.value;
