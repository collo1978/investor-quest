"use client";

import { useState } from "react";

import { GamificationMechanicsSections } from "@/components/platform/GamificationMechanicsSection";

export function MechanicsChecklistPanel() {
  const [hint, setHint] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-white">Gamification mechanics</h1>
        <p className="mt-2 max-w-3xl text-sm text-white/65">
          Live registry of Investor Quest systems grouped by mechanic area. Expand each
          section to review rollout status, partner policy toggles, and behavioral design
          audits (Octalysis, Hook, SDT, Fogg).
        </p>
      </div>

      {hint ? (
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/80">
          {hint}
        </div>
      ) : null}

      <GamificationMechanicsSections onEditHint={setHint} />
    </div>
  );
}
