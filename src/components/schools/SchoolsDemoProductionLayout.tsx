"use client";

import type { ReactNode } from "react";

import { SchoolsDemoFullscreenShell } from "@/components/schools/SchoolsDemoFullscreenShell";

/**
 * Minimal chrome for `/schools/demo/*` — fullscreen PWA-style mobile shell.
 */
export function SchoolsDemoProductionLayout({ children }: { children: ReactNode }) {
  return <SchoolsDemoFullscreenShell>{children}</SchoolsDemoFullscreenShell>;
}
