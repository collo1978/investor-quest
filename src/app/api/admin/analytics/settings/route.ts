import { NextResponse } from "next/server";
import { isAnalyticsTierId, TIER_PRESETS } from "@/lib/analytics/tiers";
import type { PartnerAnalyticsSettingsUpdate } from "@/lib/analytics/partnerSettingsTypes";
import {
  getPartnerAnalyticsSettings,
  listPartnerAnalyticsSettings,
  upsertPartnerAnalyticsSettings
} from "@/lib/supabase/analytics/partnerSettingsRepository";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const partnerId = searchParams.get("partnerId");

    if (partnerId) {
      const settings = await getPartnerAnalyticsSettings(partnerId);
      return NextResponse.json({ settings });
    }

    const settings = await listPartnerAnalyticsSettings();
    return NextResponse.json({ settings });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Settings load failed." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = (await req.json()) as {
      partnerId?: string;
      analyticsTier?: string;
      applyTierPreset?: boolean;
      flags?: Partial<PartnerAnalyticsSettingsUpdate["flags"]>;
      partnerName?: string;
    };

    if (!body.partnerId) {
      return NextResponse.json({ error: "partnerId required." }, { status: 400 });
    }

    const update: PartnerAnalyticsSettingsUpdate = {
      partnerName: body.partnerName
    };

    if (body.analyticsTier && isAnalyticsTierId(body.analyticsTier)) {
      update.analyticsTier = body.analyticsTier;
      if (body.applyTierPreset !== false) {
        update.flags = TIER_PRESETS[body.analyticsTier];
      }
    }

    if (body.flags) {
      update.flags = { ...update.flags, ...body.flags };
    }

    const settings = await upsertPartnerAnalyticsSettings(body.partnerId, update);
    return NextResponse.json({ settings });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Settings save failed." },
      { status: 500 }
    );
  }
}
