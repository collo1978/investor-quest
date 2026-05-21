-- =============================================================================
-- FINANCIALS QUEST SEED — paste into Supabase SQL Editor
-- =============================================================================
-- Creates 5 Financials hub quests + map overlay (routes, lock policy, order 1–5).
-- After running: http://localhost:3003/admin/quests → Financials tab (5 cards)
-- Game hub: http://localhost:3003/financials (hard refresh Ctrl+Shift+R)
-- =============================================================================

alter table public.quest_content_cards
  add column if not exists hub_icon text,
  add column if not exists hub_subtitle text,
  add column if not exists hub_card_count integer,
  add column if not exists hub_route text,
  add column if not exists hub_locked boolean;

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
  partner_ids,
  is_active,
  updated_at
) values
  (
    'growth',
    'financials',
    'growth',
    'Growth',
    'Assess whether the business is growing.',
    'Mini quest prompts: What is the 3 year revenue growth? What is the breakdown of revenue for their products? What is the breakdown of geographical revenue?',
    'Is the business growing?',
    'Revenue growth shows whether demand for the company''s products or services is expanding.',
    null,
    '10-K',
    'item_7',
    'Item 7 — MD&A',
    'You are helping a beginner investor evaluate {Company.name} ({Company.ticker}). In plain English, answer: Is the business growing? Cover: (1) roughly how revenue has changed over about three years, (2) which products or services drive revenue, and (3) how revenue splits by geography if disclosed. Use 10-K Item 7 — MD&A and Item 8 — Financial Statements only. No jargon—short paragraphs or bullets.',
    50,
    'multiple-choice',
    '{"passThreshold": 0.66}'::jsonb,
    10,
    '{}',
    true,
    now()
  ),
  (
    'profitability',
    'financials',
    'profitability',
    'Profitability',
    'Assess whether the company is profitable.',
    'Mini quest prompts: Are profit margins improving or shrinking? Is earnings per share growing?',
    'Is the company profitable?',
    'EPS growth reflects how much profit belongs to each shareholder.',
    null,
    '10-K',
    'item_7',
    'Item 7 — MD&A',
    'You are helping a beginner investor evaluate {Company.name} ({Company.ticker}). In plain English, answer: Is the company profitable? Explain whether profit margins are improving or shrinking and whether earnings per share (EPS) is growing. Use 10-K Item 7 — MD&A and Item 8 — Financial Statements only. Define terms simply when you use them.',
    50,
    'multiple-choice',
    '{"passThreshold": 0.66}'::jsonb,
    20,
    '{}',
    true,
    now()
  ),
  (
    'expenses',
    'financials',
    'expenses',
    'Expenses',
    'See how efficiently the company operates.',
    'Mini quest prompts: How are operating expenses changing? Is the company spending to grow the business?',
    'How efficiently is the company operating?',
    'Rising expenses without revenue growth may signal inefficiency.',
    null,
    '10-K',
    'item_7',
    'Item 7 — MD&A',
    'You are helping a beginner investor evaluate {Company.name} ({Company.ticker}). In plain English, answer: How efficiently is the company operating? Describe how operating expenses are changing and whether spending looks focused on growth or waste. Use only 10-K Item 7 — MD&A. Keep it practical for a beginner.',
    50,
    'multiple-choice',
    '{"passThreshold": 0.66}'::jsonb,
    30,
    '{}',
    true,
    now()
  ),
  (
    'cash',
    'financials',
    'cash',
    'Cash',
    'Check whether the business generates real cash.',
    'Mini quest prompts: Is operating cash flow increasing? How is cash being used?',
    'Is the business generating real cash?',
    'Strong operating cash flow shows the business generates real cash from operations.',
    null,
    '10-K',
    'item_7',
    'Item 7 — MD&A',
    'You are helping a beginner investor evaluate {Company.name} ({Company.ticker}). In plain English, answer: Is the business generating real cash? Explain whether operating cash flow is increasing and how the company uses cash (operations, investments, debt paydown, dividends, buybacks). Use 10-K Item 7 — MD&A and Item 8 — Financial Statements only.',
    50,
    'multiple-choice',
    '{"passThreshold": 0.66}'::jsonb,
    40,
    '{}',
    true,
    now()
  ),
  (
    'financial-strength',
    'financials',
    'financial-strength',
    'Financial Strength',
    'Gauge balance-sheet strength and obligations.',
    'Mini quest prompts: Does the company have more cash or debt? What financial obligations does the company have?',
    'How strong is the company financially?',
    'Companies with strong balance sheets can survive downturns and invest in growth.',
    null,
    '10-K',
    'item_8',
    'Item 8 — Financial Statements',
    'You are helping a beginner investor evaluate {Company.name} ({Company.ticker}). In plain English, answer: How strong is the company financially? Address whether it has more cash or debt (in simple terms) and what major financial obligations investors should know. Use 10-K Item 8 — Financial Statements and supporting notes from Item 7 — MD&A if needed. Avoid accounting jargon.',
    50,
    'multiple-choice',
    '{"passThreshold": 0.66}'::jsonb,
    50,
    '{}',
    true,
    now()
  )
on conflict (pillar_id, slug) do update set
  quest_type = excluded.quest_type,
  title = excluded.title,
  objective = excluded.objective,
  description = excluded.description,
  investor_question = excluded.investor_question,
  why_this_matters = excluded.why_this_matters,
  plain_english_answer = excluded.plain_english_answer,
  source_filing_type = excluded.source_filing_type,
  source_section_key = excluded.source_section_key,
  source_section_label = excluded.source_section_label,
  ai_prompt_template = excluded.ai_prompt_template,
  xp_reward = excluded.xp_reward,
  quiz_format = excluded.quiz_format,
  quiz_config = excluded.quiz_config,
  display_order = excluded.display_order,
  partner_ids = excluded.partner_ids,
  is_active = excluded.is_active,
  updated_at = now();

-- Hub map overlay: Growth unlocked, others locked; routes to /financials/{slug}
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
  hub_card_count = 3,
  hub_route = coalesce(hub_route, '/financials/' || slug),
  hub_locked = case
    when slug = 'growth' then false
    when pillar_id = 'financials' then coalesce(hub_locked, true)
    else hub_locked
  end
where pillar_id = 'financials';
