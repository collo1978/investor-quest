"use client";

import { useEffect } from "react";
import type { QuestSubCard } from "@/data/quests/types";
import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";
import {
  computeQuestCardReadProgress,
  questQuizUnlockUserMessage,
  type QuestCardReadProgress
} from "@/lib/quests/questCardReadProgress";

export type QuestQuizUnlockStatusProps = {
  parentSlug: string;
  cards: readonly QuestSubCard[];
  readQuestSlugs: readonly string[];
  quizConfig?: import("@/data/quests/types").QuizConfig | null;
  parentSelfRead?: boolean;
  theme: PillarQuestTheme;
  /** Show cards completed / lock reasons (dev or `?questDebug=1`). */
  showDevDetails?: boolean;
  className?: string;
};

function formatLockReasons(reasons: string[]): string {
  return reasons.length ? reasons.join(", ") : "none";
}

export function QuestQuizUnlockStatus({
  parentSlug,
  cards,
  readQuestSlugs,
  quizConfig,
  parentSelfRead,
  theme,
  showDevDetails = false,
  className = ""
}: QuestQuizUnlockStatusProps) {
  const progress: QuestCardReadProgress = computeQuestCardReadProgress({
    parentSlug,
    cards,
    readQuestSlugs,
    quizConfig,
    parentSelfRead
  });

  const userMessage = questQuizUnlockUserMessage(progress, cards);

  useEffect(() => {
    if (!showDevDetails) return;
    console.info("[quest-quiz-unlock]", {
      parentSlug,
      cardsCompleted: `${progress.cardsRead}/${progress.cardsRequired}`,
      quizUnlocked: progress.quizUnlocked,
      missingCardIds: progress.missingCardIds,
      lockReasons: progress.lockReasons
    });
  }, [
    showDevDetails,
    parentSlug,
    progress.cardsRead,
    progress.cardsRequired,
    progress.quizUnlocked,
    progress.missingCardIds,
    progress.lockReasons
  ]);

  if (!userMessage && !showDevDetails) return null;

  return (
    <div
      className={`mx-auto mt-4 max-w-2xl rounded-xl border px-4 py-3 text-center ${className}`}
      style={{
        borderColor: progress.quizUnlocked
          ? "rgba(34,197,139,0.35)"
          : theme.border,
        background: progress.quizUnlocked
          ? "rgba(34,197,139,0.08)"
          : theme.glowSoft
      }}
      role="status"
      aria-live="polite"
    >
      {userMessage ? (
        <p
          className="text-[13px] font-medium leading-snug"
          style={{ color: progress.quizUnlocked ? "#22C58B" : theme.hi }}
        >
          {userMessage}
        </p>
      ) : null}

      {showDevDetails ? (
        <dl className="mt-3 space-y-1 text-left font-mono text-[10px] leading-relaxed text-ink-2">
          <div className="flex justify-between gap-4">
            <dt>cards completed</dt>
            <dd>
              {progress.cardsRead} / {progress.cardsRequired}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>quiz unlocked</dt>
            <dd>{String(progress.quizUnlocked)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>has quiz config</dt>
            <dd>{String(progress.hasQuiz)}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt>missing card ids</dt>
            <dd className="break-all text-ink-1">
              {progress.missingCardIds.length
                ? progress.missingCardIds.join(", ")
                : "—"}
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt>lock reasons</dt>
            <dd className="break-all text-ink-1">
              {formatLockReasons(progress.lockReasons)}
            </dd>
          </div>
        </dl>
      ) : null}
    </div>
  );
}

/** Client hook: dev build or `?questDebug=1` on the URL. */
export function useQuestProgressDebug(): boolean {
  if (process.env.NODE_ENV === "development") return true;
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("questDebug") === "1";
}
