import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

/** Verifies Supabase env + API reachability (no tables required). */
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        message:
          "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local, then restart the dev server."
      },
      { status: 503 }
    );
  }

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
      message: "Supabase connection is ready."
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { ok: false, configured: true, message },
      { status: 502 }
    );
  }
}
