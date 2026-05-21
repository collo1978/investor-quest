"use client";

import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { useGame } from "@/components/GameProvider";
import { ConvictionFeedbackModal } from "@/components/conviction/ConvictionFeedbackModal";
import { companyById } from "@/data/companies";
import { pillarById } from "@/data/pillars";
import { appendConvictionRecord } from "@/lib/conviction";
import { filingForPillar } from "@/lib/conviction/filingForPillar";

export function ConvictionQueueHost() {
  const { state, actions } = useGame();
  const router = useRouter();
  const head = state.pendingConvictionQueue[0];
  const open = Boolean(head);
  const pendingRouteRef = useRef<string | null>(null);
  const prevLen = useRef(state.pendingConvictionQueue.length);

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
      const next =
        head.pillarToUnlock != null
          ? pillarById(head.pillarToUnlock).route
          : "/map";
      pendingRouteRef.current = next;
      actions.submitConvictionAndAdvance();
    },
    [head, state.activeCompanyId, actions]
  );

  useEffect(() => {
    const len = state.pendingConvictionQueue.length;
    const prev = prevLen.current;
    prevLen.current = len;
    if (prev > 0 && len === 0 && pendingRouteRef.current) {
      const target = pendingRouteRef.current;
      pendingRouteRef.current = null;
      const id = window.setTimeout(() => {
        router.push(target);
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
          onConfident={() => void onPick("confident")}
          onCautious={() => void onPick("cautious")}
        />
      ) : null}
    </AnimatePresence>
  );
}
