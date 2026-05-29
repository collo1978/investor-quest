"use client";

import type { ReactNode } from "react";

import { SchoolsDemoRouteBootstrap } from "@/components/schools/SchoolsDemoRouteBootstrap";

/**
 * Minimal chrome for `/schools/demo/*` — fullscreen, no preview header.
 */
export function SchoolsDemoProductionLayout({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-auto relative min-h-[100dvh] bg-[#030308]">
      <SchoolsDemoRouteBootstrap />
      {children}
    </div>
  );
}
