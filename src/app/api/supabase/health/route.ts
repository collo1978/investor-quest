import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getSupabaseEnvDiagnostics,
  isSupabaseConfigured
} from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

/** Verifies Supabase env + API reachability (no tables required). */
export async function GET() {
  if (!isSupabaseConfigured()) {
    const diagnostics = getSupabaseEnvDiagnostics();
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        message: diagnostics.hint,
        diagnostics
      },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const diagnostics = getSupabaseEnvDiagnostics();

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.getSession();

    if (error) {
      return NextResponse.json(
        { ok: false, configured: true, message: error.message },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      configured: true,
      message: "Supabase connection is ready.",
      diagnostics: { urlHost: diagnostics.urlHost }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { ok: false, configured: true, message },
      { status: 502 }
    );
  }
}
