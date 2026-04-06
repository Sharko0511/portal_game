INSERT INTO translations (language, namespace, key, value) VALUES
('vi', 'audiochat', 'breadcrumb.home', 'Trang chủ'),
('en', 'audiochat', 'breadcrumb.home', 'Home'),
('vi', 'audiochat', 'hero.tagline', 'Cải thiện khả năng nghe qua audio.'),
('en', 'audiochat', 'hero.tagline', 'Improve your listening skills through audio.')
ON CONFLICT (language, namespace, key) DO UPDATE SET value = EXCLUDED.value;
