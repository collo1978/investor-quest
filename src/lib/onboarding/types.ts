export type InterestTagSource = "metadata" | "item1_business" | "seed";

export type OnboardingInterest = {
  id: string;
  label: string;
  icon: string;
  sortOrder: number;
};

export type OnboardingCompanyRecord = {
  id: string;
  ticker: string;
  displayName: string;
  cik: string;
  sicCode: string | null;
  sector: string;
  industry: string;
  logoUrl: string;
  item1BusinessHints: string[];
};

export type CompanyInterestTag = {
  companyId: string;
  interestId: string;
  tagSource: InterestTagSource;
};

export type RecommendedCompanyCard = {
  id: string;
  logo: string;
  companyName: string;
  ticker: string;
  sector: string;
  industry: string;
  matchingInterests: string[];
  score: number;
};

export type OnboardingRecommendationsResult = {
  source: "supabase" | "demo";
  interests: string[];
  companies: RecommendedCompanyCard[];
};
