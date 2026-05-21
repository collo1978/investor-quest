-- Remove first Positive Inside topic card (Business & operational strength).

update public.quest_content_cards
set is_active = false, updated_at = now()
where pillar_id = 'forces'
  and slug = 'positive-inside-business-strength';

update public.quest_content_cards
set hub_card_count = 4, updated_at = now()
where pillar_id = 'forces'
  and slug = 'forces-hub-positive-inside';

update public.quest_content_cards
set display_order = 11, updated_at = now()
where pillar_id = 'forces'
  and slug = 'positive-inside-supply-chain'
  and is_active = true;

update public.quest_content_cards
set display_order = 12, updated_at = now()
where pillar_id = 'forces'
  and slug = 'positive-inside-technology'
  and is_active = true;

update public.quest_content_cards
set display_order = 13, updated_at = now()
where pillar_id = 'forces'
  and slug = 'positive-inside-financial-strength'
  and is_active = true;

update public.quest_content_cards
set display_order = 14, updated_at = now()
where pillar_id = 'forces'
  and slug = 'positive-inside-brand-strength'
  and is_active = true;
