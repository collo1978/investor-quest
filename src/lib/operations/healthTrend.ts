import type { GameHealthCheckRecord } from "@/lib/gameHealth/types";
import { tierFromScoreOrLabel } from "@/lib/operations/healthTier";

export type HealthTrendPoint = {
  score: number;
  statusLabel: GameHealthCheckRecord["statusLabel"];
  createdAt: string;
  issueCount: number;
  warningCount: number;
  failCount: number;
};

export function checksToTrendPoints(
  checks: readonly GameHealthCheckRecord[]
): HealthTrendPoint[] {
  return [...checks]
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    .map((c) => ({
      score: c.score,
      statusLabel: c.statusLabel,
      createdAt: c.createdAt,
      warningCount: c.warnings?.length ?? 0,
      failCount: c.failedChecks?.length ?? 0,
      issueCount:
        (c.warnings?.length ?? 0) + (c.failedChecks?.length ?? 0)
    }));
}

/** Human-readable time since a check (mobile-friendly). */
export function formatRelativeCheckTime(iso: string, now = Date.now()): string {
  const ms = Math.max(0, now - new Date(iso).getTime());
  const min = Math.floor(ms / 60_000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min} min ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return hrs === 1 ? "1 hour ago" : `${hrs} hours ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

export type HealthTrendSummary = {
  headline: string;
  detail: string;
  direction: "up" | "down" | "flat" | "ready";
};

export function summarizeHealthTrend(
  points: readonly HealthTrendPoint[]
): HealthTrendSummary {
  if (points.length === 0) {
    return {
      headline: "No history yet",
      detail: "Run a health check to start tracking demo readiness.",
      direction: "flat"
    };
  }

  const latest = points[points.length - 1];
  const prev = points.length > 1 ? points[points.length - 2] : null;
  const delta = prev != null ? latest.score - prev.score : 0;

  if (latest.score >= 90) {
    return {
      headline: "Demo ready",
      detail: prev
        ? delta >= 0
          ? `Latest score ${latest.score}% — platform looks healthy for a live demo.`
          : `Latest ${latest.score}% (was ${prev.score}%). Still demo-ready, but watch open issues.`
        : `Latest score ${latest.score}% — safe to demo.`,
      direction: "ready"
    };
  }

  if (delta <= -10) {
    return {
      headline: "Something may have broken",
      detail: `Score dropped from ${prev!.score}% to ${latest.score}% since the last check. Review open issues.`,
      direction: "down"
    };
  }

  if (delta >= 8) {
    return {
      headline: "Improving",
      detail: `Up from ${prev!.score}% to ${latest.score}% — fixes are helping. Keep going until Demo Ready (90%+).`,
      direction: "up"
    };
  }

  if (latest.score < 50) {
    return {
      headline: "Not demo ready",
      detail: `${latest.score}% with ${latest.issueCount} check flag(s). Fix critical issues before a live demo.`,
      direction: "down"
    };
  }

  return {
    headline: "Holding steady",
    detail: prev
      ? `Around ${latest.score}% (${delta >= 0 ? "+" : ""}${delta} vs last check). Clear warnings to reach Demo Ready.`
      : `${latest.score}% — run more checks to see if things improve.`,
    direction: "flat"
  };
}

export function trendTooltipLine(point: HealthTrendPoint): string {
  const tier = tierFromScoreOrLabel(point.score, point.statusLabel);
  const issues =
    point.issueCount === 0
      ? "no issues flagged"
      : point.issueCount === 1
        ? "1 issue flagged"
        : `${point.issueCount} issues flagged`;
  return `${point.score}% — ${tier.shortLabel} — ${issues}`;
}
