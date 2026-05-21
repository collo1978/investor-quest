import { NextResponse } from "next/server";

import { executeFixAction } from "@/lib/gameHealth/executeFixAction";
import type { FixActionId } from "@/lib/gameHealth/types";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const VALID_ACTIONS: FixActionId[] = [
  "retry_generation",
  "use_cached_answer",
  "clear_and_regenerate",
  "enable_fast_mode",
  "disable_heavy_checks",
  "mark_resolved"
];

export async function POST(
  request: Request,
  context: { params: Promise<{ issueId: string }> }
) {
  const { issueId } = await context.params;

  let body: { action?: string } = {};
  try {
    body = (await request.json()) as { action?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const action = body.action as FixActionId;
  if (!action || !VALID_ACTIONS.includes(action)) {
    return NextResponse.json(
      { error: `Invalid action. Use one of: ${VALID_ACTIONS.join(", ")}` },
      { status: 400 }
    );
  }

  const result = await executeFixAction(issueId, action);
  return NextResponse.json(result, {
    status: result.ok ? 200 : 422,
    headers: { "Cache-Control": "no-store" }
  });
}
