"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

import { ClientProviders } from "@/components/ClientProviders";

const CHUNK_RELOAD_KEY = "iq-chunk-reload-once";

export function ClientAppRoot({
  children,
  initialPathname = ""
}: {
  children: ReactNode;
  initialPathname?: string;
}) {
  useEffect(() => {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY);

    const onError = (event: ErrorEvent) => {
      const message = event.message ?? "";
      const isChunkLoadError =
        message.includes("ChunkLoadError") ||
        message.includes("Loading chunk") ||
        message.includes("Failed to fetch dynamically imported module");

      if (!isChunkLoadError) return;
      if (sessionStorage.getItem(CHUNK_RELOAD_KEY)) return;

      sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
      window.location.reload();
    };

    window.addEventListener("error", onError);
    return () => window.removeEventListener("error", onError);
  }, []);

  return (
    <ClientProviders initialPathname={initialPathname}>
      {children}
    </ClientProviders>
  );
}