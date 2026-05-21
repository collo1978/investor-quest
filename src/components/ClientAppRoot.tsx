"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const ClientProviders = dynamic(
  () =>
    import("@/components/ClientProviders").then((m) => ({
      default: m.ClientProviders
    })),
  {
    ssr: true,
    loading: () => (
      <div
        className="min-h-screen bg-bg-0"
        aria-busy="true"
        aria-label="Loading application"
      />
    )
  }
);

export function ClientAppRoot({ children }: { children: ReactNode }) {
  return <ClientProviders>{children}</ClientProviders>;
}
