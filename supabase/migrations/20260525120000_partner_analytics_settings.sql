-- Partner analytics tiers + per-client SaaS feature flags
-- TODO: Stripe subscription webhooks → sync analytics_tier + flags
-- TODO: Usage-based pricing (MAU / events ingested)
-- TODO: Analytics seat limits · school/student licence packs · broker enterprise contracts

create table if not exists public.partner_analytics_settings (
  id uuid primary key default gen_random_uuid(),
  partner_id text not null unique,
  partner_name text,
  analytics_tier text not null default 'basic'
    check (analytics_tier in ('basic', 'pro', 'enterprise')),
  enable_basic_metrics boolean not null default true,
  enable_time_tracking boolean not null default false,
  enable_retention_tracking boolean not null default false,
  enable_behavior_funnels boolean not null default false,
  enable_heatmaps boolean not null default false,
  enable_ai_insights boolean not null default false,
  enable_conviction_tracking boolean not null default false,
  enable_company_interest_tracking boolean not null default false,
  enable_sector_tracking boolean not null default false,
  enable_cohort_tracking boolean not null default false,
  enable_school_dashboard boolean not null default false,
  enable_broker_dashboard boolean not null default false,
  enable_api_exports boolean not null default false,
  enable_custom_reports boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists partner_analytics_settings_partner_id_idx
  on public.partner_analytics_settings (partner_id);

alter table public.partner_analytics_settings enable row level security;

drop policy if exists "partner_analytics_settings_select" on public.partner_analytics_settings;
create policy "partner_analytics_settings_select"
  on public.partner_analytics_settings for select to anon, authenticated using (true);

drop policy if exists "partner_analytics_settings_insert" on public.partner_analytics_settings;
create policy "partner_analytics_settings_insert"
  on public.partner_analytics_settings for insert to anon, authenticated with check (true);

drop policy if exists "partner_analytics_settings_update" on public.partner_analytics_settings;
create policy "partner_analytics_settings_update"
  on public.partner_analytics_settings for update to anon, authenticated using (true);

-- Demo partners: school = basic, bank = pro, broker = enterprise
insert into public.partner_analytics_settings (
  partner_id,
  partner_name,
  analytics_tier,
  enable_basic_metrics,
  enable_time_tracking,
  enable_retention_tracking,
  enable_behavior_funnels,
  enable_heatmaps,
  enable_ai_insights,
  enable_conviction_tracking,
  enable_company_interest_tracking,
  enable_sector_tracking,
  enable_cohort_tracking,
  enable_school_dashboard,
  enable_broker_dashboard,
  enable_api_exports,
  enable_custom_reports
) values
  (
    'demo-riverside-academy',
    'Riverside Academy',
    'basic',
    true, false, false, false, false, false, false, false, false, false, false, false, false, false
  ),
  (
    'demo-northstar-bank',
    'Northstar Community Bank',
    'pro',
    true, true, true, true, true, false, true, true, false, false, false, false, false, false
  ),
  (
    'demo-apex-clearing',
    'Apex Online Brokerage',
    'enterprise',
    true, true, true, true, true, true, true, true, true, true, true, true, true, true
  )
on conflict (partner_id) do update set
  partner_name = excluded.partner_name,
  analytics_tier = excluded.analytics_tier,
  enable_basic_metrics = excluded.enable_basic_metrics,
  enable_time_tracking = excluded.enable_time_tracking,
  enable_retention_tracking = excluded.enable_retention_tracking,
  enable_behavior_funnels = excluded.enable_behavior_funnels,
  enable_heatmaps = excluded.enable_heatmaps,
  enable_ai_insights = excluded.enable_ai_insights,
  enable_conviction_tracking = excluded.enable_conviction_tracking,
  enable_company_interest_tracking = excluded.enable_company_interest_tracking,
  enable_sector_tracking = excluded.enable_sector_tracking,
  enable_cohort_tracking = excluded.enable_cohort_tracking,
  enable_school_dashboard = excluded.enable_school_dashboard,
  enable_broker_dashboard = excluded.enable_broker_dashboard,
  enable_api_exports = excluded.enable_api_exports,
  enable_custom_reports = excluded.enable_custom_reports;
