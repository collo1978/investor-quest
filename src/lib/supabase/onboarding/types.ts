import type { InterestTagSource } from "@/lib/onboarding/types";

export type InterestRow = {
  id: string;
  label: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
};

export type CompanyRow = {
  id: string;
  ticker: string;
  display_name: string;
  cik: string;
  sic_code: string | null;
  sector: string;
  industry: string;
  logo_url: string;
  item1_business_hints: string[] | null;
  is_active: boolean;
};

export type CompanyInterestTagRow = {
  company_id: string;
  interest_id: string;
  tag_source: InterestTagSource;
};

export type UserInterestRow = {
  id: string;
  user_id: string | null;
  guest_id: string | null;
  interest_id: string;
  created_at: string;
};
