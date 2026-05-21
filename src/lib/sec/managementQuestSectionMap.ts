import type { ManagementAiQuestSlug } from "@/app/management/managementQuestSlugs";
import { MANAGEMENT_AI_QUEST_SLUGS } from "@/app/management/managementQuestSlugs";
import type { QuestCardSpec } from "@/lib/sec/questCardSpec";

export const MANAGEMENT_QUEST_CARD_SPECS: readonly QuestCardSpec[] = [
  {
    questSlug: "mgmt-1",
    cardId: "card-1",
    formType: "DEF 14A",
    sectionKeys: ["proxy_executives"],
    promptFocus:
      "ONLY named executive officers — who they are, relevant experience, scope of role. No pay tables yet."
  },
  {
    questSlug: "mgmt-1",
    cardId: "card-2",
    formType: "DEF 14A",
    sectionKeys: ["proxy_executives", "proxy_board"],
    promptFocus:
      "ONLY executive tenure and stability — years in role, turnover signals. Do not repeat bios from card-1."
  },
  {
    questSlug: "mgmt-1",
    cardId: "card-3",
    formType: "DEF 14A",
    sectionKeys: ["proxy_executives"],
    promptFocus:
      "ONLY track record and outcomes leadership oversaw — use proxy/10-K themes, not hype. No compensation."
  },
  {
    questSlug: "mgmt-quiz",
    cardId: "card-1",
    formType: "DEF 14A",
    sectionKeys: ["proxy_ownership", "proxy_executives"],
    promptFocus:
      "ONLY insider ownership — do executives hold meaningful stock? Mention Form 4 patterns only if in proxy."
  },
  {
    questSlug: "mgmt-quiz",
    cardId: "card-2",
    formType: "DEF 14A",
    sectionKeys: ["proxy_compensation"],
    promptFocus:
      "ONLY pay vs performance — compare compensation trends to operating/TSR outcomes honestly."
  },
  {
    questSlug: "mgmt-quiz",
    cardId: "card-3",
    formType: "DEF 14A",
    sectionKeys: ["proxy_compensation"],
    promptFocus:
      "ONLY pay structure — salary vs bonus vs equity, vesting, performance tests. Do not repeat card-2 totals."
  },
  {
    questSlug: "mgmt-quiz",
    cardId: "card-4",
    formType: "DEF 14A",
    sectionKeys: ["proxy_compensation"],
    promptFocus:
      "ONLY annual incentive metrics — what targets drive bonuses (revenue, EPS, ESG, etc.) and whether they look hard."
  },
  {
    questSlug: "mgmt-2",
    cardId: "card-1",
    formType: "10-K",
    sectionKeys: ["item_7", "item_8"],
    promptFocus:
      "ONLY uses of cash — reinvestment, capex, M&A, debt paydown. No dividend/buyback detail yet."
  },
  {
    questSlug: "mgmt-2",
    cardId: "card-2",
    formType: "10-K",
    sectionKeys: ["item_7", "item_8"],
    promptFocus:
      "ONLY shareholder returns — dividends, buybacks, net of dilution. Do not re-open capex breakdown from card-1."
  },
  {
    questSlug: "mgmt-governance",
    cardId: "card-1",
    formType: "DEF 14A",
    sectionKeys: ["proxy_board", "proxy_governance"],
    promptFocus:
      "ONLY board roster and independence — chair/CEO structure, lead independent director if any."
  },
  {
    questSlug: "mgmt-governance",
    cardId: "card-2",
    formType: "DEF 14A",
    sectionKeys: ["proxy_governance"],
    promptFocus:
      "ONLY board committees — audit, comp, nominating and what they oversee."
  },
  {
    questSlug: "mgmt-governance",
    cardId: "card-3",
    formType: "DEF 14A",
    sectionKeys: ["proxy_governance"],
    promptFocus:
      "ONLY related-party transactions and conflicts — disclose clearly, note investor concern level."
  },
  {
    questSlug: "mgmt-governance",
    cardId: "card-4",
    formType: "DEF 14A",
    sectionKeys: ["proxy_governance", "proxy_executives"],
    promptFocus:
      "ONLY change-in-control and severance — golden parachutes, acceleration, whether incentives align."
  },
  {
    questSlug: "mgmt-financial-strength",
    cardId: "card-1",
    formType: "10-K",
    sectionKeys: ["item_8"],
    promptFocus:
      "ONLY cash and liquid investments on hand vs near-term needs."
  },
  {
    questSlug: "mgmt-financial-strength",
    cardId: "card-2",
    formType: "10-K",
    sectionKeys: ["item_8", "item_7"],
    promptFocus:
      "ONLY debt — gross/net, maturities, fixed vs floating. Do not repeat cash totals from card-1."
  },
  {
    questSlug: "mgmt-financial-strength",
    cardId: "card-3",
    formType: "10-K",
    sectionKeys: ["item_8", "item_7"],
    promptFocus:
      "ONLY self-funding — operating/free cash flow consistency. No buyback lecture."
  },
  {
    questSlug: "management-summary",
    cardId: "card-1",
    formType: "DEF 14A",
    sectionKeys: ["proxy_governance", "proxy_compensation", "proxy_executives"],
    promptFocus:
      "ONE conviction verdict: leadership + incentives + governance + capital discipline — aligned with shareholders or not?"
  }
] as const;

export function getManagementCardSpecs(
  questSlug?: ManagementAiQuestSlug
): QuestCardSpec[] {
  if (!questSlug) return [...MANAGEMENT_QUEST_CARD_SPECS];
  return MANAGEMENT_QUEST_CARD_SPECS.filter((s) => s.questSlug === questSlug);
}

export function isManagementAiQuestSlugValue(
  value: string
): value is ManagementAiQuestSlug {
  return (MANAGEMENT_AI_QUEST_SLUGS as readonly string[]).includes(value);
}
