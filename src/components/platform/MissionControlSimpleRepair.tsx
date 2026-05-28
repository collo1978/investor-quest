"use client";

import { useCallback, useMemo, useState } from "react";

import { opsPanel } from "@/components/operations/opsTheme";
import { applyCommunicationAuditToPlatformReport } from "@/lib/gameHealth/applyCommunicationAuditToReport";
import type { CommunicationQualityReport } from "@/lib/communicationQuality/types";
import type { RepairVerificationResult } from "@/lib/gameHealth/missionControlRepairSync";
import type { GameHealthIssueRecord, PlatformHealthReport } from "@/lib/gameHealth/types";
import {
  buildRepairQueue,
  compactDomainScores,
  type RepairQueueDoneItem,
  type RepairQueueItem
} from "@/lib/operations/repairQueue";
import { tierFromScoreOrLabel } from "@/lib/operations/healthTier";
import {
  RepairLastOutcomePanel,
  type RepairLastOutcome
} from "@/components/platform/RepairLastOutcomePanel";
import { humanizeTechnicalMessage } from "@/lib/operations/layman";

function QueueRow({
  item,
  busy,
  onAction
}: {
  item: RepairQueueItem;
  busy: boolean;
  onAction: (item: RepairQueueItem) => void;
}) {
  const icon = item.severity === "medium" ? "•" : "⚠";

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/25 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold leading-snug text-white/90">
          <span className="mr-2 text-amber-300" aria-hidden>
            {icon}
          </span>
          {item.title}
        </p>
        <p className="mt-1 text-[13px] text-white/50">{item.summary}</p>
      </div>
      <button
        type="button"
        disabled={busy}
        className="min-h-[48px] shrink-0 rounded-xl border border-[var(--partner-primary)] bg-[var(--partner-primary)] px-5 py-3 text-[14px] font-bold text-black touch-manipulation disabled:opacity-50 active:scale-[0.99] sm:min-w-[200px]"
        onClick={() => onAction(item)}
      >
        {busy ? "Working…" : item.actionLabel}
      </button>
    </li>
  );
}

