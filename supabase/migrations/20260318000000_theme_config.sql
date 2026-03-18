-- ============================================================
-- Theme Configuration Migration
-- Feature: admin-customizable color palette (light + dark)
-- ============================================================

-- 1. TABLE
-- ============================================================

create table public.theme_config (
  variable   text        not null,              -- CSS variable name e.g. --brand-primary
  theme      text        not null default 'light' check (theme in ('light', 'dark')),
  value      text        not null,              -- CSS value e.g. #317f5f
  label      text        not null default '',   -- Human-readable e.g. "Brand Primary Green"
  group_name text        not null default '',   -- "brand", "semantic", "scrollbar"
  description text       not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid        references public.profiles(id),

  primary key (variable, theme)
);

-- 2. RLS
-- ============================================================

alter table public.theme_config enable row level security;

create policy "theme_config: public read"
  on public.theme_config for select
  using (true);

create policy "theme_config: admin insert"
  on public.theme_config for insert
  with check (public.is_admin());

create policy "theme_config: admin update"
  on public.theme_config for update
  using (public.is_admin());

create policy "theme_config: admin delete"
  on public.theme_config for delete
  using (public.is_admin());

-- 3. SEED — light mode defaults
-- ============================================================

insert into public.theme_config (variable, theme, value, label, group_name, description) values
  -- Brand (same in both themes by default — admin can diverge later)
  ('--brand-primary',       'light', '#317f5f', 'Brand Primary',       'brand', 'Main brand green — links, hover states, active elements'),
  ('--brand-dark',          'light', '#225d2d', 'Brand Dark',          'brand', 'Dark green — hero buttons, feature block borders'),
  ('--brand-hero',          'light', '#94b506', 'Brand Hero',          'brand', 'Olive green — hero section background'),
  ('--brand-footer',        'light', '#1b5e20', 'Brand Footer',        'brand', 'Dark forest green — footer and card backgrounds'),
  ('--brand-footer-hover',  'light', '#236b27', 'Brand Footer Hover',  'brand', 'Lighter footer green — hover state'),
  ('--brand-footer-dark',   'light', '#164a18', 'Brand Footer Dark',   'brand', 'Darker footer green — empty state placeholders'),
  ('--brand-lime',          'light', '#a4c639', 'Brand Lime',          'brand', 'Lime green — CTAs and register button'),
  ('--brand-lime-bright',   'light', '#c8e63d', 'Brand Lime Bright',   'brand', 'Bright lime — badges, like button, focus rings'),
  ('--brand-orange',        'light', '#f47121', 'Brand Orange',        'brand', 'Orange — level badges (A1–C2)'),

  -- Semantic
  ('--background',          'light', '#ffffff', 'Background',          'semantic', 'Page background'),
  ('--foreground',          'light', '#111827', 'Foreground',          'semantic', 'Primary text color'),
  ('--foreground-muted',    'light', '#6b7280', 'Foreground Muted',    'semantic', 'Secondary / muted text'),
  ('--card',                'light', '#f9fafb', 'Card',                'semantic', 'Card and input background'),
  ('--card-hover',          'light', '#f3f4f6', 'Card Hover',          'semantic', 'Card hover state'),
  ('--card-foreground',     'light', '#111827', 'Card Foreground',     'semantic', 'Text on cards'),
  ('--popover',             'light', '#ffffff', 'Popover',             'semantic', 'Popover / dropdown background'),
  ('--popover-foreground',  'light', '#111827', 'Popover Foreground',  'semantic', 'Text in popovers'),
  ('--primary',             'light', '#111827', 'Primary',             'semantic', 'Primary UI surface'),
  ('--primary-foreground',  'light', '#ffffff', 'Primary Foreground',  'semantic', 'Text on primary surface'),
  ('--secondary',           'light', '#f3f4f6', 'Secondary',           'semantic', 'Secondary surface'),
  ('--secondary-foreground','light', '#111827', 'Secondary Foreground','semantic', 'Text on secondary surface'),
  ('--muted',               'light', '#f3f4f6', 'Muted',               'semantic', 'Muted surface background'),
  ('--muted-foreground',    'light', '#6b7280', 'Muted Foreground',    'semantic', 'Text on muted surfaces'),
  ('--accent',              'light', '#f3f4f6', 'Accent',              'semantic', 'Accent surface — menu hover states'),
  ('--accent-foreground',   'light', '#111827', 'Accent Foreground',   'semantic', 'Text on accent surface'),
  ('--destructive',         'light', '#dc2626', 'Destructive',         'semantic', 'Error / destructive actions'),
  ('--border',              'light', '#e5e7eb', 'Border',              'semantic', 'Default border color'),
  ('--input',               'light', '#e5e7eb', 'Input Border',        'semantic', 'Input border color'),
  ('--ring',                'light', '#c8e63d', 'Ring',                'semantic', 'Focus ring color'),

  -- Scrollbar
  ('--scrollbar-thumb',       'light', '#d1d5db', 'Scrollbar Thumb',       'scrollbar', 'Scrollbar thumb'),
  ('--scrollbar-thumb-hover', 'light', '#9ca3af', 'Scrollbar Thumb Hover', 'scrollbar', 'Scrollbar thumb hover');

