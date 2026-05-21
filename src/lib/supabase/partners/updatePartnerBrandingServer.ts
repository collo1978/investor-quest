import type { PartnerBranding } from "@/platform/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getPartnerById } from "@/platform/partners/partnerRegistry";
import { mapBranding } from "./mapPartnerConfig";
import type { PartnerBrandingRow } from "./types";
import type {
  BrandingUpdateResult,
  PartnerBrandingUpdateInput
} from "./brandingUpdateShared";

function mergeBranding(
  partnerId: string,
  input: PartnerBrandingUpdateInput
): PartnerBranding {
  const existing = getPartnerById(partnerId);
  const colors = existing?.branding.colors ?? {
    primary: input.colorPrimary,
    secondary: input.colorSecondary,
    accent: input.colorAccent,
    surface: "#070712",
    text: "#E4E4E7"
  };

  return {
    partnerName: input.partnerName,
    logoUrl: input.logoUrl,
    colors: {
      ...colors,
      primary: input.colorPrimary,
      secondary: input.colorSecondary,
      accent: input.colorAccent
    },
    tonePresetId: input.tonePresetId,
    wordingDeckId: input.wordingDeckId
  };
}

/** Server-only — updates `partner_branding` via Supabase. */
export async function updatePartnerBrandingInSupabase(
  partnerId: string,
  input: PartnerBrandingUpdateInput
): Promise<BrandingUpdateResult> {
  if (!isSupabaseConfigured()) {
    return { persisted: "demo", branding: mergeBranding(partnerId, input) };
  }

  const existing = getPartnerById(partnerId);
  if (!existing) {
    throw new Error(`Partner not found: ${partnerId}`);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("partner_branding")
    .update({
      partner_name: input.partnerName,
      logo_url: input.logoUrl,
      color_primary: input.colorPrimary,
      color_secondary: input.colorSecondary,
      color_accent: input.colorAccent,
      tone_preset_id: input.tonePresetId,
      wording_deck_id: input.wordingDeckId,
      updated_at: new Date().toISOString()
    })
    .eq("partner_id", partnerId)
    .select(
      "partner_id, partner_name, logo_url, color_primary, color_secondary, color_accent, color_surface, color_text, tone_preset_id, wording_deck_id"
    )
    .single();

  if (error) throw error;

  return {
    persisted: "supabase",
    branding: mapBranding(data as PartnerBrandingRow)
  };
}

export function brandingInputToPartnerBranding(
  partnerId: string,
  input: PartnerBrandingUpdateInput
): PartnerBranding {
  return mergeBranding(partnerId, input);
}
