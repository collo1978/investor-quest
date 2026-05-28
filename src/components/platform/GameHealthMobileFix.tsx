"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { OpsInlineIssueRepair } from "@/components/operations/OpsInlineIssueRepair";
import { OpsQuickNav } from "@/components/operations/OpsQuickNav";
import { humanizeTechnicalMessage } from "@/lib/operations/layman";
import type { GameHealthIssueRecord } from "@/lib/gameHealth/types";

export function GameHealthMobileFix({ issueId }: { issueId: string }) {
  const [issue, setIssue] = useState<GameHealthIssueRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/game-health/issues/${issueId}`, {
      cache: "no-store"
    });
    const json = (await res.json()) as { issue?: GameHealthIssueRecord; error?: string };
    if (!res.ok) throw new Error(json.error ?? "Issue not found.");
    setIssue(json.issue ?? null);
  }, [issueId]);

  useEffect(() => {
    void (async () => {
      try {
        await load();
      } catch (err) {
        setError(humanizeTechnicalMessage(err instanceof Error ? err.message : "Could not load issue."));
      } finally {
        setLoading(false);
      }
    })();
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#070712] px-4 text-[15px] text-white/60">
        Opening repair guide…
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-[100dvh] bg-[#070712] px-5 py-10 text-white">
        <p className="text-[17px]">{error ?? "This fix link may be outdated."}</p>
        <Link
          href="/admin/game-health"
          className="mt-6 inline-flex min-h-[48px] items-center text-base font-semibold text-[var(--partner-primary)]"
        >
          ← Mission Control
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#070712] px-4 pb-12 pt-5 text-white sm:px-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-violet-300/80">
        Mission Control · Repair guide
      </p>

      <div className="mt-3">
        <OpsQuickNav />
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <OpsInlineIssueRepair issue={issue} onIssueUpdated={load} />
      </div>

      <Link
        href="/admin/game-health"
        className="mt-8 flex min-h-[48px] items-center justify-center text-base font-semibold text-[var(--partner-primary)] touch-manipulation"
      >
        ← Back to Mission Control
      </Link>
    </div>
  );
}
