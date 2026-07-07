"use client";

import { AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { useGame } from "@/components/GameProvider";
import { ConvictionFeedbackModal } from "@/components/conviction/ConvictionFeedbackModal";
import { companyById } from "@/data/companies";
import { pillarById } from "@/data/pillars";
import type { PendingConvictionItem } from "@/engine";
import { CONTROLLED_DEMO_MODE } from "@/lib/demo/controlledDemo";
import { NVDA_CONVICTION } from "@/lib/demo/nvidiaDemoVoice";
import {
  isSchoolsLearnerPath,
  resolveSchoolsLearnerHref
} from "@/lib/schools/schoolsDemoHref";
import { isSchoolsDemoPlaythroughActive } from "@/lib/schools/schoolsDemoPlaythrough";
import { warmSchoolsProfileApproachAssets } from "@/lib/schools/prefetchSchoolsProfileLinks";
import { XP_ISLAND_COMPLETION } from "@/engine/progression/xpEconomy";
import { appendConvictionRecord } from "@/lib/conviction";
import { filingForPillar } from "@/lib/conviction/filingForPillar";

/** Removed Schools quest-1 check-in — drain stale queue items from older saves. */
function isDeprecatedSchoolsQuest1CheckIn(
  item: PendingConvictionItem | undefined,
  pathname: string
): boolean {
  if (!item) return false;
  if (item.completedPillarId !== "business" || item.pillarToUnlock != null) {
    return false;
  }
  return isSchoolsLearnerPath(pathname) || isSchoolsDemoPlaythroughActive();
}

export function ConvictionQueueHost() {
  const { state, actions } = useGame();
  const router = useRouter();
  const pathname = usePathname();
  const head = state.pendingConvictionQueue[0];
  const open = Boolean(head);
  const pendingRouteRef = useRef<string | null>(null);
  const prevLen = useRef(state.pendingConvictionQueue.length);

  useEffect(() => {
    if (!isDeprecatedSchoolsQuest1CheckIn(head, pathname)) return;
    actions.dropPendingConviction("business", null);
  }, [head, pathname, actions]);

  const resolvePostConvictionRoute = useCallback((): string => {
    if (!head) return "/map";
    if (isSchoolsLearnerPath(pathname) || isSchoolsDemoPlaythroughActive()) {
      if (head.completedPillarId === "business") {
        if (isSchoolsDemoPlaythroughActive()) {
          return resolveSchoolsLearnerHref("/schools/profile", pathname);
        }
      }
      if (isSchoolsDemoPlaythroughActive()) {
        return resolveSchoolsLearnerHref("/schools/map", pathname);
      }
    }
    if (head.pillarToUnlock != null) {
      return pillarById(head.pillarToUnlock).route;
    }
    return "/map";
  }, [head, pathname]);

  const onPick = useCallback(
    (conviction: "confident" | "cautious") => {
      if (!head) return;
      const company = companyById(state.activeCompanyId);
      const pillarMeta = pillarById(head.completedPillarId);
      appendConvictionRecord({
        ticker: company.ticker,
        island: pillarMeta.title,
        filing: filingForPillar(head.completedPillarId),
        conviction,
        timestamp: Date.now()
      });
      const next = resolvePostConvictionRoute();
      if (next.includes("/profile")) {
        warmSchoolsProfileApproachAssets();
      }

      actions.submitConvictionAndAdvance();
      pendingRouteRef.current = next;
    },
    [head, resolvePostConvictionRoute, state.activeCompanyId, actions]
  );

  useEffect(() => {
    if (!open || !head) return;
    if (head.completedPillarId !== "business") return;
    if (!isSchoolsLearnerPath(pathname) && !isSchoolsDemoPlaythroughActive()) return;
    warmSchoolsProfileApproachAssets();
  }, [head, open, pathname]);

  const deprecatedSchoolsCheckIn = isDeprecatedSchoolsQuest1CheckIn(head, pathname);
  const showModal = open && head && !deprecatedSchoolsCheckIn;

  useEffect(() => {
    const len = state.pendingConvictionQueue.length;
    const prev = prevLen.current;
    prevLen.current = len;
    if (prev > 0 && len === 0 && pendingRouteRef.current) {
      const target = pendingRouteRef.current;
      pendingRouteRef.current = null;
      const id = window.setTimeout(() => {
        router.replace(target);
      }, 340);
      return () => window.clearTimeout(id);
    }
  }, [state.pendingConvictionQueue.length, router]);

  return (
    <AnimatePresence>
      {showModal && head ? (
        <ConvictionFeedbackModal
          key={`${head.completedPillarId}:${head.pillarToUnlock ?? "none"}`}
          pillarTitle={pillarById(head.completedPillarId).title}
          nextIslandTitle={
            head.pillarToUnlock
              ? pillarById(head.pillarToUnlock).title
              : undefined
          }
          kicker={
            CONTROLLED_DEMO_MODE
              ? NVDA_CONVICTION.kicker(pillarById(head.completedPillarId).title)
              : undefined
          }
          heading={CONTROLLED_DEMO_MODE ? NVDA_CONVICTION.heading : undefined}
          body={
            CONTROLLED_DEMO_MODE
              ? NVDA_CONVICTION.body(
                  XP_ISLAND_COMPLETION,
                  head.pillarToUnlock != null
                )
              : undefined
          }
          nextUnlockLabel={
            CONTROLLED_DEMO_MODE ? NVDA_CONVICTION.nextUnlock : undefined
          }
          onConfident={() => void onPick("confident")}
          onCautious={() => void onPick("cautious")}
        />
      ) : null}
    </AnimatePresence>
  );
}
