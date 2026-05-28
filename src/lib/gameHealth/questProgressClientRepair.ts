import type { CompanyId } from "@/data/companies";
import type { PillarId } from "@/data/pillars";
import type { GameAction } from "@/engine/progression/reducer";

export type QuestProgressRepairMode =
  | "repair"
  | "reset"
  | "unlock_quiz";

export type QuestProgressClientRepairParams = {
  companyId: CompanyId;
  pillarId: PillarId;
  questSlug: string;
  cardIds: string[];
  mode: QuestProgressRepairMode;
};

export function buildRepairQuestProgressAction(
  params: QuestProgressClientRepairParams
): GameAction {
  return {
    type: "repair-quest-progress",
    companyId: params.companyId,
    pillarId: params.pillarId,
    questSlug: params.questSlug,
    cardIds: params.cardIds,
    mode: params.mode
  };
}

/**
 * Apply quest read-state repair through the canonical reducer dispatch.
 * Never writes localStorage directly — GameProvider persists after dispatch.
 */
export function applyQuestProgressClientRepair(
  params: QuestProgressClientRepairParams,
  dispatch: (action: GameAction) => void
): { ok: boolean; message: string; laymanMessage: string } {
  if (typeof window === "undefined") {
    return {
      ok: false,
      message: "Client repair requires a browser.",
      laymanMessage: "Open this fix link on a phone or laptop with the game open."
    };
  }

  dispatch(buildRepairQuestProgressAction(params));

  const modeLabel =
    params.mode === "reset"
      ? "Reset"
      : params.mode === "unlock_quiz"
        ? "Quiz unlock"
        : "Repair";

  return {
    ok: true,
    message: `${modeLabel} applied for ${params.questSlug} (${params.companyId}).`,
    laymanMessage: `${modeLabel} applied. Quiz unlock should update immediately.`
  };
}
