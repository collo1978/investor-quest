"use client";

import type { ReactNode } from "react";

/** Fullscreen shell for static schools poster screens — no GameProvider required. */
export function SchoolsPosterShell({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-auto flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden bg-[#05010f]">
      {children}
    </div>
  );
}
