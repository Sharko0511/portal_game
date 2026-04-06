-- ============================================================
-- Translations Table Migration
-- DB-driven i18n: all UI translations stored and managed here
-- ============================================================

create table translations (
  id          uuid primary key default gen_random_uuid(),
  language    text not null,
  namespace   text not null,
  key         text not null,
  value       text not null,
  updated_at  timestamptz default now(),
  unique(language, namespace, key)
);

alter table translations enable row level security;

-- Public read: app fetches translations without auth
create policy "Translations are publicly readable"
  on translations for select
  using (true);

-- Only admins can insert/update/delete
create policy "Admins can manage translations"
  on translations for all to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create index idx_translations_lookup on translations(language, namespace);
create index idx_translations_key    on translations(key);

-- Auto-update updated_at on change
create or replace function update_translations_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger translations_updated_at
  before update on translations
  for each row execute function update_translations_updated_at();
