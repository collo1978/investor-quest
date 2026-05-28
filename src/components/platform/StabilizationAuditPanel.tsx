"use client";

import { useCallback, useMemo, useState } from "react";

import type {
  StabilizationAuditReport,
  StabilizationStatus
} from "@/lib/admin/runStabilizationAudit";

const STATUS_STYLE: Record<
  StabilizationStatus,
  { dot: string; border: string; label: string }
> = {
  green: {
    dot: "bg-emerald-400",
    border: "border-emerald-500/30",
    label: "OK"
  },
  yellow: {
    dot: "bg-amber-400",
    border: "border-amber-500/30",
    label: "Watch"
  },
  red: {
    dot: "bg-red-400",
    border: "border-red-500/30",
    label: "Fix"
  }
};

function StatusBadge({ status }: { status: StabilizationStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${s.border}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden />
      {s.label}
    </span>
  );
}

function CheckTable({
  title,
  rows
}: {
  title: string;
  rows: { id: string; label: string; status: StabilizationStatus; detail: string }[];
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-white/90">{title}</h2>
      <ul className="space-y-2">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-white/90">{row.label}</p>
              <p className="mt-1 text-[12px] text-white/55">{row.detail}</p>
            </div>
            <StatusBadge status={row.status} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function StabilizationAuditPanel() {
  const [report, setReport] = useState<StabilizationAuditReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardFilter, setCardFilter] = useState<StabilizationStatus | "all">("red");

  const runAudit = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stabilization/audit", {
        method: "POST",
        cache: "no-store"
      });
      const data = (await res.json()) as {
        ok: boolean;
        report?: StabilizationAuditReport;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.report) {
        throw new Error(data.error ?? "Audit failed");
      }
      setReport(data.report);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Audit failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredCards = useMemo(() => {
    if (!report) return [];
    return report.questCards.filter(
      (c) => cardFilter === "all" || c.status === cardFilter
    );
  }, [report, cardFilter]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 text-white">
      <header className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-300/80">
          Stabilization mode
        </p>
        <h1 className="font-[var(--font-grotesk)] text-2xl font-semibold tracking-tight">
          System audit
        </h1>
        <p className="max-w-2xl text-sm text-white/65">
          One view for copy failures, missing card fields, duplicate UI paths, routes,
          and mobile layout risks. Green / yellow / red only — no new player features.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void runAudit()}
          disabled={loading}
          className="rounded-xl border border-violet-400/40 bg-violet-500/15 px-4 py-2 text-sm font-semibold text-violet-100 transition hover:bg-violet-500/25 disabled:opacity-50"
        >
          {loading ? "Scanning…" : "Run system audit"}
        </button>
        <a
          href="/admin/copy-quality"
          className="text-xs text-white/50 underline hover:text-white/80"
        >
          Copy quality detail
        </a>
        <a
          href="/admin/game-health"
          className="text-xs text-white/50 underline hover:text-white/80"
        >
          Mission Control
        </a>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </p>
      ) : null}

      {report ? (
        <>
          <div className="grid gap-3 sm:grid-cols-4">
            {(["green", "yellow", "red"] as const).map((tier) => (
              <div
                key={tier}
                className={`rounded-xl border px-4 py-3 ${STATUS_STYLE[tier].border} bg-black/30`}
              >
                <StatusBadge status={tier} />
                <p className="mt-2 font-[var(--font-grotesk)] text-2xl font-bold tabular-nums">
                  {report.summary[tier]}
                </p>
              </div>
            ))}
            <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
              <p className="text-[10px] uppercase tracking-wider text-white/45">Copy avg</p>
              <p className="mt-2 font-[var(--font-grotesk)] text-2xl font-bold tabular-nums text-white/90">
                {Math.round(report.copyQuality.averageScore)}%
              </p>
              <p className="text-[11px] text-white/45">
                {report.copyQuality.failedCards} / {report.copyQuality.totalCards} failed
              </p>
            </div>
          </div>

          <CheckTable title="Duplicate components" rows={report.duplicateComponents} />
          <CheckTable title="Player routes" rows={report.routes} />
          <CheckTable title="Mobile overflow risks" rows={report.mobileOverflow} />

          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-white/90">Quest cards</h2>
              <label className="flex items-center gap-2 text-xs text-white/60">
                Show
                <select
                  value={cardFilter}
                  onChange={(e) =>
                    setCardFilter(e.target.value as StabilizationStatus | "all")
                  }
                  className="rounded-lg border border-white/15 bg-black/40 px-2 py-1 text-white"
                >
                  <option value="red">Red only</option>
                  <option value="yellow">Yellow</option>
                  <option value="green">Green</option>
                  <option value="all">All</option>
                </select>
              </label>
            </div>
            <ul className="max-h-[480px] space-y-2 overflow-y-auto pr-1">
              {filteredCards.slice(0, 120).map((row) => (
                <li
                  key={row.id}
                  className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-white/8 bg-black/25 px-3 py-2"
                >
                  <div className="min-w-0 text-[12px] text-white/75">
                    <span className="font-semibold text-white/90">
                      {row.ticker} · {row.pillarId} · {row.questSlug} · {row.cardId}
                    </span>
                    {row.issues.length > 0 ? (
                      <p className="mt-0.5 text-white/50">{row.issues.join(" · ")}</p>
                    ) : null}
                  </div>
                  <StatusBadge status={row.status} />
                </li>
              ))}
            </ul>
            {filteredCards.length > 120 ? (
              <p className="text-[11px] text-white/45">
                Showing first 120 of {filteredCards.length} cards.
              </p>
            ) : null}
          </section>
        </>
      ) : null}
    </div>
  );
}
