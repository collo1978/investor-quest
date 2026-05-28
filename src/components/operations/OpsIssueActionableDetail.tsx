"use client";

import { AuditActionableCard } from "@/components/platform/AuditActionableCardList";
import { readActionableDetail } from "@/lib/gameHealth/resolutionIntelligence/actionableDetail";
import type { AuditActionableDetail } from "@/lib/gameHealth/resolutionIntelligence/actionableDetail";
import type { GameHealthIssueRecord } from "@/lib/gameHealth/types";

export function OpsIssueActionableDetail({
  issue,
  detail: detailProp
}: {
  issue?: GameHealthIssueRecord | null;
  detail?: AuditActionableDetail | null;
}) {
  const detail = detailProp ?? readActionableDetail(issue?.metadata ?? null);
  if (!detail?.findings.length) return null;

  return (
    <section className="mt-4">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-200/80">
        Actionable detail
      </p>
      <AuditActionableCard detail={detail} />
    </section>
  );
}
