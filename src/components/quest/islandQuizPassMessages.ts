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
  return "You leveled up — XP is locked in. Keep building conviction across the island.";
}

function businessPassMessage(type: string): string {
  switch (type) {
    case "snapshot":
      return "You can now explain what this company does in normal life — that's the foundation.";
    case "revenue":
      return "You see where the money really comes from — that makes every judgment sharper.";
    case "operations":
      return "You get how the business actually runs day to day — execution is where plans meet reality.";
    case "advantage":
      return "You know what protects the business — durable edges compound over time.";
    case "industry":
      return "You see the competitive arena — context completes the picture.";
    default:
      return "Keep building conviction across the Business island.";
  }
}

function forcesPassMessage(_slug: string): string {
  return "You can name a real-world force that could help or hurt this stock — not just buzzwords.";
}

function financialsPassMessage(slug: string): string {
  switch (slug) {
    case "growth":
      return "You can read growth in plain terms — pace and mix shape every upside case.";
    case "profitability":
      return "You know whether profits feel real — margins tell the everyday story.";
    case "expenses":
      return "You see how efficiently the company runs — wasted spend shows up fast.";
    case "cash":
      return "You can judge real cash — cash is what pays the bills, not headlines.";
    case "financial-strength":
      return "You've sized up financial strength — resilience matters when times get tough.";
    default:
      return "You leveled up your read on how the money works.";
  }
}

function managementPassMessage(slug: string): string {
  switch (slug) {
    case "mgmt-1":
      return "You've met the bench — trust is earned when leaders deliver, not just promise.";
    case "mgmt-quiz":
      return "You've stress-tested the team — pay and alignment are on your radar.";
    case "mgmt-2":
      return "You understand how they're paid — incentives drive real behavior.";
    case "mgmt-governance":
      return "You've checked the guardrails — oversight protects everyday shareholders.";
    case "mgmt-financial-strength":
      return "You've connected stewardship to results — management quality shows up in the numbers.";
    default:
      return "You've sharpened your lens on the people running the company.";
  }
}
