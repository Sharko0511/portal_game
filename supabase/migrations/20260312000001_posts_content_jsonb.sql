-- Change posts.content from text to jsonb (TipTap JSON format)
-- Must drop and recreate the view that depends on the column

drop view if exists posts_with_counts;

alter table posts alter column content type jsonb using content::jsonb;

create view posts_with_counts as
  select
    p.*,
    pr.display_name                  as author_name,
    count(distinct l.id)::int        as like_count,
    count(distinct c.id)::int        as comment_count
  from posts p
  left join profiles pr on pr.id    = p.author_id
  left join likes l     on l.post_id = p.id
  left join comments c  on c.post_id = p.id
  group by p.id, pr.display_name;
