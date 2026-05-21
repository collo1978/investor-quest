import { HUMAN_FIRST_MISSION, HUMAN_FIRST_SIX_STEPS } from "@/lib/quests/humanFirstExplanation";

/** Whether an active system prompt includes the human-first explanation architecture. */
export function systemPromptHasRelatableVoice(body: string): boolean {
  const b = body.toLowerCase();
  return (
    b.includes("human-first") ||
    b.includes("teenager picture test") ||
    b.includes("everyday life") ||
    b.includes(HUMAN_FIRST_MISSION.toLowerCase().slice(0, 24)) ||
    (b.includes("real life") && b.includes("why investors care"))
  );
}

export function systemPromptHasHumanFirstArchitecture(body: string): boolean {
  const b = body.toLowerCase();
  const steps = HUMAN_FIRST_SIX_STEPS.toLowerCase();
  const hasMission = b.includes("smart friend") || b.includes("human-first");
  const hasSteps =
    b.includes("real life") &&
    (b.includes("pain") || b.includes("problem")) &&
    b.includes("why investors care");
  return hasMission && hasSteps;
}

export function promptPayloadPreview(body: string, maxLen = 480): string {
  const trimmed = body.replace(/\s+/g, " ").trim();
  return trimmed.length <= maxLen ? trimmed : `${trimmed.slice(0, maxLen)}…`;
}
