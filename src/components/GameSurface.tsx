"use client";

import { SkyBackdrop } from "@/components/FloatingIslands";

export function GameSurface({
  children,
  variant = "sky"
}: {
  children: React.ReactNode;
  variant?: "sky" | "flat";
}) {
  return (
    <main className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-bg-0">
      {variant === "sky" ? <SkyBackdrop /> : null}
      {/* top padding keeps content clear of HUD; bottom keeps clear of mobile nav */}
      <div className="relative mx-auto w-full max-w-6xl px-6 pb-32 pt-24 md:pt-12">
        {children}
      </div>
    </main>
  );
}

