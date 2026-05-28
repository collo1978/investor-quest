import { NVDA_DEMO_TAGLINE } from "@/lib/demo/nvidiaDemoSources";

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
  /** Brand mark under `/public/logos/companies/`. */
  logoSrc: string;
  /**
   * Optional Supabase `company_logo_url` override — when set, hub map and headers
   * prefer this over `logoSrc`.
   */
  companyLogoUrl?: string;
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
    logoSrc: "/logos/companies/aapl.svg",
    cik: "0000320193",
    tagline: "The world's most profitable consumer hardware + services ecosystem.",
    sector: "Consumer Tech"
  },
  {
    id: "msft",
    name: "Microsoft",
    ticker: "MSFT",
    logoSrc: "/logos/companies/msft.svg",
    cik: "0000789019",
    tagline: "Cloud, productivity, and AI infrastructure for the global enterprise.",
    sector: "Enterprise Software"
  },
  {
    id: "tsla",
    name: "Tesla",
    ticker: "TSLA",
    logoSrc: "/logos/companies/tsla.svg",
    cik: "0001318605",
    tagline: "Electric vehicles, energy storage, and autonomy at industrial scale.",
    sector: "Auto / Energy"
  },
  {
    id: "nvda",
    name: "NVIDIA",
    ticker: "NVDA",
    logoSrc: "/logos/companies/nvda.svg",
    cik: "0001045810",
    tagline: NVDA_DEMO_TAGLINE,
    sector: "Semiconductors"
  },
  {
    id: "nke",
    name: "Nike",
    ticker: "NKE",
    logoSrc: "/logos/companies/nke.svg",
    cik: "0000320187",
    tagline: "Iconic athletic brand with global distribution and design leverage.",
    sector: "Consumer"
  },
  {
    id: "spot",
    name: "Spotify",
    ticker: "SPOT",
    logoSrc: "/logos/companies/spot.svg",
    cik: "0001639920",
    tagline: "Audio-first subscription platform with podcasts and creator tooling.",
    sector: "Media / Subscription"
  }
] as const;

export function isCompanyId(id: string): id is CompanyId {
  return COMPANIES.some((c) => c.id === id);
}

export function companyById(id: string | null | undefined): Company {
  const fallback =
    process.env.NEXT_PUBLIC_CONTROLLED_DEMO !== "false"
      ? (COMPANIES.find((c) => c.id === "nvda") ?? COMPANIES[0])
      : COMPANIES[0];
  return COMPANIES.find((c) => c.id === id) ?? fallback;
}

export function companyByTicker(ticker: string): Company | null {
  const symbol = ticker.trim().toUpperCase();
  return COMPANIES.find((c) => c.ticker === symbol) ?? null;
}

export const DEFAULT_COMPANY_ID: CompanyId = "aapl";
