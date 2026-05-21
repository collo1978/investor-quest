-- Business hub map overlay fields on quest_content_cards (Supabase CMS)

alter table public.quest_content_cards
  add column if not exists hub_icon text,
  add column if not exists hub_subtitle text,
  add column if not exists hub_card_count integer,
  add column if not exists hub_route text,
  add column if not exists hub_locked boolean;

comment on column public.quest_content_cards.display_order is
  'Map order_number (1–5) for Business hub card placement.';
comment on column public.quest_content_cards.hub_icon is
  'Business map icon key — see businessHubIcons.ts';
comment on column public.quest_content_cards.hub_subtitle is
  'Business map card subtitle; falls back to investor_question';
comment on column public.quest_content_cards.hub_card_count is
  'Badge count on Business map card';
comment on column public.quest_content_cards.hub_route is
  'Route override e.g. /business/snapshot';
comment on column public.quest_content_cards.hub_locked is
  'Force hub lock; null = default unlock policy';

-- Seed Business pillar hub metadata (when rows exist)
update public.quest_content_cards
set
  display_order = case slug
    when 'snapshot' then 1
    when 'revenue' then 2
    when 'operations' then 3
    when 'advantage' then 4
    when 'industry' then 5
    else display_order
  end,
  hub_icon = coalesce(hub_icon, quest_type),
  hub_card_count = coalesce(hub_card_count, 3),
  hub_route = coalesce(hub_route, '/business/' || slug),
  hub_locked = case
    when slug = 'snapshot' then false
    when pillar_id = 'business' then coalesce(hub_locked, true)
    else hub_locked
  end,
  hub_subtitle = coalesce(hub_subtitle, investor_question)
where pillar_id = 'business';
