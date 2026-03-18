-- Allow any theme name (not just 'light' | 'dark')
-- so admins can create custom themes from the UI
alter table public.theme_config
  drop constraint theme_config_theme_check;
