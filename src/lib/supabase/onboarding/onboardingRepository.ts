import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  buildRecommendations,
  normalizeInterestSlugs
} from "@/lib/onboarding/recommendations";
import type {
  CompanyInterestTag,
  OnboardingCompanyRecord,
  OnboardingInterest,
  OnboardingRecommendationsResult,
  RecommendedCompanyCard
} from "@/lib/onboarding/types";
import type {
  CompanyInterestTagRow,
  CompanyRow,
  InterestRow
} from "@/lib/supabase/onboarding/types";

function mapInterest(row: InterestRow): OnboardingInterest {
  return {
    id: row.id,
    label: row.label,
    icon: row.icon,
    sortOrder: row.sort_order
  };
}

function mapCompany(row: CompanyRow): OnboardingCompanyRecord {
  return {
    id: row.id,
    ticker: row.ticker,
    displayName: row.display_name,
    cik: row.cik,
    sicCode: row.sic_code,
    sector: row.sector,
    industry: row.industry,
    logoUrl: row.logo_url,
    item1BusinessHints: row.item1_business_hints ?? []
  };
}

function mapTag(row: CompanyInterestTagRow): CompanyInterestTag {
  return {
    companyId: row.company_id,
    interestId: row.interest_id,
    tagSource: row.tag_source
  };
}

export async function listOnboardingInterests(): Promise<OnboardingInterest[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("interests")
    .select("id, label, icon, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return ((data ?? []) as InterestRow[]).map(mapInterest);
}

export async function fetchRecommendationsFromSupabase(
  interestSlugs: string[],
  limit = 12
): Promise<OnboardingRecommendationsResult> {
  const interests = normalizeInterestSlugs(interestSlugs.join(","));
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const supabase = await createSupabaseServerClient();

  const { data: companyRows, error: companyError } = await supabase
    .from("companies")
    .select(
      "id, ticker, display_name, cik, sic_code, sector, industry, logo_url, item1_business_hints, is_active"
    )
    .eq("is_active", true);

  if (companyError) throw new Error(companyError.message);

  const companies = ((companyRows ?? []) as CompanyRow[]).map(mapCompany);

  if (interests.length === 0) {
    return { source: "supabase", interests, companies: [] };
  }

  const { data: tagRows, error: tagError } = await supabase
    .from("company_interest_tags")
    .select("company_id, interest_id, tag_source")
    .in("interest_id", interests);

  if (tagError) throw new Error(tagError.message);

  const tags = ((tagRows ?? []) as CompanyInterestTagRow[]).map(mapTag);
  const cards: RecommendedCompanyCard[] = buildRecommendations(
    interests,
    companies,
    tags,
    { limit }
  );

  return { source: "supabase", interests, companies: cards };
}

export async function saveUserInterests(options: {
  guestId?: string;
  userId?: string;
  interestIds: string[];
}): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const { guestId, userId, interestIds } = options;
  if (!guestId && !userId) {
    throw new Error("guestId or userId is required.");
  }

  const uniqueIds = [...new Set(interestIds.map((id) => id.trim().toLowerCase()))];
  const supabase = await createSupabaseServerClient();

  if (guestId) {
    const { error: delError } = await supabase
      .from("user_interests")
      .delete()
      .eq("guest_id", guestId);
    if (delError) throw new Error(delError.message);
  } else if (userId) {
    const { error: delError } = await supabase
      .from("user_interests")
      .delete()
      .eq("user_id", userId);
    if (delError) throw new Error(delError.message);
  }

  if (uniqueIds.length === 0) return;

  const rows = uniqueIds.map((interestId) => ({
    guest_id: guestId ?? null,
    user_id: userId ?? null,
    interest_id: interestId
  }));

  const { error: insertError } = await supabase.from("user_interests").insert(rows);
  if (insertError) throw new Error(insertError.message);
}

export async function listUserInterests(options: {
  guestId?: string;
  userId?: string;
}): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createSupabaseServerClient();
  let query = supabase.from("user_interests").select("interest_id");

  if (options.guestId) query = query.eq("guest_id", options.guestId);
  else if (options.userId) query = query.eq("user_id", options.userId);
  else return [];

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: { interest_id: string }) => r.interest_id);
}
