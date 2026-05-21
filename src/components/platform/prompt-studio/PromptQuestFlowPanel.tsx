"use client";

import { useState } from "react";

import type { QuestTeachingQualityAnalysis } from "@/lib/ai/questTeachingQualityAnalysis";
import type { PromptQualityAnalysis } from "@/lib/ai/promptQualityAnalysis";
import type { PromptTemplateDetailDto } from "@/lib/supabase/promptTemplates/types";
import type { PillarId } from "@/data/pillars";

import { PromptQualityScorecard } from "./PromptQualityScorecard";
import { btnPrimary, inputClass, panelClass, scoreColor } from "./promptStudioTheme";
import type { PromptTestContext } from "./PromptTestContextBar";

type QuestCardRow = {
  cardId: string;
  promptFocus: string;
  orderIndex: number;
  plainEnglishAnswer: string;
  quality: PromptQualityAnalysis;
  error?: string;
};

type QuestBatchResult = {
  quest: QuestTeachingQualityAnalysis;
  cards: QuestCardRow[];
  generated: number;
  failed: number;
};

function MetricBar({
  label,
  score,
  hint
}: {
  label: string;
  score: number;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="text-white/55">{label}</span>
        <span className={`font-semibold tabular-nums ${scoreColor(score)}`}>
          {score}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--partner-primary)]/80 to-emerald-400/70 transition-all"
          style={{ width: `${Math.min(100, score)}%` }}
        />
      </div>
      {hint ? <p className="text-[10px] text-white/40">{hint}</p> : null}
    </div>
  );
}

