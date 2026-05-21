-- SEC filing section extraction + quest/AI pipeline tables

-- ---------------------------------------------------------------------------
-- SEC filings (canonical filing metadata)
-- ---------------------------------------------------------------------------
create table if not exists public.sec_filings (
  id uuid primary key default gen_random_uuid(),
  ticker text not null,
  cik text not null,
  form_type text not null check (form_type in ('10-K', '10-Q', 'DEF 14A')),
  accession_number text not null,
  filed_at timestamptz not null,
  filing_url text not null,
  period_of_report date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (accession_number)
);

create index if not exists sec_filings_ticker_form_idx
  on public.sec_filings (ticker, form_type, filed_at desc);

-- ---------------------------------------------------------------------------
-- Extracted sections (quest-relevant only — never full filings)
-- ---------------------------------------------------------------------------
create table if not exists public.filing_sections (
  id uuid primary key default gen_random_uuid(),
  filing_id uuid not null references public.sec_filings (id) on delete cascade,
  section_key text not null,
  section_label text not null,
  quest_category text not null,
  content_text text not null,
  content_hash text not null,
  char_count integer not null check (char_count >= 0),
  truncated boolean not null default false,
  extracted_at timestamptz not null default now(),
  unique (filing_id, section_key)
);

create index if not exists filing_sections_filing_id_idx
  on public.filing_sections (filing_id);

create index if not exists filing_sections_quest_category_idx
  on public.filing_sections (quest_category);

-- ---------------------------------------------------------------------------
-- Quest ↔ SEC section mapping (seeded catalog)
-- ---------------------------------------------------------------------------
create table if not exists public.quest_section_mappings (
  id uuid primary key default gen_random_uuid(),
  form_type text not null check (form_type in ('10-K', '10-Q', 'DEF 14A')),
  quest_category text not null,
  section_key text not null,
  section_label text not null,
  extractor_item text,
  pillar_hint text,
  sort_order integer not null default 0,
  unique (form_type, section_key)
);

-- ---------------------------------------------------------------------------
-- AI generation jobs (prompts use section excerpts only)
-- ---------------------------------------------------------------------------
create table if not exists public.ai_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  ticker text not null,
  filing_id uuid references public.sec_filings (id) on delete set null,
  job_type text not null check (
    job_type in ('quest_generation', 'quiz_generation', 'section_summary')
  ),
  status text not null default 'pending' check (
    status in ('pending', 'running', 'completed', 'failed', 'cancelled')
  ),
  input_section_ids uuid[] not null default '{}',
  prompt_payload jsonb not null default '{}'::jsonb,
  result jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists ai_generation_jobs_ticker_status_idx
  on public.ai_generation_jobs (ticker, status, created_at desc);

-- ---------------------------------------------------------------------------
-- Quest answers (player / demo responses tied to generated content)
-- ---------------------------------------------------------------------------
create table if not exists public.quest_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  quest_id text not null,
  company_ticker text not null,
  generation_job_id uuid references public.ai_generation_jobs (id) on delete set null,
  answer_payload jsonb not null default '{}'::jsonb,
  is_correct boolean,
  created_at timestamptz not null default now()
);

create index if not exists quest_answers_ticker_quest_idx
  on public.quest_answers (company_ticker, quest_id);

-- ---------------------------------------------------------------------------
-- RLS (read for catalog; writes via server route handlers)
-- ---------------------------------------------------------------------------
alter table public.sec_filings enable row level security;
alter table public.filing_sections enable row level security;
alter table public.quest_section_mappings enable row level security;
alter table public.ai_generation_jobs enable row level security;
alter table public.quest_answers enable row level security;

drop policy if exists "sec_filings_select_anon" on public.sec_filings;
create policy "sec_filings_select_anon"
  on public.sec_filings for select to anon, authenticated using (true);

drop policy if exists "sec_filings_write_anon" on public.sec_filings;
create policy "sec_filings_write_anon"
  on public.sec_filings for all to anon, authenticated using (true) with check (true);

drop policy if exists "filing_sections_select_anon" on public.filing_sections;
create policy "filing_sections_select_anon"
  on public.filing_sections for select to anon, authenticated using (true);

drop policy if exists "filing_sections_write_anon" on public.filing_sections;
create policy "filing_sections_write_anon"
  on public.filing_sections for all to anon, authenticated using (true) with check (true);

drop policy if exists "quest_section_mappings_select_anon" on public.quest_section_mappings;
create policy "quest_section_mappings_select_anon"
  on public.quest_section_mappings for select to anon, authenticated using (true);

drop policy if exists "ai_generation_jobs_all_anon" on public.ai_generation_jobs;
create policy "ai_generation_jobs_all_anon"
  on public.ai_generation_jobs for all to anon, authenticated using (true) with check (true);

drop policy if exists "quest_answers_all_anon" on public.quest_answers;
create policy "quest_answers_all_anon"
  on public.quest_answers for all to anon, authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Seed: quest section mappings
-- ---------------------------------------------------------------------------
insert into public.quest_section_mappings (
  form_type,
  quest_category,
  section_key,
  section_label,
  extractor_item,
  pillar_hint,
  sort_order
) values
  ('10-K', 'business', 'item_1', 'Item 1 — Business', '1', 'business', 10),
  ('10-K', 'forces', 'item_1a', 'Item 1A — Risk Factors', '1A', 'forces', 20),
  ('10-K', 'financials', 'item_7', 'Item 7 — MD&A', '7', 'financials', 30),
  ('10-K', 'financials', 'item_8', 'Item 8 — Financial Statements', '8', 'financials', 40),
  ('10-Q', 'quarterly_update', 'part1item2', 'Part I Item 2 — MD&A', 'part1item2', 'business', 10),
  ('10-Q', 'quarterly_risks', 'part2item1a', 'Part II Item 1A — Risk Factors', 'part2item1a', 'forces', 20),
  ('10-Q', 'quarterly_financials', 'part1item1', 'Part I Item 1 — Financial Statements', 'part1item1', 'financials', 30),
  ('DEF 14A', 'proxy_board', 'proxy_board', 'Board of Directors', null, 'business', 10),
  ('DEF 14A', 'proxy_executives', 'proxy_executives', 'Executive Officers', null, 'business', 20),
  ('DEF 14A', 'proxy_compensation', 'proxy_compensation', 'Executive Compensation', null, 'financials', 30),
  ('DEF 14A', 'proxy_governance', 'proxy_governance', 'Corporate Governance', null, 'forces', 40),
  ('DEF 14A', 'proxy_ownership', 'proxy_ownership', 'Security Ownership', null, 'financials', 50)
on conflict (form_type, section_key) do update set
  quest_category = excluded.quest_category,
  section_label = excluded.section_label,
  extractor_item = excluded.extractor_item,
  pillar_hint = excluded.pillar_hint,
  sort_order = excluded.sort_order;
