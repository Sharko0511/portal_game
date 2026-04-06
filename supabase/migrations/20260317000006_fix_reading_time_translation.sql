INSERT INTO translations (language, namespace, key, value) VALUES
('en', 'blog', 'reading_time', 'mins read')
ON CONFLICT (language, namespace, key) DO UPDATE SET value = EXCLUDED.value;
