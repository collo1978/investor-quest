"use client";

import type { ReactNode } from "react";

import type {
  DomainRecoveryIntelligence,
  RecoverySeverity
} from "@/lib/gameHealth/recoveryIntelligence";
import { tierFromScoreOrLabel } from "@/lib/operations/healthTier";

function severityStyles(severity: RecoverySeverity): {
  badge: string;
  dot: string;
  ring: string;
} {
  switch (severity) {
    case "critical":
      return {
        badge: "border-red-500/35 bg-red-500/15 text-red-200",
        dot: "bg-red-400",
        ring: "ring-red-400/50"
      };
    case "high":
      return {
        badge: "border-orange-500/35 bg-orange-500/12 text-orange-200",
        dot: "bg-orange-400",
        ring: "ring-orange-400/45"
      };
    case "medium":
      return {
        badge: "border-amber-500/30 bg-amber-500/10 text-amber-200",
        dot: "bg-amber-400",
        ring: "ring-amber-400/40"
      };
    case "low":
    default:
      return {
        badge: "border-white/15 bg-white/5 text-white/55",
        dot: "bg-white/40",
        ring: "ring-white/25"
      };
  }
}

function SeverityBadge({ severity }: { severity: RecoverySeverity }) {
  const s = severityStyles(severity);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${s.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden />
      {severity}
    </span>
  );
}

