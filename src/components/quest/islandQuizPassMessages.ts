import type { PillarId } from "@/data/pillars";
import { CONTROLLED_DEMO_MODE } from "@/lib/demo/controlledDemo";
import { islandQuizDefaultPassMessage } from "@/lib/quests/islandQuizStyle";
import {
  isNvidiaDemoVoiceActive,
  nvidiaIslandQuizPassMessage
} from "@/lib/demo/nvidiaDemoVoice";
import { normalizePlayerFacingCopy } from "@/lib/quests/normalizeQuestProse";

export function questCompleteHeadline(
  slug: string,
  title: string,
  type: string
): string {
  if (slug === "what-they-do" || type === "snapshot") return "SECTION COMPLETE";
  return `${title.toUpperCase()} COMPLETE`;
}

export function islandQuizPassMessage(
  pillarId: PillarId,
  slug: string,
  type: string
): string {
  if (CONTROLLED_DEMO_MODE && isNvidiaDemoVoiceActive()) {
    return normalizePlayerFacingCopy(nvidiaIslandQuizPassMessage(pillarId, slug));
  }
  const raw =
    pillarId === "business"
      ? businessPassMessage(type)
      : pillarId === "forces"
        ? forcesPassMessage(slug)
        : pillarId === "financials"
          ? financialsPassMessage(slug)
          : pillarId === "management"
            ? managementPassMessage(slug)
            : "You leveled up. XP is locked in. Keep clearing quests on the island.";
  return normalizePlayerFacingCopy(raw);
}

function businessPassMessage(type: string): string {
  switch (type) {
    case "snapshot":
      return "You can explain what this company does in everyday terms. That is the foundation for every later judgment.";
    case "revenue":
      return "You know where revenue comes from. That helps you judge the business more clearly.";
    case "everyday":
      return "You can connect this company to real life — not just a ticker on a screen.";
    case "operations":
      return "You see how the business runs day to day. Execution is where plans meet reality.";
    case "advantage":
      return "You know what protects the business. Durable advantages compound over time.";
    case "industry":
      return "You see the competitive arena. Context helps you judge the whole picture.";
    default:
      return islandQuizDefaultPassMessage("business");
  }
}

function forcesPassMessage(slug: string): string {
  if (slug.startsWith("forces-hub-positive-inside")) {
    return "You mapped NVIDIA's internal strengths — and proved it. That section is done.";
  }
  if (slug.startsWith("forces-hub-positive-outside")) {
    return "You spotted outside tailwinds for NVIDIA — quiz passed, section complete.";
  }
  if (slug.startsWith("forces-hub-negative-inside")) {
    return "You faced inside risks for NVIDIA — now you can name what could hurt from within.";
  }
  if (slug.startsWith("forces-hub-negative-outside")) {
    return "You tracked outside headwinds — competition, rules, macro — section locked in.";
  }
  return "You can name a real-world force that could help or hurt this stock, not just buzzwords.";
}

function financialsPassMessage(slug: string): string {
  switch (slug) {
    case "growth":
      return "You can read growth in plain terms. Pace and mix shape every upside case.";
    case "profitability":
      return "You know whether profits feel real. Margins tell the everyday story.";
    case "expenses":
      return "You see how efficiently the company runs. Wasted spend shows up fast.";
    case "cash":
      return "You can judge real cash. Cash pays the bills, not headlines.";
    case "financial-strength":
      return "You sized up financial strength. Resilience matters when times get tough.";
    default:
      return islandQuizDefaultPassMessage("financials");
  }
}

function managementPassMessage(slug: string): string {
  switch (slug) {
    case "mgmt-1":
      return "You met the leadership bench. Trust is earned when leaders deliver, not just promise.";
    case "mgmt-quiz":
      return "You stress-tested the team. Pay and alignment are on your radar.";
    case "mgmt-2":
      return "You understand how leaders are paid. Incentives drive real behavior.";
    case "mgmt-governance":
      return "You checked the guardrails. Oversight protects everyday shareholders.";
    case "mgmt-financial-strength":
      return "You connected stewardship to results. Management quality shows up in the numbers.";
    default:
      return islandQuizDefaultPassMessage("management");
  }
}
