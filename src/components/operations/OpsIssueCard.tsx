"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { OpsInlineIssueRepair } from "@/components/operations/OpsInlineIssueRepair";
import { buildOperatorRepairGuide } from "@/lib/operations/operatorRepairGuide";
import type { GameHealthIssueRecord } from "@/lib/gameHealth/types";

import { opsPanel } from "./opsTheme";

export function OpsIssueCard({
  issue,
  domainScores,
  onIssueUpdated
}: {
  issue: GameHealthIssueRecord;
  domainScores?: Record<string, number>;
  onIssueUpdated?: () => void | Promise<void>;
}) {
  const [expanded, setExpanded] = useState(true);
  const guide = useMemo(() => buildOperatorRepairGuide(issue), [issue]);

  return (
    <li className={`${opsPanel} list-none`}>
      <button
        type="button"
        className="flex w-full min-h-[44px] items-center justify-between gap-3 text-left touch-manipulation"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-violet-300/80">
            {guide.domainLabel} · {guide.fixTypeLabel}
          </p>
          <p className="mt-1 text-[16px] font-semibold leading-snug text-white/95">
            {guide.problem}
          </p>
          <p className="mt-1 text-[13px] text-white/45">{guide.scoreImpactLabel}</p>
        </div>
        <span className="shrink-0 text-white/40">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded ? (
        <div className="mt-4 border-t border-white/10 pt-4">
          <OpsInlineIssueRepair
            issue={issue}
            domainScores={domainScores}
            onIssueUpdated={onIssueUpdated}
          />
        </div>
      ) : null}

      <Link
        href={`/admin/mobile-fix/${issue.id}`}
        className="mt-3 flex min-h-[40px] items-center justify-center rounded-xl border border-white/12 bg-white/5 text-[13px] font-semibold text-white/55 touch-manipulation lg:hidden"
      >
        Open on phone
      </Link>
    </li>
  );
}
