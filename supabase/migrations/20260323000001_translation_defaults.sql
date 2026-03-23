-- ============================================================
-- Translation Defaults — 2-milestone revert system
--
-- snapshot = 'v1'    → frozen original seed, set by migration only
-- snapshot = 'saved' → admin-curated snapshot, admin can overwrite
-- ============================================================

create table translation_defaults (
  snapshot   text        not null,  -- 'v1' | 'saved'
  language   text        not null,
  namespace  text        not null,
  key        text        not null,
  value      text        not null,
  saved_at   timestamptz not null default now(),
  primary key (snapshot, language, namespace, key)
);

alter table translation_defaults enable row level security;

-- Public read: admin UI and revert endpoint can read snapshots
create policy "Defaults are publicly readable"
  on translation_defaults for select
  using (true);

-- Only admins can manage the 'saved' snapshot via API
-- The 'v1' snapshot is protected — never touched after migration
create policy "Admins can manage saved snapshot"
  on translation_defaults for all to authenticated
  using (
    snapshot = 'saved' and
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  )
  with check (
    snapshot = 'saved' and
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ── Seed v1 snapshot from current EN/VI values ────────────────────
-- This runs after all previous migrations, so it captures the final
-- post-rebrand state as the immutable "v1" baseline.
insert into translation_defaults (snapshot, language, namespace, key, value)
select 'v1', language, namespace, key, value
from translations
where language in ('en', 'vi');
