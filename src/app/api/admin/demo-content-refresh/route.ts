import { NextResponse } from "next/server";

import {
  findDemoRefreshJob,
  getDemoRefreshPlan
} from "@/lib/demoContentRefresh/config";
import { regenerateAllDemoQuests } from "@/lib/demoContentRefresh/regenerateAllDemoQuests";
import { runDemoRefreshJob } from "@/lib/demoContentRefresh/runDemoRefreshJob";
import { verifyAllDemoContent } from "@/lib/demoContentRefresh/verifyDemoContent";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isOpenAiConfigured } from "@/lib/ai/env";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * GET — demo refresh plan + current readiness.
 * POST — run one job ({ jobId }) or verify all ({ action: "verify" }).
 */
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 }
    );
  }

  const plan = getDemoRefreshPlan();
  const readiness = await verifyAllDemoContent();

  return NextResponse.json(
    { plan, readiness },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request: Request) {
  if (!isOpenAiConfigured()) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured." },
      { status: 503 }
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 }
    );
  }

  let body: { action?: string; jobId?: string; runExtractIfMissing?: boolean } =
    {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  if (body.action === "regenerate-all-demo") {
    const refresh = await regenerateAllDemoQuests({
      runExtractIfMissing: body.runExtractIfMissing !== false
    });
    const readiness = await verifyAllDemoContent();
    return NextResponse.json(
      { refresh, readiness },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  if (body.action === "verify") {
    const readiness = await verifyAllDemoContent();
    return NextResponse.json(
      { readiness },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const jobId = body.jobId?.trim();
  if (!jobId) {
    return NextResponse.json(
      { error: "jobId is required to run a refresh step." },
      { status: 400 }
    );
  }

  const job = findDemoRefreshJob(jobId);
  if (!job) {
    return NextResponse.json({ error: `Unknown job: ${jobId}` }, { status: 400 });
  }

  const result = await runDemoRefreshJob(job);
  const readiness = await verifyAllDemoContent();

  return NextResponse.json(
    { result, readiness },
    { headers: { "Cache-Control": "no-store" } }
  );
}
