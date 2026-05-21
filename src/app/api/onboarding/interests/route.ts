import { NextResponse } from "next/server";

import {
  getOnboardingInterestsWithFallback,
  persistUserInterestsWithFallback
} from "@/lib/onboarding/onboardingService";
import { normalizeInterestSlugs } from "@/lib/onboarding/recommendations";

export const dynamic = "force-dynamic";

/** List available interest tags for onboarding step 1. */
export async function GET() {
  const catalog = await getOnboardingInterestsWithFallback();
  return NextResponse.json(catalog, {
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }
  });
}

/** Persist user-selected interests (guest or authenticated). */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Body must be a JSON object." }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const guestId = typeof b.guestId === "string" ? b.guestId.trim() : undefined;
  const userId = typeof b.userId === "string" ? b.userId.trim() : undefined;
  const interestIds = Array.isArray(b.interestIds)
    ? normalizeInterestSlugs((b.interestIds as string[]).join(","))
    : typeof b.interests === "string"
      ? normalizeInterestSlugs(b.interests)
      : [];

  if (!guestId && !userId) {
    return NextResponse.json(
      { error: "guestId or userId is required." },
      { status: 400 }
    );
  }

  if (interestIds.length === 0) {
    return NextResponse.json({ error: "At least one interest is required." }, { status: 400 });
  }

  const result = await persistUserInterestsWithFallback({
    guestId,
    userId,
    interestIds
  });

  return NextResponse.json(
    { ok: true, interestIds, ...result },
    { status: result.saved ? 201 : 200 }
  );
}
