"use client";

import { useEffect, useState, type ReactNode } from "react";

import { SchoolsDemoRouteBootstrap } from "@/components/schools/SchoolsDemoRouteBootstrap";
import { SCHOOLS_DEVICE } from "@/lib/schools/schoolsResponsive";

const ROOT_CLASS = "iq-schools-demo-fullscreen";

function detectStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    nav.standalone === true
  );
}

/**
 * Locks html/body for immersive mobile demo + optional Add-to-Home-Screen hint.
 */
export function SchoolsDemoFullscreenShell({ children }: { children: ReactNode }) {
  const [showPwaHint, setShowPwaHint] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add(ROOT_CLASS);
    document.body.classList.add(ROOT_CLASS);

    const mq = window.matchMedia("(display-mode: standalone)");
    const refreshHint = () => setShowPwaHint(!detectStandalone());
    refreshHint();
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
          For true fullscreen on iPhone, open in Safari, tap Share, then Add to Home Screen.
        </p>
      ) : null}
    </div>
  );
}
