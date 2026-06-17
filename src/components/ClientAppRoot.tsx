"use client";

import type { ReactNode } from "react";

import { ClientProviders } from "@/components/ClientProviders";

export function ClientAppRoot({
  children,
  initialPathname = ""
}: {
  children: ReactNode;
  initialPathname?: string;
}) {
  return (
    <ClientProviders initialPathname={initialPathname}>
      {children}
    </ClientProviders>
  );
}