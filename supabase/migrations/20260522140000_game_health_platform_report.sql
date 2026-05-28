-- Mission Control: store structured platform health report (8 domains).
alter table public.game_health_checks
  add column if not exists platform_report jsonb;

comment on column public.game_health_checks.platform_report is
  'PlatformHealthReport v1: domain scores, subsections, demo readiness, bottleneck.';
