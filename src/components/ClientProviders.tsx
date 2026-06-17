"use client";

import type { ReactNode } from "react";

import { AppShell } from "@/components/AppShell";
import { AnalyticsTelemetryBridge } from "@/components/analytics/AnalyticsTelemetryBridge";
import { SchoolsPosterShell } from "@/components/schools/SchoolsPosterShell";
import { useStablePathname } from "@/hooks/useStablePathname";
import { isSchoolsLightweightClientPath } from "@/lib/schools/schoolsDemoProtection";

/**
 * Client-only app shell + game/analytics providers.
 * Poster screens skip GameProvider — AppShell cannot be used there (it requires useGame).
 */
export function ClientProviders({
  children,
  initialPathname = ""
}: {
  children: ReactNode;
  initialPathname?: string;
}) {
  const pathname = useStablePathname(initialPathname);
  const lightweight = isSchoolsLightweightClientPath(pathname);

  if (lightweight) {
    return <SchoolsPosterShell>{children}</SchoolsPosterShell>;
  }

  return (
    <AnalyticsTelemetryBridge>
      <AppShell initialPathname={initialPathname}>{children}</AppShell>
    </AnalyticsTelemetryBridge>
  );
}
