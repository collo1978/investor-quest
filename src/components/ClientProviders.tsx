"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { AnalyticsTelemetryBridge } from "@/components/analytics/AnalyticsTelemetryBridge";

/**
 * Client-only app shell + game/analytics providers.
 * Loaded via dynamic import from the root layout to keep the layout chunk smaller.
 */
export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AnalyticsTelemetryBridge>
      <AppShell>{children}</AppShell>
    </AnalyticsTelemetryBridge>
  );
}
