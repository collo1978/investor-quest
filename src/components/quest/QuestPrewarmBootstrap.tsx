"use client";

import { useEffect, useRef } from "react";

import { isDemoPrewarmDisabled } from "@/lib/quests/questGenerationModeClient";

const DEMO_PREWARM_SESSION_KEY = "iq-demo-snapshot-prewarm-v1";

/**
 * Once per browser session, prewarm Business Snapshot for all demo companies
 * so the first quest open feels instant when answers are already cached.
 */
export function QuestPrewarmBootstrap() {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    if (isDemoPrewarmDisabled()) return;
    if (typeof sessionStorage === "undefined") return;
    if (sessionStorage.getItem(DEMO_PREWARM_SESSION_KEY)) return;

    started.current = true;
    sessionStorage.setItem(DEMO_PREWARM_SESSION_KEY, "1");

    // Fast dev: no multi-company prewarm storm — active company handled by useQuestPrewarm.
  }, []);

  return null;
}
