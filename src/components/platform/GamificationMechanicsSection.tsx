"use client";

import { useState } from "react";

import { BehavioralDesignAuditsPanel } from "@/components/platform/behavioralDesign/BehavioralDesignAuditsPanel";
import { GamificationMechanicsTable } from "@/components/platform/GamificationMechanicsTable";
import { GAMIFICATION_MECHANICS } from "@/platform/gamification/mechanicsRegistry";
import {
  GAMIFICATION_MECHANICS_SECTIONS,
  mechanicsForSection,
  type MechanicsSectionDefinition
} from "@/platform/gamification/mechanicsSections";
import { opsPanel } from "@/components/operations/opsTheme";

export function GamificationMechanicsSection({
  section,
  onEditHint
}: {
  section: MechanicsSectionDefinition;
  onEditHint: (message: string) => void;
}) {
  const [open, setOpen] = useState(section.id === "xp_economy");

  const rows = mechanicsForSection(section, GAMIFICATION_MECHANICS);
  const activeCount = rows.filter((m) => m.rolloutStatus === "active").length;

  return (
    <section className={opsPanel}>
      <button
        type="button"
        className="flex w-full min-h-[48px] items-center justify-between gap-3 text-left touch-manipulation"
        onClick={() => setOpen((v) => !v)}
      >
        <div>
          <h2 className="text-[15px] font-bold text-white">{section.label}</h2>
          <p className="mt-1 text-[12px] text-white/50">{section.description}</p>
          {section.kind === "mechanics" ? (
            <p className="mt-2 text-[11px] text-white/40">
              {activeCount} active · {rows.length} registered
            </p>
          ) : null}
        </div>
        <span className="text-white/40">{open ? "▲" : "▼"}</span>
      </button>

      {open ? (
        <div className="mt-4">
          {section.kind === "behavioral_audits" ? (
            <BehavioralDesignAuditsPanel />
          ) : (
            <GamificationMechanicsTable rows={rows} onEditHint={onEditHint} />
          )}
        </div>
      ) : null}
    </section>
  );
}

export function GamificationMechanicsSections({
  onEditHint
}: {
  onEditHint: (message: string) => void;
}) {
  return (
    <div className="space-y-3">
      {GAMIFICATION_MECHANICS_SECTIONS.map((section) => (
        <GamificationMechanicsSection
          key={section.id}
          section={section}
          onEditHint={onEditHint}
        />
      ))}
    </div>
  );
}
