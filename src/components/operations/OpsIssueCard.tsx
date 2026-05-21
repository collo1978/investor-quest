"use client";

import Link from "next/link";

import { issueSeverityLabel } from "@/lib/operations/layman";
import type { GameHealthIssueRecord } from "@/lib/gameHealth/types";

import { opsPanel } from "./opsTheme";

export function OpsIssueCard({ issue }: { issue: GameHealthIssueRecord }) {
  const severityClass =
    issue.severity === "critical" ? "text-red-400" : "text-amber-300";

  return (
    <li className={`${opsPanel} list-none`}>
      <span
        className={`text-[10px] font-bold uppercase tracking-wider ${severityClass}`}
      >
        {issueSeverityLabel(issue.severity)}
      </span>
      <p className="mt-2 text-[17px] font-semibold leading-snug text-white/95">
        {issue.problemPlain}
      </p>
      <p className="mt-2 text-[14px] leading-relaxed text-white/55">
        {issue.whatUsersSee}
      </p>
      {(issue.companyName || issue.questSlug) && (
        <p className="mt-2 text-[13px] text-white/45">
          {issue.companyName ?? issue.companyTicker}
          {issue.questSlug ? ` · ${issue.questSlug}` : ""}
        </p>
      )}
      <Link
        href={`/admin/mobile-fix/${issue.id}`}
        className="mt-4 flex min-h-[56px] w-full flex-col items-start justify-center rounded-2xl border border-[var(--partner-primary)] bg-[var(--partner-primary)] px-4 py-3.5 text-left touch-manipulation active:scale-[0.99]"
      >
        <span className="text-[17px] font-bold text-black">Fix on phone</span>
        <span className="mt-1 text-[14px] text-black/65">One-tap fixes for this issue</span>
      </Link>
    </li>
  );
}
