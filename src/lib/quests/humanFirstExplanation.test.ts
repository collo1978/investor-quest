import assert from "node:assert/strict";
import test from "node:test";

import {
  analyzeHumanFirstStructure,
  isCustomerProblemCard
} from "@/lib/quests/humanFirstExplanation";
import { analyzeQuestJargonGate } from "@/lib/quests/questJargonGate";

const GOOD = `When you play a sharp-looking game, you've already felt what slow chips feel like.

They make the parts inside devices so games and apps feel quick again.

Why investors care:
If demand for fast tech keeps growing, demand for those parts can rise.`;

const BAD_ANALOGY = `When you play a sharp-looking game, you've already felt what slow chips feel like.

Think of it like a phone running too many apps — everything drags.

They make the parts inside devices so games and apps feel quick again.

Why investors care:
If demand for fast tech keeps growing, demand for those parts can rise.`;

test("human-first structure passes good answer without forced analogy", () => {
  const r = analyzeHumanFirstStructure(GOOD);
  assert.equal(r.pass, true);
  assert.equal(r.hasRealLifeOpening, true);
});

test("human-first structure rejects forced analogy", () => {
  const r = analyzeHumanFirstStructure(BAD_ANALOGY);
  assert.equal(r.pass, false);
  assert.ok(r.flags.includes("forced_analogy"));
});

test("jargon gate integrates human-first", () => {
  const gate = analyzeQuestJargonGate(GOOD);
  assert.equal(gate.pass, true);
  assert.equal(gate.humanFirst.pass, true);
});

test("jargon gate rejects forced analogy", () => {
  const gate = analyzeQuestJargonGate(BAD_ANALOGY);
  assert.equal(gate.pass, false);
  assert.ok(gate.humanFirst.flags.includes("forced_analogy"));
});

const BAD_CINEMATIC = `Apple makes tech products people use every day, like iPhones and Macs.

But the real story is bigger than the devices.

Once people enter the ecosystem they keep buying services for years.

Why investors care:
Repeat spend matters for investors.`;

test("human-first structure rejects cinematic filler", () => {
  const r = analyzeHumanFirstStructure(BAD_CINEMATIC);
  assert.equal(r.pass, false);
  assert.ok(r.flags.includes("cinematic_filler"));
});

test("detects customer problem card", () => {
  assert.equal(
    isCustomerProblemCard({
      questSlug: "snapshot",
      cardId: "card-2",
      cardQuestion: "What problem does it solve for customers?"
    }),
    true
  );
});

const BAD_GENERIC_CUSTOMERS = `Most buyers are regular people upgrading phones and laptops.

They like the products.

Why investors care:
Premium pricing helps margins.`;

const GOOD_TARGET_CUSTOMERS = `Apple mainly sells to consumers willing to pay more for premium devices and a connected ecosystem.

They come back for seamless devices and services that stack on the phone they already own.

Developers build for iOS because paying users are already there.

Why investors care:
Premium buyers in the ecosystem support higher margins than discount phone sales.`;

test("target customer card rejects vague audience phrasing", () => {
  const r = analyzeHumanFirstStructure(BAD_GENERIC_CUSTOMERS, null, {
    pillarId: "business",
    questSlug: "revenue",
    cardId: "card-3",
    cardQuestion: "Who are Apple's customers?"
  });
  assert.equal(r.pass, false);
  assert.ok(r.flags.includes("generic_customer_audience"));
});

test("target customer card passes investor-quality audience copy", () => {
  const r = analyzeHumanFirstStructure(GOOD_TARGET_CUSTOMERS, null, {
    pillarId: "business",
    questSlug: "revenue",
    cardId: "card-3",
    cardQuestion: "Who are Apple's customers?"
  });
  assert.equal(r.pass, true);
  assert.equal(r.intent, "target_customer");
});

const BAD_APPLE_RD = `Apple pours billions into R&D, custom chips, cameras, AI, Vision Pro, whatever's next.

That's how Macs leaped to Apple silicon.

Why investors care:
R&D is the subscription to staying premium.`;

test("advantage R&D card rejects buzzword-stack narration", () => {
  const r = analyzeHumanFirstStructure(BAD_APPLE_RD, null, {
    pillarId: "business",
    questSlug: "advantage",
    cardId: "card-1",
    cardQuestion: "Does Apple invest in research and development (R&D)?"
  });
  assert.equal(r.pass, false);
  assert.ok(r.flags.includes("innovation_rd_buzzword_or_hype"));
});

test("rejects em dash in player copy", () => {
  const r = analyzeHumanFirstStructure(
    "Revenue comes from iPhone — services add on top.\n\nWhy investors care:\nRepeat spend matters.",
    null,
    { pillarId: "business", questSlug: "revenue", cardId: "card-1" }
  );
  assert.equal(r.pass, false);
  assert.ok(r.flags.includes("em_dash"));
});
