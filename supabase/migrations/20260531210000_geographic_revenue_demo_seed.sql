-- Ensure geographic revenue table is writable + Apple demo row exists

drop policy if exists "company_geographic_revenue_write" on public.company_geographic_revenue_reports;
create policy "company_geographic_revenue_write"
  on public.company_geographic_revenue_reports
  for all
  to anon, authenticated
  using (true)
  with check (true);

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
    {"regionKey":"americas","label":"Americas","percent":42,"percentage":42},
    {"regionKey":"europe","label":"Europe","percent":25,"percentage":25},
    {"regionKey":"greater_china","label":"Greater China","percent":18,"percentage":18},
    {"regionKey":"japan","label":"Japan","percent":7,"percentage":7},
    {"regionKey":"rest_of_asia_pacific","label":"Rest of Asia Pacific","percent":8,"percentage":8}
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
