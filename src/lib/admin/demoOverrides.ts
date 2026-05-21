import type { PartnerBranding } from "@/platform/types";
import type { PartnerBrandingUpdateInput } from "@/lib/supabase/partners/brandingUpdateShared";

const STORAGE_KEY = "iq-admin-partner-overrides";

type PartnerOverrideStore = Record<
  string,
  {
    branding?: PartnerBrandingUpdateInput;
  }
>;

function readStore(): PartnerOverrideStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PartnerOverrideStore;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: PartnerOverrideStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function saveDemoBrandingOverride(
  partnerId: string,
  input: PartnerBrandingUpdateInput
): void {
  const store = readStore();
  store[partnerId] = { ...store[partnerId], branding: input };
  writeStore(store);
}

export function clearDemoBrandingOverride(partnerId: string): void {
  const store = readStore();
  if (!store[partnerId]?.branding) return;
  const next = { ...store[partnerId] };
  delete next.branding;
  if (Object.keys(next).length) {
    store[partnerId] = next;
  } else {
    delete store[partnerId];
  }
  writeStore(store);
}

export function readDemoBrandingOverride(
  partnerId: string
): PartnerBrandingUpdateInput | undefined {
  return readStore()[partnerId]?.branding;
}

/** Merge saved demo overrides into hydrated partner catalog (client-only). */
export function applyDemoBrandingOverrides<T extends { id: string; branding: PartnerBranding }>(
  partners: T[]
): T[] {
  if (typeof window === "undefined") return partners;
  const store = readStore();
  if (!Object.keys(store).length) return partners;

  return partners.map((partner) => {
    const override = store[partner.id]?.branding;
    if (!override) return partner;

    return {
      ...partner,
      branding: {
        ...partner.branding,
        partnerName: override.partnerName,
        logoUrl: override.logoUrl,
        colors: {
          ...partner.branding.colors,
          primary: override.colorPrimary,
          secondary: override.colorSecondary,
          accent: override.colorAccent
        },
        tonePresetId: override.tonePresetId,
        wordingDeckId: override.wordingDeckId
      }
    };
  });
}
