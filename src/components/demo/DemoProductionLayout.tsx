"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { DemoRouteBootstrap } from "@/components/demo/DemoRouteBootstrap";
import { useDemoStory } from "@/components/demo/DemoStoryProvider";

/**
 * Minimal chrome for `/demo/*` — no funnel guard, no main app nav.
 * Orchestrator + toasts live in AnalyticsTelemetryBridge / AppShell.
 */
export function DemoProductionLayout({ children }: { children: ReactNode }) {
  const { active, step } = useDemoStory();

  return (
    <div className="pointer-events-auto relative min-h-[100dvh] bg-[#030308]">
      <DemoRouteBootstrap />

      {active ? (
        <div
          className="pointer-events-none absolute left-0 right-0 top-0 z-[300] flex justify-center px-3 pt-2"
          aria-hidden
        >
          <span className="rounded-full border border-violet-400/35 bg-[rgba(8,6,18,0.88)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-200/90 backdrop-blur-md">
            Demo story · {step.replace("-", " ")}
          </span>
        </div>
      ) : null}

      <div className="absolute right-3 top-2 z-[301]">
        <Link
          href="/map"
          className="rounded-lg border border-white/10 bg-[rgba(8,6,18,0.85)] px-2.5 py-1 text-[10px] font-medium text-ink-2 backdrop-blur-md transition hover:text-ink-0"
        >
          Exit demo
        </Link>
      </div>

      {children}
    </div>
  );
}
