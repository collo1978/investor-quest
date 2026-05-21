-- Link geographic revenue reports to parsed 10-K accession

alter table public.company_geographic_revenue_reports
  add column if not exists source_accession text;

-- Refresh Apple seed with optional revenue USD (10-K geographic net sales)
update public.company_geographic_revenue_reports
set
  segments = '[
    {"regionKey":"americas","label":"Americas","percent":42,"percentage":42,"revenueUsd":165000000000,"revenue":165000000000},
    {"regionKey":"europe","label":"Europe","percent":25,"percentage":25,"revenueUsd":98000000000,"revenue":98000000000},
    {"regionKey":"greater_china","label":"Greater China","percent":18,"percentage":18,"revenueUsd":71000000000,"revenue":71000000000},
    {"regionKey":"japan","label":"Japan","percent":7,"percentage":7,"revenueUsd":27000000000,"revenue":27000000000},
    {"regionKey":"rest_of_asia_pacific","label":"Rest of Asia Pacific","percent":8,"percentage":8,"revenueUsd":31000000000,"revenue":31000000000}
  ]'::jsonb,
  investor_insight = 'Apple has broad global exposure, but Greater China remains an important region to watch.',
  source_section_label = 'Segment Information — Geographic Areas',
  updated_at = now()
where ticker = 'AAPL' and fiscal_year = 2024;
