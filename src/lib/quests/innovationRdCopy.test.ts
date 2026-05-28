import assert from "node:assert/strict";
import test from "node:test";

import { analyzeHumanFirstStructure } from "@/lib/quests/humanFirstExplanation";
import {
  hasInnovationRdQualityIssue,
  polishInnovationRdCopy
} from "@/lib/quests/innovationRdCopy";

const BAD_RD = `Apple pours billions into R&D, custom chips, cameras, AI, Vision Pro, whatever's next.

That's how Macs leaped to Apple silicon.

Why investors care:
R&D is the subscription to staying premium.`;

const GOOD_RD = `Apple invests heavily in R&D to improve its devices, chips, software, and AI capabilities.

That helps Apple keep its products connected and difficult for competitors to copy.

Why investors care:
Steady R&D supports pricing power and ecosystem strength.`;

test("detects innovation R&D buzzword and filler issues", () => {
  assert.equal(hasInnovationRdQualityIssue(BAD_RD), true);
  assert.equal(hasInnovationRdQualityIssue(GOOD_RD), false);
});

test("human-first rejects bad R&D card copy", () => {
  const r = analyzeHumanFirstStructure(BAD_RD, null, {
    pillarId: "business",
    questSlug: "advantage",
    cardId: "card-1",
    cardQuestion: "Does Apple invest in research and development (R&D)?"
  });
  assert.equal(r.pass, false);
  assert.equal(r.intent, "innovation_advantage");
  assert.ok(r.flags.includes("innovation_rd_buzzword_or_hype"));
});

test("human-first passes clean R&D card copy", () => {
  const r = analyzeHumanFirstStructure(GOOD_RD, null, {
    pillarId: "business",
    questSlug: "advantage",
    cardId: "card-1",
    cardQuestion: "Does Apple invest in research and development (R&D)?"
  });
  assert.equal(r.pass, true);
  assert.equal(r.intent, "innovation_advantage");
});

test("polishInnovationRdCopy replaces common bad phrases", () => {
  const out = polishInnovationRdCopy("Apple pours billions into R&D, whatever's next.");
  assert.ok(!/\bwhatever'?s next\b/i.test(out));
  assert.ok(/invests heavily in R&D/i.test(out));
});
