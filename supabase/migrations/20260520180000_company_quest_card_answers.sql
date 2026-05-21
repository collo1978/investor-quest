-- AI-generated quest card answers (Financials pillar MVP).
create table if not exists public.company_quest_card_answers (
  id uuid primary key default gen_random_uuid(),
  ticker text not null,
  pillar_id text not null default 'financials',
  quest_slug text not null,
  card_id text not null,
  plain_english_answer text not null,
  investor_insight text,
  source_form text not null default '10-K',
  source_accession text,
  source_section_keys text[] not null default '{}',
  filing_section_ids uuid[] not null default '{}',
  content_hash text,
  generated_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint company_quest_card_answers_unique unique (ticker, pillar_id, quest_slug, card_id)
);

create index if not exists company_quest_card_answers_ticker_slug_idx
  on public.company_quest_card_answers (ticker, quest_slug);

alter table public.company_quest_card_answers enable row level security;

create policy "company_quest_card_answers_select"
  on public.company_quest_card_answers for select using (true);

create policy "company_quest_card_answers_insert"
  on public.company_quest_card_answers for insert with check (true);

create policy "company_quest_card_answers_update"
  on public.company_quest_card_answers for update using (true);
