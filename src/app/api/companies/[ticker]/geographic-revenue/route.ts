import { NextResponse } from "next/server";

import { fetchGeographicRevenueReport } from "@/lib/supabase/geographicRevenue";

export const revalidate = 3600;

export async function GET(
  _request: Request,
  context: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await context.params;
  const report = await fetchGeographicRevenueReport(ticker);

  if (!report) {
    return NextResponse.json(
      { report: null },
      { headers: { "Cache-Control": "public, s-maxage=300" } }
    );
  }

  return NextResponse.json(
    { report },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
      }
    }
  );
}
