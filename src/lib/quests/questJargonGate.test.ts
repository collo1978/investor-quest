import assert from "node:assert/strict";
import test from "node:test";

import {
  analyzeQuestJargonGate,
  passesQuestJargonGate
} from "@/lib/quests/questJargonGate";

const GOOD = `If you've used a popular AI chat app or played a sharp-looking game, you've already bumped into NVIDIA's world.

They make the powerful chips helping AI tools, games, and smart technology run faster and smoother.

Why investors care:
If AI and gaming keep growing, demand for those chips can keep rising.`;

const BAD_GPU = `NVIDIA develops graphics processing units for accelerated computing platforms.

Think of them like a tech supplier.

They mainly sell GPUs for data centers and complex tasks.

Why investors care:
AI demand may grow.`;

test("passes plain everyday answer", () => {
  assert.equal(passesQuestJargonGate(GOOD), true);
});

test("rejects GPU and computing platform jargon", () => {
  const gate = analyzeQuestJargonGate(BAD_GPU);
  assert.equal(gate.pass, false);
  assert.equal(gate.rewriteRequired, true);
  assert.ok(gate.hits.some((h) => h.label === "GPU"));
});

test("flags technical opening", () => {
  const gate = analyzeQuestJargonGate(
    "They mainly sell graphics processing units to cloud customers.\n\nThink of it like a parts store.\n\nWhy investors care:\nGrowth."
  );
  assert.equal(gate.technicalOpening, true);
  assert.equal(gate.pass, false);
});

const BAD_CORPORATE_PROBLEM = `Their solutions are essential for industries where technology is crucial to innovation.

Think of them as a leader in advanced computing.

They provide innovative technology for many sectors.

Why investors care:
Growth depends on technology adoption.`;

const GOOD_CUSTOMER_PROBLEM = `When a game stutters or an AI chat takes forever to reply, you're feeling what happens when devices aren't fast enough.

They make the powerful parts inside those devices so games, apps, and smart tools feel quick again.

Why investors care:
If people keep demanding faster games and AI, demand for those parts can keep growing.`;

test("rejects corporate customer-problem answer", () => {
  const gate = analyzeQuestJargonGate(BAD_CORPORATE_PROBLEM, null, {
    questSlug: "snapshot",
    cardId: "card-2",
    cardQuestion: "What problem does it solve for customers?"
  });
  assert.equal(gate.pass, false);
  assert.ok(gate.hits.some((h) => h.label === "solutions are essential"));
});

test("passes relatable customer-problem answer", () => {
  assert.equal(
    passesQuestJargonGate(GOOD_CUSTOMER_PROBLEM, null, {
      questSlug: "snapshot",
      cardId: "card-2",
      cardQuestion: "What problem does it solve for customers?"
    }),
    true
  );
});

test("rejects forced analogy phrasing", () => {
  const gate = analyzeQuestJargonGate(
    "When you shop for sneakers, Nike is everywhere.\n\nThink of it like a crowded race where everyone wants your attention.\n\nWhy investors care:\nCompetition matters."
  );
  assert.equal(gate.pass, false);
  assert.ok(gate.hits.some((h) => h.label === "forced analogy"));
});
