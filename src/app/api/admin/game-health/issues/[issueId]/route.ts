import { NextResponse } from "next/server";

import { fetchGameHealthIssue } from "@/lib/gameHealth/storage";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ issueId: string }> }
) {
  const { issueId } = await context.params;
  const issue = await fetchGameHealthIssue(issueId);

  if (!issue) {
    return NextResponse.json({ error: "Issue not found." }, { status: 404 });
  }

  return NextResponse.json({ issue }, { headers: { "Cache-Control": "no-store" } });
}
