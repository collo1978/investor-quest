import { NextResponse } from "next/server";

import { normalizeInterestSlugs } from "@/lib/onboarding/recommendations";
import { getRecommendationsWithFallback } from "@/lib/onboarding/onboardingService";

export const dynamic = "force-dynamic";

/** Safe test + production route: ranked company cards for selected interests. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const interests = normalizeInterestSlugs(searchParams.get("interests"));
  const limitRaw = searchParams.get("limit");
  const limit = limitRaw ? Math.min(Math.max(Number(limitRaw) || 12, 1), 24) : 12;

  if (interests.length === 0) {
    return NextResponse.json(
      {
        error: "Provide at least one interest slug via ?interests=ai,gaming",
        interests: [],
        companies: [],
        source: "demo"
      },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const result = await getRecommendationsWithFallback(interests, limit);

  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }
  });
}
