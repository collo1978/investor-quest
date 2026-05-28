import assert from "node:assert/strict";
import test from "node:test";

import {
  suggestCleanedQuestCopy,
  validateQuestCopy
} from "@/lib/quests/questAnswerValidator";

const BAD = `Apple pours billions into R&D, custom chips, cameras, AI, Vision Pro, whatever's next.

Investor Insight:
More hype here.

Why investors care:
R&D is the subscription to staying premium.`;

test("validateQuestCopy flags buzzwords and banned sections", () => {
  const r = validateQuestCopy(BAD, {
    pillarId: "business",
    questSlug: "advantage",
    cardId: "card-1",
    kind: "quest_card"
  });
  assert.equal(r.pass, false);
  assert.ok(r.issues.length > 0);
});

test("suggestCleanedQuestCopy removes casual filler", () => {
  const cleaned = suggestCleanedQuestCopy(BAD, {
    pillarId: "business",
    questSlug: "advantage",
    cardId: "card-1",
    kind: "quest_card"
  });
  assert.ok(!/\bwhatever'?s next\b/i.test(cleaned));
  assert.ok(!/Investor Insight:/i.test(cleaned));
});
