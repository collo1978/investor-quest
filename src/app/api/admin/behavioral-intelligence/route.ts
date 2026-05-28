import { NextResponse } from "next/server";

import { buildBehavioralIntelligenceAsync } from "@/platform/gamification/behavioralDesign/buildBehavioralIntelligence";
import { DEFAULT_BEHAVIORAL_AUDIT_SCORES } from "@/platform/gamification/behavioralDesign/defaultScores";

/** Server snapshot for future partner dashboards / exports */
export async function GET() {
  try {
    const report = await buildBehavioralIntelligenceAsync(DEFAULT_BEHAVIORAL_AUDIT_SCORES, {
      windowDays: 28
    });
    return NextResponse.json(report);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to build behavioral intelligence report";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
