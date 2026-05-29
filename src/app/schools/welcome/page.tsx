"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useGame } from "@/components/GameProvider";
import { resolveSchoolsHomeEntryRoute } from "@/lib/schools/schoolsFunnel";

/** Legacy route — schools funnel skips the welcome intro. */
export default function SchoolsWelcomePage() {
  const router = useRouter();
  const { raw, persistenceReady } = useGame();

  useEffect(() => {
    if (!persistenceReady) return;
    router.replace(resolveSchoolsHomeEntryRoute(raw));
  }, [raw, persistenceReady, router]);

  return null;
}
