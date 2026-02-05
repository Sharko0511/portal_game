create table scores (
  id bigint generated always as identity primary key,
  player_name text not null,
  score integer not null,
  game text not null,
  created_at timestamptz default now()
);

alter table scores enable row level security;

create policy "Scores are publicly readable"
  on scores for select
  to anon
  using (true);

create policy "Anyone can insert scores"
  on scores for insert
  to anon
  with check (true);

create index idx_scores_game_score on scores (game, score desc);
