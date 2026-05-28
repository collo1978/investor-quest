"use client";

import { useCallback, useMemo, useState } from "react";

import type { CopyQualityAuditReport, CopyQualityCardRow } from "@/lib/quests/runCopyQualityAudit";

const PILLAR_LABELS: Record<string, string> = {
  business: "Business",
  financials: "Financials",
  forces: "Forces",
  management: "Management"
};

export function CopyQualityAuditPanel() {
  const [report, setReport] = useState<CopyQualityAuditReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"failed" | "all">("failed");
  const [pillarFilter, setPillarFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const runAudit = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/copy-quality/audit", {
        method: "POST",
        cache: "no-store"
      });
      const data = (await res.json()) as {
        ok: boolean;
        report?: CopyQualityAuditReport;
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

  const rows = useMemo(() => {
    if (!report) return [];
    return report.rows.filter((r) => {
      if (filter === "failed" && (r.pass || r.placeholder)) return false;
      if (pillarFilter !== "all" && r.pillarId !== pillarFilter) return false;
      return true;
    });
  }, [report, filter, pillarFilter]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 text-white">
      <header className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-300/80">
          Global copy system
        </p>
        <h1 className="font-[var(--font-grotesk)] text-2xl font-semibold tracking-tight">
          Copy Quality Audit
        </h1>
        <p className="max-w-2xl text-sm text-white/65">
          Scans every playable quest card, quiz explain, and mastery line against
          global rules (no em dashes, no cinematic filler, no duplicate sections).
          Suggested answers use the auto-formatter — not a full AI rewrite.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void runAudit()}
          disabled={loading}
          className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/20 disabled:opacity-50"
        >
          {loading ? "Scanning…" : "Run full audit"}
        </button>
        <label className="flex items-center gap-2 text-xs text-white/60">
          Show
          <select
            className="rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-white"
            value={filter}
            onChange={(e) => setFilter(e.target.value as "failed" | "all")}
          >
            <option value="failed">Failed only</option>
            <option value="all">All rows</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs text-white/60">
          Pillar
          <select
            className="rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-white"
            value={pillarFilter}
            onChange={(e) => setPillarFilter(e.target.value)}
          >
            <option value="all">All</option>
            {Object.entries(PILLAR_LABELS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {report ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Rows scanned" value={String(report.totalCards)} />
          <Stat label="Failed" value={String(report.failedCards)} />
          <Stat label="Avg score" value={`${report.averageScore}%`} />
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.04] text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">
            <tr>
              <th className="px-3 py-2">Score</th>
              <th className="px-3 py-2">Location</th>
              <th className="px-3 py-2">Question</th>
              <th className="px-3 py-2">Issues</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-white/50">
                  {report
                    ? "No rows match this filter."
                    : "Run an audit to see results."}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <CopyQualityRow
                  key={row.id}
                  row={row}
                  expanded={expandedId === row.id}
                  onToggle={() =>
                    setExpandedId((id) => (id === row.id ? null : row.id))
                  }
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function CopyQualityRow({
  row,
  expanded,
  onToggle
}: {
  row: CopyQualityCardRow;
  expanded: boolean;
  onToggle: () => void;
}) {
  const scoreColor =
    row.score >= 80
      ? "text-emerald-300"
      : row.score >= 60
        ? "text-amber-300"
        : "text-red-300";

  return (
    <>
      <tr className="border-t border-white/[0.06] hover:bg-white/[0.02]">
        <td className={`px-3 py-2 font-mono text-xs ${scoreColor}`}>
          {row.placeholder ? "—" : row.score}
        </td>
        <td className="px-3 py-2 text-xs text-white/70">
          <div className="font-medium text-white/90">{row.ticker}</div>
          <div>
            {PILLAR_LABELS[row.pillarId] ?? row.pillarId} · {row.questTitle} ·{" "}
            {row.cardId}
          </div>
          <div className="text-white/45">{row.source}</div>
        </td>
        <td className="max-w-[14rem] px-3 py-2 text-xs text-white/75">
          {row.question.slice(0, 120)}
          {row.question.length > 120 ? "…" : ""}
        </td>
        <td className="px-3 py-2 text-xs text-white/60">
          {row.placeholder
            ? "Placeholder"
            : row.issues.length > 0
              ? row.issues.slice(0, 2).join("; ")
              : "—"}
          {row.issues.length > 2 ? ` (+${row.issues.length - 2})` : ""}
        </td>
        <td className="px-3 py-2 text-right">
          <button
            type="button"
            onClick={onToggle}
            className="text-xs font-medium text-amber-300/90 hover:text-amber-200"
          >
            {expanded ? "Hide" : "Details"}
          </button>
        </td>
      </tr>
      {expanded ? (
        <tr className="border-t border-white/[0.04] bg-black/30">
          <td colSpan={5} className="space-y-4 px-4 py-4">
            <CopyBlock title="Current answer" body={row.currentAnswer} />
            {row.suggestedAnswer &&
            row.suggestedAnswer.trim() !== row.currentAnswer.trim() ? (
              <CopyBlock title="Suggested (auto-cleaned)" body={row.suggestedAnswer} accent />
            ) : null}
            {row.issues.length > 0 ? (
              <ul className="list-inside list-disc text-xs text-white/55">
                {row.issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            ) : null}
          </td>
        </tr>
      ) : null}
    </>
  );
}

function CopyBlock({
  title,
  body,
  accent
}: {
  title: string;
  body: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p
        className={`mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
          accent ? "text-emerald-300/80" : "text-white/45"
        }`}
      >
        {title}
      </p>
      <pre
        className={`whitespace-pre-wrap rounded-lg border px-3 py-2 text-xs leading-relaxed ${
          accent
            ? "border-emerald-400/25 bg-emerald-400/5 text-white/85"
            : "border-white/10 bg-white/[0.03] text-white/75"
        }`}
      >
        {body || "(empty)"}
      </pre>
    </div>
  );
}
