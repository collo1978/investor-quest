import { NextResponse } from "next/server";

import { runCopyQualityAudit } from "@/lib/quests/runCopyQualityAudit";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/** Full-game copy quality audit — all demo quest cards, quizzes, mastery UI. */
export async function POST() {
  try {
    const report = await runCopyQualityAudit();
    return NextResponse.json(
      { ok: true, report },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Copy quality audit failed."
      },
      { status: 500 }
    );
  }
}
