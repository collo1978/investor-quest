-- Security fix (audit S1): the anon/public Supabase key ships to every browser,
-- so every table below previously granting anon full read/write via
-- `using (true)` / `with check (true)` was directly readable and writable by
-- anyone with devtools open, bypassing the Next.js app entirely.
--
-- All server-side repositories in src/lib/gameHealth, src/lib/sec, and
-- src/lib/supabase/** now use the service-role client
-- (src/lib/supabase/serviceClient.ts), which bypasses RLS by design for
-- trusted server code. That means anon no longer needs any policy on these
-- tables for the app to keep working.
--
-- The only two tables still written directly from the browser are
-- user_activity_events (src/lib/analytics/trackUserEvent.ts) and
-- user_sessions (src/lib/analytics/sessionTracker.ts) — both low-sensitivity
-- analytics, both kept as-is below.

do $$
declare
  pol record;
  affected_tables text[] := array[
    'ai_generation_jobs',
    'companies',
    'company_geographic_revenue_reports',
    'company_interest_tags',
    'company_quest_card_answers',
    'filing_sections',
    'game_health_checks',
    'game_health_issues',
    'game_health_settings',
    'interests',
    'licences',
    'package_tiers',
    'partner_analytics_settings',
    'partner_branding',
    'partner_policies',
    'partners',
    'prompt_templates',
    'prompt_template_versions',
    'prompt_preview_evaluations',
    'quest_answers',
    'quest_content_cards',
    'quest_section_mappings',
    'sec_filings',
    'user_activity_events',
    'user_interests',
    'user_sessions'
  ];
  t text;
begin
  -- Drop every existing policy on these tables, regardless of name/history,
  -- rather than relying on the exact policy names each prior migration used.
  for pol in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename = any(affected_tables)
  loop
    execute format('drop policy if exists %I on public.%I', pol.policyname, pol.tablename);
  end loop;

  -- Make sure RLS is enabled on all of them (defensive; should already be true).
  foreach t in array affected_tables loop
    if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = t) then
      execute format('alter table public.%I enable row level security', t);
    end if;
  end loop;
end $$;

-- user_activity_events: browser inserts analytics events; nothing reads its own
-- rows back from the client, so no select policy is needed.
create policy "user_activity_events_insert_anon"
  on public.user_activity_events for insert
  to anon, authenticated
  with check (true);

-- user_sessions: browser opens/reads/updates its own session row
-- (src/lib/analytics/sessionTracker.ts) — insert, select, and update are all
-- exercised directly from client code today.
create policy "user_sessions_insert_anon"
  on public.user_sessions for insert
  to anon, authenticated
  with check (true);

create policy "user_sessions_select_anon"
  on public.user_sessions for select
  to anon, authenticated
  using (true);

create policy "user_sessions_update_anon"
  on public.user_sessions for update
  to anon, authenticated
  using (true)
  with check (true);

-- Every other table in affected_tables above now has zero anon/authenticated
-- policies: RLS enabled + no matching policy = anon/authenticated get nothing.
-- The service-role key (server-only, never NEXT_PUBLIC_) bypasses RLS
-- entirely and keeps working unaffected.
