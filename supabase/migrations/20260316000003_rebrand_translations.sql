-- ============================================================
-- Rebrand: Game Portal → The Good Learning
-- Blog/learning is primary, games are secondary/bonus
-- ============================================================

-- ── EN updates ───────────────────────────────────────────────
update translations set value = 'Play, Learn & Share'
  where language='en' and namespace='homepage' and key='hero.title';

update translations set value = 'Improve your English every day through articles, blog posts,<br />and a little fun with games on the side.'
  where language='en' and namespace='homepage' and key='hero.description';

update translations set value = 'Start Reading'
  where language='en' and namespace='homepage' and key='hero.button';

update translations set value = 'What can you do here?'
  where language='en' and namespace='homepage_features' and key='title';

update translations set value = 'The Good Learning'
  where language='en' and namespace='footer' and key='copyright';

update translations set value = '2026© The Good Learning'
  where language='en' and namespace='footer' and key='copyright';

update translations set value = 'About Us'
  where language='en' and namespace='footer' and key='about.title';

update translations set value = 'The Good Learning is a community platform to improve your English through reading blog posts, real-world articles,<br />and a little fun with games.'
  where language='en' and namespace='footer' and key='about.description';

-- ── VI updates ───────────────────────────────────────────────
update translations set value = 'Chơi, Học & Chia Sẻ'
  where language='vi' and namespace='homepage' and key='hero.title';

update translations set value = 'Cải thiện tiếng Anh mỗi ngày qua các bài viết, blog,<br />và một chút vui vẻ với trò chơi.'
  where language='vi' and namespace='homepage' and key='hero.description';

update translations set value = 'Bắt đầu đọc'
  where language='vi' and namespace='homepage' and key='hero.button';

update translations set value = '2026© The Good Learning'
  where language='vi' and namespace='footer' and key='copyright';

update translations set value = 'Về chúng tôi'
  where language='vi' and namespace='footer' and key='about.title';

update translations set value = 'The Good Learning là nền tảng cộng đồng giúp bạn cải thiện tiếng Anh qua đọc blog, bài viết thực tế,<br />và một chút vui vẻ với trò chơi.'
  where language='vi' and namespace='footer' and key='about.description';

-- Update Telegram notification text to use new brand name
update translations set value = 'Link your Telegram account to receive a notification when authors you follow post new content.'
  where language='en' and namespace='profile' and key='telegram.description';

update translations set value = 'Button not working? Open @thegoodlearning_bot in Telegram and send this command manually:'
  where language='en' and namespace='profile' and key='telegram.manual_fallback';

update translations set value = 'Nút không hoạt động? Mở @thegoodlearning_bot trong Telegram và gửi lệnh này thủ công:'
  where language='vi' and namespace='profile' and key='telegram.manual_fallback';
