"use client";

import { formatAnalyticsDateTime } from "@/lib/analytics/formatDisplay";
import { tierFromScoreOrLabel } from "@/lib/operations/healthTier";
import type { HealthStatusLabel } from "@/lib/gameHealth/types";

import { OpsTouchButton } from "./OpsTouchButton";
import { opsPanel } from "./opsTheme";

export function OpsHealthHero({
  score,
  statusLabel,
  lastCheckAt,
  slowestRoute,
  durationSec,
  running,
  onRunCheck,
  onRefresh
}: {
  score: number | null;
  statusLabel?: HealthStatusLabel | null;
  lastCheckAt?: string | null;
  slowestRoute?: string | null;
  durationSec?: number | null;
  running?: boolean;
  onRunCheck: () => void;
  onRefresh: () => void;
}) {
  const hasScore = score != null;
  const tier = hasScore
    ? tierFromScoreOrLabel(score, statusLabel ?? null)
    : null;

  return (
    <section className={`${opsPanel} text-center`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
        Live game health
      </p>

      <p
        className="mt-3 font-[var(--font-grotesk)] text-7xl font-bold tabular-nums leading-none sm:text-8xl"
        style={{ color: tier?.color ?? "rgba(255,255,255,0.35)" }}
      >
        {hasScore ? `${score}%` : "—"}
      </p>

      <p
        className="mt-3 text-xl font-bold"
        style={{ color: tier?.color ?? "rgba(255,255,255,0.4)" }}
      >
        {tier?.label ?? "Not checked yet"}
      </p>

      {tier ? (
        <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-white/65">
          {tier.explanation}
        </p>
      ) : (
        <p className="mt-3 text-[15px] text-white/55">
          Run a check to see if Investor Quest is demo-ready.
        </p>
      )}

      {lastCheckAt ? (
        <p className="mt-4 text-[12px] text-white/40">
          Last check: {formatAnalyticsDateTime(lastCheckAt)}
          {durationSec != null ? ` · ${durationSec.toFixed(1)}s` : ""}
        </p>
      ) : null}

      {slowestRoute ? (
        <p className="mt-1 text-[12px] text-white/35">
          Slowest part: {slowestRoute.replace(/\/api\//g, "").replace(/^\//, "")}
        </p>
      ) : null}

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        <OpsTouchButton
          variant="primary"
          disabled={running}
          onClick={onRunCheck}
          description="Scans map, quests, AI, and saved answers"
        >
          {running ? "Checking…" : "Run health check"}
        </OpsTouchButton>
        <OpsTouchButton
          variant="secondary"
          disabled={running}
          onClick={onRefresh}
          description="Refresh score without a full scan"
        >
          Refresh status
        </OpsTouchButton>
      </div>
    </section>
  );
}
