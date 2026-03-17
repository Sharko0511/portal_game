INSERT INTO translations (language, namespace, key, value) VALUES
('vi', 'blog', 'reading_time', 'phút đọc'),
('en', 'blog', 'reading_time', 'min read')
ON CONFLICT (language, namespace, key) DO UPDATE SET value = EXCLUDED.value;
