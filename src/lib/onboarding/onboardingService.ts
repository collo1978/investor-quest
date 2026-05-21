import { buildDemoRecommendations } from "@/lib/onboarding/recommendations";
import { DEMO_INTERESTS } from "@/lib/onboarding/seedData";
import type { OnboardingInterest, OnboardingRecommendationsResult } from "@/lib/onboarding/types";
import {
  fetchRecommendationsFromSupabase,
  listOnboardingInterests,
  saveUserInterests
} from "@/lib/supabase/onboarding/onboardingRepository";
import { isSupabaseConfigured } from "@/lib/supabase/env";

function listDemoInterests(): OnboardingInterest[] {
  return [...DEMO_INTERESTS].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getOnboardingInterestsWithFallback(): Promise<{
  source: "supabase" | "demo";
  interests: OnboardingInterest[];
}> {
  if (!isSupabaseConfigured()) {
    return { source: "demo", interests: listDemoInterests() };
  }
  try {
    const interests = await listOnboardingInterests();
    if (interests.length) return { source: "supabase", interests };
  } catch {
    // demo fallback
  }
  return { source: "demo", interests: listDemoInterests() };
}

export async function getRecommendationsWithFallback(
  interestSlugs: string[],
  limit = 12
): Promise<OnboardingRecommendationsResult> {
  if (!isSupabaseConfigured()) {
    return buildDemoRecommendations(interestSlugs, limit);
  }
  try {
    return await fetchRecommendationsFromSupabase(interestSlugs, limit);
  } catch {
    return buildDemoRecommendations(interestSlugs, limit);
  }
}

export async function persistUserInterestsWithFallback(options: {
  guestId?: string;
  userId?: string;
  interestIds: string[];
}): Promise<{ saved: boolean; source: "supabase" | "skipped" }> {
  if (!isSupabaseConfigured()) {
    return { saved: false, source: "skipped" };
  }
  try {
    await saveUserInterests(options);
    return { saved: true, source: "supabase" };
  } catch {
    return { saved: false, source: "skipped" };
  }
}
