"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchAndHydratePartnerRegistry,
  type PartnerHydrationResult
} from "@/platform/partners/partnerLoader";
import { getPartnerCatalogSource } from "@/platform/partners/partnerRegistry";

/**
 * Loads partner catalog from `/api/partners` (Supabase with demo fallback).
 * Bump `version` after hydration so consumers re-read `listPartners()`.
 */
export function usePartnerRegistryHydration() {
  const [version, setVersion] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "ready">("idle");
  const [result, setResult] = useState<PartnerHydrationResult | null>(null);

  const refetch = useCallback(async () => {
    setStatus("loading");
    const hydration = await fetchAndHydratePartnerRegistry();
    setResult(hydration);
    setStatus("ready");
    setVersion((v) => v + 1);
    return hydration;
  }, []);

  useEffect(() => {
    let cancelled = false;
    void refetch().then(() => {
      if (cancelled) return;
    });

    return () => {
      cancelled = true;
    };
  }, [refetch]);

  return {
    version,
    status,
    source: result?.source ?? getPartnerCatalogSource(),
    partnerCount: result?.count ?? 0,
    refetch
  };
}
