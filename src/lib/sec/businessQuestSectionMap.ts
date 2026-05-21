import type { BusinessAiQuestSlug } from "@/app/business/businessQuestSlugs";
import { BUSINESS_AI_QUEST_SLUGS } from "@/app/business/businessQuestSlugs";
import type { QuestCardSpec } from "@/lib/sec/questCardSpec";

export const BUSINESS_REQUIRED_10K_SECTION_KEYS = ["item_1"] as const;

/** Revenue visuals benefit from segment tables in Item 8 / MD&A. */
export const BUSINESS_REVENUE_VISUAL_SECTION_KEYS = [
  "item_1",
  "item_8",
  "item_7"
] as const;

export const BUSINESS_QUEST_CARD_SPECS: readonly QuestCardSpec[] = [
  {
    questSlug: "snapshot",
    cardId: "card-1",
    formType: "10-K",
    sectionKeys: ["item_1"],
    promptFocus:
      "ONLY what the company sells — main products and services. Do not discuss geography or competitors."
  },
  {
    questSlug: "snapshot",
    cardId: "card-2",
    formType: "10-K",
    sectionKeys: ["item_1"],
    promptFocus:
      "ONLY the everyday customer pain WITHOUT this company, what goes wrong (slow/lag/broken/expensive/confusing), and how life feels better WITH them. Pain → consequence → benefit. No revenue, competitors, or industry overview. Never 'solutions for industries' or corporate AI buzzwords."
  },
  {
    questSlug: "snapshot",
    cardId: "card-3",
    formType: "10-K",
    sectionKeys: ["item_1"],
    promptFocus:
      "ONLY company scale and market position — size, reach, flagship products. Do not repeat the product list from card-1."
  },
  {
    questSlug: "revenue",
    cardId: "card-1",
    formType: "10-K",
    sectionKeys: ["item_1", "item_8"],
    promptFocus:
      "ONLY revenue by product and service line (major segments). Name the biggest earners. A chart may show below — keep prose tight and segment-focused."
  },
  {
    questSlug: "revenue",
    cardId: "card-2",
    formType: "10-K",
    sectionKeys: ["item_8", "item_7", "item_1"],
    promptFocus:
      "ONLY revenue by geography or region. Note concentration risk. Do not repeat product mix from card-1."
  },
  {
    questSlug: "revenue",
    cardId: "card-3",
    formType: "10-K",
    sectionKeys: ["item_1"],
    promptFocus:
      "ONLY who pays — customer types (consumers, enterprises, partners, developers). No regional breakdown."
  },
  {
    questSlug: "operations",
    cardId: "card-1",
    formType: "10-K",
    sectionKeys: ["item_1"],
    promptFocus:
      "ONLY how products reach customers — channels, distribution, logistics, digital delivery. No workforce or R&D."
  },
  {
    questSlug: "operations",
    cardId: "card-2",
    formType: "10-K",
    sectionKeys: ["item_1"],
    promptFocus:
      "ONLY workforce and human capital — headcount themes, talent, key roles. Do not repeat distribution channels from card-1."
  },
  {
    questSlug: "advantage",
    cardId: "card-1",
    formType: "10-K",
    sectionKeys: ["item_1"],
    promptFocus:
      "ONLY R&D and innovation investment — what they build for the future. No brand or patent list yet."
  },
  {
    questSlug: "advantage",
    cardId: "card-2",
    formType: "10-K",
    sectionKeys: ["item_1"],
    promptFocus:
      "ONLY competitive moat — brand, IP, ecosystem, switching costs, loyalty. Do not repeat R&D spend details from card-1."
  },
  {
    questSlug: "industry",
    cardId: "card-1",
    formType: "10-K",
    sectionKeys: ["item_1"],
    promptFocus:
      "ONLY named competitors and rival categories. No regulation yet."
  },
  {
    questSlug: "industry",
    cardId: "card-2",
    formType: "10-K",
    sectionKeys: ["item_1"],
    promptFocus:
      "ONLY how competitive the industry is — pricing pressure, innovation pace, concentration. Do not repeat competitor names from card-1."
  },
  {
    questSlug: "industry",
    cardId: "card-3",
    formType: "10-K",
    sectionKeys: ["item_1"],
    promptFocus:
      "ONLY regulations and legal risks that affect the business. Do not repeat competitor or industry intensity points."
  }
] as const;

export function getBusinessCardSpecs(
  questSlug?: BusinessAiQuestSlug
): QuestCardSpec[] {
  if (!questSlug) {
    return BUSINESS_QUEST_CARD_SPECS.filter((s) =>
      (BUSINESS_AI_QUEST_SLUGS as readonly string[]).includes(s.questSlug)
    );
  }
  return BUSINESS_QUEST_CARD_SPECS.filter((s) => s.questSlug === questSlug);
}

export function isBusinessAiQuestSlugValue(
  value: string
): value is BusinessAiQuestSlug {
  return (BUSINESS_AI_QUEST_SLUGS as readonly string[]).includes(value);
}
