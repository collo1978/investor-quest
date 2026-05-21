-- Allow hub-map quest unlock analytics events

alter table public.user_activity_events
  drop constraint if exists user_activity_events_event_type_check;

alter table public.user_activity_events
  add constraint user_activity_events_event_type_check
  check (
    event_type in (
      'user_started_quest',
      'user_opened_card',
      'user_marked_card_read',
      'user_unlocked_quest',
      'user_completed_pillar',
      'user_completed_quiz',
      'user_earned_xp',
      'user_earned_badge',
      'user_completed_company_report',
      'user_updated_conviction'
    )
  );

-- Business hub: null hub_locked = order-based chain unlock (not permanent lock)
update public.quest_content_cards
set hub_locked = null, updated_at = now()
where pillar_id = 'business'
  and slug in ('revenue', 'operations', 'advantage', 'industry');
