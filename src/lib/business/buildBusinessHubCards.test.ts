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

test("fresh state: only snapshot unlocked", () => {
  const quests = demoQuests();
  const views = Object.fromEntries(
    quests.map((q) => [q.slug, { quest: q, completed: false, read: false, readAt: null, unlocked: true, work: null }])
  );
  const cards = buildBusinessHubCards(quests, views, new Set());

  const bySlug = Object.fromEntries(cards.map((c) => [c.slug, c]));

  assert.equal(bySlug.snapshot?.locked, false);
  assert.equal(bySlug.snapshot?.visualState, "active");
  assert.equal(bySlug.snapshot?.isPrimaryActive, true);

  for (const slug of ["revenue", "operations", "advantage", "industry"] as const) {
    assert.equal(bySlug[slug]?.locked, true, `${slug} should be locked`);
    assert.equal(bySlug[slug]?.visualState, "locked", `${slug} visual`);
    assert.equal(bySlug[slug]?.isPrimaryActive, false, `${slug} primary`);
  }
});

test("missing revenue row still locks operations (canonical prior chain)", () => {
  const quests = demoQuests().filter((q) => q.slug !== "revenue");
  const views = Object.fromEntries(
    quests.map((q) => [q.slug, { quest: q, completed: false, read: false, readAt: null, unlocked: true, work: null }])
  );
  const cards = buildBusinessHubCards(quests, views, new Set());
  const operations = cards.find((c) => c.slug === "operations");
  assert.equal(operations?.locked, true);
  assert.equal(operations?.visualState, "locked");
});
