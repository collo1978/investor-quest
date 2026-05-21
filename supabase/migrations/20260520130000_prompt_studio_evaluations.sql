-- Prompt Studio optimization: tags, recommendations, and evaluation history.

alter table public.prompt_template_versions
  add column if not exists tags text[] not null default '{}',
  add column if not exists teaching_notes text not null default '',
  add column if not exists is_recommended boolean not null default false;

create table if not exists public.prompt_preview_evaluations (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.prompt_templates (id) on delete cascade,
  version_id uuid references public.prompt_template_versions (id) on delete set null,
  pillar_id text not null,
  ticker text not null,
  quest_slug text not null,
  card_id text not null,
  plain_english_answer text not null,
  investor_insight text,
  readability_score numeric(5, 2) not null,
  repetition_score numeric(5, 2) not null,
  teaching_flow_score numeric(5, 2) not null,
  composite_score numeric(5, 2) not null,
  analysis jsonb not null default '{}'::jsonb,
  compare_label text,
  created_at timestamptz not null default now()
);

create index if not exists prompt_preview_evaluations_template_idx
  on public.prompt_preview_evaluations (template_id, created_at desc);

create index if not exists prompt_preview_evaluations_version_idx
  on public.prompt_preview_evaluations (template_id, version_id);

comment on table public.prompt_preview_evaluations is 'Saved preview runs with readability/repetition/teaching scores for Prompt Studio optimization.';
