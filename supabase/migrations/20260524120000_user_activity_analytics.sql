-- User activity analytics + session tracking (Investor Quest behavior intelligence)

create table if not exists public.user_activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  partner_id text,
  company_ticker text,
  company_name text,
  pillar text,
  quest_id text,
  card_id text,
  event_type text not null check (
    event_type in (
      'user_started_quest',
      'user_opened_card',
      'user_marked_card_read',
      'user_completed_pillar',
      'user_completed_quiz',
      'user_earned_xp',
      'user_earned_badge',
      'user_completed_company_report',
      'user_updated_conviction'
    )
  ),
  xp_amount integer not null default 0,
  badge_name text,
  conviction_status text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists user_activity_events_user_id_idx
  on public.user_activity_events (user_id);

create index if not exists user_activity_events_partner_id_idx
  on public.user_activity_events (partner_id);

create index if not exists user_activity_events_company_ticker_idx
  on public.user_activity_events (company_ticker);

create index if not exists user_activity_events_event_type_idx
  on public.user_activity_events (event_type);

create index if not exists user_activity_events_created_at_idx
  on public.user_activity_events (created_at desc);

create table if not exists public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  partner_id text,
  session_start timestamptz not null default now(),
  session_end timestamptz,
  duration_seconds integer,
  companies_viewed jsonb not null default '[]'::jsonb,
  pillars_viewed jsonb not null default '[]'::jsonb,
  total_events integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists user_sessions_user_id_idx on public.user_sessions (user_id);
create index if not exists user_sessions_partner_id_idx on public.user_sessions (partner_id);
create index if not exists user_sessions_created_at_idx on public.user_sessions (created_at desc);

alter table public.user_activity_events enable row level security;
alter table public.user_sessions enable row level security;

drop policy if exists "user_activity_events_select" on public.user_activity_events;
create policy "user_activity_events_select"
  on public.user_activity_events for select to anon, authenticated using (true);

drop policy if exists "user_activity_events_insert" on public.user_activity_events;
create policy "user_activity_events_insert"
  on public.user_activity_events for insert to anon, authenticated with check (true);

drop policy if exists "user_sessions_select" on public.user_sessions;
create policy "user_sessions_select"
  on public.user_sessions for select to anon, authenticated using (true);

drop policy if exists "user_sessions_insert" on public.user_sessions;
create policy "user_sessions_insert"
  on public.user_sessions for insert to anon, authenticated with check (true);

drop policy if exists "user_sessions_update" on public.user_sessions;
create policy "user_sessions_update"
  on public.user_sessions for update to anon, authenticated using (true) with check (true);

-- Demo seed: five learner archetypes × five companies × realistic evening bias
insert into public.user_activity_events (
  user_id,
  partner_id,
  company_ticker,
  company_name,
  pillar,
  quest_id,
  card_id,
  event_type,
  xp_amount,
  badge_name,
  conviction_status,
  metadata,
  created_at
)
select
  (array[
    'demo-user-casual-explorer',
    'demo-user-consistent-learner',
    'demo-user-deep-research',
    'demo-user-high-conviction',
    'demo-user-streak-builder'
  ])[1 + (g % 5)] as user_id,
  (array['demo-riverside-academy', 'demo-apex-clearing', 'demo-northstar-bank'])[1 + (g % 3)] as partner_id,
  (array['AAPL', 'NVDA', 'TSLA', 'AMZN', 'META'])[1 + (g % 5)] as company_ticker,
  (array['Apple', 'NVIDIA', 'Tesla', 'Amazon', 'Meta'])[1 + (g % 5)] as company_name,
  (array['business', 'forces', 'financials', 'management'])[1 + (g % 4)] as pillar,
  (array['business', 'forces', 'financials', 'management'])[1 + (g % 4)] || '-quest-' || ((g % 5) + 1)::text as quest_id,
  case when g % 3 = 0 then 'card-' || ((g % 5) + 1)::text else null end as card_id,
  (array[
    'user_started_quest',
    'user_opened_card',
    'user_marked_card_read',
    'user_completed_quiz',
    'user_earned_xp',
    'user_earned_badge',
    'user_completed_pillar',
    'user_updated_conviction',
    'user_completed_company_report'
  ])[1 + (g % 9)] as event_type,
  case
    when (g % 9) = 4 then 40 + (g % 120)
    else 0
  end as xp_amount,
  case when (g % 9) = 5 then (array['first_read', 'quiz_streak', 'pillar_master'])[1 + (g % 3)] else null end,
  case when (g % 9) = 7 then 'submitted' else null end as conviction_status,
  jsonb_build_object(
    'demo', true,
    'archetype', (array[
      'casual_explorer',
      'consistent_learner',
      'deep_research',
      'high_conviction',
      'streak_builder'
    ])[1 + (g % 5)],
    'analytics_tier', case when g % 4 = 0 then 'pro' else 'basic' end,
    'weekday', extract(isodow from ts)
  ) as metadata,
  ts as created_at
from generate_series(1, 960) as g
cross join lateral (
  select (now() - ((g * 2) || ' hours')::interval)
    + (((17 + (g % 6)) % 24) || ' hours')::interval
    - (extract(hour from now()) || ' hours')::interval as ts
) t;

insert into public.user_sessions (
  user_id,
  partner_id,
  session_start,
  session_end,
  duration_seconds,
  companies_viewed,
  pillars_viewed,
  total_events,
  created_at
)
select
  u.user_id,
  u.partner_id,
  u.session_start,
  u.session_start + ((u.duration_seconds || ' seconds')::interval),
  u.duration_seconds,
  u.companies_viewed,
  u.pillars_viewed,
  u.total_events,
  u.session_start
from (
  select
    (array[
      'demo-user-casual-explorer',
      'demo-user-consistent-learner',
      'demo-user-deep-research',
      'demo-user-high-conviction',
      'demo-user-streak-builder'
    ])[1 + (s % 5)] as user_id,
    (array['demo-riverside-academy', 'demo-apex-clearing'])[1 + (s % 2)] as partner_id,
    now() - ((s * 18) || ' hours')::interval as session_start,
    600 + (s % 2400) as duration_seconds,
    jsonb_build_array(
      (array['AAPL', 'NVDA', 'TSLA'])[1 + (s % 3)],
      (array['AMZN', 'META'])[1 + (s % 2)]
    ) as companies_viewed,
    jsonb_build_array('business', 'forces') as pillars_viewed,
    8 + (s % 40) as total_events
  from generate_series(1, 48) s
) u;
