-- Phase B: Editable prompt templates with versioning and rollback.
-- Run in Supabase SQL editor or via CLI when deploying.

create table if not exists public.prompt_templates (
  id uuid primary key default gen_random_uuid(),
  template_key text not null unique,
  scope text not null check (scope in ('system', 'user')),
  pillar_id text check (pillar_id in ('business', 'forces', 'financials', 'management')),
  quest_slug text,
  label text not null default '',
  description text not null default '',
  active_version_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.prompt_template_versions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.prompt_templates (id) on delete cascade,
  version_number integer not null,
  body text not null,
  model text not null default 'gpt-4o-mini',
  temperature numeric(3, 2) not null default 0.25,
  change_note text not null default '',
  created_by text,
  created_at timestamptz not null default now(),
  unique (template_id, version_number)
);

alter table public.prompt_templates
  add constraint prompt_templates_active_version_fkey
  foreign key (active_version_id)
  references public.prompt_template_versions (id)
  on delete set null;

create index if not exists prompt_templates_pillar_scope_idx
  on public.prompt_templates (pillar_id, scope);

create index if not exists prompt_template_versions_template_idx
  on public.prompt_template_versions (template_id, version_number desc);

comment on table public.prompt_templates is 'Logical AI prompt slots (system/user per pillar or quest override).';
comment on table public.prompt_template_versions is 'Immutable version history; active_version_id on parent selects live prompt.';