-- 4. SEED — dark mode defaults
-- ============================================================

insert into public.theme_config (variable, theme, value, label, group_name, description) values
  -- Brand (same as light by default)
  ('--brand-primary',       'dark', '#317f5f', 'Brand Primary',       'brand', 'Main brand green — links, hover states, active elements'),
  ('--brand-dark',          'dark', '#225d2d', 'Brand Dark',          'brand', 'Dark green — hero buttons, feature block borders'),
  ('--brand-hero',          'dark', '#94b506', 'Brand Hero',          'brand', 'Olive green — hero section background'),
  ('--brand-footer',        'dark', '#1b5e20', 'Brand Footer',        'brand', 'Dark forest green — footer and card backgrounds'),
  ('--brand-footer-hover',  'dark', '#236b27', 'Brand Footer Hover',  'brand', 'Lighter footer green — hover state'),
  ('--brand-footer-dark',   'dark', '#164a18', 'Brand Footer Dark',   'brand', 'Darker footer green — empty state placeholders'),
  ('--brand-lime',          'dark', '#a4c639', 'Brand Lime',          'brand', 'Lime green — CTAs and register button'),
  ('--brand-lime-bright',   'dark', '#c8e63d', 'Brand Lime Bright',   'brand', 'Bright lime — badges, like button, focus rings'),
  ('--brand-orange',        'dark', '#f47121', 'Brand Orange',        'brand', 'Orange — level badges (A1–C2)'),

  -- Semantic
  ('--background',          'dark', '#0f1117', 'Background',          'semantic', 'Page background'),
  ('--foreground',          'dark', '#f3f4f6', 'Foreground',          'semantic', 'Primary text color'),
  ('--foreground-muted',    'dark', '#9ca3af', 'Foreground Muted',    'semantic', 'Secondary / muted text'),
  ('--card',                'dark', '#1a1d27', 'Card',                'semantic', 'Card and input background'),
  ('--card-hover',          'dark', '#252836', 'Card Hover',          'semantic', 'Card hover state'),
  ('--card-foreground',     'dark', '#f3f4f6', 'Card Foreground',     'semantic', 'Text on cards'),
  ('--popover',             'dark', '#1a1d27', 'Popover',             'semantic', 'Popover / dropdown background'),
  ('--popover-foreground',  'dark', '#f3f4f6', 'Popover Foreground',  'semantic', 'Text in popovers'),
  ('--primary',             'dark', '#f3f4f6', 'Primary',             'semantic', 'Primary UI surface'),
  ('--primary-foreground',  'dark', '#0f1117', 'Primary Foreground',  'semantic', 'Text on primary surface'),
  ('--secondary',           'dark', '#252836', 'Secondary',           'semantic', 'Secondary surface'),
  ('--secondary-foreground','dark', '#f3f4f6', 'Secondary Foreground','semantic', 'Text on secondary surface'),
  ('--muted',               'dark', '#252836', 'Muted',               'semantic', 'Muted surface background'),
  ('--muted-foreground',    'dark', '#9ca3af', 'Muted Foreground',    'semantic', 'Text on muted surfaces'),
  ('--accent',              'dark', '#252836', 'Accent',              'semantic', 'Accent surface — menu hover states'),
  ('--accent-foreground',   'dark', '#f3f4f6', 'Accent Foreground',   'semantic', 'Text on accent surface'),
  ('--destructive',         'dark', '#ef4444', 'Destructive',         'semantic', 'Error / destructive actions'),
  ('--border',              'dark', '#2d3148', 'Border',              'semantic', 'Default border color'),
  ('--input',               'dark', '#2d3148', 'Input Border',        'semantic', 'Input border color'),
  ('--ring',                'dark', '#c8e63d', 'Ring',                'semantic', 'Focus ring color'),

  -- Scrollbar
  ('--scrollbar-thumb',       'dark', '#3d4166', 'Scrollbar Thumb',       'scrollbar', 'Scrollbar thumb'),
  ('--scrollbar-thumb-hover', 'dark', '#4f5580', 'Scrollbar Thumb Hover', 'scrollbar', 'Scrollbar thumb hover');
