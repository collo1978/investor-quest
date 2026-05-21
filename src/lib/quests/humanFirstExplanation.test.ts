import assert from "node:assert/strict";
import test from "node:test";

import {
  analyzeHumanFirstStructure,
  isCustomerProblemCard
} from "@/lib/quests/humanFirstExplanation";
import { analyzeQuestJargonGate } from "@/lib/quests/questJargonGate";

const GOOD = `When you play a sharp-looking game, you've already felt what slow chips feel like.

Think of it like a phone running too many apps — everything drags.

They make the parts inside devices so games and apps feel quick again.

Why investors care:
If demand for fast tech keeps growing, demand for those parts can rise.`;

test("human-first structure passes good answer", () => {
  const r = analyzeHumanFirstStructure(GOOD);
  assert.equal(r.pass, true);
  assert.equal(r.hasAnalogy, true);
  assert.equal(r.hasRealLifeOpening, true);
});

test("jargon gate integrates human-first", () => {
  const gate = analyzeQuestJargonGate(GOOD);
  assert.equal(gate.pass, true);
  assert.equal(gate.humanFirst.pass, true);
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
