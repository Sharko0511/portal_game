-- Add navigation.feed translation key for the logged-in blog feed link

insert into translations (language, namespace, key, value) values
  ('en', 'common', 'navigation.feed', 'Feed'),
  ('vi', 'common', 'navigation.feed', 'Feed')
on conflict (language, namespace, key) do update set value = excluded.value;
