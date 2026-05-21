import type { PartnerBranding, TonePresetId } from "@/platform/types";

export const TONE_PRESET_OPTIONS: { id: TonePresetId; label: string }[] = [
  { id: "classroom_supportive", label: "Classroom supportive" },
  { id: "mentor_friendly", label: "Mentor friendly" },
  { id: "professional_neutral", label: "Professional neutral" },
  { id: "competitive_broker", label: "Competitive broker" }
];

const TONE_PRESET_IDS: TonePresetId[] = TONE_PRESET_OPTIONS.map((o) => o.id);

const HEX_COLOR = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export type PartnerBrandingUpdateInput = {
  partnerName: string;
  logoUrl: string;
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  tonePresetId: TonePresetId;
  wordingDeckId: string;
};

export type BrandingUpdateResult = {
  persisted: "supabase" | "demo";
  branding: PartnerBranding;
};

export function validateBrandingUpdate(
  body: unknown
): { ok: true; data: PartnerBrandingUpdateInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Request body must be a JSON object." };
  }

  const b = body as Record<string, unknown>;
  const partnerName = typeof b.partnerName === "string" ? b.partnerName.trim() : "";
  const logoUrl = typeof b.logoUrl === "string" ? b.logoUrl.trim() : "";
  const colorPrimary =
    typeof b.colorPrimary === "string" ? b.colorPrimary.trim() : "";
  const colorSecondary =
    typeof b.colorSecondary === "string" ? b.colorSecondary.trim() : "";
  const colorAccent =
    typeof b.colorAccent === "string" ? b.colorAccent.trim() : "";
  const tonePresetId = b.tonePresetId;
  const wordingDeckId =
    typeof b.wordingDeckId === "string" ? b.wordingDeckId.trim() : "";

  if (!partnerName) return { ok: false, error: "Partner name is required." };
  if (!logoUrl) return { ok: false, error: "Logo URL is required." };
  if (!HEX_COLOR.test(colorPrimary)) {
    return {
      ok: false,
      error: "Primary color must be a valid hex value (#RGB or #RRGGBB)."
    };
  }
  if (!HEX_COLOR.test(colorSecondary)) {
    return { ok: false, error: "Secondary color must be a valid hex value." };
  }
  if (!HEX_COLOR.test(colorAccent)) {
    return { ok: false, error: "Accent color must be a valid hex value." };
  }
  if (
    typeof tonePresetId !== "string" ||
    !TONE_PRESET_IDS.includes(tonePresetId as TonePresetId)
  ) {
    return { ok: false, error: "Invalid tone preset." };
  }
  if (!wordingDeckId) return { ok: false, error: "Wording deck id is required." };

  return {
    ok: true,
    data: {
      partnerName,
      logoUrl,
      colorPrimary,
      colorSecondary,
      colorAccent,
      tonePresetId: tonePresetId as TonePresetId,
      wordingDeckId
    }
  };
}
