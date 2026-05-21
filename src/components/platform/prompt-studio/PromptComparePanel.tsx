"use client";

import { useState } from "react";

import type { PromptQualityAnalysis } from "@/lib/ai/promptQualityAnalysis";
import type { PromptTemplateDetailDto } from "@/lib/supabase/promptTemplates/types";
import type { PromptDraftOverrides } from "@/lib/ai/resolveActivePrompts";
import type { PillarId } from "@/data/pillars";

import { PromptQualityScorecard } from "./PromptQualityScorecard";
import { btnPrimary, inputClass, panelClass } from "./promptStudioTheme";
import type { PromptTestContext } from "./PromptTestContextBar";

type CompareSideResult = {
  label: string;
  plainEnglishAnswer: string;
  investorInsight: string | null;
  quality: PromptQualityAnalysis;
};

type CompareResult = {
  sideA: CompareSideResult;
  sideB: CompareSideResult;
  winner: "a" | "b" | "tie";
  winnerReason: string;
};

export function PromptComparePanel({
  detail,
  testCtx,
  draftBody,
  draftOverrides,
  draftSystem
}: {
  detail: PromptTemplateDetailDto;
  testCtx: PromptTestContext;
  draftBody: string;
  draftOverrides?: PromptDraftOverrides;
  draftSystem: string | null;
}) {
  const [sideAVersion, setSideAVersion] = useState<string>("editor");
  const [sideBVersion, setSideBVersion] = useState<string>("active");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const buildDraft = (): PromptDraftOverrides | undefined => {
    if (detail.scope === "system") {
      return { systemPrompt: draftBody, ...draftOverrides };
    }
    return {
      systemPrompt: draftSystem ?? draftOverrides?.systemPrompt,
      userTemplate: draftBody,
      model: draftOverrides?.model,
      temperature: draftOverrides?.temperature
    };
  };

  const resolveSide = (
    which: "a" | "b",
    pick: string
  ): { label: string; versionId?: string | null; draft?: PromptDraftOverrides } => {
    if (pick === "editor") {
      return {
        label: which === "a" ? "Editor draft" : "Editor draft",
        draft: buildDraft()
      };
    }
    if (pick === "active") {
      const active = detail.versions.find((v) => v.isActive);
      return {
        label: active ? `Live v${active.versionNumber}` : "Live",
        versionId: active?.id ?? null
      };
    }
    const v = detail.versions.find((x) => x.id === pick);
    return {
      label: v ? `v${v.versionNumber}` : pick,
      versionId: pick
    };
  };

  const runCompare = async () => {
    setRunning(true);
    setError(null);
    setResult(null);

    const sideA = resolveSide("a", sideAVersion);
    const sideB = resolveSide("b", sideBVersion);
    if (sideAVersion === sideBVersion && sideAVersion !== "editor") {
      setError("Pick two different versions to compare.");
      setRunning(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/prompt-templates/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateKey: detail.templateKey,
          pillarId: testCtx.previewPillar as PillarId,
          ticker: testCtx.ticker,
          questSlug: testCtx.questSlug,
          cardId: testCtx.cardId,
          sideA: {
            label: sideA.label,
            versionId: sideA.versionId,
            draft: sideA.draft
          },
          sideB: {
            label: sideB.label,
            versionId: sideB.versionId,
            draft: sideB.draft
          },
          saveEvaluations: true
        })
      });
      const data = (await res.json()) as CompareResult & { error?: string; detail?: string };
      if (!res.ok) throw new Error(data.detail ?? data.error ?? "Compare failed");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Compare failed.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <section className={`${panelClass} space-y-4`}>
      <div>
        <h2 className="text-sm font-semibold text-white">Side-by-side compare</h2>
        <p className="text-xs text-white/55">
          Run two prompt variants on the same card. Scores use readability, repetition
          vs prior cards, and teaching structure.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-xs text-white/60">
          Side A
          <select
            className={inputClass}
            value={sideAVersion}
            onChange={(e) => setSideAVersion(e.target.value)}
          >
            <option value="editor">Editor draft (unsaved)</option>
            <option value="active">Live published</option>
            {detail.versions.map((v) => (
              <option key={v.id} value={v.id}>
                v{v.versionNumber}
                {v.tags.length ? ` · ${v.tags.join(", ")}` : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs text-white/60">
          Side B
          <select
            className={inputClass}
            value={sideBVersion}
            onChange={(e) => setSideBVersion(e.target.value)}
          >
            <option value="active">Live published</option>
            <option value="editor">Editor draft (unsaved)</option>
            {detail.versions.map((v) => (
              <option key={v.id} value={v.id}>
                v{v.versionNumber}
                {v.tags.length ? ` · ${v.tags.join(", ")}` : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="button"
        className={btnPrimary}
        disabled={running}
        onClick={() => void runCompare()}
      >
        {running ? "Comparing…" : "Run comparison"}
      </button>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      {result ? (
        <div className="space-y-4">
          <p className="rounded-lg border border-[var(--partner-primary)]/30 bg-[var(--partner-primary)]/10 px-3 py-2 text-sm text-white/90">
            {result.winnerReason}
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            {([result.sideA, result.sideB] as const).map((side, idx) => (
              <div
                key={side.label}
                className={`space-y-3 rounded-xl border p-4 ${
                  result.winner === (idx === 0 ? "a" : "b")
                    ? "border-emerald-400/40 bg-emerald-500/5"
                    : "border-white/10 bg-black/20"
                }`}
              >
                <p className="text-xs font-semibold text-white">{side.label}</p>
                <PromptQualityScorecard quality={side.quality} compact />
                <pre className="max-h-56 overflow-auto whitespace-pre-wrap font-mono text-[11px] text-white/85">
                  {side.plainEnglishAnswer}
                </pre>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
