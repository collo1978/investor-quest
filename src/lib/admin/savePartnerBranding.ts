import {
  clearDemoBrandingOverride,
  saveDemoBrandingOverride
} from "@/lib/admin/demoOverrides";
import type { PartnerBrandingUpdateInput } from "@/lib/supabase/partners/brandingUpdateShared";
import type { PartnerBranding } from "@/platform/types";
import { patchPartnerBranding } from "@/platform/partners/partnerRegistry";

export type SaveBrandingResult = {
  persisted: "supabase" | "demo";
  branding: PartnerBranding;
};

export async function savePartnerBranding(
  partnerId: string,
  input: PartnerBrandingUpdateInput
): Promise<SaveBrandingResult> {
  const res = await fetch(
    `/api/admin/partners/${encodeURIComponent(partnerId)}/branding`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    }
  );

  const body = (await res.json().catch(() => ({}))) as {
    error?: string;
    persisted?: "supabase" | "demo";
    branding?: PartnerBranding;
  };

  if (!res.ok) {
    throw new Error(body.error ?? `Save failed (${res.status})`);
  }

  if (!body.branding) {
    throw new Error("Save succeeded but no branding was returned.");
  }

  if (body.persisted === "demo") {
    saveDemoBrandingOverride(partnerId, input);
  } else {
    clearDemoBrandingOverride(partnerId);
  }

  patchPartnerBranding(partnerId, body.branding);

  return {
    persisted: body.persisted ?? "demo",
    branding: body.branding
  };
}