export function RecoveryIntelligencePanel({
  intelligence,
  compact,
  selectedDriverId,
  onSelectDriver,
  filteredCardCount = 0,
  domainScore,
  scoreBeforeRepair,
  inlineRepair,
  auditLoading
}: {
  intelligence: DomainRecoveryIntelligence;
  compact?: boolean;
  selectedDriverId?: string | null;
  onSelectDriver?: (driverId: string) => void;
  filteredCardCount?: number;
  domainScore?: number;
  scoreBeforeRepair?: number;
  inlineRepair?: ReactNode;
  auditLoading?: boolean;
}) {
  if (intelligence.drivers.length === 0) return null;

  const displayScore = domainScore ?? intelligence.currentScore;
  const tier = tierFromScoreOrLabel(displayScore, null);
  const projected = Math.min(
    100,
    displayScore + intelligence.totalRecoverablePercent
  );
  const interactive = Boolean(onSelectDriver);
  const selectedDriver = intelligence.drivers.find((d) => d.id === selectedDriverId);
  const scoreImproved =
    scoreBeforeRepair != null &&
    domainScore != null &&
    domainScore > scoreBeforeRepair;

  return (
    <section
      className={
        compact
          ? "rounded-xl border border-violet-500/25 bg-gradient-to-br from-violet-500/[0.08] to-black/30 p-4"
          : "rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 via-black/40 to-sky-500/[0.06] p-4 sm:p-5"
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-200/80">
            Recovery intelligence
          </p>
          <p className="mt-1 text-[14px] font-semibold text-white/90">
            Why {intelligence.domainLabel} is at {displayScore}%
          </p>
          {interactive ? (
            <p className="mt-1 text-[12px] text-white/45">
              Tap an impact row — the exact flagged card and fix actions appear below it.
            </p>
          ) : null}
        </div>
        <div className="text-right">
          {scoreImproved ? (
            <p className="text-[11px] text-white/40 line-through tabular-nums">
              {scoreBeforeRepair}%
            </p>
          ) : null}
          <p
            className="font-[var(--font-grotesk)] text-2xl font-bold tabular-nums leading-none"
            style={{ color: tier.color }}
          >
            {displayScore}%
            {scoreImproved ? (
              <span className="ml-1 text-[14px] font-semibold text-emerald-300">↑</span>
            ) : null}
          </p>
          {intelligence.totalRecoverablePercent > 0 && !scoreImproved ? (
            <p className="mt-1 text-[11px] text-emerald-300/85">
              Up to ~{projected}% if top fixes land
            </p>
          ) : scoreImproved ? (
            <p className="mt-1 text-[11px] font-semibold text-emerald-300/95">
              ✅ Score updated after fix
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
          Biggest score impacts
        </p>
        <ul className="mt-2 space-y-2">
          {intelligence.drivers.slice(0, 6).map((d) => {
            const selected = d.id === selectedDriverId;
            const s = severityStyles(d.severity);
            const cardHint =
              d.affectedCardCount != null && d.affectedCardCount > 0
                ? `${d.affectedCardCount} card${d.affectedCardCount === 1 ? "" : "s"}`
                : d.link?.kind === "check" || d.link?.kind === "subsection"
                  ? "Platform check"
                  : null;

            const inner = (
              <>
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                  <SeverityBadge severity={d.severity} />
                  <span className="text-[13px] text-white/85">{d.label}</span>
                  {cardHint ? (
                    <span className="text-[11px] text-violet-300/70">{cardHint}</span>
                  ) : null}
                </div>
                <span className="shrink-0 text-[13px] font-semibold tabular-nums text-rose-300/95">
                  −{d.scoreDragPercent}%
                </span>
              </>
            );

            if (!interactive) {
              return (
                <li
                  key={d.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/8 bg-black/25 px-3 py-2"
                >
                  {inner}
                </li>
              );
            }

            return (
              <li key={d.id} className="space-y-0">
                <button
                  type="button"
                  className={`flex w-full min-h-[44px] flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left touch-manipulation transition ${
                    selected
                      ? `border-violet-400/50 bg-violet-500/15 ring-2 ${s.ring}`
                      : "border-white/8 bg-black/25 hover:border-violet-400/30 hover:bg-violet-500/[0.06]"
                  }`}
                  onClick={() => onSelectDriver?.(d.id)}
                >
                  {inner}
                </button>
                {selected && inlineRepair ? (
                  <div className="mt-2 space-y-2 border-l-2 border-violet-400/40 pl-3">
                    {inlineRepair}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
        {interactive && selectedDriver && auditLoading && filteredCardCount === 0 ? (
          <p className="mt-2 text-[12px] text-violet-200/75">
            Loading flagged cards for this impact row…
          </p>
        ) : null}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
            Recommended recovery order
          </p>
          <ol className="mt-2 space-y-2">
            {intelligence.recommendedOrder.slice(0, 6).map((step) => {
              const selected = step.driverId === selectedDriverId;
              return (
                <li key={step.driverId}>
                  {interactive ? (
                    <button
                      type="button"
                      className={`flex w-full gap-2 rounded-lg px-1 py-1 text-left text-[13px] leading-snug touch-manipulation ${
                        selected ? "text-violet-100" : "text-white/80 hover:text-white"
                      }`}
                      onClick={() => onSelectDriver?.(step.driverId)}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                          selected
                            ? "bg-violet-500/40 text-violet-100"
                            : "bg-violet-500/20 text-violet-200"
                        }`}
                      >
                        {step.step}
                      </span>
                      <span className="pt-0.5">{step.action}</span>
                    </button>
                  ) : (
                    <div className="flex gap-2 text-[13px] leading-snug text-white/80">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-[11px] font-bold text-violet-200">
                        {step.step}
                      </span>
                      <span className="pt-0.5">{step.action}</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
            Estimated score recovery
          </p>
          <ul className="mt-2 space-y-2">
            {intelligence.estimatedRecovery.slice(0, 6).map((est) => {
              const selected = est.driverId === selectedDriverId;
              return (
                <li key={est.driverId}>
                  {interactive ? (
                    <button
                      type="button"
                      className={`flex w-full items-start justify-between gap-2 rounded-lg px-1 py-1 text-left text-[12px] leading-snug touch-manipulation ${
                        selected ? "text-white/90" : "text-white/65 hover:text-white/80"
                      }`}
                      onClick={() => onSelectDriver?.(est.driverId)}
                    >
                      <span>{est.action}</span>
                      <span className="shrink-0 font-semibold tabular-nums text-emerald-300/95">
                        +{est.recoveryPercent}%
                      </span>
                    </button>
                  ) : (
                    <div className="flex items-start justify-between gap-2 text-[12px] leading-snug">
                      <span className="text-white/65">{est.action}</span>
                      <span className="shrink-0 font-semibold tabular-nums text-emerald-300/95">
                        +{est.recoveryPercent}%
                      </span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-white/38">
        {interactive
          ? "Regenerate inline, then verify — the domain score above updates without leaving Mission Control."
          : "Estimates rank fixes by severity and weighted score drag. Run a fresh health check after each batch."}
      </p>
    </section>
  );
}
