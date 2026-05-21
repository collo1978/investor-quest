-- Onboarding interest matching: interests, companies, tags, user selections

create table if not exists public.interests (
  id text primary key,
  label text not null,
  icon text not null default '✦',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.companies (
  id text primary key,
  ticker text not null unique,
  display_name text not null,
  cik text not null,
  sic_code text,
  sector text not null,
  industry text not null,
  logo_url text not null,
  -- Curated Item 1 Business keywords only (not full-filing inference)
  item1_business_hints text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.company_interest_tags (
  company_id text not null references public.companies (id) on delete cascade,
  interest_id text not null references public.interests (id) on delete cascade,
  tag_source text not null default 'seed'
    check (tag_source in ('metadata', 'item1_business', 'seed')),
  primary key (company_id, interest_id, tag_source)
);

create index if not exists company_interest_tags_interest_idx
  on public.company_interest_tags (interest_id);

create table if not exists public.user_interests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  guest_id text,
  interest_id text not null references public.interests (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint user_interests_actor_check check (user_id is not null or guest_id is not null)
);

create unique index if not exists user_interests_guest_interest_uidx
  on public.user_interests (guest_id, interest_id)
  where guest_id is not null;

create unique index if not exists user_interests_user_interest_uidx
  on public.user_interests (user_id, interest_id)
  where user_id is not null;

-- ---------------------------------------------------------------------------
-- Seed interests
-- ---------------------------------------------------------------------------

insert into public.interests (id, label, icon, sort_order) values
  ('ai', 'AI & Robotics', '⌬', 10),
  ('electric_cars', 'Electric Cars', '⚡', 20),
  ('gaming', 'Gaming', '⌁', 30),
  ('fashion', 'Fashion', '◆', 40),
  ('sports', 'Sports', '◎', 50),
  ('tech', 'Technology', '✦', 60),
  ('consumer', 'Consumer', '◐', 70),
  ('music', 'Music & Media', '♫', 80),
  ('finance', 'Finance', '▦', 90),
  ('health', 'Healthcare', '♡', 100),
  ('energy', 'Energy', '☼', 110),
  ('travel', 'Travel', '✈', 120)
on conflict (id) do update set
  label = excluded.label,
  icon = excluded.icon,
  sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- Seed companies (metadata-first; Item 1 hints stored separately)
-- ---------------------------------------------------------------------------

insert into public.companies (
  id, ticker, display_name, cik, sic_code, sector, industry, logo_url, item1_business_hints
) values
  ('nvda', 'NVDA', 'NVIDIA', '0001045810', '3674', 'Technology', 'Semiconductors', '/logos/companies/nvda.svg',
    array['artificial intelligence', 'data center accelerators', 'graphics processing']),
  ('msft', 'MSFT', 'Microsoft', '0000789019', '7372', 'Technology', 'Software—Prepackaged Software', '/logos/companies/msft.svg',
    array['cloud computing', 'productivity software', 'AI copilots']),
  ('pltr', 'PLTR', 'Palantir', '0001321655', '7372', 'Technology', 'Software—Applications', '/logos/companies/pltr.svg',
    array['government analytics', 'enterprise AI platforms', 'operating systems for data']),
  ('tsla', 'TSLA', 'Tesla', '0001318605', '3711', 'Consumer Cyclical', 'Motor Vehicles & Passenger Car Bodies', '/logos/companies/tsla.svg',
    array['electric vehicles', 'energy storage', 'autonomous driving']),
  ('rivn', 'RIVN', 'Rivian', '0001874178', '3711', 'Consumer Cyclical', 'Motor Vehicles & Passenger Car Bodies', '/logos/companies/rivn.svg',
    array['electric trucks', 'adventure vehicles', 'battery systems']),
  ('rblx', 'RBLX', 'Roblox', '0001315098', '7372', 'Communication Services', 'Services—Computer Programming', '/logos/companies/rblx.svg',
    array['user-generated games', 'immersive experiences', 'developer ecosystem']),
  ('ea', 'EA', 'Electronic Arts', '0000712515', '7372', 'Communication Services', 'Services—Prepackaged Software', '/logos/companies/ea.svg',
    array['sports franchises', 'live services', 'interactive entertainment']),
  ('nke', 'NKE', 'Nike', '0000320187', '3021', 'Consumer Cyclical', 'Rubber & Plastics Footwear', '/logos/companies/nke.svg',
    array['athletic footwear', 'apparel', 'direct-to-consumer']),
  ('lulu', 'LULU', 'Lululemon', '0001397187', '5651', 'Consumer Cyclical', 'Retail—Apparel & Accessories', '/logos/companies/lulu.svg',
    array['technical apparel', 'wellness lifestyle', 'omni-channel retail']),
  ('dis', 'DIS', 'Walt Disney', '0001001039', '7990', 'Communication Services', 'Services—Miscellaneous Amusement', '/logos/companies/dis.svg',
    array['streaming', 'parks and experiences', 'sports media rights']),
  ('dkng', 'DKNG', 'DraftKings', '0001883685', '7990', 'Consumer Cyclical', 'Services—Miscellaneous Amusement', '/logos/companies/dkng.svg',
    array['sports betting', 'iGaming', 'daily fantasy sports']),
  ('aapl', 'AAPL', 'Apple', '0000320193', '3571', 'Technology', 'Electronic Computers', '/logos/companies/aapl.svg',
    array['consumer electronics', 'services ecosystem', 'wearables']),
  ('spot', 'SPOT', 'Spotify', '0001639920', '7370', 'Communication Services', 'Services—Computer Programming', '/logos/companies/spot.svg',
    array['audio streaming', 'podcasts', 'creator tools'])
on conflict (id) do update set
  ticker = excluded.ticker,
  display_name = excluded.display_name,
  cik = excluded.cik,
  sic_code = excluded.sic_code,
  sector = excluded.sector,
  industry = excluded.industry,
  logo_url = excluded.logo_url,
  item1_business_hints = excluded.item1_business_hints,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- Company ↔ interest tags (metadata + seed; Item 1 support where noted)
-- ---------------------------------------------------------------------------

insert into public.company_interest_tags (company_id, interest_id, tag_source) values
  -- AI
  ('nvda', 'ai', 'metadata'),
  ('msft', 'ai', 'metadata'),
  ('pltr', 'ai', 'metadata'),
  ('nvda', 'ai', 'item1_business'),
  ('msft', 'ai', 'item1_business'),
  ('pltr', 'ai', 'item1_business'),
  ('nvda', 'tech', 'metadata'),
  ('msft', 'tech', 'metadata'),
  ('pltr', 'tech', 'metadata'),
  ('aapl', 'tech', 'metadata'),
  -- Electric cars
  ('tsla', 'electric_cars', 'metadata'),
  ('rivn', 'electric_cars', 'metadata'),
  ('tsla', 'energy', 'metadata'),
  ('rivn', 'energy', 'metadata'),
  -- Gaming
  ('rblx', 'gaming', 'metadata'),
  ('ea', 'gaming', 'metadata'),
  ('rblx', 'gaming', 'item1_business'),
  ('ea', 'gaming', 'item1_business'),
  ('rblx', 'tech', 'metadata'),
  ('ea', 'consumer', 'metadata'),
  -- Fashion
  ('nke', 'fashion', 'metadata'),
  ('lulu', 'fashion', 'metadata'),
  ('nke', 'fashion', 'item1_business'),
  ('lulu', 'fashion', 'item1_business'),
  ('nke', 'consumer', 'metadata'),
  ('lulu', 'consumer', 'metadata'),
  ('nke', 'sports', 'metadata'),
  ('lulu', 'sports', 'metadata'),
  -- Sports
  ('nke', 'sports', 'seed'),
  ('dis', 'sports', 'metadata'),
  ('dkng', 'sports', 'metadata'),
  ('dis', 'sports', 'item1_business'),
  ('dkng', 'sports', 'item1_business'),
  ('ea', 'sports', 'metadata'),
  ('dis', 'music', 'metadata'),
  ('dis', 'consumer', 'metadata'),
  ('spot', 'music', 'metadata'),
  ('spot', 'music', 'item1_business'),
  ('spot', 'tech', 'metadata'),
  ('aapl', 'consumer', 'metadata'),
  ('tsla', 'consumer', 'metadata')
on conflict (company_id, interest_id, tag_source) do nothing;

-- ---------------------------------------------------------------------------
-- RLS (dev-open; tighten when auth ships)
-- ---------------------------------------------------------------------------

alter table public.interests enable row level security;
alter table public.companies enable row level security;
alter table public.company_interest_tags enable row level security;
alter table public.user_interests enable row level security;

drop policy if exists "interests_select_anon" on public.interests;
create policy "interests_select_anon"
  on public.interests for select to anon, authenticated using (true);

drop policy if exists "companies_select_anon" on public.companies;
create policy "companies_select_anon"
  on public.companies for select to anon, authenticated using (true);

drop policy if exists "company_interest_tags_select_anon" on public.company_interest_tags;
create policy "company_interest_tags_select_anon"
  on public.company_interest_tags for select to anon, authenticated using (true);

drop policy if exists "user_interests_select_anon" on public.user_interests;
create policy "user_interests_select_anon"
  on public.user_interests for select to anon, authenticated using (true);

drop policy if exists "user_interests_write_anon" on public.user_interests;
create policy "user_interests_write_anon"
  on public.user_interests for all to anon, authenticated using (true) with check (true);
