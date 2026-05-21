-- Investor Quest: partner / licence architecture (v1)
-- Run via Supabase SQL editor or: supabase db push

-- ---------------------------------------------------------------------------
-- Package tiers (entitlement matrix)
-- ---------------------------------------------------------------------------
create table if not exists public.package_tiers (
  id text primary key check (id in ('basic', 'pro', 'enterprise')),
  display_name text not null,
  max_users integer not null check (max_users > 0),
  enabled_module_ids jsonb not null default '[]'::jsonb,
  enabled_dashboards jsonb not null default '[]'::jsonb,
  allowed_gamification_mechanic_ids jsonb not null default '[]'::jsonb,
  analytics_access_level text not null,
  data_export_access text not null,
  broker_rewards_access boolean not null default false,
  custom_branding_access boolean not null default false,
  api_integration_access text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Partners
-- ---------------------------------------------------------------------------
create table if not exists public.partners (
  id text primary key,
  type text not null check (type in ('school', 'bank', 'broker')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partner_branding (
  partner_id text primary key references public.partners (id) on delete cascade,
  partner_name text not null,
  logo_url text not null,
  color_primary text not null,
  color_secondary text not null,
  color_accent text not null,
  color_surface text not null,
  color_text text not null,
  tone_preset_id text not null,
  wording_deck_id text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.licences (
  id uuid primary key default gen_random_uuid(),
  partner_id text not null unique references public.partners (id) on delete cascade,
  licence_code text not null unique,
  expires_at date not null,
  max_seats integer not null check (max_seats > 0),
  package_tier_id text not null references public.package_tiers (id),
  dashboard_school boolean not null default false,
  dashboard_bank boolean not null default false,
  dashboard_broker boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partner_policies (
  partner_id text primary key references public.partners (id) on delete cascade,
  enabled_module_ids jsonb not null default '[]'::jsonb,
  enabled_dashboards jsonb not null default '[]'::jsonb,
  reward_model_id text not null,
  allowed_role_ids jsonb not null default '[]'::jsonb,
  gamification_mechanic_ids jsonb not null default '[]'::jsonb,
  analytics_access_level text not null,
  data_export_access text not null,
  custom_branding_access boolean not null default false,
  broker_rewards_access boolean not null default false,
  api_integration_access text not null,
  updated_at timestamptz not null default now()
);

create index if not exists licences_package_tier_id_idx on public.licences (package_tier_id);

-- ---------------------------------------------------------------------------
-- Row level security (read-only catalog for anon — server + client fetch)
-- ---------------------------------------------------------------------------
alter table public.package_tiers enable row level security;
alter table public.partners enable row level security;
alter table public.partner_branding enable row level security;
alter table public.licences enable row level security;
alter table public.partner_policies enable row level security;

drop policy if exists "package_tiers_select_anon" on public.package_tiers;
create policy "package_tiers_select_anon"
  on public.package_tiers for select
  to anon, authenticated
  using (true);

drop policy if exists "partners_select_anon" on public.partners;
create policy "partners_select_anon"
  on public.partners for select
  to anon, authenticated
  using (true);

drop policy if exists "partner_branding_select_anon" on public.partner_branding;
create policy "partner_branding_select_anon"
  on public.partner_branding for select
  to anon, authenticated
  using (true);

drop policy if exists "licences_select_anon" on public.licences;
create policy "licences_select_anon"
  on public.licences for select
  to anon, authenticated
  using (true);

drop policy if exists "partner_policies_select_anon" on public.partner_policies;
create policy "partner_policies_select_anon"
  on public.partner_policies for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Seed: package tiers (from packageDefinitions.ts)
-- ---------------------------------------------------------------------------
insert into public.package_tiers (
  id,
  display_name,
  max_users,
  enabled_module_ids,
  enabled_dashboards,
  allowed_gamification_mechanic_ids,
  analytics_access_level,
  data_export_access,
  broker_rewards_access,
  custom_branding_access,
  api_integration_access
) values
  (
    'basic',
    'Basic',
    50,
    '["core_quests","pillar_map"]'::jsonb,
    '["school"]'::jsonb,
    '["xp_system","level_ladder","quests","progress_bars","pillar_completion","quizzes","streaks"]'::jsonb,
    'standard',
    'csv_basic',
    false,
    false,
    'none'
  ),
  (
    'pro',
    'Pro',
    500,
    '["core_quests","pillar_map","sec_filings_lab","conviction_tracker","leaderboards","broker_rewards"]'::jsonb,
    '["school","bank","broker"]'::jsonb,
    '["xp_system","level_ladder","badges","quests","mini_quests","pillar_completion","progress_bars","streaks","quizzes","rewards","unlocks","profile_stats","company_badges","investor_titles","completion_pct","conviction_tracker","broker_rewards","retention_tracking"]'::jsonb,
    'advanced',
    'csv_full',
    true,
    true,
    'read_webhooks'
  ),
  (
    'enterprise',
    'Enterprise',
    50000,
    '["core_quests","pillar_map","sec_filings_lab","conviction_tracker","leaderboards","certificates","broker_rewards","team_dashboards","referrals","api_integrations"]'::jsonb,
    '["school","bank","broker"]'::jsonb,
    '["xp_system","level_ladder","badges","quests","mini_quests","pillar_completion","progress_bars","streaks","quizzes","rewards","unlocks","profile_stats","company_badges","investor_titles","completion_pct","conviction_tracker","broker_rewards","leaderboards","certificates","class_team_dashboards","referral_rewards","unlockable_content","confidence_tracker","retention_nudges","retention_tracking"]'::jsonb,
    'full',
    'api_stream',
    true,
    true,
    'full_api'
  )
on conflict (id) do update set
  display_name = excluded.display_name,
  max_users = excluded.max_users,
  enabled_module_ids = excluded.enabled_module_ids,
  enabled_dashboards = excluded.enabled_dashboards,
  allowed_gamification_mechanic_ids = excluded.allowed_gamification_mechanic_ids,
  analytics_access_level = excluded.analytics_access_level,
  data_export_access = excluded.data_export_access,
  broker_rewards_access = excluded.broker_rewards_access,
  custom_branding_access = excluded.custom_branding_access,
  api_integration_access = excluded.api_integration_access,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- Seed: demo partners (from examplePartners.ts)
-- ---------------------------------------------------------------------------
insert into public.partners (id, type) values
  ('demo-riverside-academy', 'school'),
  ('demo-northstar-bank', 'bank'),
  ('demo-apex-clearing', 'broker')
on conflict (id) do update set type = excluded.type, updated_at = now();

insert into public.partner_branding (
  partner_id,
  partner_name,
  logo_url,
  color_primary,
  color_secondary,
  color_accent,
  color_surface,
  color_text,
  tone_preset_id,
  wording_deck_id
) values
  (
    'demo-riverside-academy',
    'Riverside Academy',
    '/screens/quest-map.png',
    '#6366F1',
    '#22D3EE',
    '#FBBF24',
    '#0B1020',
    '#E5E7EB',
    'classroom_supportive',
    'school_default_v1'
  ),
  (
    'demo-northstar-bank',
    'Northstar Community Bank',
    '/screens/business-island-screen.png',
    '#1D4ED8',
    '#38BDF8',
    '#F59E0B',
    '#071018',
    '#F1F5F9',
    'professional_neutral',
    'bank_finlit_v1'
  ),
  (
    'demo-apex-clearing',
    'Apex Online Brokerage',
    '/screens/quest-map.png',
    '#A855F7',
    '#22C55E',
    '#FACC15',
    '#070712',
    '#E4E4E7',
    'competitive_broker',
    'broker_retail_v1'
  )
on conflict (partner_id) do update set
  partner_name = excluded.partner_name,
  logo_url = excluded.logo_url,
  color_primary = excluded.color_primary,
  color_secondary = excluded.color_secondary,
  color_accent = excluded.color_accent,
  color_surface = excluded.color_surface,
  color_text = excluded.color_text,
  tone_preset_id = excluded.tone_preset_id,
  wording_deck_id = excluded.wording_deck_id,
  updated_at = now();

insert into public.licences (
  partner_id,
  licence_code,
  expires_at,
  max_seats,
  package_tier_id,
  dashboard_school,
  dashboard_bank,
  dashboard_broker
) values
  (
    'demo-riverside-academy',
    'lic-school-demo-001',
    '2027-06-30',
    400,
    'pro',
    true,
    false,
    false
  ),
  (
    'demo-northstar-bank',
    'lic-bank-demo-002',
    '2026-12-15',
    5000,
    'enterprise',
    false,
    true,
    false
  ),
  (
    'demo-apex-clearing',
    'lic-broker-demo-003',
    '2028-01-01',
    25000,
    'pro',
    false,
    false,
    true
  )
on conflict (partner_id) do update set
  licence_code = excluded.licence_code,
  expires_at = excluded.expires_at,
  max_seats = excluded.max_seats,
  package_tier_id = excluded.package_tier_id,
  dashboard_school = excluded.dashboard_school,
  dashboard_bank = excluded.dashboard_bank,
  dashboard_broker = excluded.dashboard_broker,
  updated_at = now();

insert into public.partner_policies (
  partner_id,
  enabled_module_ids,
  enabled_dashboards,
  reward_model_id,
  allowed_role_ids,
  gamification_mechanic_ids,
  analytics_access_level,
  data_export_access,
  custom_branding_access,
  broker_rewards_access,
  api_integration_access
) values
  (
    'demo-riverside-academy',
    '["core_quests","pillar_map","sec_filings_lab","leaderboards"]'::jsonb,
    '["school"]'::jsonb,
    'school_merit',
    '["learner","instructor","partner_admin"]'::jsonb,
    '["xp_system","level_ladder","badges","quests","pillar_completion","progress_bars","streaks","quizzes","profile_stats","completion_pct","leaderboards","certificates"]'::jsonb,
    'advanced',
    'csv_full',
    true,
    false,
    'read_webhooks'
  ),
  (
    'demo-northstar-bank',
    '["core_quests","pillar_map","sec_filings_lab","conviction_tracker","leaderboards","certificates","broker_rewards","team_dashboards","referrals","api_integrations"]'::jsonb,
    '["bank"]'::jsonb,
    'xp_plus_badges',
    '["learner","branch_admin","partner_admin","auditor_readonly"]'::jsonb,
    '["xp_system","level_ladder","badges","quests","mini_quests","pillar_completion","progress_bars","streaks","quizzes","rewards","unlocks","profile_stats","company_badges","investor_titles","completion_pct","conviction_tracker","broker_rewards","leaderboards","certificates","class_team_dashboards","referral_rewards","unlockable_content","confidence_tracker","retention_nudges","retention_tracking"]'::jsonb,
    'full',
    'api_stream',
    true,
    false,
    'full_api'
  ),
  (
    'demo-apex-clearing',
    '["core_quests","pillar_map","sec_filings_lab","conviction_tracker","leaderboards","broker_rewards"]'::jsonb,
    '["broker"]'::jsonb,
    'broker_incentives',
    '["learner","partner_admin","auditor_readonly"]'::jsonb,
    '["xp_system","level_ladder","badges","quests","mini_quests","pillar_completion","progress_bars","streaks","quizzes","rewards","unlocks","profile_stats","company_badges","investor_titles","completion_pct","conviction_tracker","broker_rewards","retention_tracking"]'::jsonb,
    'advanced',
    'csv_full',
    true,
    true,
    'read_webhooks'
  )
on conflict (partner_id) do update set
  enabled_module_ids = excluded.enabled_module_ids,
  enabled_dashboards = excluded.enabled_dashboards,
  reward_model_id = excluded.reward_model_id,
  allowed_role_ids = excluded.allowed_role_ids,
  gamification_mechanic_ids = excluded.gamification_mechanic_ids,
  analytics_access_level = excluded.analytics_access_level,
  data_export_access = excluded.data_export_access,
  custom_branding_access = excluded.custom_branding_access,
  broker_rewards_access = excluded.broker_rewards_access,
  api_integration_access = excluded.api_integration_access,
  updated_at = now();