function QuestFlowScorecard({ quest }: { quest: QuestTeachingQualityAnalysis }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-[var(--partner-primary)]/30 bg-[var(--partner-primary)]/10 p-3">
          <p className="text-[10px] uppercase text-white/45">Beginner comprehension</p>
          <p
            className={`text-3xl font-semibold tabular-nums ${scoreColor(quest.overall.beginnerComprehensionScore)}`}
          >
            {quest.overall.beginnerComprehensionScore}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/25 p-3">
          <p className="text-[10px] uppercase text-white/45">Quest composite</p>
          <p className="text-2xl font-semibold tabular-nums text-white">
            {quest.overall.compositeScore}
          </p>
          <p className="text-[10px] text-white/40">
            {quest.cardCount} cards · avg readability {quest.overall.readabilityScore}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/25 p-3">
          <p className="text-[10px] uppercase text-white/45">Learning arc</p>
          <p className="text-sm text-white/85">
            {quest.learningProgression.logicalEscalation
              ? "Progressive"
              : "Needs smoother escalation"}
          </p>
          <p className="text-[10px] text-white/40">
            {quest.learningProgression.feelsRepetitive
              ? "May feel repetitive"
              : "Good variety across cards"}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <MetricBar
          label="Cross-card repetition"
          score={quest.crossCardRepetition.score}
          hint={
            quest.crossCardRepetition.similarOpeningPairs.length > 0
              ? `${quest.crossCardRepetition.similarOpeningPairs.length} similar opening pair(s)`
              : "Distinct openings"
          }
        />
        <MetricBar
          label="Teaching progression"
          score={quest.teachingProgression.score}
          hint={`Trend: ${quest.teachingProgression.trend.replace(/_/g, " ")}`}
        />
        <MetricBar
          label="Cognitive load"
          score={quest.cognitiveLoad.score}
          hint={`~${quest.cognitiveLoad.avgWordCount} words/card avg`}
        />
        <MetricBar
          label="Narrative flow (structure)"
          score={quest.narrativeFlow.score}
          hint={`${quest.narrativeFlow.structureComplianceRate}% cards follow scaffold`}
        />
        <MetricBar
          label="Explanation variety"
          score={quest.explanationVariety.score}
          hint={`${quest.explanationVariety.uniqueOpenings} unique openings`}
        />
        <MetricBar
          label="Learning progression"
          score={quest.learningProgression.score}
        />
      </div>

      {quest.flags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {quest.flags.map((f) => (
            <span
              key={f}
              className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/55"
            >
              {f.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      ) : null}

      {quest.crossCardRepetition.similarOpeningPairs.length > 0 ? (
        <div className="rounded-lg border border-rose-400/20 bg-rose-500/5 p-2 text-xs text-white/65">
          <p className="font-medium text-rose-200">Similar openings</p>
          {quest.crossCardRepetition.similarOpeningPairs.map((p) => (
            <p key={`${p.cardA}-${p.cardB}`}>
              {p.cardA} ↔ {p.cardB} — {p.reason}
            </p>
          ))}
        </div>
      ) : null}

      <div className="text-xs text-white/50">
        <p className="font-medium text-white/70">Readability by card (flow)</p>
        <p className="font-mono text-[11px]">
          {quest.teachingProgression.readabilityByCard
            .map((r) => `${r.cardId}:${r.score}`)
            .join(" → ")}
        </p>
      </div>

      {quest.questTips.length > 0 ? (
        <div className="rounded-xl border border-amber-400/20 bg-amber-500/5 p-3">
          <p className="text-xs font-semibold text-amber-100/90">Quest-level recommendations</p>
          <ul className="mt-2 space-y-1 text-xs text-white/65">
            {quest.questTips.map((t) => (
              <li key={t}>• {t}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {(quest.weakestCards.length > 0 || quest.strongestCards.length > 0) && (
        <div className="grid gap-3 sm:grid-cols-2 text-xs">
          {quest.weakestCards.length > 0 ? (
            <div className="rounded-lg border border-rose-400/20 bg-rose-500/5 p-2">
              <p className="font-medium text-rose-200">Weakest cards</p>
              {quest.weakestCards.map((w) => (
                <p key={w.cardId} className="text-white/60">
                  {w.cardId} ({w.compositeScore}) — {w.reason}
                </p>
              ))}
            </div>
          ) : null}
          {quest.strongestCards.length > 0 ? (
            <div className="rounded-lg border border-emerald-400/20 bg-emerald-500/5 p-2">
              <p className="font-medium text-emerald-200">Strongest cards</p>
              {quest.strongestCards.map((s) => (
                <p key={s.cardId} className="text-white/60">
                  {s.cardId} ({s.compositeScore})
                </p>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function PromptQuestFlowPanel({
  detail,
  testCtx,
  draftBody,
  draftSystem,
  draftModel = "gpt-4o-mini",
  draftTemp = 0.25
}: {
  detail: PromptTemplateDetailDto | null;
  testCtx: PromptTestContext;
  draftBody: string;
  draftSystem: string | null;
  draftModel?: string;
  draftTemp?: number;
}) {
  const [mode, setMode] = useState<"generate" | "stored">("generate");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<QuestBatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const run = async () => {
    if (!testCtx.questSlug) return;
    setRunning(true);
    setError(null);
    setResult(null);

    let systemPrompt: string | undefined;
    if (detail?.scope === "system") systemPrompt = draftBody;
    else if (draftSystem) systemPrompt = draftSystem;

    const userTemplate = detail?.scope === "user" ? draftBody : undefined;

    try {
      const res = await fetch("/api/admin/prompt-templates/quest-evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pillarId: testCtx.previewPillar as PillarId,
          ticker: testCtx.ticker,
          questSlug: testCtx.questSlug,
          templateKey: detail?.templateKey,
          useStoredAnswers: mode === "stored",
          draft:
            mode === "generate"
              ? {
                  systemPrompt,
                  userTemplate,
                  model: detail?.scope === "user" ? draftModel : undefined,
                  temperature: detail?.scope === "user" ? draftTemp : undefined
                }
              : undefined,
          saveEvaluations: true
        })
      });
      const data = (await res.json()) as QuestBatchResult & {
        error?: string;
        detail?: string;
      };
      if (!res.ok) throw new Error(data.detail ?? data.error ?? "Quest analysis failed");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Quest analysis failed.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <section className={`${panelClass} space-y-4`}>
      <div>
        <h2 className="text-sm font-semibold text-white">Quest-level teaching quality</h2>
        <p className="text-xs text-white/55">
          Batch-score every card on this quest for repetition, progression, cognitive
          load, narrative flow, and beginner comprehension — as one learning journey.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-xs text-white/60">
          Analysis mode
          <select
            className={inputClass}
            value={mode}
            onChange={(e) => setMode(e.target.value as "generate" | "stored")}
          >
            <option value="generate">
              Generate all cards (tests current prompt draft)
            </option>
            <option value="stored">
              Score stored answers only (fast, no API cost)
            </option>
          </select>
        </label>
        <button
          type="button"
          className={btnPrimary}
          disabled={running || !testCtx.questSlug}
          onClick={() => void run()}
        >
          {running
            ? "Analyzing quest…"
            : mode === "stored"
              ? "Analyze stored quest"
              : "Generate & analyze quest"}
        </button>
      </div>

      {mode === "generate" ? (
        <p className="text-[11px] text-white/45">
          Runs cards in order so repetition detection matches real player flow. May
          take 1–3 minutes for multi-card quests.
        </p>
      ) : null}

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      {result ? (
        <>
          <p className="text-xs text-white/50">
            {result.generated} card(s) scored
            {result.failed > 0 ? ` · ${result.failed} failed` : ""} · quest{" "}
            <span className="font-mono text-white/70">{result.quest.questSlug}</span>
          </p>
          <QuestFlowScorecard quest={result.quest} />

          <div className="space-y-2 border-t border-white/10 pt-4">
            <h3 className="text-xs font-semibold uppercase text-white/50">
              Card-by-card flow
            </h3>
            <div className="space-y-2">
              {result.cards.map((card) => (
                <div
                  key={card.cardId}
                  className="rounded-xl border border-white/10 bg-black/20"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs"
                    onClick={() =>
                      setExpandedCard(
                        expandedCard === card.cardId ? null : card.cardId
                      )
                    }
                  >
                    <span className="text-white">
                      <span className="font-mono text-white/50">
                        {card.orderIndex + 1}.
                      </span>{" "}
                      {card.cardId}
                      <span className="ml-2 text-white/40">{card.promptFocus}</span>
                    </span>
                    {card.error ? (
                      <span className="text-rose-300">{card.error}</span>
                    ) : (
                      <span
                        className={`font-semibold tabular-nums ${scoreColor(card.quality.compositeScore)}`}
                      >
                        {card.quality.compositeScore}
                      </span>
                    )}
                  </button>
                  {expandedCard === card.cardId && !card.error ? (
                    <div className="space-y-3 border-t border-white/10 px-3 py-3">
                      <PromptQualityScorecard quality={card.quality} compact />
                      <pre className="max-h-40 overflow-auto whitespace-pre-wrap font-mono text-[10px] text-white/80">
                        {card.plainEnglishAnswer}
                      </pre>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
