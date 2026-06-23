import assert from "node:assert/strict";
import test from "node:test";

import { BUSINESS_QUEST_TEMPLATES } from "@/data/quests/templates/business";
import { companyById } from "@/data/companies";
import { buildQuestId } from "@/data/quests/library";
import type { QuestDefinition } from "@/data/quests/types";
import { buildBusinessHubCards } from "@/lib/business/buildBusinessHubCards";

function demoQuests(): QuestDefinition[] {
  const company = companyById("aapl");
  return BUSINESS_QUEST_TEMPLATES.map((t) => ({
    ...t,
    id: buildQuestId(company.id, t.pillarId, t.slug),
    companyId: company.id,
    title: t.title,
    objective: t.objective,
    description: t.description,
    aiTask: t.aiTask,
    investorQuestion: t.investorQuestion,
    plainEnglishAnswer: t.plainEnglishAnswer,
    whyItMatters: t.whyItMatters
  }));
}

test("fresh state: only what-they-do unlocked", () => {
  const quests = demoQuests();
  const views = Object.fromEntries(
    quests.map((q) => [
      q.slug,
      {
        quest: q,
        completed: false,
        read: false,
        readAt: null,
        unlocked: true,
        work: null
      }
    ])
  );
  const cards = buildBusinessHubCards(quests, views, new Set());

  const bySlug = Object.fromEntries(cards.map((c) => [c.slug, c]));

  assert.equal(bySlug["what-they-do"]?.locked, false);
  assert.equal(bySlug["what-they-do"]?.visualState, "active");
  assert.equal(bySlug["what-they-do"]?.isPrimaryActive, true);

  for (const slug of [
    "why-buying",
    "everyday-life",
    "how-it-works",
    "why-they-stay",
    "competition",
    "who-competes"
  ] as const) {
    assert.equal(bySlug[slug]?.locked, true, `${slug} should be locked`);
    assert.equal(bySlug[slug]?.visualState, "locked", `${slug} visual`);
    assert.equal(bySlug[slug]?.isPrimaryActive, false, `${slug} primary`);
  }

  assert.equal(cards.length, 7);
});

test("missing why-buying row still locks everyday-life (canonical prior chain)", () => {
  const quests = demoQuests().filter((q) => q.slug !== "why-buying");
  const views = Object.fromEntries(
    quests.map((q) => [
      q.slug,
      {
        quest: q,
        completed: false,
        read: false,
        readAt: null,
        unlocked: true,
        work: null
      }
    ])
  );
  const cards = buildBusinessHubCards(quests, views, new Set());
  const everyday = cards.find((c) => c.slug === "everyday-life");
  assert.equal(everyday?.locked, true);
  assert.equal(everyday?.visualState, "locked");
});
