"use client";



import { useMemo, useState } from "react";

import { AuditActionableCardList } from "@/components/platform/AuditActionableCardList";
import { RecoveryRepairWorkflow } from "@/components/platform/RecoveryRepairWorkflow";

import { opsPanel } from "@/components/operations/opsTheme";

import {

  allActionableDetailsFromReport,

  hasActionableCommunicationIntelligence,

  shouldSuppressLegacyCommCheck

} from "@/lib/communicationQuality/actionableDisplay";

import type { CommunicationQualityReport } from "@/lib/communicationQuality/types";

import { tierFromScoreOrLabel } from "@/lib/operations/healthTier";

import { buildDomainRecoveryIntelligence } from "@/lib/gameHealth/recoveryIntelligence";
import { CHECK_OUTCOME_LABELS } from "@/lib/gameHealth/resolutionIntelligence/types";

import type {

  GameHealthIssueRecord,

  PlatformHealthCheckResult,

  PlatformHealthDomainResult,

  PlatformHealthSubsectionResult

} from "@/lib/gameHealth/types";



const ACTIONABLE_DOMAIN_IDS = new Set(["learning_quality", "communication_quality"]);



function statusTone(status: PlatformHealthCheckResult["status"]): string {

  switch (status) {

    case "pass":

      return "text-emerald-400";

    case "warn":

      return "text-amber-300";

    case "fail":

      return "text-red-400";

    default:

      return "text-white/40";

  }

}



function CountPills({ counts }: { counts: PlatformHealthDomainResult["counts"] }) {

  return (

    <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold uppercase tracking-wide">

      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-300">

        {counts.pass} pass

      </span>

      {counts.warn > 0 ? (

        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-200">

          {counts.warn} warn

        </span>

      ) : null}

      {counts.fail > 0 ? (

        <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-red-300">

          {counts.fail} fail

        </span>

      ) : null}

      {counts.critical > 0 ? (

        <span className="rounded-full bg-red-600/25 px-2 py-0.5 text-red-200">

          {counts.critical} critical

        </span>

      ) : null}

      {counts.pending > 0 ? (

        <span className="rounded-full bg-white/10 px-2 py-0.5 text-white/45">

          {counts.pending} pending

        </span>

      ) : null}

      {counts.unavailable > 0 ? (

        <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-sky-200/70">

          {counts.unavailable} N/A

        </span>

      ) : null}

    </div>

  );

}



function CheckRow({ check }: { check: PlatformHealthCheckResult }) {

  const nonScorable =

    check.outcomeKind && check.outcomeKind !== "actual_problem";



  return (

    <li className="rounded-lg border border-white/8 bg-black/25 px-3 py-2.5">

      <div className="flex flex-wrap items-start justify-between gap-2">

        <div className="min-w-0 flex-1">

          <p className="text-[13px] font-semibold text-white/85">{check.name}</p>

          <p className="mt-1 text-[12px] leading-relaxed text-white/50">{check.message}</p>

          {nonScorable ? (

            <p className="mt-2 text-[11px] text-violet-200/70">

              {CHECK_OUTCOME_LABELS[check.outcomeKind!]} — excluded from health score

            </p>

          ) : null}

          {check.status !== "pass" && check.status !== "pending" && !nonScorable ? (

            <p className="mt-2 text-[12px] text-violet-200/80">

              <span className="font-semibold text-violet-200/90">Fix: </span>

              {check.suggestedFix}

            </p>

          ) : null}

        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">

          <span className={`text-[11px] font-bold uppercase ${statusTone(check.status)}`}>

            {check.status}

          </span>

          <span className="rounded bg-white/8 px-1.5 py-0.5 text-[10px] text-white/45">

            {check.checkType}

          </span>

        </div>

      </div>

    </li>

  );

}



