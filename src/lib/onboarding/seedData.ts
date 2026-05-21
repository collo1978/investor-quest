import type {
  CompanyInterestTag,
  OnboardingCompanyRecord,
  OnboardingInterest
} from "@/lib/onboarding/types";

/** Demo fallback when Supabase is unavailable (mirrors migration seed). */
export const DEMO_INTERESTS: readonly OnboardingInterest[] = [
  { id: "ai", label: "AI & Robotics", icon: "⌬", sortOrder: 10 },
  { id: "electric_cars", label: "Electric Cars", icon: "⚡", sortOrder: 20 },
  { id: "gaming", label: "Gaming", icon: "⌁", sortOrder: 30 },
  { id: "fashion", label: "Fashion", icon: "◆", sortOrder: 40 },
  { id: "sports", label: "Sports", icon: "◎", sortOrder: 50 },
  { id: "tech", label: "Technology", icon: "✦", sortOrder: 60 },
  { id: "consumer", label: "Consumer", icon: "◐", sortOrder: 70 },
  { id: "music", label: "Music & Media", icon: "♫", sortOrder: 80 },
  { id: "finance", label: "Finance", icon: "▦", sortOrder: 90 },
  { id: "health", label: "Healthcare", icon: "♡", sortOrder: 100 },
  { id: "energy", label: "Energy", icon: "☼", sortOrder: 110 },
  { id: "travel", label: "Travel", icon: "✈", sortOrder: 120 }
];

export const DEMO_COMPANIES: readonly OnboardingCompanyRecord[] = [
  {
    id: "nvda",
    ticker: "NVDA",
    displayName: "NVIDIA",
    cik: "0001045810",
    sicCode: "3674",
    sector: "Technology",
    industry: "Semiconductors",
    logoUrl: "/logos/companies/nvda.svg",
    item1BusinessHints: [
      "artificial intelligence",
      "data center accelerators",
      "graphics processing"
    ]
  },
  {
    id: "msft",
    ticker: "MSFT",
    displayName: "Microsoft",
    cik: "0000789019",
    sicCode: "7372",
    sector: "Technology",
    industry: "Software—Prepackaged Software",
    logoUrl: "/logos/companies/msft.svg",
    item1BusinessHints: ["cloud computing", "productivity software", "AI copilots"]
  },
  {
    id: "pltr",
    ticker: "PLTR",
    displayName: "Palantir",
    cik: "0001321655",
    sicCode: "7372",
    sector: "Technology",
    industry: "Software—Applications",
    logoUrl: "/logos/companies/pltr.svg",
    item1BusinessHints: [
      "government analytics",
      "enterprise AI platforms",
      "operating systems for data"
    ]
  },
  {
    id: "tsla",
    ticker: "TSLA",
    displayName: "Tesla",
    cik: "0001318605",
    sicCode: "3711",
    sector: "Consumer Cyclical",
    industry: "Motor Vehicles & Passenger Car Bodies",
    logoUrl: "/logos/companies/tsla.svg",
    item1BusinessHints: ["electric vehicles", "energy storage", "autonomous driving"]
  },
  {
    id: "rivn",
    ticker: "RIVN",
    displayName: "Rivian",
    cik: "0001874178",
    sicCode: "3711",
    sector: "Consumer Cyclical",
    industry: "Motor Vehicles & Passenger Car Bodies",
    logoUrl: "/logos/companies/rivn.svg",
    item1BusinessHints: ["electric trucks", "adventure vehicles", "battery systems"]
  },
  {
    id: "rblx",
    ticker: "RBLX",
    displayName: "Roblox",
    cik: "0001315098",
    sicCode: "7372",
    sector: "Communication Services",
    industry: "Services—Computer Programming",
    logoUrl: "/logos/companies/rblx.svg",
    item1BusinessHints: [
      "user-generated games",
      "immersive experiences",
      "developer ecosystem"
    ]
  },
  {
    id: "ea",
    ticker: "EA",
    displayName: "Electronic Arts",
    cik: "0000712515",
    sicCode: "7372",
    sector: "Communication Services",
    industry: "Services—Prepackaged Software",
    logoUrl: "/logos/companies/ea.svg",
    item1BusinessHints: ["sports franchises", "live services", "interactive entertainment"]
  },
  {
    id: "nke",
    ticker: "NKE",
    displayName: "Nike",
    cik: "0000320187",
    sicCode: "3021",
    sector: "Consumer Cyclical",
    industry: "Rubber & Plastics Footwear",
    logoUrl: "/logos/companies/nke.svg",
    item1BusinessHints: ["athletic footwear", "apparel", "direct-to-consumer"]
  },
  {
    id: "lulu",
    ticker: "LULU",
    displayName: "Lululemon",
    cik: "0001397187",
    sicCode: "5651",
    sector: "Consumer Cyclical",
    industry: "Retail—Apparel & Accessories",
    logoUrl: "/logos/companies/lulu.svg",
    item1BusinessHints: ["technical apparel", "wellness lifestyle", "omni-channel retail"]
  },
  {
    id: "dis",
    ticker: "DIS",
    displayName: "Walt Disney",
    cik: "0001001039",
    sicCode: "7990",
    sector: "Communication Services",
    industry: "Services—Miscellaneous Amusement",
    logoUrl: "/logos/companies/dis.svg",
    item1BusinessHints: ["streaming", "parks and experiences", "sports media rights"]
  },
  {
    id: "dkng",
    ticker: "DKNG",
    displayName: "DraftKings",
    cik: "0001883685",
    sicCode: "7990",
    sector: "Consumer Cyclical",
    industry: "Services—Miscellaneous Amusement",
    logoUrl: "/logos/companies/dkng.svg",
    item1BusinessHints: ["sports betting", "iGaming", "daily fantasy sports"]
  },
  {
    id: "aapl",
    ticker: "AAPL",
    displayName: "Apple",
    cik: "0000320193",
    sicCode: "3571",
    sector: "Technology",
    industry: "Electronic Computers",
    logoUrl: "/logos/companies/aapl.svg",
    item1BusinessHints: ["consumer electronics", "services ecosystem", "wearables"]
  },
  {
    id: "spot",
    ticker: "SPOT",
    displayName: "Spotify",
    cik: "0001639920",
    sicCode: "7370",
    sector: "Communication Services",
    industry: "Services—Computer Programming",
    logoUrl: "/logos/companies/spot.svg",
    item1BusinessHints: ["audio streaming", "podcasts", "creator tools"]
  }
];

