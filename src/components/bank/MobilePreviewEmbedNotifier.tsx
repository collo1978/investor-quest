"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import {
  isMobilePreviewEmbed,
  markMobilePreviewEmbedSession,
  MOBILE_PREVIEW_READY_MESSAGE
} from "@/lib/bank/mobilePreviewEmbed";
import { deactivateDemoStory } from "@/lib/demo/demoStoryMode";
import { deactivateSchoolsDemoStory } from "@/lib/schools/schoolsDemoStoryMode";

/**
 * Signals the parent `/bank/mobile-preview` shell as soon as the demo route
 * has mounted — much faster than waiting for iframe `load` (images, dev compile).
 */
export function MobilePreviewEmbedNotifier() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isMobilePreviewEmbed()) return;
    if (window.parent === window) return;

    deactivateDemoStory();
    deactivateSchoolsDemoStory();
    markMobilePreviewEmbedSession();

    const notify = () => {
      window.parent.postMessage(
        {
          type: MOBILE_PREVIEW_READY_MESSAGE,
          path: pathname,
          search: window.location.search
        },
        window.location.origin
      );
    };

    notify();
    const raf = requestAnimationFrame(notify);
    const t = window.setTimeout(notify, 120);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, [pathname]);

  return null;
}
