-- Mission Control: idempotent finish (safe if 20260601120000_game_health.sql ran partially).
-- Run ONLY after verification, or when policies/tables already partially exist.

-- ---------------------------------------------------------------------------
-- Tables + indexes (no-op if already present)
-- ---------------------------------------------------------------------------

create table if not exists public.game_health_checks (
  id uuid primary key default gen_random_uuid(),
  score integer not null check (score >= 0 and score <= 100),
  status_label text not null,
  passed_checks jsonb not null default '[]'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  failed_checks jsonb not null default '[]'::jsonb,
  suggested_fixes jsonb not null default '[]'::jsonb,
  slowest_route text,
  duration_ms integer,
  created_at timestamptz not null default now()
);

create index if not exists game_health_checks_created_at_idx
  on public.game_health_checks (created_at desc);

create table if not exists public.game_health_issues (
  id uuid primary key default gen_random_uuid(),
  check_id uuid references public.game_health_checks (id) on delete cascade,
  issue_key text not null,
  severity text not null check (severity in ('info', 'warning', 'critical')),
  title text not null,
  problem_plain text not null,
  what_users_see text not null,
  suggested_fix text not null,
  fix_action text,
  company_ticker text,
  company_name text,
  pillar_id text,
  quest_slug text,
  card_id text,
  status text not null default 'open' check (status in ('open', 'resolved', 'ignored')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists game_health_issues_status_idx
  on public.game_health_issues (status, created_at desc);

create index if not exists game_health_issues_check_id_idx
  on public.game_health_issues (check_id);

create table if not exists public.game_health_settings (
  id text primary key default 'default',
  alert_email text,
  alert_below_score integer not null default 80,
  alert_on_critical boolean not null default true,
  alert_on_slow_loading boolean not null default true,
  check_interval_minutes integer not null default 15,
  demo_emergency_fast_mode boolean not null default false,
  demo_emergency_skip_jargon boolean not null default false,
  last_alert_score integer,
  last_alert_at timestamptz,
  updated_at timestamptz not null default now()
);

insert into public.game_health_settings (id)
values ('default')
on conflict (id) do nothing;

alter table public.game_health_checks enable row level security;
alter table public.game_health_issues enable row level security;
alter table public.game_health_settings enable row level security;

-- ---------------------------------------------------------------------------
-- Policies (create only if missing — avoids duplicate policy errors)
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'game_health_checks'
      and policyname = 'game_health_checks_select'
  ) then
    create policy game_health_checks_select on public.game_health_checks
      for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'game_health_checks'
      and policyname = 'game_health_checks_insert'
  ) then
    create policy game_health_checks_insert on public.game_health_checks
      for insert with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'game_health_issues'
      and policyname = 'game_health_issues_select'
  ) then
    create policy game_health_issues_select on public.game_health_issues
      for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'game_health_issues'
      and policyname = 'game_health_issues_insert'
  ) then
    create policy game_health_issues_insert on public.game_health_issues
      for insert with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'game_health_issues'
      and policyname = 'game_health_issues_update'
  ) then
    create policy game_health_issues_update on public.game_health_issues
      for update using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'game_health_settings'
      and policyname = 'game_health_settings_select'
  ) then
    create policy game_health_settings_select on public.game_health_settings
      for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'game_health_settings'
      and policyname = 'game_health_settings_update'
  ) then
    create policy game_health_settings_update on public.game_health_settings
      for update using (true);
  end if;
end $$;
