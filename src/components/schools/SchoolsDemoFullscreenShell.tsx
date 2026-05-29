"use client";

import { useEffect, useState, type ReactNode } from "react";

import { SchoolsDemoRouteBootstrap } from "@/components/schools/SchoolsDemoRouteBootstrap";
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
    <div className="relative h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-[#05010f]">
      <SchoolsDemoRouteBootstrap />
      {children}
      {showPwaHint ? (
        <p
          className={`pointer-events-none absolute inset-x-0 bottom-[max(0.4rem,env(safe-area-inset-bottom))] z-[5] mx-auto max-w-[18rem] px-4 text-center text-[0.62rem] leading-snug tracking-[0.02em] text-violet-200/42 ${SCHOOLS_DEVICE.mobileOnly}`}
        >
          For fullscreen on iPhone: open investor-quest.vercel.app/schools/demo/ in Safari,
          tap Share, then Add to Home Screen (remove any old icon first).
        </p>
      ) : null}
    </div>
  );
}
