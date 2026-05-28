"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import {
  actionableCardKey,
  formatQuestSectionLabel,
  questPlayPath,
  questRegenerateAdminPath,
  type AuditActionableDetail,
  type AuditFlaggedFinding
} from "@/lib/gameHealth/resolutionIntelligence/actionableDetail";

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  if (value == null || value === "" || value === "—") return null;
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
        {label}
      </p>
      <p className="mt-1 text-[14px] leading-relaxed text-white/85">{value}</p>
    </div>
  );
}

function FindingBlock({ finding, index }: { finding: AuditFlaggedFinding; index: number }) {
  return (
    <li className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-3 py-3">
      {index > 0 ? (
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/35">
          Also flagged
        </p>
      ) : null}
      <DetailRow label="Reason" value={finding.reason} />
      <div className="mt-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
          Flagged text
        </p>
        <blockquote className="mt-1 border-l-2 border-amber-400/50 pl-3 text-[13px] italic leading-relaxed text-amber-100/90">
          &ldquo;{finding.flaggedText}&rdquo;
        </blockquote>
      </div>
      <div className="mt-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-300/80">
          Suggested direction
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-violet-100/85">
          {finding.rewriteDirection}
        </p>
      </div>
      {finding.categoryLabel ? (
        <p className="mt-2 text-[11px] text-white/40">
          Dimension: {finding.categoryLabel}
        </p>
      ) : null}
    </li>
  );
}

function CardRepairActions({ detail }: { detail: AuditActionableDetail }) {
  const playPath = questPlayPath(detail);
  const regenPath = questRegenerateAdminPath(detail);

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {playPath ? (
        <Link
          href={playPath}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[40px] rounded-xl border border-sky-400/35 bg-sky-500/15 px-3 py-2 text-[12px] font-semibold text-sky-100 touch-manipulation active:scale-[0.99]"
        >
          Open flagged content
        </Link>
      ) : null}
      <Link
        href={regenPath}
        target="_blank"
        rel="noopener noreferrer"
        className="min-h-[40px] rounded-xl border border-violet-400/35 bg-violet-500/20 px-3 py-2 text-[12px] font-semibold text-violet-100 touch-manipulation active:scale-[0.99]"
      >
        Regenerate card
      </Link>
    </div>
  );
}

export function AuditActionableCard({
  detail,
  compact,
  highlighted,
  showRepairActions
}: {
  detail: AuditActionableDetail;
  compact?: boolean;
  highlighted?: boolean;
  showRepairActions?: boolean;
}) {
  if (!detail.findings.length) return null;

  const loc = detail.location;
  const maxFindings = compact ? 1 : 3;

  return (
    <article
      className={`rounded-xl border p-4 transition duration-500 ${
        highlighted
          ? "border-violet-400/60 bg-violet-500/10 ring-2 ring-violet-400/50 shadow-lg shadow-violet-500/15"
          : compact
            ? "border-amber-500/20 bg-amber-500/[0.04]"
            : "border-amber-500/25 bg-amber-500/[0.05]"
      }`}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <DetailRow label="Company" value={loc.companyTicker ?? loc.companyName} />
        <DetailRow label="Pillar" value={loc.pillarLabel ?? loc.pillarId} />
        <DetailRow
          label="Quest section"
          value={formatQuestSectionLabel(loc.questSlug, loc.questTitle)}
        />
        <DetailRow label="Card" value={loc.cardLabel ?? loc.cardId} />
      </div>

      <ul className="mt-4 space-y-3">
        {detail.findings.slice(0, maxFindings).map((f, i) => (
          <FindingBlock key={`${f.code}-${i}`} finding={f} index={i} />
        ))}
      </ul>

      <div className="mt-4 rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-200/70">
          Best fix path
        </p>
        <p className="mt-1 text-[14px] font-semibold text-violet-100/95">
          {detail.preferredFixLabel}
        </p>
      </div>

      {showRepairActions ? <CardRepairActions detail={detail} /> : null}
    </article>
  );
}

export function AuditActionableCardList({
  details,
  title = "Flagged cards — actionable detail",
  emptyMessage,
  maxCards = 20,
  compact,
  focusedCardKey,
  onFocusCard,
  showRepairActions
}: {
  details: AuditActionableDetail[];
  title?: string;
  emptyMessage?: string;
  maxCards?: number;
  compact?: boolean;
  focusedCardKey?: string | null;
  onFocusCard?: (key: string) => void;
  showRepairActions?: boolean;
}) {
  const shown = details.filter((d) => d.findings.length > 0).slice(0, maxCards);

  if (shown.length === 0) {
    if (!emptyMessage) return null;
    return <p className="text-[13px] text-white/45">{emptyMessage}</p>;
  }

  return (
    <section className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-200/80">
        {title}
      </p>
      <ul className="space-y-3">
        {shown.map((detail) => {
          const key = actionableCardKey(detail);
          const highlighted = focusedCardKey === key;
          return (
            <li
              key={key}
              id={`actionable-card-${key}`}
              className="scroll-mt-24"
              onMouseEnter={() => onFocusCard?.(key)}
            >
              <AuditActionableCard
                detail={detail}
                compact={compact}
                highlighted={highlighted}
                showRepairActions={showRepairActions}
              />
            </li>
          );
        })}
      </ul>
      {details.length > maxCards ? (
        <p className="text-[11px] text-white/40">
          Showing {maxCards} of {details.length} flagged cards. Open issues below for the full
          list.
        </p>
      ) : null}
    </section>
  );
}
