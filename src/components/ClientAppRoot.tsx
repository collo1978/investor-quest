"use client";

import type { ReactNode } from "react";

import { ClientProviders } from "@/components/ClientProviders";

export function ClientAppRoot({ children }: { children: ReactNode }) {
  return <ClientProviders>{children}</ClientProviders>;
}