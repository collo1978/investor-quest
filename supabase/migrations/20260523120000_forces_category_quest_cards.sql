-- FORCES pillar: four categories × topic decks (positive-inside: 4 topics)

alter table public.quest_content_cards
  add column if not exists forces_category text
  check (
    forces_category is null
    or forces_category in (
      'positive-inside',
      'negative-inside',
      'positive-outside',
      'negative-outside'
    )
  );

create index if not exists quest_content_cards_forces_category_idx
  on public.quest_content_cards (pillar_id, forces_category, display_order)
  where pillar_id = 'forces';

-- Retire legacy two-quest structure
update public.quest_content_cards
set is_active = false, updated_at = now()
where pillar_id = 'forces'
  and slug in ('inside-forces', 'outside-forces');

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
  forces_category,
  partner_ids,
  is_active,
  updated_at
) values
  ('positive-inside-supply-chain', 'forces', 'risk', 'Supply chain strength', 'Positive — Inside · Within the company''s control', 'A strong supply chain allows the company to scale production and meet demand.', 'Supply chain strength', 'Reliable suppliers and manufacturing give the company room to grow without constant firefighting on fulfillment.', 'A strong supply chain allows the company to scale production and meet demand.', '10-K', 'item_1a', 'Item 1A — Risk Factors', 'Explain how "Supply chain strength" could help or hurt {Company.name} in plain English from Item 1A.', 40, 'multiple-choice', null, 11, 'positive-inside', '{}', true, now()),
  ('positive-inside-technology', 'forces', 'risk', 'Technology systems', 'Positive — Inside · Within the company''s control', 'Reliable systems can improve efficiency and support product innovation.', 'Technology systems', 'Solid tech infrastructure can lower costs and speed new features — both can support a stronger long-term story.', 'Reliable systems can improve efficiency and support product innovation.', '10-K', 'item_1a', 'Item 1A — Risk Factors', 'Explain how "Technology systems" could help or hurt {Company.name} in plain English from Item 1A.', 40, 'multiple-choice', null, 12, 'positive-inside', '{}', true, now()),
  ('positive-inside-financial-strength', 'forces', 'risk', 'Financial strength', 'Positive — Inside · Within the company''s control', 'Strong finances allow the company to invest in growth and survive downturns.', 'Financial strength', 'A healthy balance sheet gives the company flexibility to invest, buy back stock, or weather a bad year without panic.', 'Strong finances allow the company to invest in growth and survive downturns.', '10-K', 'item_1a', 'Item 1A — Risk Factors', 'Explain how "Financial strength" could help or hurt {Company.name} in plain English from Item 1A.', 40, 'multiple-choice', null, 13, 'positive-inside', '{}', true, now()),
  ('positive-inside-brand-strength', 'forces', 'risk', 'Brand strength', 'Positive — Inside · Within the company''s control', 'A strong brand can increase customer loyalty and pricing power.', 'Brand strength', 'Trusted brands let the company charge more and keep customers — that shows up in margins and repeat revenue.', 'A strong brand can increase customer loyalty and pricing power.', '10-K', 'item_1a', 'Item 1A — Risk Factors', 'Explain how "Brand strength" could help or hurt {Company.name} in plain English from Item 1A.', 40, 'multiple-choice', null, 14, 'positive-inside', '{}', true, now()),
  ('negative-inside-operational-failures', 'forces', 'risk', 'Operational failures', 'Negative — Inside · Within the company''s control', 'Delays or poor execution can increase costs and reduce sales.', 'Operational failures', 'Execution slips are often the first sign that guidance or margins could disappoint — even when the industry looks fine.', 'Delays or poor execution can increase costs and reduce sales.', '10-K', 'item_1a', 'Item 1A — Risk Factors', 'Explain how "Operational failures" could help or hurt {Company.name} in plain English from Item 1A.', 40, 'multiple-choice', null, 21, 'negative-inside', '{}', true, now()),
  ('negative-inside-supply-disruption', 'forces', 'risk', 'Supply chain disruption', 'Negative — Inside · Within the company''s control', 'Supplier shortages or manufacturing disruptions could limit production.', 'Supply chain disruption', 'If the company cannot ship what customers want, revenue and trust can drop fast — investors watch lead times closely.', 'Supplier shortages or manufacturing disruptions could limit production.', '10-K', 'item_1a', 'Item 1A — Risk Factors', 'Explain how "Supply chain disruption" could help or hurt {Company.name} in plain English from Item 1A.', 40, 'multiple-choice', null, 22, 'negative-inside', '{}', true, now()),
  ('negative-inside-cyber-risk', 'forces', 'risk', 'Cybersecurity / technology risks', 'Negative — Inside · Within the company''s control', 'System failures or cyberattacks could disrupt operations and damage trust.', 'Cybersecurity / technology risks', 'Outages and breaches can halt sales, trigger fines, and erode confidence — especially for digital-first businesses.', 'System failures or cyberattacks could disrupt operations and damage trust.', '10-K', 'item_1a', 'Item 1A — Risk Factors', 'Explain how "Cybersecurity / technology risks" could help or hurt {Company.name} in plain English from Item 1A.', 40, 'multiple-choice', null, 23, 'negative-inside', '{}', true, now()),
  ('negative-inside-financial-weakness', 'forces', 'risk', 'Financial weakness', 'Negative — Inside · Within the company''s control', 'High debt or liquidity issues could limit investment and increase risk.', 'Financial weakness', 'Heavy debt or thin cash limits the company''s options in a downturn and can magnify losses if results slip.', 'High debt or liquidity issues could limit investment and increase risk.', '10-K', 'item_1a', 'Item 1A — Risk Factors', 'Explain how "Financial weakness" could help or hurt {Company.name} in plain English from Item 1A.', 40, 'multiple-choice', null, 24, 'negative-inside', '{}', true, now()),
  ('negative-inside-reputation-damage', 'forces', 'risk', 'Reputation damage', 'Negative — Inside · Within the company''s control', 'Brand damage or product failures could reduce demand and trust.', 'Reputation damage', 'Trust is hard to rebuild — product recalls or scandals can hit demand and valuation long after headlines fade.', 'Brand damage or product failures could reduce demand and trust.', '10-K', 'item_1a', 'Item 1A — Risk Factors', 'Explain how "Reputation damage" could help or hurt {Company.name} in plain English from Item 1A.', 40, 'multiple-choice', null, 25, 'negative-inside', '{}', true, now()),
  ('positive-outside-demand-growth', 'forces', 'industry', 'Customer demand growth', 'Positive — Outside · Outside the company''s control', 'Growing demand can drive revenue growth and expansion.', 'Customer demand growth', 'Rising demand lifts revenue without the company needing to win share — a tailwind every investor wants on their side.', 'Growing demand can drive revenue growth and expansion.', '10-K', 'item_1a', 'Item 1A — Risk Factors', 'Explain how "Customer demand growth" could help or hurt {Company.name} in plain English from Item 1A.', 40, 'multiple-choice', null, 31, 'positive-outside', '{}', true, now()),
  ('positive-outside-competitive-advantages', 'forces', 'industry', 'Competitive advantages', 'Positive — Outside · Outside the company''s control', 'Strong competitive advantages can increase market share.', 'Competitive advantages', 'Durable edges — network effects, scale, or switching costs — help the company grow profitably in a crowded market.', 'Strong competitive advantages can increase market share.', '10-K', 'item_1a', 'Item 1A — Risk Factors', 'Explain how "Competitive advantages" could help or hurt {Company.name} in plain English from Item 1A.', 40, 'multiple-choice', null, 32, 'positive-outside', '{}', true, now()),
  ('positive-outside-economic-growth', 'forces', 'industry', 'Economic growth', 'Positive — Outside · Outside the company''s control', 'Economic growth can increase spending and demand.', 'Economic growth', 'A healthy economy often lifts consumer and business spending — cyclical names can rerate quickly when growth returns.', 'Economic growth can increase spending and demand.', '10-K', 'item_1a', 'Item 1A — Risk Factors', 'Explain how "Economic growth" could help or hurt {Company.name} in plain English from Item 1A.', 40, 'multiple-choice', null, 33, 'positive-outside', '{}', true, now()),
  ('positive-outside-favorable-regulation', 'forces', 'industry', 'Favorable regulation', 'Positive — Outside · Outside the company''s control', 'Favorable regulations or incentives can support growth.', 'Favorable regulation', 'Subsidies, tax credits, or lighter rules can open new markets or improve economics overnight for the right sectors.', 'Favorable regulations or incentives can support growth.', '10-K', 'item_1a', 'Item 1A — Risk Factors', 'Explain how "Favorable regulation" could help or hurt {Company.name} in plain English from Item 1A.', 40, 'multiple-choice', null, 34, 'positive-outside', '{}', true, now()),
  ('positive-outside-global-expansion', 'forces', 'industry', 'Global expansion', 'Positive — Outside · Outside the company''s control', 'Global expansion can create new growth opportunities.', 'Global expansion', 'New regions can extend the company''s growth runway when home markets mature — if execution and regulation cooperate.', 'Global expansion can create new growth opportunities.', '10-K', 'item_1a', 'Item 1A — Risk Factors', 'Explain how "Global expansion" could help or hurt {Company.name} in plain English from Item 1A.', 40, 'multiple-choice', null, 35, 'positive-outside', '{}', true, now()),
  ('negative-outside-demand-decline', 'forces', 'industry', 'Customer demand decline', 'Negative — Outside · Outside the company''s control', 'Losing major customers or declining demand could reduce revenue.', 'Customer demand decline', 'Demand shocks hit top line first — even great operators struggle when customers pull back or switch away.', 'Losing major customers or declining demand could reduce revenue.', '10-K', 'item_1a', 'Item 1A — Risk Factors', 'Explain how "Customer demand decline" could help or hurt {Company.name} in plain English from Item 1A.', 40, 'multiple-choice', null, 41, 'negative-outside', '{}', true, now()),
  ('negative-outside-competition', 'forces', 'industry', 'Competition', 'Negative — Outside · Outside the company''s control', 'Intense competition can reduce pricing power and margins.', 'Competition', 'Price wars and new entrants can compress margins for years — investors need to know if the company can defend share.', 'Intense competition can reduce pricing power and margins.', '10-K', 'item_1a', 'Item 1A — Risk Factors', 'Explain how "Competition" could help or hurt {Company.name} in plain English from Item 1A.', 40, 'multiple-choice', null, 42, 'negative-outside', '{}', true, now()),
  ('negative-outside-economic-slowdown', 'forces', 'industry', 'Economic slowdown', 'Negative — Outside · Outside the company''s control', 'Economic slowdowns can reduce customer spending.', 'Economic slowdown', 'Recessions and rate shocks often show up in guidance before they show up in headlines — macro matters for every stock.', 'Economic slowdowns can reduce customer spending.', '10-K', 'item_1a', 'Item 1A — Risk Factors', 'Explain how "Economic slowdown" could help or hurt {Company.name} in plain English from Item 1A.', 40, 'multiple-choice', null, 43, 'negative-outside', '{}', true, now()),
  ('negative-outside-regulation-risk', 'forces', 'industry', 'Regulation risk', 'Negative — Outside · Outside the company''s control', 'Regulations or lawsuits could increase costs or restrict operations.', 'Regulation risk', 'New rules or legal battles can cap growth or add permanent costs — regulatory risk is a separate lens from operational risk.', 'Regulations or lawsuits could increase costs or restrict operations.', '10-K', 'item_1a', 'Item 1A — Risk Factors', 'Explain how "Regulation risk" could help or hurt {Company.name} in plain English from Item 1A.', 40, 'multiple-choice', null, 44, 'negative-outside', '{}', true, now()),
  ('negative-outside-geopolitical-risk', 'forces', 'industry', 'Geopolitical risk', 'Negative — Outside · Outside the company''s control', 'Trade restrictions or geopolitical tensions could disrupt operations.', 'Geopolitical risk', 'Tariffs, sanctions, and conflict can break supply chains and block markets — global companies carry this risk whether they discuss it or not.', 'Trade restrictions or geopolitical tensions could disrupt operations.', '10-K', 'item_1a', 'Item 1A — Risk Factors', 'Explain how "Geopolitical risk" could help or hurt {Company.name} in plain English from Item 1A.', 40, 'multiple-choice', null, 45, 'negative-outside', '{}', true, now())
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
  forces_category = excluded.forces_category,
  is_active = excluded.is_active,
  updated_at = now();
