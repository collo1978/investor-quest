"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";
import type { QuestPipelinePhase } from "@/hooks/usePillarQuestGeneratedContent";
import type { PillarId } from "@/data/pillars";
import {
  getPipelineStatusLines,
  PIPELINE_STATUS_CYCLE_MS,
  playerFacingPipelineError
} from "@/lib/quests/pipelineStatusCopy";
import type { QuestPipelineProgress } from "@/lib/quests/questPayloadProgress";
import type { QuestContentStatus } from "@/lib/supabase/questCardAnswers/types";

type Props = {
  pillarId: PillarId;
  questSlug?: string;
  status: QuestContentStatus | null;
  generating: boolean;
  pipelinePhase?: QuestPipelinePhase;
  progress?: QuestPipelineProgress | null;
  compact?: boolean;
  error: string | null;
  theme: PillarQuestTheme;
  onRetry?: () => void | Promise<void>;
};

function phaseHeadline(
  phase: QuestPipelinePhase | undefined,
  compact: boolean
): string {
  if (compact) return "Finishing the rest of this quest…";
  switch (phase) {
    case "loading":
      return "Checking quest content…";
    case "extracting":
      return "Pulling SEC filing sections";
    case "generating":
      return "Writing plain-English answers";
    case "refreshing":
      return "Loading your quest cards";
    default:
      return "Building your quest answers";
  }
}

function phaseHint(
  phase: QuestPipelinePhase | undefined,
  compact: boolean,
  progress?: QuestPipelineProgress | null
): string {
  if (compact) {
    const done = progress?.completed ?? 1;
    const total = progress?.total ?? 3;
    return `Card 1 is ready — loading ${done} of ${total} in the background. Keep reading while we finish.`;
  }
  switch (phase) {
    case "extracting":
      return "One-time SEC pull for this company — usually under a minute, then answers stream in.";
    case "generating":
      return "First card loads first; the rest fill in while you read.";
    case "refreshing":
      return "Almost there…";
    case "loading":
      return "Checking your cached research…";
    default:
      return "First insight should appear in seconds once filings are ready.";
  }
}

export function PillarQuestPipelineBanner({
  pillarId,
  questSlug,
  status,
  generating,
  pipelinePhase,
  progress,
  compact = false,
  error,
  theme,
  onRetry
}: Props) {
  const lines = getPipelineStatusLines(pillarId, questSlug);
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    if (!generating) {
      setLineIndex(0);
      return;
    }
    const id = window.setInterval(() => {
      setLineIndex((i) => (i + 1) % lines.length);
    }, PIPELINE_STATUS_CYCLE_MS);
    return () => window.clearInterval(id);
  }, [generating, lines.length]);

  if (!status && !generating && !error) return null;

  if (generating) {
    const line = lines[lineIndex] ?? lines[0];
    const pct =
      progress && progress.total > 0
        ? Math.round((progress.completed / progress.total) * 100)
        : null;

    if (compact) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-3 max-w-2xl rounded-lg border px-3 py-2"
          style={{
            borderColor: theme.borderSoft,
            background: "rgba(0,0,0,0.2)",
            color: theme.hi
          }}
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-2">
            {phaseHeadline(pipelinePhase, true)}
          </p>
          <p className="mt-1 text-[12px] leading-snug text-ink-1">
            {phaseHint(pipelinePhase, true, progress)}
          </p>
          {pct != null ? (
            <div
              aria-hidden
              className="pointer-events-none mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]"
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: theme.hi, width: `${Math.max(8, pct)}%` }}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            </div>
          ) : null}
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto mb-4 max-w-2xl overflow-hidden rounded-xl border px-4 py-3.5"
        style={{
          borderColor: theme.border,
          background: theme.glowSoft,
          color: theme.hi
        }}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border"
            style={{
              borderColor: theme.borderSoft,
              background: "rgba(0,0,0,0.25)",
              boxShadow: `0 0 16px ${theme.glow}`
            }}
          >
            <motion.span
              className="h-2 w-2 rounded-full"
              style={{ background: theme.hi }}
              animate={{ opacity: [0.35, 1, 0.35], scale: [0.85, 1.1, 0.85] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
            />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-2">
              {phaseHeadline(pipelinePhase, false)}
            </p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={line}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.28 }}
                className="mt-1 text-[13px] leading-relaxed"
                style={{ color: theme.hi }}
              >
                {line}
              </motion.p>
            </AnimatePresence>
            <p className="mt-2 text-[11.5px] leading-snug text-ink-2">
              {phaseHint(pipelinePhase, false, progress)}
            </p>
            {progress && progress.total > 0 ? (
              <p className="mt-1.5 text-[11px] font-medium text-ink-2">
                {progress.completed} of {progress.total} cards ready
                {progress.currentLabel ? ` · next: ${progress.currentLabel}` : ""}
              </p>
            ) : null}
          </div>
        </div>
        <div
          aria-hidden
          className="pointer-events-none mt-3 h-0.5 overflow-hidden rounded-full"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${theme.hi}, transparent)`,
              width: "40%"
            }}
            animate={{ x: ["-120%", "280%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto mb-4 max-w-2xl rounded-xl border border-red-400/35 bg-red-500/10 px-4 py-3 text-[13px] leading-relaxed text-red-200/90"
        role="alert"
      >
        <p className="font-semibold text-red-100">Quest content could not load</p>
        <p className="mt-1">{playerFacingPipelineError(error)}</p>
        {onRetry ? (
          <button
            type="button"
            onClick={() => void onRetry()}
            className="mt-3 rounded-lg border border-red-300/40 bg-red-500/15 px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-red-50 transition hover:bg-red-500/25"
          >
            Try again
          </button>
        ) : null}
      </motion.div>
    );
  }

  if (
    status === "missing_extract" ||
    status === "needs_generation" ||
    status === "partial"
  ) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto mb-4 max-w-2xl rounded-xl border border-dashed px-4 py-3.5 text-[13px] leading-relaxed"
        style={{
          borderColor: theme.border,
          background: "rgba(0,0,0,0.25)",
          color: theme.hi
        }}
        role="status"
      >
        <span className="font-semibold">SEC filing sections not loaded yet.</span>{" "}
        <span className="text-ink-2">
          Pull the company&apos;s filings first, then we can write quest answers.
        </span>
        {onRetry ? (
          <button
            type="button"
            onClick={() => void onRetry()}
            className="mt-3 rounded-lg border px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              borderColor: theme.border,
              background: theme.glowSoft,
              color: theme.hi
            }}
          >
            Pull filing + generate
          </button>
        ) : null}
      </motion.div>
    );
  }

  return null;
}

/** @deprecated Use PillarQuestPipelineBanner */
export { PillarQuestPipelineBanner as FinancialQuestPipelineBanner };
