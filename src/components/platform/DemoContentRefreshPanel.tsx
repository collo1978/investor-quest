"use client";

import { useCallback, useEffect, useState } from "react";

import { OpsTouchButton } from "@/components/operations/OpsTouchButton";
import { opsPanel } from "@/components/operations/opsTheme";
import type { DemoContentReadiness } from "@/lib/demoContentRefresh/verifyDemoContent";
import type { DemoRefreshRunResult } from "@/lib/demoContentRefresh/runDemoRefreshJob";

type DemoRefreshJob = {
  id: string;
  ticker: string;
  companyName: string;
  pillarId: string;
  questSlug: string;
  label: string;
};

type JobUiStatus = "pending" | "running" | "done" | "warn" | "error";

type JobUiState = {
  job: DemoRefreshJob;
  status: JobUiStatus;
  message?: string;
};

export function DemoContentRefreshPanel({
  onRefreshMissionControl
}: {
  onRefreshMissionControl?: () => void;
}) {
  const [jobs, setJobs] = useState<JobUiState[]>([]);
  const [readiness, setReadiness] = useState<DemoContentReadiness | null>(null);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLabel, setCurrentLabel] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/admin/demo-content-refresh", {
        cache: "no-store"
      });
      const json = (await res.json()) as {
        plan?: DemoRefreshJob[];
        readiness?: DemoContentReadiness;
        error?: string;
      };
      if (!res.ok) throw new Error(json.error ?? "Could not load demo refresh status.");
      const plan = json.plan ?? [];
      setReadiness(json.readiness ?? null);
      setJobs((prev) => {
        const statusById = new Map(prev.map((p) => [p.job.id, p.status]));
        return plan.map((job) => {
          const quest = json.readiness?.quests.find((q) => q.jobId === job.id);
          let status: JobUiStatus = statusById.get(job.id) ?? "pending";
          if (!running && quest?.ok) status = "done";
          else if (!running && quest && !quest.ok) status = "warn";
          return { job, status };
        });
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed.");
    } finally {
      setLoading(false);
    }
  }, [running]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const runFullRefresh = async () => {
    if (jobs.length === 0) return;
    setRunning(true);
    setError(null);

    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i].job;
      setCurrentLabel(job.label);
      setJobs((prev) =>
        prev.map((row, idx) =>
          idx === i
            ? { ...row, status: "running", message: "Regenerating…" }
            : row
        )
      );

      try {
        const res = await fetch("/api/admin/demo-content-refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId: job.id })
        });
        const json = (await res.json()) as {
          result?: DemoRefreshRunResult;
          readiness?: DemoContentReadiness;
          error?: string;
        };
        if (!res.ok) throw new Error(json.error ?? "Refresh step failed.");

        const result = json.result!;
        if (json.readiness) setReadiness(json.readiness);

        const ok =
          result.verification.ok && result.generationErrors.length === 0;
        setJobs((prev) =>
          prev.map((row) =>
            row.job.id === job.id
              ? {
                  ...row,
                  status: ok ? "done" : "warn",
                  message: ok
                    ? `Updated ${result.generated} card(s)`
                    : result.generationErrors[0]?.message ??
                      "Some cards need another pass"
                }
              : row
          )
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed.";
        setJobs((prev) =>
          prev.map((row) =>
            row.job.id === job.id
              ? { ...row, status: "error", message: msg }
              : row
          )
        );
      }
    }

    setCurrentLabel(null);
    setRunning(false);
    onRefreshMissionControl?.();
    await loadStatus();
  };

  const doneCount = jobs.filter((j) => j.status === "done").length;
  const progressPct =
    jobs.length > 0 ? Math.round((doneCount / jobs.length) * 100) : 0;

  return (
    <section className={opsPanel}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white/80">
            Demo content refresh
          </h2>
          <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-white/50">
            Refreshes NVDA, AAPL, and NKE priority quests with human-first copy
            (real life → pain → consequence → analogy → plain explanation).
          </p>
        </div>
        {readiness?.ready ? (
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-[12px] font-semibold text-emerald-300">
            Demo Content Ready
          </span>
        ) : (
          <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-3 py-1 text-[12px] font-semibold text-amber-200/90">
            Needs refresh
          </span>
        )}
      </div>

      {readiness ? (
        <p className="mt-3 text-[13px] text-white/55">
          {readiness.readyCards}/{readiness.totalCards} cards pass human-first
          checks · {readiness.readyJobs}/{readiness.totalJobs} quests ready
        </p>
      ) : null}

      {running ? (
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[var(--partner-primary)] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="mt-2 text-[12px] text-white/45">
            {currentLabel
              ? `Working on ${currentLabel}…`
              : `Progress ${doneCount}/${jobs.length}`}
          </p>
        </div>
      ) : null}

      <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
        {loading ? (
          <li className="text-[13px] text-white/45">Loading plan…</li>
        ) : (
          jobs.map((row) => (
            <li
              key={row.job.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-white/8 bg-black/25 px-3 py-2 text-[13px]"
            >
              <span className="text-white/80">{row.job.label}</span>
              <StatusBadge status={row.status} />
            </li>
          ))
        )}
      </ul>

      {readiness && readiness.technicalFlags.length > 0 && !readiness.ready ? (
        <details className="mt-3 text-[12px] text-amber-200/80">
          <summary className="cursor-pointer touch-manipulation">
            {readiness.technicalFlags.length} card(s) still flagged
          </summary>
          <ul className="mt-2 space-y-1 text-white/50">
            {readiness.technicalFlags.slice(0, 8).map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </details>
      ) : null}

      {error ? (
        <p className="mt-3 text-[13px] text-red-300/90">{error}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <OpsTouchButton
          variant="primary"
          disabled={running || loading}
          onClick={() => void runFullRefresh()}
        >
          {running ? "Refreshing demo content…" : "Refresh demo content"}
        </OpsTouchButton>
        <OpsTouchButton
          variant="secondary"
          disabled={running}
          onClick={() => void loadStatus()}
        >
          Re-check status
        </OpsTouchButton>
      </div>

      <p className="mt-3 text-[11px] text-white/35">
        Uses force regenerate. Failures are logged as open issues in Mission
        Control below.
      </p>
    </section>
  );
}

function StatusBadge({ status }: { status: JobUiStatus }) {
  const styles: Record<JobUiStatus, string> = {
    pending: "text-white/40",
    running: "text-[var(--partner-primary)]",
    done: "text-emerald-400",
    warn: "text-amber-300",
    error: "text-red-400"
  };
  const labels: Record<JobUiStatus, string> = {
    pending: "Pending",
    running: "Running…",
    done: "Ready",
    warn: "Review",
    error: "Failed"
  };
  return (
    <span className={`shrink-0 text-[11px] font-semibold uppercase ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
