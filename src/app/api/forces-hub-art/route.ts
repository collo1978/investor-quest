import { NextResponse } from "next/server";

import { FORCES_HUB_IMG_SRC } from "@/lib/screenAssetUrls";

export const dynamic = "force-static";
export const revalidate = 31536000;

/**
 * Deprecated endpoint kept for compatibility.
 * Redirects to the cache-busted static asset rather than reading from disk.
 */
export async function GET(request: Request) {
  return NextResponse.redirect(new URL(FORCES_HUB_IMG_SRC, request.url), 307);
}
