import {
  BUSINESS_AI_QUEST_SLUGS,
  isBusinessAiQuestSlugValue,
  type BusinessAiQuestSlug
} from "@/app/business/businessQuestSlugs";

export { isBusinessAiQuestSlugValue };
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
    questSlug: "what-they-do",
    cardId: "card-1",
    formType: "10-K",
    sectionKeys: ["item_1"],
    promptFocus:
      "ONLY what the company sells — main products and services. Do not discuss geography or competitors."
  },
  {
    questSlug: "what-they-do",
    cardId: "card-2",
    formType: "10-K",
    sectionKeys: ["item_1"],
    promptFocus:
      "ONLY why customers buy — faster AI, smoother games, processing large amounts of data efficiently. Benefits to companies, gamers, and businesses. No market-size or competitor overview."
  },
  {
    questSlug: "why-buying",
    cardId: "card-1",
    formType: "10-K",
    sectionKeys: ["item_1"],
    promptFocus:
      "ONLY who pays the most — major customers and customer concentration. No product list from other cards."
  },
  {
    questSlug: "why-buying",
    cardId: "card-2",
    formType: "10-K",
    sectionKeys: ["item_1", "item_8"],
    promptFocus:
      "ONLY revenue by product and service line — biggest earners. Segment-focused."
  },
  {
    questSlug: "why-buying",
    cardId: "card-3",
    formType: "10-K",
    sectionKeys: ["item_1", "item_7"],
    promptFocus:
      "ONLY why demand is strong now — AI / data-center rush in plain terms. Not a customer list repeat."
  },
  {
    questSlug: "everyday-life",
    cardId: "card-1",
    formType: "10-K",
    sectionKeys: ["item_1"],
    promptFocus:
      "ONLY where end users meet the technology — apps, games, cloud services. No revenue tables."
  },
  {
    questSlug: "everyday-life",
    cardId: "card-2",
    formType: "10-K",
    sectionKeys: ["item_1"],
    promptFocus:
      "ONLY gaming and AI application impact — speed, graphics, model training/inference feel. Relatable examples."
  },
  {
    questSlug: "everyday-life",
    cardId: "card-3",
    formType: "10-K",
    sectionKeys: ["item_1"],
    promptFocus:
      "ONLY why builders and AI companies rely on this company — ecosystem, software, default choice. Not competitor names yet."
  },
  {
    questSlug: "how-it-works",
    cardId: "card-1",
    formType: "10-K",
    sectionKeys: ["item_1"],
    promptFocus:
      "ONLY design-to-build journey — who designs, who manufactures. No R&D moat essay."
  },
  {
    questSlug: "how-it-works",
    cardId: "card-2",
    formType: "10-K",
    sectionKeys: ["item_1"],
    promptFocus:
      "ONLY manufacturing partners and supply chain — who builds, concentration risk. Do not repeat card-1 design story."
  },
  {
    questSlug: "how-it-works",
    cardId: "card-3",
    formType: "10-K",
    sectionKeys: ["item_1"],
    promptFocus:
      "ONLY distribution and global delivery to customers. No workforce deep dive."
  },
  {
    questSlug: "why-they-stay",
    cardId: "card-1",
    formType: "10-K",
    sectionKeys: ["item_1"],
    promptFocus:
      "ONLY switching costs and why hard to replace — trust, habit, performance. Not competitor list."
  },
  {
    questSlug: "why-they-stay",
    cardId: "card-2",
    formType: "10-K",
    sectionKeys: ["item_1"],
    promptFocus:
      "ONLY differentiation vs rivals — speed, software, brand. Do not repeat card-1 switching cost paragraph."
  },
  {
    questSlug: "why-they-stay",
    cardId: "card-3",
    formType: "10-K",
    sectionKeys: ["item_1"],
    promptFocus:
      "ONLY developer ecosystem and software stack — CUDA, tools, habit. No R&D spend tables only."
  },
  {
    questSlug: "competition",
    cardId: "card-1",
    formType: "10-K",
    sectionKeys: ["item_1"],
    promptFocus: "ONLY named competitors and rival categories. No regulation yet."
  },
  {
    questSlug: "competition",
    cardId: "card-2",
    formType: "10-K",
    sectionKeys: ["item_1", "item_7"],
    promptFocus:
      "ONLY industry tailwinds and trends that could accelerate growth. Do not repeat competitor names from card-1."
  },
  {
    questSlug: "competition",
    cardId: "card-3",
    formType: "10-K",
    sectionKeys: ["item_1"],
    promptFocus:
      "ONLY risks and headwinds — regulation, rivalry, demand slowdown. Land impact on the company."
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
