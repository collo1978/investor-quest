"use client";

import { AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { useGame } from "@/components/GameProvider";
import { ConvictionFeedbackModal } from "@/components/conviction/ConvictionFeedbackModal";
import { companyById } from "@/data/companies";
import { pillarById } from "@/data/pillars";
import { CONTROLLED_DEMO_MODE } from "@/lib/demo/controlledDemo";
import { NVDA_CONVICTION } from "@/lib/demo/nvidiaDemoVoice";
import { resolveSchoolsLearnerHref, isSchoolsLearnerPath } from "@/lib/schools/schoolsDemoHref";
import { isSchoolsDemoPlaythroughActive } from "@/lib/schools/schoolsDemoPlaythrough";
import { warmSchoolsProfileApproachAssets } from "@/lib/schools/prefetchSchoolsProfileLinks";
import {
  SCHOOLS_CONVICTION_BODY,
  SCHOOLS_CONVICTION_CAUTIOUS_DESCRIPTION,
  SCHOOLS_CONVICTION_CAUTIOUS_LABEL,
  SCHOOLS_CONVICTION_CONFIDENT_LABEL,
  schoolsConvictionConfidentDescription,
  schoolsConvictionHeading,
  schoolsConvictionKicker
} from "@/lib/schools/schoolsQuestRewardFlow";
import { XP_ISLAND_COMPLETION } from "@/engine/progression/xpEconomy";
import { appendConvictionRecord } from "@/lib/conviction";
import { filingForPillar } from "@/lib/conviction/filingForPillar";

export function ConvictionQueueHost() {
  const { state, actions } = useGame();
  const router = useRouter();
  const pathname = usePathname();
  const head = state.pendingConvictionQueue[0];
  const open = Boolean(head);
  const pendingRouteRef = useRef<string | null>(null);
  const prevLen = useRef(state.pendingConvictionQueue.length);

  const resolvePostConvictionRoute = useCallback((): string => {
    if (!head) return "/map";
    if (isSchoolsLearnerPath(pathname) || isSchoolsDemoPlaythroughActive()) {
      if (head.completedPillarId === "business") {
        if (head.pillarToUnlock == null) {
          return resolveSchoolsLearnerHref("/schools/business", pathname);
        }
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
      const schoolsImmediate =
        isSchoolsLearnerPath(pathname) &&
        head.completedPillarId === "business" &&
        head.pillarToUnlock == null;

      actions.submitConvictionAndAdvance();

      if (schoolsImmediate) {
        pendingRouteRef.current = null;
        if (pathname !== next) {
          router.replace(next);
        }
        return;
      }

      pendingRouteRef.current = next;
    },
    [head, pathname, resolvePostConvictionRoute, router, state.activeCompanyId, actions]
  );

  useEffect(() => {
    if (!open || !head) return;
    if (head.completedPillarId !== "business") return;
    if (!isSchoolsLearnerPath(pathname) && !isSchoolsDemoPlaythroughActive()) return;
    warmSchoolsProfileApproachAssets();
  }, [head, open, pathname]);

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
      {open && head ? (
        <ConvictionFeedbackModal
          key={`${head.completedPillarId}:${head.pillarToUnlock ?? "none"}`}
          pillarTitle={pillarById(head.completedPillarId).title}
          nextIslandTitle={
            head.pillarToUnlock
              ? pillarById(head.pillarToUnlock).title
              : undefined
          }
          kicker={
            isSchoolsLearnerPath(pathname)
              ? schoolsConvictionKicker(pillarById(head.completedPillarId).title)
              : CONTROLLED_DEMO_MODE
                ? NVDA_CONVICTION.kicker(pillarById(head.completedPillarId).title)
                : undefined
          }
          heading={
            isSchoolsLearnerPath(pathname)
              ? schoolsConvictionHeading(companyById(state.activeCompanyId).name)
              : CONTROLLED_DEMO_MODE
                ? NVDA_CONVICTION.heading
                : undefined
          }
          body={
            isSchoolsLearnerPath(pathname)
              ? SCHOOLS_CONVICTION_BODY
              : CONTROLLED_DEMO_MODE
                ? NVDA_CONVICTION.body(
                    XP_ISLAND_COMPLETION,
                    head.pillarToUnlock != null
                  )
                : undefined
          }
          confidentLabel={
            isSchoolsLearnerPath(pathname)
              ? SCHOOLS_CONVICTION_CONFIDENT_LABEL
              : undefined
          }
          confidentDescription={
            isSchoolsLearnerPath(pathname)
              ? schoolsConvictionConfidentDescription(
                  companyById(state.activeCompanyId).name
                )
              : undefined
          }
          cautiousLabel={
            isSchoolsLearnerPath(pathname)
              ? SCHOOLS_CONVICTION_CAUTIOUS_LABEL
              : undefined
          }
          cautiousDescription={
            isSchoolsLearnerPath(pathname)
              ? SCHOOLS_CONVICTION_CAUTIOUS_DESCRIPTION
              : undefined
          }
          confidentGlyph={isSchoolsLearnerPath(pathname) ? "🟢" : undefined}
          cautiousGlyph={isSchoolsLearnerPath(pathname) ? "🔵" : undefined}
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
