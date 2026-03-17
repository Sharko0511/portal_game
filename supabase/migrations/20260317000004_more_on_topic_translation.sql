INSERT INTO translations (language, namespace, key, value) VALUES
('vi', 'blog', 'more_on_topic', 'Xem thêm chủ đề này'),
('en', 'blog', 'more_on_topic', 'more on this topic')
ON CONFLICT (language, namespace, key) DO UPDATE SET value = EXCLUDED.value;
