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

/**
 * Persist user-selected interests for the anonymous demo guest.
 *
 * `guestId` is a client-generated local pairing key (see
 * `getOrCreateOnboardingGuestId`), not an identity claim, so trusting a
 * client-supplied value is fine — it only ever addresses that guest's own
 * local record. There is no authenticated-user path in this app (no login,
 * no session), so this route no longer accepts a client-supplied `userId`:
 * nothing verifies it belongs to the caller, and no live caller sends one.
 */
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
  const interestIds = Array.isArray(b.interestIds)
    ? normalizeInterestSlugs((b.interestIds as string[]).join(","))
    : typeof b.interests === "string"
      ? normalizeInterestSlugs(b.interests)
      : [];

  if (!guestId) {
    return NextResponse.json({ error: "guestId is required." }, { status: 400 });
  }

  if (interestIds.length === 0) {
    return NextResponse.json({ error: "At least one interest is required." }, { status: 400 });
  }

  const result = await persistUserInterestsWithFallback({
    guestId,
    interestIds
  });

  return NextResponse.json(
    { ok: true, interestIds, ...result },
    { status: result.saved ? 201 : 200 }
  );
}
