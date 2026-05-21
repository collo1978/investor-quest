import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { FORCES_QUEST_FILENAME } from "@/lib/screenAssetUrls";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Streams the Forces hub PNG from disk on every request.
 * Source file: `public/screens/forces-quest.png`
 */
export async function GET() {
  const abs = path.join(
    process.cwd(),
    "public",
    "screens",
    FORCES_QUEST_FILENAME
  );
  try {
    const buf = await readFile(abs);
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"
      }
    });
  } catch {
    return new NextResponse("Forces hub image not found on disk.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }
}
