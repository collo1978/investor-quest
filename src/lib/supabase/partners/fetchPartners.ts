import { DEMO_PARTNERS } from "@/platform/partners/examplePartners";
import type { PartnerConfig } from "@/platform/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

import { mapPartnerWithRelations, mapPackageTierRow } from "./mapPartnerConfig";
import type {
  PackageTierRow,
  PartnerCatalogPayload,
  PartnerCatalogSource,
  PartnerWithRelationsRow
} from "./types";

const PARTNER_SELECT = `
  id,
  type,
  partner_branding (
    partner_id,
    partner_name,
    logo_url,
    color_primary,
    color_secondary,
    color_accent,
    color_surface,
    color_text,
    tone_preset_id,
    wording_deck_id
  ),
  licences (
    id,
    partner_id,
    licence_code,
    expires_at,
    max_seats,
    package_tier_id,
    dashboard_school,
    dashboard_bank,
    dashboard_broker
  ),
  partner_policies (
    partner_id,
    enabled_module_ids,
    enabled_dashboards,
    reward_model_id,
    allowed_role_ids,
    gamification_mechanic_ids,
    analytics_access_level,
    data_export_access,
    custom_branding_access,
    broker_rewards_access,
    api_integration_access
  )
`;

export async function fetchPartnersFromSupabase(): Promise<PartnerConfig[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("partners")
    .select(PARTNER_SELECT)
    .order("id", { ascending: true });

  if (error) throw error;
  if (!data?.length) return [];

  return (data as PartnerWithRelationsRow[])
    .map(mapPartnerWithRelations)
    .filter((p): p is PartnerConfig => p != null);
}

export async function fetchPackageTiersFromSupabase() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("package_tiers")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as PackageTierRow[]).map(mapPackageTierRow);
}

export async function loadPartnerCatalogWithFallback(): Promise<PartnerCatalogPayload> {
  const fallback = (): PartnerCatalogPayload => ({
    partners: [...DEMO_PARTNERS],
    source: "demo"
  });

  if (!isSupabaseConfigured()) return fallback();

  try {
    const partners = await fetchPartnersFromSupabase();
    if (!partners.length) return fallback();
    return { partners, source: "supabase" satisfies PartnerCatalogSource };
  } catch {
    return fallback();
  }
}
