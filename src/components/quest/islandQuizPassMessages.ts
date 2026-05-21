import type { PillarId } from "@/data/pillars";

export function questCompleteHeadline(
  slug: string,
  title: string,
  type: string
): string {
  if (slug === "snapshot" || type === "snapshot") return "SNAPSHOT COMPLETE";
  return `${title.toUpperCase()} COMPLETE`;
}

export function islandQuizPassMessage(
  pillarId: PillarId,
  slug: string,
  type: string
): string {
  if (pillarId === "business") return businessPassMessage(type);
  if (pillarId === "forces") return forcesPassMessage(slug);
  if (pillarId === "financials") return financialsPassMessage(slug);
  if (pillarId === "management") return managementPassMessage(slug);
  return "XP is locked in for this quest. Keep building conviction across the island.";
}

function businessPassMessage(type: string): string {
  switch (type) {
    case "snapshot":
      return "You've taken the first step toward understanding the business.";
    case "revenue":
      return "You can see where the money comes from — that sharpens every judgment call.";
    case "operations":
      return "You understand how the business runs day to day — execution shapes outcomes.";
    case "advantage":
      return "You've mapped what protects the business — durable edges compound over time.";
    case "industry":
      return "You've placed the company in its competitive arena — context completes the picture.";
    default:
      return "Keep building conviction across the Business island.";
  }
}

function forcesPassMessage(_slug: string): string {
  return "You've leveled up your read on a force that can help or hurt the stock.";
}

function financialsPassMessage(slug: string): string {
  switch (slug) {
    case "growth":
      return "You can read the growth engine — pace and mix shape every upside case.";
    case "profitability":
      return "You know whether profits are real and durable — margins tell the story.";
    case "expenses":
      return "You see how efficiently the company runs — cost discipline compounds.";
    case "cash":
      return "You can judge real cash generation — cash flow funds the future.";
    case "financial-strength":
      return "You've sized up balance-sheet strength — resilience matters when cycles turn.";
    default:
      return "You've leveled up your read on how the money works.";
  }
}

function managementPassMessage(slug: string): string {
  switch (slug) {
    case "mgmt-1":
      return "You've met the bench — trust in leadership is earned through delivery.";
    case "mgmt-quiz":
      return "You've stress-tested the team — incentives and alignment are on your radar.";
    case "mgmt-2":
      return "You understand how they're paid — incentives drive behavior over time.";
    case "mgmt-governance":
      return "You've checked the guardrails — governance protects minority owners.";
    case "mgmt-financial-strength":
      return "You've connected stewardship to capital — management quality shows up in results.";
    default:
      return "You've sharpened your lens on the people running the company.";
  }
}