function SubsectionBlock({

  subsection,

  communicationQuality

}: {

  subsection: PlatformHealthSubsectionResult;

  communicationQuality?: CommunicationQualityReport | null;

}) {

  const [open, setOpen] = useState(false);

  const tier = tierFromScoreOrLabel(subsection.score, null);



  const visibleChecks = subsection.checks.filter(

    (c) => !shouldSuppressLegacyCommCheck(c.id, communicationQuality)

  );



  return (

    <div className="rounded-xl border border-white/8 bg-black/20">

      <button

        type="button"

        className="flex w-full min-h-[44px] items-center justify-between gap-3 px-3 py-2.5 text-left touch-manipulation"

        onClick={() => setOpen((v) => !v)}

      >

        <div className="min-w-0">

          <p className="text-[13px] font-semibold text-white/80">{subsection.label}</p>

          <div className="mt-1">

            <CountPills counts={subsection.counts} />

          </div>

        </div>

        <div className="flex shrink-0 items-center gap-2">

          <span

            className="font-[var(--font-grotesk)] text-lg font-bold tabular-nums"

            style={{ color: tier.color }}

          >

            {subsection.score}%

          </span>

          <span className="text-white/35">{open ? "▲" : "▼"}</span>

        </div>

      </button>

      {open && visibleChecks.length > 0 ? (

        <ul className="space-y-2 border-t border-white/8 px-3 py-3">

          {visibleChecks.map((c) => (

            <CheckRow key={c.id} check={c} />

          ))}

        </ul>

      ) : null}

    </div>

  );

}



export function PlatformHealthDomainPanel({

  domain,

  communicationQuality,

  openIssues,

  onRepairComplete

}: {

  domain: PlatformHealthDomainResult;

  communicationQuality?: CommunicationQualityReport | null;

  openIssues?: GameHealthIssueRecord[];

  onRepairComplete?: (
    result: import("@/lib/gameHealth/missionControlRepairSync").RepairVerificationResult
  ) => void | Promise<void>;

}) {

  const [open, setOpen] = useState(false);

  const tier = tierFromScoreOrLabel(domain.score, null);



  const showActionable =

    ACTIONABLE_DOMAIN_IDS.has(domain.domainId) &&

    hasActionableCommunicationIntelligence(communicationQuality);



  const actionableDetails =

    showActionable && communicationQuality

      ? allActionableDetailsFromReport(communicationQuality, domain.domainId)

      : [];

  const recoveryIntelligence = useMemo(
    () => buildDomainRecoveryIntelligence(domain, communicationQuality),
    [domain, communicationQuality]
  );

  return (

    <section className={opsPanel}>

      <button

        type="button"

        className="flex w-full min-h-[48px] flex-col gap-2 text-left touch-manipulation sm:flex-row sm:items-center sm:justify-between"

        onClick={() => setOpen((v) => !v)}

      >

        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-center gap-2">

            <h3 className="text-[15px] font-bold text-white">{domain.label}</h3>

            {domain.demoCritical ? (

              <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-violet-200/90">

                Demo critical

              </span>

            ) : null}

          </div>

          <p className="mt-1 text-[12px] text-white/45">{domain.description}</p>

          <div className="mt-2">

            <CountPills counts={domain.counts} />

          </div>

        </div>

        <div className="flex items-center gap-3">

          <span

            className="font-[var(--font-grotesk)] text-3xl font-bold tabular-nums leading-none"

            style={{ color: tier.color }}

          >

            {domain.score}%

          </span>

          <span className="text-white/40">{open ? "▲" : "▼"}</span>

        </div>

      </button>



      {open ? (

        <div className="mt-4 space-y-4">

          {recoveryIntelligence ? (
            <RecoveryRepairWorkflow
              intelligence={recoveryIntelligence}
              domain={domain}
              domainId={domain.domainId}
              domainLabel={domain.label}
              domainScore={domain.score}
              communicationQuality={communicationQuality}
              openIssues={openIssues}
              onRepairComplete={onRepairComplete}
            />
          ) : showActionable ? (
            <AuditActionableCardList
              details={actionableDetails}
              title={`${domain.label} — card-level findings`}
              maxCards={12}
              showRepairActions
            />
          ) : null}



          {domain.subsections.some((sub) =>

            sub.checks.some((c) => !shouldSuppressLegacyCommCheck(c.id, communicationQuality))

          ) ? (

            <div className="space-y-3">

              {showActionable ? (

                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">

                  Other checks

                </p>

              ) : null}

              {domain.subsections.map((sub) => (

                <SubsectionBlock

                  key={sub.subsectionId}

                  subsection={sub}

                  communicationQuality={communicationQuality}

                />

              ))}

            </div>

          ) : showActionable ? (

            <p className="text-[12px] text-white/45">

              Category-level warnings are folded into the card list above — regenerate flagged

              cards to improve this score.

            </p>

          ) : (

            <div className="space-y-3">

              {domain.subsections.map((sub) => (

                <SubsectionBlock

                  key={sub.subsectionId}

                  subsection={sub}

                  communicationQuality={communicationQuality}

                />

              ))}

            </div>

          )}

        </div>

      ) : null}

    </section>

  );

}

