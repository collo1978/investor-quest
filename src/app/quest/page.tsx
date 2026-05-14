"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { QuestDetailScreen } from "@/components/QuestDetailScreen";
import { useGame } from "@/components/GameProvider";
import {
  PILLAR_ORDER,
  pillarById,
  type PillarId
} from "@/data/pillars";

/**
 * `/quest` route — thin wrapper around {@link QuestDetailScreen}.
 *
 * Reads `pillar` + `quest` from the URL and renders the canonical
 * gold quest detail layout for any pillar. If `quest` is missing,
 * we bounce the user back to the island route so they can pick one
 * from the island artwork; if `pillar` is missing or unknown, we
 * fall back to the player's current pillar.
 *
 * The legacy purple "list of quests in a grid" view and the
 * `QuestPanel` modal that lived on this route in MVP-1 are
 * intentionally removed — the gold reading card is now the single
 * surface for quest detail across every pillar.
 */
function QuestPageInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { state } = useGame();

  const pillarParam = params.get("pillar");
  const questParam = params.get("quest");

  const fallbackPillarId = useMemo<PillarId>(() => {
    if (state.activePillarId) return state.activePillarId;
    return PILLAR_ORDER[0];
  }, [state.activePillarId]);

  const pillarId: PillarId = useMemo(() => {
    if (pillarParam && isPillarId(pillarParam)) return pillarParam;
    return fallbackPillarId;
  }, [pillarParam, fallbackPillarId]);

  // No specific quest selected — bounce back to the island screen
  // so the user can pick one from the artwork.
  useEffect(() => {
    if (questParam) return;
    const meta = pillarById(pillarId);
    router.replace(meta.route);
  }, [questParam, pillarId, router]);

  if (!questParam) return null;

  return <QuestDetailScreen pillarId={pillarId} slug={questParam} />;
}

function isPillarId(value: string): value is PillarId {
  return (PILLAR_ORDER as readonly string[]).includes(value);
}

export default function QuestPage() {
  return (
    <Suspense
      fallback={
        <main className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-bg-0" />
      }
    >
      <QuestPageInner />
    </Suspense>
  );
}
