"use client";

import Link from "next/link";

import { DemoControlsAdminCard } from "@/components/demo/DemoControlsHost";

export function DemoControlPageClient() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 md:px-8">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-300/80">
          Mission Control
        </p>
        <h1 className="mt-2 font-[var(--font-grotesk)] text-2xl font-semibold text-white">
          Demo control
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60">
          Replay the first-time player funnel or jump to a polished investor state.
          Changes apply to{" "}
          <strong className="font-medium text-white/80">local browser storage only</strong>
          — not production user accounts.
        </p>
        <p className="mt-3 text-xs text-white/45">
          The same controls appear in-game as a floating{" "}
          <span className="text-violet-200">Demo</span> tab on every screen.
        </p>
      </header>

      <DemoControlsAdminCard />

      <p className="text-xs text-white/45">
        <Link
          href="/admin/game-health"
          className="text-violet-300 underline-offset-2 hover:underline"
        >
          ← Back to Mission Control
        </Link>
      </p>
    </div>
  );
}
