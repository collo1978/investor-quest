"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useGame } from "@/components/GameProvider";
import { MissionBriefCard } from "@/components/map/MissionBriefCard";
import { initialCompanyProgress } from "@/engine/progression/state";
import { QUEST_MAP_PATH } from "@/lib/screenAssetUrls";

export default function MissionBriefPageClient() {
  const router = useRouter();
  const { actions, raw, hydrated } = useGame();
  const [leaving, setLeaving] = useState(false);

  const companyProgress =
    raw.companies[raw.activeCompanyId] ?? initialCompanyProgress();
  const briefDismissed = companyProgress.questMapBriefDismissedAt != null;

  useEffect(() => {
    if (!hydrated || !briefDismissed) return;
    router.replace("/map");
  }, [briefDismissed, hydrated, router]);

  const handleLetsGo = useCallback(() => {
    setLeaving(true);
    actions.dismissQuestMapBrief();
    router.replace("/map");
  }, [actions, router]);

  if (leaving || (hydrated && briefDismissed)) {
    return (
      <main className="pointer-events-none min-h-[calc(100dvh-8rem)] bg-[#05050F] md:min-h-[calc(100dvh-5rem)]" />
    );
  }

  return (
    <main className="pointer-events-auto relative flex min-h-[calc(100dvh-8rem)] w-full flex-col items-center justify-center overflow-x-hidden bg-[#05050F] px-3 py-8 pb-32 sm:px-5 md:min-h-[calc(100dvh-5rem)] md:pb-8">
      {/* Quest map artwork — full-bleed backdrop (same asset as /map). */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <Image
          src={QUEST_MAP_PATH}
          alt=""
          fill
          priority
          sizes="100vw"
          className="select-none object-cover object-center opacity-90"
        />
        {/* Light wash — map stays visible; card remains the focal point. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(5,5,15,0.10) 0%, rgba(5,5,15,0.22) 50%, rgba(4,2,14,0.32) 100%)"
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 85% at 50% 35%, rgba(40,22,90,0.10) 0%, rgba(14,8,42,0.16) 50%, transparent 100%)"
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            boxShadow: "inset 0 0 80px rgba(0,0,0,0.22)"
          }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-[10] w-full max-w-[min(100%,26rem)] sm:max-w-[28rem] md:max-w-[min(100%,32rem)]"
      >
        <MissionBriefCard
          titleId="mission-brief-page-title"
          primaryLabel="Let's go"
          onPrimary={handleLetsGo}
        />
      </motion.div>
    </main>
  );
}
