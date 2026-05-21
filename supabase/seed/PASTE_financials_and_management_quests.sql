-- =============================================================================
-- FINANCIALS + MANAGEMENT QUEST SEED (paste into Supabase SQL Editor)
-- =============================================================================
--
-- STEP 1 — Run the base card seed (5 Financials + 4 Management quests):
--   Open: supabase/migrations/20260522120000_seed_financials_management_quest_cards.sql
--   Copy all SQL and run it in the Supabase SQL Editor.
--
-- STEP 2 — Run the hub map overlay (routes, lock policy, 5th Management card):
--   Copy the SQL below and run it after Step 1.
--
-- STEP 3 — Verify in admin:
--   http://localhost:3003/admin/quests?partner=demo-riverside-academy
--   Tabs: Financials (5 cards), Management (5 cards)
--
-- STEP 4 — Hard refresh game hubs:
--   /financials  /management
-- =============================================================================

-- Hub columns (safe if already applied via 20260527120000_business_hub_map_fields.sql)
alter table public.quest_content_cards
  add column if not exists hub_icon text,
  add column if not exists hub_subtitle text,
  add column if not exists hub_card_count integer,
  add column if not exists hub_route text,
  add column if not exists hub_locked boolean;

-- FINANCIALS hub metadata
update public.quest_content_cards
set
  display_order = case slug
    when 'growth' then 1
    when 'profitability' then 2
    when 'expenses' then 3
    when 'cash' then 4
    when 'financial-strength' then 5
    else display_order
  end,
  hub_icon = coalesce(hub_icon, quest_type),
  hub_subtitle = coalesce(hub_subtitle, investor_question),
  hub_card_count = coalesce(hub_card_count, 3),
  hub_route = coalesce(hub_route, '/financials/' || slug),
  hub_locked = case
    when slug = 'growth' then false
    when pillar_id = 'financials' then coalesce(hub_locked, true)
    else hub_locked
  end
where pillar_id = 'financials';

-- MANAGEMENT hub metadata
update public.quest_content_cards
set
  display_order = case slug
    when 'board-leadership' then 1
    when 'executive-compensation' then 2
    when 'capital-allocation' then 3
    when 'governance-control' then 4
    when 'management-summary' then 5
    else display_order
  end,
  hub_icon = coalesce(hub_icon, quest_type),
  hub_subtitle = coalesce(hub_subtitle, investor_question),
  hub_card_count = coalesce(hub_card_count, 3),
  hub_route = coalesce(
    hub_route,
    '/quest?pillar=management&quest=' || slug
  ),
  hub_locked = case
    when slug = 'board-leadership' then false
    when pillar_id = 'management' then coalesce(hub_locked, true)
    else hub_locked
  end
where pillar_id = 'management';

-- Fifth Management hub card — Management Summary
insert into public.quest_content_cards (
  slug,
  pillar_id,
  quest_type,
  title,
  objective,
  description,
  investor_question,
  why_this_matters,
  plain_english_answer,
  source_filing_type,
  source_section_key,
  source_section_label,
  ai_prompt_template,
  xp_reward,
  quiz_format,
  quiz_config,
  display_order,
  hub_icon,
  hub_subtitle,
  hub_card_count,
  hub_route,
  hub_locked,
  partner_ids,
  is_active,
  updated_at
) values (
  'management-summary',
  'management',
  'snapshot',
  'Management Summary',
  'Synthesize what you learned about leadership, pay, capital, and governance.',
  'A short recap quest tying together Board & Leadership, Executive Compensation, Capital Allocation, and Governance & Control.',
  'Can you explain—in your own words—whether you trust this management team with your capital?',
  'Conviction comes from connecting people, incentives, capital, and oversight—not from reading one section in isolation.',
  null,
  'DEF 14A',
  'proxy_governance',
  'Corporate Governance',
  'You are helping a beginner investor evaluate {Company.name} ({Company.ticker}). In plain English, summarize the management story: leadership quality, pay alignment, capital discipline, and governance protections. Keep it practical and under 200 words.',
  50,
  'multiple-choice',
  '{"passThreshold": 0.66}'::jsonb,
  5,
  'summary',
  'Can you explain—in your own words—whether you trust this management team with your capital?',
  3,
  '/quest?pillar=management&quest=management-summary',
  true,
  '{}',
  true,
  now()
)
on conflict (pillar_id, slug) do update set
  title = excluded.title,
  objective = excluded.objective,
  description = excluded.description,
  investor_question = excluded.investor_question,
  why_this_matters = excluded.why_this_matters,
  display_order = excluded.display_order,
  hub_icon = excluded.hub_icon,
  hub_subtitle = excluded.hub_subtitle,
  hub_card_count = excluded.hub_card_count,
  hub_route = excluded.hub_route,
  hub_locked = excluded.hub_locked,
  is_active = excluded.is_active,
  updated_at = now();
