"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { OpsFixActionList } from "@/components/operations/OpsFixActionList";
import { OpsQuickNav } from "@/components/operations/OpsQuickNav";
import {
  humanizeTechnicalMessage,
  issueSeverityLabel
} from "@/lib/operations/layman";
import type { FixActionId, GameHealthIssueRecord } from "@/lib/gameHealth/types";

export function GameHealthMobileFix({ issueId }: { issueId: string }) {
  const [issue, setIssue] = useState<GameHealthIssueRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<FixActionId | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/game-health/issues/${issueId}`, {
      cache: "no-store"
    });
    const json = (await res.json()) as { issue?: GameHealthIssueRecord; error?: string };
    if (!res.ok) throw new Error(json.error ?? "Issue not found.");
    const loaded = json.issue ?? null;
    setIssue(loaded);
    setResolved(loaded?.status === "resolved");
  }, [issueId]);

  useEffect(() => {
    void (async () => {
      try {
        await load();
      } catch (err) {
        setResult(humanizeTechnicalMessage(err instanceof Error ? err.message : "Could not load issue."));
      } finally {
        setLoading(false);
      }
    })();
  }, [load]);

  const runFix = async (action: FixActionId) => {
    setBusy(action);
    setResult(null);
    try {
      const res = await fetch(`/api/admin/game-health/issues/${issueId}/fix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      const json = (await res.json()) as {
        ok?: boolean;
        laymanMessage?: string;
        message?: string;
      };
      const msg =
        json.laymanMessage ??
        (json.message ? humanizeTechnicalMessage(json.message) : null) ??
        (json.ok ? "Done." : "That fix did not work. Try again.");
      setResult(msg);
      if (json.ok) {
        await load();
        if (action === "mark_resolved") setResolved(true);
      }
    } catch (err) {
      setResult(humanizeTechnicalMessage(err instanceof Error ? err.message : "Fix failed."));
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#070712] px-4 text-[15px] text-white/60">
        Opening fix panel…
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-[100dvh] bg-[#070712] px-5 py-10 text-white">
        <p className="text-[17px]">{result ?? "This fix link may be outdated."}</p>
        <Link
          href="/admin/game-health"
          className="mt-6 inline-flex min-h-[48px] items-center text-base font-semibold text-[var(--partner-primary)]"
        >
          ← Mission Control
        </Link>
      </div>
    );
  }

  const severityClass =
    issue.severity === "critical" ? "text-red-400" : "text-amber-300";

  return (
    <div className="min-h-[100dvh] bg-[#070712] px-4 pb-12 pt-5 text-white sm:px-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-violet-300/80">
        Investor Quest Alert
      </p>

      <div className="mt-3">
        <OpsQuickNav />
      </div>

      {resolved ? (
        <div className="mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4">
          <p className="text-[17px] font-semibold text-emerald-200">Marked as fixed</p>
          <p className="mt-1 text-[14px] text-emerald-100/80">
            Run another health check on Mission Control to confirm all clear.
          </p>
        </div>
      ) : null}

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <p className={`text-[11px] font-bold uppercase tracking-wider ${severityClass}`}>
          {issueSeverityLabel(issue.severity)}
        </p>
        <h1 className="mt-2 font-[var(--font-grotesk)] text-[22px] leading-snug">
          {issue.problemPlain}
        </h1>

        <div className="mt-5 space-y-4 text-[15px] leading-relaxed">
          {(issue.companyName || issue.questSlug) && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                Affected
              </p>
              <p className="mt-1 text-white/90">
                {issue.companyName ?? issue.companyTicker}
                {issue.questSlug ? ` · ${issue.questSlug}` : ""}
                {issue.cardId ? ` · ${issue.cardId}` : ""}
              </p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
              What users may see
            </p>
            <p className="mt-1 text-white/85">{issue.whatUsersSee}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
              Suggested fix
            </p>
            <p className="mt-1 text-white/85">{issue.suggestedFix}</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-white/45">
          Tap a fix
        </p>
        <OpsFixActionList
          recommendedAction={issue.fixAction}
          busy={busy}
          onRun={(action) => void runFix(action)}
        />
      </div>

      {result ? (
        <p
          className={`mt-5 rounded-xl border px-4 py-3 text-[15px] leading-relaxed ${
            result.toLowerCase().includes("fail") || result.includes("could not")
              ? "border-amber-500/30 bg-amber-500/10 text-amber-100"
              : "border-white/10 bg-black/40 text-white/90"
          }`}
          role="status"
        >
          {result}
        </p>
      ) : null}

      <Link
        href="/admin/game-health"
        className="mt-8 flex min-h-[48px] items-center justify-center text-base font-semibold text-[var(--partner-primary)] touch-manipulation"
      >
        ← Mission Control
      </Link>
    </div>
  );
}
