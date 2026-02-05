-- Run this SQL in your Supabase dashboard (SQL Editor)
-- to create the scores table for the Game Portal

create table scores (
  id bigint generated always as identity primary key,
  player_name text not null,
  score integer not null,
  game text not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table scores enable row level security;

-- Allow anyone to read scores
create policy "Scores are publicly readable"
  on scores for select
  to anon
  using (true);

-- Allow anyone to insert scores
create policy "Anyone can insert scores"
  on scores for insert
  to anon
  with check (true);

-- Create an index for faster leaderboard queries
create index idx_scores_game_score on scores (game, score desc);
