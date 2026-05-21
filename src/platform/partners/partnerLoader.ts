import { applyDemoBrandingOverrides } from "@/lib/admin/demoOverrides";
import type { PartnerCatalogSource } from "@/lib/supabase/partners/types";
import { DEMO_PARTNERS } from "@/platform/partners/examplePartners";
import { hydratePartnerRegistry } from "@/platform/partners/partnerRegistry";
import type { PartnerConfig } from "@/platform/types";

export type PartnerHydrationResult = {
  source: PartnerCatalogSource;
  count: number;
};

/** Client-side: fetch catalog from API and hydrate the registry. */
export async function fetchAndHydratePartnerRegistry(): Promise<PartnerHydrationResult> {
  try {
    const res = await fetch("/api/partners", { cache: "no-store" });
    if (!res.ok) throw new Error(`Partner catalog fetch failed (${res.status})`);

    const body = (await res.json()) as {
      partners?: unknown;
      source?: PartnerCatalogSource;
    };

    if (Array.isArray(body.partners) && body.partners.length > 0) {
      const partners = applyDemoBrandingOverrides(
        body.partners as PartnerConfig[]
      );
      hydratePartnerRegistry(partners, body.source ?? "supabase");
      return {
        source: body.source ?? "supabase",
        count: partners.length
      };
    }
  } catch {
    // fall through to demo
  }

  const partners = applyDemoBrandingOverrides([...DEMO_PARTNERS]);
  hydratePartnerRegistry(partners, "demo");
  return { source: "demo", count: partners.length };
}
