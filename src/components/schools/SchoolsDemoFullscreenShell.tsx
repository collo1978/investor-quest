"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";

import { MobilePreviewEmbedNotifier } from "@/components/bank/MobilePreviewEmbedNotifier";
import { SchoolsDemoGameFx } from "@/components/schools/SchoolsDemoGameFx";
import { SchoolsDemoPlaythroughBridge } from "@/components/schools/SchoolsDemoPlaythroughBridge";
import { SchoolsDemoRouteBootstrap } from "@/components/schools/SchoolsDemoRouteBootstrap";
import { MOBILE_PREVIEW_SEARCH_PARAM } from "@/lib/bank/mobilePreviewEmbed";
import {
  configureCapacitorNativeShell,
  isCapacitorNativeApp
} from "@/lib/capacitor/nativeShell";
import {
  isIosStandaloneDisplayMode,
  registerSchoolsDemoServiceWorker
} from "@/lib/schools/schoolsDemoPwa";
import { SCHOOLS_DEVICE } from "@/lib/schools/schoolsResponsive";

const ROOT_CLASS = "iq-schools-demo-fullscreen";

/**
 * Locks html/body for immersive mobile demo + optional Add-to-Home-Screen hint.
 */
export function SchoolsDemoFullscreenShell({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const isPreviewEmbed =
    searchParams.get(MOBILE_PREVIEW_SEARCH_PARAM) === "1";
  const [showPwaHint, setShowPwaHint] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add(ROOT_CLASS);
    document.body.classList.add(ROOT_CLASS);

    void configureCapacitorNativeShell();
    registerSchoolsDemoServiceWorker();

    const mq = window.matchMedia("(display-mode: standalone)");
    const refreshHint = async () => {
      const native = await isCapacitorNativeApp();
      setShowPwaHint(!native && !isIosStandaloneDisplayMode());
    };
    void refreshHint();
    mq.addEventListener("change", refreshHint);

    return () => {
      document.documentElement.classList.remove(ROOT_CLASS);
      document.body.classList.remove(ROOT_CLASS);
      mq.removeEventListener("change", refreshHint);
    };
  }, []);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-[#05010f]">
      <SchoolsDemoRouteBootstrap />
      <SchoolsDemoPlaythroughBridge />
      <SchoolsDemoGameFx />
      <MobilePreviewEmbedNotifier />
      <div className="iq-schools-demo-scroll-host relative min-h-0 flex-1 overflow-y-auto">
        {children}
      </div>
      {showPwaHint && !isPreviewEmbed ? (
        <p
          className={`pointer-events-none absolute inset-x-0 bottom-[max(0.4rem,env(safe-area-inset-bottom))] z-[5] mx-auto max-w-[18rem] px-4 text-center text-[0.62rem] leading-snug tracking-[0.02em] text-violet-200/42 ${SCHOOLS_DEVICE.mobileOnly}`}
        >
          For fullscreen on iPhone: open investor-quest.vercel.app/schools/demo in Safari,
          tap Share, then Add to Home Screen (remove any old icon first).
        </p>
      ) : null}
    </div>
  );
}
