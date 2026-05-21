import assert from "node:assert/strict";
import test from "node:test";

import {
  analyzeQuestJargonGate,
  passesQuestJargonGate
} from "@/lib/quests/questJargonGate";

const GOOD = `If you've used a popular AI chat app or played a sharp-looking game, you've already bumped into NVIDIA's world.

Think of them like the shop that sells the engine inside many smart computers — not the app you tap on.

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
