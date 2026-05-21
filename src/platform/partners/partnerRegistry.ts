import type { PartnerBranding, PartnerConfig, PackageTierId } from "@/platform/types";
import { DEMO_PARTNERS } from "@/platform/partners/examplePartners";
import {
  PACKAGE_TIERS,
  getPackageTier
} from "@/platform/packages/packageDefinitions";
import type { PartnerCatalogSource } from "@/lib/supabase/partners/types";

export const DEFAULT_PARTNER_ID = DEMO_PARTNERS[0]?.id ?? "demo-riverside-academy";

let partnerCache: PartnerConfig[] | null = null;
let catalogSource: PartnerCatalogSource = "demo";

/** Replace in-memory partner catalog (Supabase or demo fallback). */
export function hydratePartnerRegistry(
  partners: PartnerConfig[],
  source: PartnerCatalogSource = "demo"
): void {
  partnerCache = partners.length ? [...partners] : [...DEMO_PARTNERS];
  catalogSource = partners.length ? source : "demo";
}

export function getPartnerCatalogSource(): PartnerCatalogSource {
  return catalogSource;
}

export function listPartners(): readonly PartnerConfig[] {
  return partnerCache ?? DEMO_PARTNERS;
}

export function getPartnerById(id: string): PartnerConfig | undefined {
  return listPartners().find((p) => p.id === id);
}

/** Update in-memory partner branding after a successful save. */
export function patchPartnerBranding(
  partnerId: string,
  branding: PartnerBranding
): PartnerConfig | undefined {
  const base = [...(partnerCache ?? DEMO_PARTNERS)];
  const idx = base.findIndex((p) => p.id === partnerId);
  if (idx < 0) return undefined;

  const updated: PartnerConfig = { ...base[idx], branding };
  base[idx] = updated;
  partnerCache = base;
  return updated;
}

export function resolvePartnerId(candidate?: string | null): string {
  if (candidate && getPartnerById(candidate)) return candidate;
  return DEFAULT_PARTNER_ID;
}

export function effectivePartnerView(partner: PartnerConfig): {
  partner: PartnerConfig;
  tier: (typeof PACKAGE_TIERS)[PackageTierId];
} {
  const tier = getPackageTier(partner.licence.packageTierId);
  return { partner, tier };
}
