/**
 * Data Layer — company directory.
 *
 * Companies are research "campaigns". Each company has its own
 * progression (XP, unlocked pillars, completed quests, journal)
 * tracked by the engine layer.
 */

export type CompanyId =
  | "aapl"
  | "msft"
  | "tsla"
  | "nvda"
  | "nke"
  | "spot";

export type Company = {
  id: CompanyId;
  name: string;
  ticker: string;
  /** SEC CIK (Central Index Key) — used later for filing fetches. */
  cik: string;
  /** One-line tagline used in island intro screens / cards. */
  tagline: string;
  /** Sector tag (informational). */
  sector: string;
};

export const COMPANIES: readonly Company[] = [
  {
    id: "aapl",
    name: "Apple",
    ticker: "AAPL",
    cik: "0000320193",
    tagline: "The world's most profitable consumer hardware + services ecosystem.",
    sector: "Consumer Tech"
  },
  {
    id: "msft",
    name: "Microsoft",
    ticker: "MSFT",
    cik: "0000789019",
    tagline: "Cloud, productivity, and AI infrastructure for the global enterprise.",
    sector: "Enterprise Software"
  },
  {
    id: "tsla",
    name: "Tesla",
    ticker: "TSLA",
    cik: "0001318605",
    tagline: "Electric vehicles, energy storage, and autonomy at industrial scale.",
    sector: "Auto / Energy"
  },
  {
    id: "nvda",
    name: "NVIDIA",
    ticker: "NVDA",
    cik: "0001045810",
    tagline: "The compute layer powering the AI economy.",
    sector: "Semiconductors"
  },
  {
    id: "nke",
    name: "Nike",
    ticker: "NKE",
    cik: "0000320187",
    tagline: "Iconic athletic brand with global distribution and design leverage.",
    sector: "Consumer"
  },
  {
    id: "spot",
    name: "Spotify",
    ticker: "SPOT",
    cik: "0001639920",
    tagline: "Audio-first subscription platform with podcasts and creator tooling.",
    sector: "Media / Subscription"
  }
] as const;

export function isCompanyId(id: string): id is CompanyId {
  return COMPANIES.some((c) => c.id === id);
}

export function companyById(id: string | null | undefined): Company {
  return COMPANIES.find((c) => c.id === id) ?? COMPANIES[0];
}

export const DEFAULT_COMPANY_ID: CompanyId = "aapl";
