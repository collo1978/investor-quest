"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { OpsPageShell } from "@/components/operations/OpsPageShell";
import { OpsTouchButton } from "@/components/operations/OpsTouchButton";
import { opsCheckbox, opsPanel, opsSelect } from "@/components/operations/opsTheme";
import { COMPANIES } from "@/data/companies";
import { pillarById, type PillarId } from "@/data/pillars";
import { humanizeTechnicalMessage } from "@/lib/operations/layman";

type PreviewPillar = {
  pillarId: PillarId;
  allQuestSlugs: string[];
  selectedQuestSlugs: string[];
  cardCount: number;
};

type RegenerateResult = {
  ticker: string;
  extractRan?: boolean;
  totalGenerated?: number;
  totalSkipped?: number;
  cachedSkipped?: number;
  fastMode?: boolean;
  totalErrors?: number;
  pillars?: Array<{
    pillarId: PillarId;
    questSlugs: string[];
    generated: number;
    skipped: number;
    errors: Array<{ questSlug: string; cardId: string; message: string }>;
  }>;
};

const PILLARS: PillarId[] = ["business", "financials", "management", "forces"];

export function IslandQuestRegenerationPanel() {
  const [ticker, setTicker] = useState("NVDA");
  const [pillarId, setPillarId] = useState<PillarId | "all">("all");
  const [runExtract, setRunExtract] = useState(false);
  const [fastMode, setFastMode] = useState(true);
  const [forceRegenerate, setForceRegenerate] = useState(false);
  const [unlockedOnly, setUnlockedOnly] = useState(false);
  const [freshPlayerOnly, setFreshPlayerOnly] = useState(false);
  const [allCompanies, setAllCompanies] = useState(false);
  const [preview, setPreview] = useState<PreviewPillar[] | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<RegenerateResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const previewMode = useMemo(() => {
    if (freshPlayerOnly) return "fresh";
    if (unlockedOnly) return "unlocked";
    return "all";
  }, [freshPlayerOnly, unlockedOnly]);

  const loadPreview = useCallback(async () => {
    if (allCompanies) {
      setPreview(null);
      return;
    }
    setPreviewLoading(true);
    try {
      const qs = new URLSearchParams({
        ticker,
        mode: previewMode
      });
      if (pillarId !== "all") qs.set("pillarId", pillarId);
      const res = await fetch(
        `/api/admin/quest-generation/preview-slugs?${qs}`,
        { cache: "no-store" }
      );
      const data = (await res.json()) as {
        pillars?: PreviewPillar[];
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Preview failed");
      setPreview(data.pillars ?? null);
    } catch (err) {
      setPreview(null);
      setLog(humanizeTechnicalMessage(err instanceof Error ? err.message : "Preview failed."));
    } finally {
      setPreviewLoading(false);
    }
  }, [allCompanies, ticker, pillarId, previewMode]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void loadPreview();
    }, 300);
    return () => window.clearTimeout(t);
  }, [loadPreview]);

  const runSnapshotCard1 = async () => {
    setRunning(true);
    setLog(null);
    setLastResult(null);
    try {
      const res = await fetch("/api/admin/quest-generation/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker,
          pillarId: "business",
          questSlug: "snapshot",
          cardIds: ["card-1"],
          extract: runExtract,
          fast: fastMode,
          force: forceRegenerate
        })
      });
      const data = (await res.json()) as RegenerateResult & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not regenerate snapshot.");
      setLastResult(data);
      const company = COMPANIES.find((c) => c.ticker === ticker)?.name ?? ticker;
      setLog(
        data.totalErrors
          ? `${company} snapshot still had problems. Check the dev server log.`
          : `${company} Business Snapshot card was refreshed. Ask players to reload the quest.`
      );
    } catch (err) {
      setLog(humanizeTechnicalMessage(err instanceof Error ? err.message : "Regeneration failed."));
    } finally {
      setRunning(false);
    }
  };

  const runRegenerate = async (scope: "island" | "company" | "batch") => {
    setRunning(true);
    setLog(null);
    setLastResult(null);
    try {
      const body: Record<string, unknown> = {
        extract: runExtract,
        fast: fastMode,
        force: forceRegenerate,
        unlockedOnly,
        freshPlayerOnly
      };

      if (scope === "batch" || allCompanies) {
        body.allCompanies = true;
        if (pillarId !== "all") body.pillarId = pillarId;
      } else {
        body.ticker = ticker;
        if (scope === "island" && pillarId !== "all") {
          body.pillarId = pillarId;
        }
      }

      const res = await fetch("/api/admin/quest-generation/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = (await res.json()) as RegenerateResult & {
        error?: string;
        detail?: string;
        results?: RegenerateResult[];
      };

      if (!res.ok) {
        throw new Error(data.error ?? data.detail ?? `Failed (${res.status})`);
      }

      if (data.results) {
        const totalErr = data.results.reduce(
          (n, r) => n + (r.totalErrors ?? 0),
          0
        );
        setLog(
          totalErr
            ? `Batch finished with ${totalErr} problem(s). Open Mission Control for details.`
            : "All companies were refreshed. Players may need to reload quest pages."
        );
      } else {
        setLastResult(data);
        const company = COMPANIES.find((c) => c.ticker === data.ticker)?.name ?? data.ticker;
        setLog(
          data.totalErrors
            ? `${company} had ${data.totalErrors} card(s) that failed.`
            : `${company} quest answers were updated successfully.`
        );
      }
    } catch (err) {
      setLog(humanizeTechnicalMessage(err instanceof Error ? err.message : "Regeneration failed."));
    } finally {
      setRunning(false);
    }
  };

  const totalPreviewCards = preview?.reduce((n, p) => n + p.cardCount, 0) ?? 0;
  const companyName = COMPANIES.find((c) => c.ticker === ticker)?.name ?? ticker;

  return (
    <OpsPageShell
      title="Regenerate answers"
      subtitle="Refresh AI quest explanations after prompt or filing changes. Best for quick fixes from your phone."
    >
      <section className={opsPanel}>
        <div className="grid gap-4">
          <label className="grid gap-2 text-[13px] text-white/55">
            Company
            <select
              className={opsSelect}
              value={ticker}
              disabled={allCompanies || running}
              onChange={(e) => setTicker(e.target.value)}
            >
              {COMPANIES.map((c) => (
                <option key={c.id} value={c.ticker}>
                  {c.ticker} — {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-[13px] text-white/55">
            Island
            <select
              className={opsSelect}
              value={pillarId}
              disabled={running}
              onChange={(e) =>
                setPillarId(e.target.value as PillarId | "all")
              }
            >
              <option value="all">All four islands</option>
              {PILLARS.map((p) => (
                <option key={p} value={p}>
                  {pillarById(p).title}
                </option>
              ))}
            </select>
          </label>
        </div>

        {!allCompanies && (
          <p className="mt-4 text-[14px] text-white/55">
            {previewLoading
              ? "Counting quest cards…"
              : preview
                ? `${totalPreviewCards} cards ready for ${companyName}`
                : "Select a company to preview scope."}
          </p>
        )}

        <div className="mt-5 space-y-3">
          <OpsTouchButton
            variant="primary"
            disabled={running || allCompanies}
            onClick={() => void runSnapshotCard1()}
            description={`Fastest fix — ${companyName} Business Snapshot, first card only`}
          >
            {running ? "Generating…" : "Regenerate snapshot"}
          </OpsTouchButton>

          <OpsTouchButton
            variant="secondary"
            disabled={running}
            onClick={() => void runRegenerate("island")}
            description="All quests on the selected island"
          >
            Regenerate island
          </OpsTouchButton>

          <OpsTouchButton
            variant="secondary"
            disabled={running || pillarId !== "all"}
            onClick={() => void runRegenerate("company")}
            description="All four islands for this company"
          >
            Regenerate whole company
          </OpsTouchButton>
        </div>

        <button
          type="button"
          className="mt-4 flex w-full min-h-[44px] items-center justify-between text-[13px] font-semibold text-white/60 touch-manipulation"
          onClick={() => setShowAdvanced((v) => !v)}
        >
          More options
          <span>{showAdvanced ? "▲" : "▼"}</span>
        </button>

        {showAdvanced ? (
          <div className="mt-3 flex flex-col gap-3 text-[15px] text-white/80">
            <label className="flex min-h-[48px] cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                className={opsCheckbox}
                checked={fastMode}
                disabled={running}
                onChange={(e) => setFastMode(e.target.checked)}
              />
              Fast mode (quicker AI, fewer rewrites)
            </label>
            <label className="flex min-h-[48px] cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                className={opsCheckbox}
                checked={forceRegenerate}
                disabled={running}
                onChange={(e) => setForceRegenerate(e.target.checked)}
              />
              Force new answers (ignore saved cache)
            </label>
            <label className="flex min-h-[48px] cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                className={opsCheckbox}
                checked={runExtract}
                disabled={running}
                onChange={(e) => setRunExtract(e.target.checked)}
              />
              Pull SEC filing first if missing
            </label>
            <label className="flex min-h-[48px] cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                className={opsCheckbox}
                checked={allCompanies}
                disabled={running}
                onChange={(e) => setAllCompanies(e.target.checked)}
              />
              All {COMPANIES.length} companies
            </label>
            {allCompanies ? (
              <OpsTouchButton
                variant="secondary"
                disabled={running}
                onClick={() => void runRegenerate("batch")}
                description="Long-running — use on Wi‑Fi"
              >
                Batch regenerate everyone
              </OpsTouchButton>
            ) : null}
          </div>
        ) : null}

        {log ? (
          <p
            className="mt-4 rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-[15px] leading-relaxed text-white/85"
            role="status"
          >
            {log}
          </p>
        ) : null}

        {lastResult?.pillars?.length ? (
          <ul className="mt-4 space-y-2 text-[13px] text-white/60">
            {lastResult.pillars.map((p) => (
              <li
                key={p.pillarId}
                className="rounded-lg border border-white/8 bg-black/20 px-3 py-2"
              >
                {pillarById(p.pillarId).title}: {p.generated} updated
                {p.errors.length > 0 ? `, ${p.errors.length} failed` : ""}
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </OpsPageShell>
  );
}
