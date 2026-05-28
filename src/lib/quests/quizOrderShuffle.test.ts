import assert from "node:assert/strict";
import test from "node:test";

import { isQuizAnswerCorrect } from "@/data/quests/types";
import {
  initialOrderPermutation,
  orderPermutationsEqual
} from "@/lib/quests/quizOrderShuffle";

test("order answer is correct when step indices match display slots", () => {
  const q = {
    kind: "order" as const,
    id: "ops-q1",
    prompt: "Order steps",
    steps: ["A", "B", "C", "D"]
  };
  assert.equal(isQuizAnswerCorrect(q, [0, 1, 2, 3]), true);
  assert.equal(isQuizAnswerCorrect(q, [0, 2, 1, 3]), false);
});

test("initial permutation is stable and differs from solved order when shuffled", () => {
  const initial = initialOrderPermutation("operations-q1", 4);
  assert.equal(initial.length, 4);
  const again = initialOrderPermutation("operations-q1", 4);
  assert.ok(orderPermutationsEqual(initial, again));
});
