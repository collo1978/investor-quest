import { NextResponse } from "next/server";

import { runCommunicationQualityAudit } from "@/lib/communicationQuality";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/** On-demand communication audit for Mission Control inline recovery. */
export async function POST() {
  try {
    const report = await runCommunicationQualityAudit();
    return NextResponse.json(
      { ok: true, report },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Communication audit failed."
      },
      { status: 500 }
    );
  }
}
