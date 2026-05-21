-- Run this in Supabase SQL Editor if quest_content_cards is missing or admin shows no cards.
-- Fixes invalid /** */ comment from the original migration file.

create table if not exists public.quest_content_cards (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  pillar_id text not null check (pillar_id in ('business', 'forces', 'financials', 'management')),
  quest_type text not null,
  title text not null,
  objective text not null default '',
  description text not null default '',
  investor_question text not null,
  why_this_matters text not null,
  plain_english_answer text,
  source_filing_type text not null check (source_filing_type in ('10-K', '10-Q', 'DEF 14A')),
  source_section_key text not null,
  source_section_label text not null,
  ai_prompt_template text not null default '',
  xp_reward integer not null default 100 check (xp_reward >= 0),
  quiz_format text not null default 'multiple-choice',
  quiz_config jsonb,
  display_order integer not null default 0,
  partner_ids text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pillar_id, slug)
);

create index if not exists quest_content_cards_pillar_order_idx
  on public.quest_content_cards (pillar_id, display_order, is_active);

alter table public.quest_content_cards enable row level security;

drop policy if exists "quest_content_cards_select_anon" on public.quest_content_cards;
create policy "quest_content_cards_select_anon"
  on public.quest_content_cards for select to anon, authenticated using (true);

drop policy if exists "quest_content_cards_write_anon" on public.quest_content_cards;
create policy "quest_content_cards_write_anon"
  on public.quest_content_cards for all to anon, authenticated using (true) with check (true);
