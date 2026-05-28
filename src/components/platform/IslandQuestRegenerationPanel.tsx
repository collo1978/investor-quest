"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { OpsPageShell } from "@/components/operations/OpsPageShell";
import { OpsTouchButton } from "@/components/operations/OpsTouchButton";
import { opsCheckbox, opsPanel, opsSelect } from "@/components/operations/opsTheme";
import { COMPANIES } from "@/data/companies";
import { pillarById, type PillarId } from "@/data/pillars";
import type { QuestCardContentSource } from "@/lib/quests/questCardContentSource";
import { humanizeTechnicalMessage } from "@/lib/operations/layman";

type PreviewPillar = {
  pillarId: PillarId;
  allQuestSlugs: string[];
  selectedQuestSlugs: string[];
  cardCount: number;
};

type CardSourceResponse = {
  playerSees: QuestCardContentSource;
  display: {
    source: QuestCardContentSource;
    sourceLabel: string;
    sourceDetail: string;
    databaseSuppressed: boolean;
    curatedPreview: string | null;
    databasePreview: string | null;
  };
  playerAnswerPreview: string | null;
  priority: string[];
  error?: string;
};

type RegenerateResult = {
  ticker: string;
  extractRan?: boolean;
  totalGenerated?: number;
  totalSkipped?: number;
  cachedSkipped?: number;
  curatedSkipped?: number;
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

const SOURCE_BADGE: Record<QuestCardContentSource, string> = {
  curated_override: "Curated code (players see this)",
  database_generated: "Database AI copy",
  template_fallback: "Template placeholder",
  generating: "Generating…"
};

export function IslandQuestRegenerationPanel() {
  const [ticker, setTicker] = useState("AAPL");
  const [pillarId, setPillarId] = useState<PillarId | "all">("business");
  const [inspectSlug, setInspectSlug] = useState("snapshot");
  const [inspectCardId, setInspectCardId] = useState("card-1");
  const [runExtract, setRunExtract] = useState(false);
  const [fastMode, setFastMode] = useState(false);
  const [forceRegenerate, setForceRegenerate] = useState(true);
  const [unlockedOnly, setUnlockedOnly] = useState(false);
  const [freshPlayerOnly, setFreshPlayerOnly] = useState(false);
  const [allCompanies, setAllCompanies] = useState(false);
  const [preview, setPreview] = useState<PreviewPillar[] | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [cardSource, setCardSource] = useState<CardSourceResponse | null>(null);
  const [cardSourceLoading, setCardSourceLoading] = useState(false);
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
      setLog(
        humanizeTechnicalMessage(err instanceof Error ? err.message : "Preview failed.")
      );
    } finally {
      setPreviewLoading(false);
    }
  }, [allCompanies, ticker, pillarId, previewMode]);

  const loadCardSource = useCallback(async () => {
    if (allCompanies) {
      setCardSource(null);
      return;
    }
    setCardSourceLoading(true);
    try {
      const qs = new URLSearchParams({
        ticker,
        pillar: pillarId === "all" ? "business" : pillarId,
        slug: inspectSlug,
        cardId: inspectCardId
      });
      const res = await fetch(
        `/api/admin/quest-generation/card-source?${qs}`,
        { cache: "no-store" }
      );
      const data = (await res.json()) as CardSourceResponse;
      if (!res.ok) throw new Error(data.error ?? "Could not load card source.");
      setCardSource(data);
    } catch (err) {
      setCardSource(null);
    } finally {
      setCardSourceLoading(false);
    }
  }, [allCompanies, ticker, pillarId, inspectSlug, inspectCardId]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void loadPreview();
    }, 300);
    return () => window.clearTimeout(t);
  }, [loadPreview]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void loadCardSource();
    }, 300);
    return () => window.clearTimeout(t);
  }, [loadCardSource]);

  const runRegenerateRequest = async (body: Record<string, unknown>) => {
    const res = await fetch("/api/admin/quest-generation/regenerate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        extract: runExtract,
        fast: fastMode,
        force: forceRegenerate,
        unlockedOnly,
        freshPlayerOnly,
        ...body
      })
    });
    const data = (await res.json()) as RegenerateResult & {
      error?: string;
      detail?: string;
      results?: RegenerateResult[];
    };
    if (!res.ok) {
      throw new Error(data.error ?? data.detail ?? `Failed (${res.status})`);
    }
    return data;
  };

  const runSmartFriendRegenerate = async () => {
    setRunning(true);
    setLog(null);
    setLastResult(null);
    try {
      const data = await runRegenerateRequest({
        ticker,
        pillarId: pillarId === "all" ? "business" : pillarId,
        questSlug: inspectSlug,
        cardIds: [inspectCardId]
      });
      setLastResult(data);
      const company = COMPANIES.find((c) => c.ticker === ticker)?.name ?? ticker;
      const curated = data.curatedSkipped ?? 0;
      if (curated > 0) {
        setLog(
          `${company}: ${curated} card(s) use curated code — players still see hand-authored copy. DB was updated only if you forced regeneration. Edit src/data/quests/content/${ticker.toLowerCase()}.ts to change visible Apple text.`
        );
      } else if (data.totalErrors) {
        setLog(`${company}: ${data.totalErrors} card(s) failed. Check the dev server log.`);
      } else {
        setLog(
          `${company} quest copy regenerated with smart-friend tone. Ask players to hard-refresh the quest page (Ctrl+Shift+R).`
        );
      }
      void loadCardSource();
    } catch (err) {
      setLog(
        humanizeTechnicalMessage(err instanceof Error ? err.message : "Regeneration failed.")
      );
    } finally {
      setRunning(false);
    }
  };

  const runAllSixDemoCompanies = async () => {
    setRunning(true);
    setLog(null);
    setLastResult(null);
    try {
      const res = await fetch("/api/admin/demo-content-refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "regenerate-all-demo",
          runExtractIfMissing: runExtract
        })
      });
      const data = (await res.json()) as {
        refresh?: {
          companies: Array<{
            ticker: string;
            companyName: string;
            playerVisibleSource: string;
            totalGenerated: number;
            totalErrors: number;
            ok: boolean;
          }>;
          summary: {
            totalCardsGenerated: number;
            totalErrors: number;
          };
          durationMs: number;
        };
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Demo refresh failed.");
      const refresh = data.refresh;
      if (!refresh) throw new Error("No refresh report returned.");
      const lines = refresh.companies.map((c) => {
        const src =
          c.playerVisibleSource === "curated_override"
            ? "screen: curated file"
            : "screen: database";
        return `${c.ticker} (${c.companyName}): ${c.totalGenerated} DB cards, ${c.totalErrors} errors — ${src}`;
      });
      setLog(
        refresh.summary.totalErrors
          ? `Finished with ${refresh.summary.totalErrors} error(s).\n${lines.join("\n")}`
          : `All 6 demo companies refreshed (${refresh.summary.totalCardsGenerated} cards, ${Math.round(refresh.durationMs / 1000)}s).\n${lines.join("\n")}\n\nApple still shows src/data/quests/content/apple.ts on screen; other five show new DB copy. Hard-refresh quest pages.`
      );
    } catch (err) {
      setLog(
        humanizeTechnicalMessage(err instanceof Error ? err.message : "Demo refresh failed.")
      );
    } finally {
      setRunning(false);
    }
  };

  const runRegenerate = async (scope: "island" | "company" | "batch") => {
    setRunning(true);
    setLog(null);
    setLastResult(null);
    try {
      const body: Record<string, unknown> = { force: forceRegenerate };

      if (scope === "batch" || allCompanies) {
        body.allCompanies = true;
        if (pillarId !== "all") body.pillarId = pillarId;
      } else {
        body.ticker = ticker;
        if (scope === "island" && pillarId !== "all") {
          body.pillarId = pillarId;
        }
      }

      const data = await runRegenerateRequest(body);

      if (data.results) {
        const totalErr = data.results.reduce(
          (n, r) => n + (r.totalErrors ?? 0),
          0
        );
        setLog(
          totalErr
            ? `Batch finished with ${totalErr} problem(s). Open Mission Control for details.`
            : "All companies refreshed. Players may need to hard-refresh quest pages."
        );
      } else {
        setLastResult(data);
        const company =
          COMPANIES.find((c) => c.ticker === data.ticker)?.name ?? data.ticker;
        const curated = data.curatedSkipped ?? 0;
        setLog(
          data.totalErrors
            ? `${company} had ${data.totalErrors} card(s) that failed.`
            : curated > 0
              ? `${company}: updated ${data.totalGenerated ?? 0} DB card(s); ${curated} curated card(s) unchanged on screen (edit content/*.ts to change those).`
              : `${company} quest answers updated. Hard-refresh player quest pages.`
        );
      }
      void loadCardSource();
    } catch (err) {
      setLog(
        humanizeTechnicalMessage(err instanceof Error ? err.message : "Regeneration failed.")
      );
    } finally {
      setRunning(false);
    }
  };

  const totalPreviewCards = preview?.reduce((n, p) => n + p.cardCount, 0) ?? 0;
  const companyName = COMPANIES.find((c) => c.ticker === ticker)?.name ?? ticker;
  const inspectPillar = pillarId === "all" ? "business" : pillarId;

  return (
    <OpsPageShell
      title="Quest copy & regeneration"
      subtitle="Smart-friend tone for AI-generated cards. Curated demo copy (Apple) always wins on screen over stale database rows."
    >
      <section className={opsPanel}>
        <h2 className="text-[15px] font-semibold text-white/90">
          What players see (source checker)
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-white/55">
          Priority: <strong className="text-white/80">curated code</strong> →{" "}
          <strong className="text-white/80">database AI</strong> → template placeholder.
          Apple Business Snapshot card 1 should show{" "}
          <strong className="text-white/80">curated_override</strong>, not old DB text.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
            Pillar (inspect)
            <select
              className={opsSelect}
              value={inspectPillar}
              disabled={running}
              onChange={(e) => setPillarId(e.target.value as PillarId)}
            >
              {PILLARS.map((p) => (
                <option key={p} value={p}>
                  {pillarById(p).title}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-[13px] text-white/55">
            Quest slug
            <input
              className={opsSelect}
              value={inspectSlug}
              disabled={running}
              onChange={(e) => setInspectSlug(e.target.value)}
            />
          </label>
          <label className="grid gap-2 text-[13px] text-white/55">
            Card id
            <input
              className={opsSelect}
              value={inspectCardId}
              disabled={running}
              onChange={(e) => setInspectCardId(e.target.value)}
            />
          </label>
        </div>

        {cardSourceLoading ? (
          <p className="mt-4 text-[14px] text-white/50">Checking source…</p>
        ) : cardSource ? (
          <div className="mt-4 rounded-xl border border-violet-400/25 bg-violet-950/20 px-4 py-3 text-[14px] leading-relaxed text-white/85">
            <p className="font-semibold text-violet-200">
              {SOURCE_BADGE[cardSource.playerSees]}
            </p>
            <p className="mt-1 text-white/60">{cardSource.display.sourceDetail}</p>
            {cardSource.display.databaseSuppressed ? (
              <p className="mt-2 text-amber-200/90">
                Stale database copy exists but is hidden — curated override wins.
              </p>
            ) : null}
            {cardSource.playerAnswerPreview ? (
              <p className="mt-3 text-[13px] italic text-white/70">
                “{cardSource.playerAnswerPreview}”
              </p>
            ) : (
              <p className="mt-3 text-white/50">No answer text on screen yet.</p>
            )}
          </div>
        ) : null}

        <div className="mt-5 space-y-3">
          <OpsTouchButton
            variant="primary"
            disabled={running || allCompanies}
            onClick={() => void runSmartFriendRegenerate()}
            description="Regenerates this card with smart-friend prompts (Force on by default)"
          >
            {running ? "Regenerating…" : "Regenerate with smart-friend voice"}
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

          <OpsTouchButton
            variant="secondary"
            disabled={running}
            onClick={() => void runAllSixDemoCompanies()}
            description="AAPL MSFT TSLA NVDA NKE SPOT — all pillars, force new smart-friend copy in DB"
          >
            Refresh all 6 demo companies
          </OpsTouchButton>
        </div>

        {!allCompanies && (
          <p className="mt-4 text-[14px] text-white/55">
            {previewLoading
              ? "Counting quest cards…"
              : preview
                ? `${totalPreviewCards} AI cards in scope for ${companyName}`
                : "Select a company to preview scope."}
          </p>
        )}

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
            <label className="grid gap-2 text-[13px] text-white/55">
              Regenerate scope (island)
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
            <label className="flex min-h-[48px] cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                className={opsCheckbox}
                checked={forceRegenerate}
                disabled={running}
                onChange={(e) => setForceRegenerate(e.target.checked)}
              />
              Force new answers (ignore DB cache)
            </label>
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
