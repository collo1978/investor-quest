"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useGame } from "@/components/GameProvider";
import { initialCompanyProgress } from "@/engine/progression/state";

/**
 * Legacy route — mission brief now appears as a cinematic overlay on `/map`.
 */
export default function MissionBriefPageClient() {
  const router = useRouter();
  const { raw, persistenceReady } = useGame();

  useEffect(() => {
    if (!persistenceReady) return;
    const prog =
      raw.companies[raw.activeCompanyId] ?? initialCompanyProgress();
    if (prog.questMapBriefDismissedAt != null) {
      router.replace("/map");
      return;
    }
    router.replace("/map");
  }, [persistenceReady, raw, router]);

  return (
    <main className="pointer-events-none min-h-[100dvh] bg-[#05050F]" aria-hidden />
  );
}
