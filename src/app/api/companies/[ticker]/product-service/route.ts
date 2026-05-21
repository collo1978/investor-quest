import { NextResponse } from "next/server";

import { fetchProductServiceReport } from "@/lib/supabase/productService";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await context.params;
  const report = await fetchProductServiceReport(ticker);

  if (!report) {
    return NextResponse.json(
      { report: null },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(
    { report },
    { headers: { "Cache-Control": "no-store" } }
  );
}