export const DEMO_COMPANY_INTEREST_TAGS: readonly CompanyInterestTag[] = [
  { companyId: "nvda", interestId: "ai", tagSource: "metadata" },
  { companyId: "msft", interestId: "ai", tagSource: "metadata" },
  { companyId: "pltr", interestId: "ai", tagSource: "metadata" },
  { companyId: "nvda", interestId: "ai", tagSource: "item1_business" },
  { companyId: "msft", interestId: "ai", tagSource: "item1_business" },
  { companyId: "pltr", interestId: "ai", tagSource: "item1_business" },
  { companyId: "nvda", interestId: "tech", tagSource: "metadata" },
  { companyId: "msft", interestId: "tech", tagSource: "metadata" },
  { companyId: "pltr", interestId: "tech", tagSource: "metadata" },
  { companyId: "tsla", interestId: "electric_cars", tagSource: "metadata" },
  { companyId: "rivn", interestId: "electric_cars", tagSource: "metadata" },
  { companyId: "rblx", interestId: "gaming", tagSource: "metadata" },
  { companyId: "ea", interestId: "gaming", tagSource: "metadata" },
  { companyId: "rblx", interestId: "gaming", tagSource: "item1_business" },
  { companyId: "ea", interestId: "gaming", tagSource: "item1_business" },
  { companyId: "nke", interestId: "fashion", tagSource: "metadata" },
  { companyId: "lulu", interestId: "fashion", tagSource: "metadata" },
  { companyId: "nke", interestId: "sports", tagSource: "metadata" },
  { companyId: "dis", interestId: "sports", tagSource: "metadata" },
  { companyId: "dkng", interestId: "sports", tagSource: "metadata" },
  { companyId: "ea", interestId: "sports", tagSource: "metadata" },
  { companyId: "dis", interestId: "music", tagSource: "metadata" },
  { companyId: "spot", interestId: "music", tagSource: "metadata" },
  { companyId: "aapl", interestId: "tech", tagSource: "metadata" },
  { companyId: "aapl", interestId: "consumer", tagSource: "metadata" }
];
