"use client";

import { tierFromScoreOrLabel } from "@/lib/operations/healthTier";
import type { BehavioralAuditSourceType, BehavioralAuditStatus } from "@/platform/gamification/behavioralDesign/types";

export function auditStatusLabel(status: BehavioralAuditStatus): string {
  switch (status) {
    case "healthy":
      return "Healthy";
    case "needs_review":
      return "Needs review";
    case "weak":
      return "Weak";
    case "critical":
      return "Critical";
  }
}

export function auditStatusClasses(status: BehavioralAuditStatus): string {
  switch (status) {
    case "healthy":
      return "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30";
    case "needs_review":
      return "bg-amber-500/15 text-amber-100 ring-amber-400/30";
    case "weak":
      return "bg-orange-500/15 text-orange-100 ring-orange-400/30";
    case "critical":
      return "bg-rose-500/15 text-rose-200 ring-rose-400/30";
  }
}

export function AuditStatusBadge({ status }: { status: BehavioralAuditStatus }) {
  return (
    <span
      className={[
        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1",
        auditStatusClasses(status)
      ].join(" ")}
    >
      {auditStatusLabel(status)}
    </span>
  );
}

export function SourceTypeBadge({ type }: { type: BehavioralAuditSourceType }) {
  const label =
    type === "manual"
      ? "Manual audit"
      : type === "automated"
        ? "Automated"
        : "Future analytics";
  return (
    <span className="rounded bg-white/8 px-1.5 py-0.5 text-[10px] text-white/50">
      {label}
    </span>
  );
}

export function ScoreBar({
  label,
  score,
  onChange
}: {
  label: string;
  score: number;
  onChange?: (value: number) => void;
}) {
  const tier = tierFromScoreOrLabel(score, null);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-medium text-white/75">{label}</span>
        {onChange ? (
          <input
            type="number"
            min={0}
            max={100}
            value={score}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-14 rounded border border-white/15 bg-black/40 px-2 py-0.5 text-right text-[12px] text-white tabular-nums"
          />
        ) : (
          <span
            className="text-[13px] font-bold tabular-nums"
            style={{ color: tier.color }}
          >
            {score}%
          </span>
        )}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${Math.max(0, Math.min(100, score))}%`, background: tier.color }}
        />
      </div>
    </div>
  );
}

export function BulletList({
  title,
  items,
  tone = "neutral"
}: {
  title: string;
  items: string[];
  tone?: "neutral" | "warn" | "positive";
}) {
  if (items.length === 0) return null;
  const titleClass =
    tone === "warn"
      ? "text-amber-200/90"
      : tone === "positive"
        ? "text-emerald-200/90"
        : "text-white/55";
  return (
    <div>
      <p className={`text-[11px] font-semibold uppercase tracking-wide ${titleClass}`}>
        {title}
      </p>
      <ul className="mt-1.5 space-y-1 text-[12px] leading-relaxed text-white/60">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
