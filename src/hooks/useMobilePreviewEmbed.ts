"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  isMobilePreviewEmbed,
  MOBILE_PREVIEW_SEARCH_PARAM
} from "@/lib/bank/mobilePreviewEmbed";

/**
 * Hydration-safe mobile preview embed detection.
 * `?preview=1` matches on server + first client paint; session/iframe after mount.
 */
export function useMobilePreviewEmbed(): boolean {
  const searchParams = useSearchParams();
  const previewInUrl =
    searchParams.get(MOBILE_PREVIEW_SEARCH_PARAM) === "1";
  const [embedded, setEmbedded] = useState(previewInUrl);

  useEffect(() => {
    setEmbedded(isMobilePreviewEmbed());
  }, []);

  return embedded;
}
