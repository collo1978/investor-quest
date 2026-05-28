"use client";

import type { QuestSubCard } from "@/data/quests/types";
import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";
import { useQuestProgressDebug } from "@/hooks/useQuestProgressDebug";
import {
  computeQuestCardReadProgress,
  questQuizButtonDisabledReason,
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
  /** Show cards completed / lock reasons (`?questDebug=1`, `?admin=1`, `?dev=1`). */
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
  showDevDetails: showDevDetailsProp,
  className = ""
}: QuestQuizUnlockStatusProps) {
  const devFromUrl = useQuestProgressDebug();
  const showDevDetails = showDevDetailsProp ?? devFromUrl;

  const progress: QuestCardReadProgress = computeQuestCardReadProgress({
    parentSlug,
    cards,
    readQuestSlugs,
    quizConfig,
    parentSelfRead
  });

  const userMessage = questQuizUnlockUserMessage(progress, cards);
  const buttonDisabledReason = questQuizButtonDisabledReason(progress);

  if (!userMessage && !showDevDetails) return null;

  return (
    <div
      className={[
        "mx-auto mt-4 max-w-2xl text-center",
        showDevDetails
          ? "rounded-xl border px-4 py-3"
          : "px-2 py-2",
        className
      ].join(" ")}
      style={
        showDevDetails
          ? {
              borderColor: progress.quizUnlocked
                ? "rgba(34,197,139,0.35)"
                : theme.border,
              background: progress.quizUnlocked
                ? "rgba(34,197,139,0.08)"
                : theme.glowSoft
            }
          : undefined
      }
      role="status"
      aria-live="polite"
    >
      {userMessage ? (
        <p
          className={
            showDevDetails
              ? "text-[13px] font-medium leading-snug"
              : "text-[13px] leading-relaxed text-ink-1/90"
          }
          style={showDevDetails ? { color: theme.hi } : undefined}
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
          <div className="flex flex-col gap-0.5">
            <dt>button disabled reason</dt>
            <dd className="break-all text-ink-1">
              {buttonDisabledReason ?? "— (quiz CTA enabled)"}
            </dd>
          </div>
        </dl>
      ) : null}
    </div>
  );
}