export function MissionControlSimpleRepair({
  report,
  openIssues,
  doneItems,
  onRepairSync,
  onRefresh,
  onShowAdvanced,
  onDoneItem
}: {
  report: PlatformHealthReport | null;
  openIssues: GameHealthIssueRecord[];
  doneItems: RepairQueueDoneItem[];
  onRepairSync: (result: RepairVerificationResult) => void | Promise<void>;
  onRefresh: () => void | Promise<void>;
  onShowAdvanced?: () => void;
  onDoneItem?: (item: RepairQueueDoneItem) => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [lastOutcome, setLastOutcome] = useState<RepairLastOutcome | null>(null);

  const { todo, done } = useMemo(
    () =>
      buildRepairQueue({
        report: report?.communicationQuality,
        openIssues,
        doneItems
      }),
    [report?.communicationQuality, openIssues, doneItems]
  );

  const domainStrip = useMemo(() => compactDomainScores(report), [report]);

  const runBatch = useCallback(
    async (item: RepairQueueItem) => {
      if (item.id.startsWith("issue:")) {
        onShowAdvanced?.();
        return;
      }
      setBusyId(item.id);
      setStatus(null);
      try {
        const res = await fetch("/api/admin/game-health/batch-repair", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: item.batchAction,
            scope: item.scope
          })
        });
        const json = (await res.json()) as {
          ok?: boolean;
          error?: string;
          communicationQuality?: CommunicationQualityReport;
          generated?: number;
          cardCount?: number;
          message?: string;
          learningScore?: number;
        };

        if (!res.ok || !json.ok) {
          throw new Error(json.error ?? "Batch repair failed.");
        }

        const beforeScore =
          report?.domains.find((d) => d.domainId === "learning_quality")?.score ?? 0;
        const afterScore = json.learningScore ?? beforeScore;

        if (json.communicationQuality && report) {
          const syncResult: RepairVerificationResult = {
            domainId: "learning_quality",
            domainScore:
              json.learningScore ??
              applyCommunicationAuditToPlatformReport(report, json.communicationQuality).domains.find(
                (d) => d.domainId === "learning_quality"
              )?.score ??
              0,
            beforeScore,
            communicationQuality: json.communicationQuality,
            communicationOverall: json.communicationQuality.overallHealthPercent,
            cardsStillFlagged: json.communicationQuality.cardsNeedingRegeneration.length
          };
          await onRepairSync(syncResult);
          setLastOutcome({
            problem: item.title,
            changeMade:
              json.generated != null
                ? `Regenerated ${json.generated} of ${json.cardCount ?? item.cardCount} cards`
                : (json.message ?? "Batch repair finished"),
            status:
              json.generated != null && json.generated > 0 ? "complete" : "partial",
            domainLabel: "Learning quality",
            scoreBefore: beforeScore,
            scoreAfter: afterScore,
            cardChange: syncResult.cardChange
          });
        }

        setStatus(
          json.generated != null
            ? `Regenerated ${json.generated} of ${json.cardCount ?? item.cardCount} cards.`
            : (json.message ?? "Done.")
        );
        onDoneItem?.({
          id: `done:${item.id}:${Date.now()}`,
          title: `${item.title} — updated`,
          fixedAt: new Date().toISOString()
        });
        await onRefresh();
      } catch (err) {
        setStatus(humanizeTechnicalMessage(err instanceof Error ? err.message : "Failed."));
      } finally {
        setBusyId(null);
      }
    },
    [onDoneItem, onRefresh, onRepairSync, onShowAdvanced, report]
  );

  const verifyAll = useCallback(async () => {
    setBusyId("verify-all");
    setStatus(null);
    try {
      const res = await fetch("/api/admin/game-health/batch-repair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_domains" })
      });
      const json = (await res.json()) as {
        ok?: boolean;
        communicationQuality?: CommunicationQualityReport;
        learningScore?: number;
        error?: string;
      };
      if (!res.ok || !json.ok || !json.communicationQuality) {
        throw new Error(json.error ?? "Verify failed.");
      }
      const beforeScore =
        report?.domains.find((d) => d.domainId === "learning_quality")?.score ?? 0;
      const afterScore = json.learningScore ?? beforeScore;

      if (report) {
        const syncResult: RepairVerificationResult = {
          domainId: "learning_quality",
          domainScore: afterScore,
          beforeScore,
          communicationQuality: json.communicationQuality,
          communicationOverall: json.communicationQuality.overallHealthPercent,
          cardsStillFlagged: json.communicationQuality.cardsNeedingRegeneration.length
        };
        await onRepairSync(syncResult);
        setLastOutcome({
          problem: "Verify all fixed cards",
          changeMade: "Refreshed scores from latest card audit",
          status: afterScore >= beforeScore ? "complete" : "partial",
          domainLabel: "Learning quality",
          scoreBefore: beforeScore,
          scoreAfter: afterScore,
          cardChange: syncResult.cardChange
        });
      }
      setStatus("Scores refreshed from latest card audit.");
      await onRefresh();
    } catch (err) {
      setStatus(humanizeTechnicalMessage(err instanceof Error ? err.message : "Verify failed."));
    } finally {
      setBusyId(null);
    }
  }, [onRefresh, onRepairSync, report]);

  return (
    <section className={`${opsPanel} space-y-5`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-200/80">
            Repair queue
          </p>
          <p className="mt-1 text-[15px] font-semibold text-white/90">
            What to fix next — one action per row
          </p>
        </div>
        {domainStrip.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {domainStrip.map((d) => {
              const tier = tierFromScoreOrLabel(d.score, null);
              return (
                <span
                  key={d.domainId}
                  className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[12px] text-white/70"
                >
                  {d.label}{" "}
                  <span className="font-bold tabular-nums" style={{ color: tier.color }}>
                    {d.score}%
                  </span>
                </span>
              );
            })}
          </div>
        ) : null}
      </div>

      {todo.length === 0 && done.length === 0 ? (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-5 text-[15px] text-emerald-100">
          ✅ No repairs queued — platform looks healthy for demo.
        </p>
      ) : (
        <ul className="space-y-3">
          {todo.map((item) => (
            <QueueRow
              key={item.id}
              item={item}
              busy={busyId === item.id}
              onAction={(row) => void runBatch(row)}
            />
          ))}
          {done.slice(0, 6).map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] px-4 py-3 text-[14px] text-emerald-100"
            >
              ✅ {item.title}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
        <button
          type="button"
          disabled={busyId != null}
          className="min-h-[44px] rounded-xl border border-violet-400/35 bg-violet-500/15 px-4 py-2.5 text-[13px] font-semibold text-violet-100 touch-manipulation disabled:opacity-50"
          onClick={() => void verifyAll()}
        >
          {busyId === "verify-all" ? "Verifying…" : "Verify all fixed cards"}
        </button>
        {onShowAdvanced ? (
          <button
            type="button"
            className="min-h-[44px] rounded-xl border border-white/12 bg-white/5 px-4 py-2.5 text-[13px] font-semibold text-white/70 touch-manipulation"
            onClick={onShowAdvanced}
          >
            Card-level review (advanced)
          </button>
        ) : null}
      </div>

      {lastOutcome ? <RepairLastOutcomePanel outcome={lastOutcome} /> : null}

      {status ? (
        <p className="text-[13px] leading-relaxed text-white/65" role="status">
          {status}
        </p>
      ) : null}
    </section>
  );
}
