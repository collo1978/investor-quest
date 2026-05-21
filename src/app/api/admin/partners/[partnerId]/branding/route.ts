import { NextResponse } from "next/server";

import { validateBrandingUpdate } from "@/lib/supabase/partners/brandingUpdateShared";
import { updatePartnerBrandingInSupabase } from "@/lib/supabase/partners/updatePartnerBrandingServer";
import { loadPartnerCatalogWithFallback } from "@/lib/supabase/partners/fetchPartners";
import {
  getPartnerById,
  hydratePartnerRegistry,
  patchPartnerBranding
} from "@/platform/partners/partnerRegistry";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ partnerId: string }> };

/** Persist partner branding (Supabase when available, else demo-only response). */
export async function PATCH(request: Request, context: RouteContext) {
  const { partnerId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validated = validateBrandingUpdate(body);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const catalog = await loadPartnerCatalogWithFallback();
  hydratePartnerRegistry(catalog.partners, catalog.source);

  if (!getPartnerById(partnerId)) {
    return NextResponse.json({ error: "Partner not found." }, { status: 404 });
  }

  try {
    const result = await updatePartnerBrandingInSupabase(
      partnerId,
      validated.data
    );

    const updated = patchPartnerBranding(partnerId, result.branding);
    if (!updated) {
      return NextResponse.json({ error: "Partner not found." }, { status: 404 });
    }

    return NextResponse.json({
      partnerId,
      persisted: result.persisted,
      branding: result.branding
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to save branding.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
