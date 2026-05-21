-- Geographic revenue by region (from 10-K segment footnotes)

create table if not exists public.company_geographic_revenue_reports (
  ticker text not null,
  fiscal_year integer not null,
  segments jsonb not null,
  investor_insight text,
  source_form text not null default '10-K',
  source_section_label text,
  updated_at timestamptz not null default now(),
  primary key (ticker, fiscal_year),
  constraint company_geographic_revenue_segments_array
    check (jsonb_typeof(segments) = 'array')
);

create index if not exists company_geographic_revenue_ticker_idx
  on public.company_geographic_revenue_reports (ticker, fiscal_year desc);

alter table public.company_geographic_revenue_reports enable row level security;

drop policy if exists "company_geographic_revenue_select" on public.company_geographic_revenue_reports;
create policy "company_geographic_revenue_select"
  on public.company_geographic_revenue_reports
  for select
  to anon, authenticated
  using (true);

-- Apple FY2024 geographic net sales (10-K segment footnotes; region-level)
insert into public.company_geographic_revenue_reports (
  ticker,
  fiscal_year,
  segments,
  investor_insight,
  source_form,
  source_section_label
) values (
  'AAPL',
  2024,
  '[
    {"regionKey":"americas","label":"Americas","percent":42},
    {"regionKey":"europe","label":"Europe","percent":25},
    {"regionKey":"greater_china","label":"Greater China","percent":18},
    {"regionKey":"japan","label":"Japan","percent":7},
    {"regionKey":"rest_of_asia_pacific","label":"Rest of Asia Pacific","percent":8}
  ]'::jsonb,
  'Apple has broad global exposure, but Greater China remains an important region to watch.',
  '10-K',
  'Segment Information — Geographic Areas'
)
on conflict (ticker, fiscal_year) do update set
  segments = excluded.segments,
  investor_insight = excluded.investor_insight,
  source_form = excluded.source_form,
  source_section_label = excluded.source_section_label,
  updated_at = now();
