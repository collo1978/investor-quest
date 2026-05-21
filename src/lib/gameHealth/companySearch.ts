import { COMPANIES, type Company } from "@/data/companies";

/** Same matching logic the map company picker uses for search. */
export function searchCompanies(query: string): readonly Company[] {
  const q = query.trim().toLowerCase();
  if (!q) return COMPANIES;

  return COMPANIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.ticker.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
  );
}
