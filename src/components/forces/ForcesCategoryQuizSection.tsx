"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { useGame } from "@/components/GameProvider";
import { InvestorMasteryScreen } from "@/components/quest/InvestorMasteryScreen";
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
  const masteryAutoOpened = useRef(false);

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

  const [screen, setScreen] = useState<"deck" | "mastery" | "quiz">("deck");

  useEffect(() => {
    masteryAutoOpened.current = false;
    setScreen("deck");
  }, [categoryId, hubSlug]);

  useEffect(() => {
    if (
      !progress.quizUnlocked ||
      !hasQuiz ||
      progress.hubCompleted ||
      fastQuizHandoff ||
      masteryAutoOpened.current
    ) {
      return;
    }
    masteryAutoOpened.current = true;
    setScreen("mastery");
  }, [progress.quizUnlocked, hasQuiz, progress.hubCompleted, fastQuizHandoff]);

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

  if (screen === "mastery" && progress.quizUnlocked && !progress.hubCompleted) {
    return (
      <div className="mt-10">
        <InvestorMasteryScreen
          company={company}
          pillarId="forces"
          questSlug={hubSlug}
          questTitle={hubTitle}
          theme={theme}
          cardsRead={progress.topicsRead}
          cardsTotal={progress.topicsRequired}
          onContinue={() => setScreen("quiz")}
          onReviewCards={() => setScreen("deck")}
        />
      </div>
    );
  }

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
          <motion.button
            type="button"
            onClick={() => setScreen("quiz")}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mx-auto block rounded-full border px-8 py-3.5 text-[12px] font-bold uppercase tracking-[0.2em] transition"
            style={{
              borderColor: theme.border,
              background: `linear-gradient(135deg, ${theme.glowSoft}, rgba(0,0,0,0.35))`,
              color: theme.hi,
              boxShadow: `0 0 28px -6px ${theme.glow}`
            }}
          >
            {islandQuizStartCta("forces")}
          </motion.button>
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
