"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { useGame } from "@/components/GameProvider";
import {
  islandQuizPassMessage,
  questCompleteHeadline
} from "@/components/quest/islandQuizPassMessages";
import { getPillarQuestTheme } from "@/components/quest/pillarQuestTheme";
import { QuestQuizPanel } from "@/components/QuestQuizPanel";
import type { Company } from "@/data/companies";
import { findQuestDefinition } from "@/data/quests/library";
import type { ForcesCategoryId } from "@/data/quests/forcesCategories";
import {
  hasPlayableQuizConfig,
  normalizeQuizConfig
} from "@/data/quests/types";
import { FORCES_ISLAND } from "@/components/quest/forcesIslandColors";
import {
  computeForcesCategoryQuizProgress,
  forcesCategoryQuizTitle,
  forcesCategoryQuizUnlockMessage
} from "@/lib/forces/categoryQuizProgress";
import { FORCES_HUB_CATEGORY_SLOTS } from "@/lib/forces/forcesHubCategories";
import { useControlledDemoFastQuizHandoff } from "@/lib/demo/controlledDemo";
import {
  islandQuizReadyIntro,
  islandQuizStartCta,
  islandQuizUnlockedHeadline
} from "@/lib/quests/islandQuizStyle";
import { QuizUnlockedCtaButton } from "@/components/quest/QuizUnlockedCtaButton";

type Props = {
  categoryId: ForcesCategoryId;
  company: Company;
  topicSlugs: readonly string[];
};

export function ForcesCategoryQuizSection({
  categoryId,
  company,
  topicSlugs
}: Props) {
  const { state } = useGame();
  const theme = getPillarQuestTheme("forces");
  const fastQuizHandoff = useControlledDemoFastQuizHandoff();

  const hubSlug = useMemo(
    () =>
      FORCES_HUB_CATEGORY_SLOTS.find((s) => s.categoryId === categoryId)
        ?.hubSlug ?? `forces-hub-${categoryId}`,
    [categoryId]
  );

  const hubQuest = useMemo(
    () => findQuestDefinition(company.id, "forces", hubSlug),
    [company.id, hubSlug]
  );

  const quiz = useMemo(
    () => normalizeQuizConfig(hubQuest?.quizConfig),
    [hubQuest?.quizConfig]
  );

  const hasQuiz = hasPlayableQuizConfig(quiz);

  const quizCheckpoint = useMemo(() => {
    if (!hasPlayableQuizConfig(quiz)) return null;
    const total = quiz.questions.length;
    const threshold = quiz.passThreshold ?? 0.66;
    return {
      total,
      requiredCorrect: Math.max(1, Math.ceil(total * threshold))
    };
  }, [quiz]);

  const progress = useMemo(
    () =>
      computeForcesCategoryQuizProgress({
        topicSlugs,
        readQuestSlugs: state.pillars.forces.readQuestSlugs,
        completedQuestSlugs: state.pillars.forces.completedQuestSlugs,
        quizConfig: quiz,
        hubSlug
      }),
    [
      topicSlugs,
      state.pillars.forces.readQuestSlugs,
      state.pillars.forces.completedQuestSlugs,
      quiz,
      hubSlug
    ]
  );

  const [screen, setScreen] = useState<"deck" | "quiz">("deck");

  useEffect(() => {
    setScreen("deck");
  }, [categoryId, hubSlug]);

  // Removed mastery interstitial — deck → quiz for a single, instant handoff.

  const lockMessage = forcesCategoryQuizUnlockMessage(progress);
  const quizTitle = forcesCategoryQuizTitle(categoryId);
  const hubTitle =
    FORCES_HUB_CATEGORY_SLOTS.find((s) => s.categoryId === categoryId)
      ?.defaultTitle ?? "Forces";

  const passCelebration = useMemo(
    () => ({
      headline: questCompleteHeadline(hubSlug, hubTitle, "risk"),
      message: islandQuizPassMessage("forces", hubSlug, "risk")
    }),
    [hubSlug, hubTitle]
  );

  if (!hasQuiz) return null;

  if (screen === "quiz") {
    return (
      <div className="mt-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${categoryId}-quiz`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <QuestQuizPanel
              pillarId="forces"
              slug={hubSlug}
              quiz={quiz!}
              unlocked={progress.quizUnlocked}
              autoStart
              title={quizTitle}
              rewardXp={hubQuest?.rewardXp ?? 100}
              cardsRead={progress.topicsRead}
              cardsTotal={progress.topicsRequired}
              panelTheme={theme}
              passCelebration={passCelebration}
              islandFinaleCta={{
                href: "/forces",
                label: "Back to Forces island"
              }}
              onReviewQuestCards={() => setScreen("deck")}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="mt-10">
      {progress.hubCompleted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border px-5 py-5 text-center"
          style={{
            borderColor: "rgba(52,211,153,0.45)",
            background: "rgba(52,211,153,0.08)",
            boxShadow: `0 0 32px -8px rgba(52,211,153,0.35)`
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-400">
            Section complete
          </p>
          <p className="mt-2 font-[var(--font-grotesk)] text-lg text-ink-0">
            You finished this category — quiz passed, XP locked in.
          </p>
          <p className="mt-2 text-[13px] text-ink-2">
            Head back to the Forces island for the next quadrant.
          </p>
        </motion.div>
      ) : progress.quizUnlocked ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 rounded-2xl border px-5 py-6"
          style={{
            borderColor: FORCES_ISLAND.border,
            background: FORCES_ISLAND.glowSoft,
            boxShadow: `0 0 40px -12px ${FORCES_ISLAND.glow}`
          }}
        >
          <div className="text-center">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.24em]"
              style={{ color: FORCES_ISLAND.hi }}
            >
              {islandQuizUnlockedHeadline("forces")}
            </p>
            <p className="mt-2 font-[var(--font-grotesk)] text-xl text-ink-0">
              You finished every topic in this section.
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-2">
              {quizCheckpoint
                ? islandQuizReadyIntro(
                    "forces",
                    quizCheckpoint.requiredCorrect,
                    quizCheckpoint.total
                  )
                : "Pass the strategy checkpoint to earn XP and mark this category complete."}
            </p>
          </div>
          <div className="mx-auto flex justify-center">
            <QuizUnlockedCtaButton
              unlocked
              onClick={() => setScreen("quiz")}
              theme={theme}
              label="QUIZ UNLOCKED"
            />
          </div>
        </motion.div>
      ) : (
        <div
          className="rounded-2xl border px-4 py-4 text-center"
          style={{
            borderColor: "rgba(248,113,113,0.22)",
            background: "rgba(7,7,18,0.55)"
          }}
          role="status"
          aria-live="polite"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-2">
            Category quiz
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-1/90">
            {lockMessage ?? "Complete all topics to unlock quiz"}
          </p>
        </div>
      )}
    </div>
  );
}
