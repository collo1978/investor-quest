"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { DemoRouteBootstrap } from "@/components/demo/DemoRouteBootstrap";
import { useDemoStory } from "@/components/demo/DemoStoryProvider";
import { MobilePreviewEmbedNotifier } from "@/components/bank/MobilePreviewEmbedNotifier";
import { useMobilePreviewEmbed } from "@/hooks/useMobilePreviewEmbed";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Minimal chrome for `/demo/*` — no funnel guard, no main app nav.
 * Orchestrator + toasts live in AnalyticsTelemetryBridge / AppShell.
 */
export function DemoProductionLayout({ children }: { children: ReactNode }) {
  const { active, step } = useDemoStory();
  const isPreviewEmbed = useMobilePreviewEmbed();

  return (
    <div className="pointer-events-auto relative min-h-[100dvh] bg-[#030308]">
      <DemoRouteBootstrap />
      <MobilePreviewEmbedNotifier />

      {active && !isPreviewEmbed ? (
        <div
          className="pointer-events-none absolute left-0 right-0 top-0 z-[300] flex justify-center px-3 pt-2"
          aria-hidden
        >
          <span className="rounded-full border border-violet-400/35 bg-[rgba(8,6,18,0.88)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-200/90 backdrop-blur-md">
            Demo story · {step.replace("-", " ")}
          </span>
        </div>
      ) : null}

      {!isPreviewEmbed ? (
        <div className="absolute right-3 top-2 z-[301] flex items-center gap-2">
          {isDev ? (
            <Link
              href="/bank/mobile-preview"
              className="rounded-lg border border-violet-400/30 bg-[rgba(8,6,18,0.85)] px-2.5 py-1 text-[10px] font-medium text-violet-200/90 backdrop-blur-md transition hover:text-violet-100"
            >
              Mobile preview
            </Link>
          ) : null}
          <Link
            href="/map"
            className="rounded-lg border border-white/10 bg-[rgba(8,6,18,0.85)] px-2.5 py-1 text-[10px] font-medium text-ink-2 backdrop-blur-md transition hover:text-ink-0"
          >
            Exit demo
          </Link>
        </div>
      ) : null}

      {children}
    </div>
  );
}
