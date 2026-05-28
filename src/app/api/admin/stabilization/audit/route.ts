import { NextResponse } from "next/server";

import { runStabilizationAudit } from "@/lib/admin/runStabilizationAudit";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST() {
  try {
    const report = await runStabilizationAudit();
    return NextResponse.json({ ok: true, report });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Stabilization audit failed."
      },
      { status: 500 }
    );
  }
}
