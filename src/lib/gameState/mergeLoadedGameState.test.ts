import assert from "node:assert/strict";
import test from "node:test";

import { initialCompanyProgress, initialState } from "@/engine/progression/state";
import { mergeLoadedGameState } from "@/lib/gameState/mergeLoadedGameState";

test("mergeLoadedGameState unions read and completed slugs per pillar", () => {
  const inMemory = initialState();
  const loaded = initialState();

  inMemory.companies.aapl.pillars.business.readQuestSlugs = ["snapshot#card-1"];
  loaded.companies.aapl.pillars.business.readQuestSlugs = ["snapshot#card-2"];
  loaded.companies.aapl.pillars.business.completedQuestSlugs = ["snapshot"];

  const merged = mergeLoadedGameState(inMemory, loaded);
  const pillar = merged.companies.aapl.pillars.business;

  assert.ok(pillar.readQuestSlugs.includes("what-they-do#card-1"));
  assert.ok(pillar.readQuestSlugs.includes("what-they-do#card-2"));
  assert.ok(pillar.completedQuestSlugs.includes("what-they-do"));
});

test("mergeLoadedGameState keeps in-memory reads when disk is empty", () => {
  const inMemory = initialState();
  inMemory.companies.aapl.pillars.business.readQuestSlugs = [
    "why-buying#card-1",
    "why-buying#card-2"
  ];

  const loaded = initialState();
  const merged = mergeLoadedGameState(inMemory, loaded);

  assert.equal(merged.companies.aapl.pillars.business.readQuestSlugs.length, 2);
});

test("mergeLoadedGameState keeps max XP and merges badges", () => {
  const inMemory = initialState();
  const loaded = initialState();

  inMemory.companies.aapl.xp = 120;
  loaded.companies.aapl.xp = 80;
  inMemory.companies.aapl.badges = {
    "first-quest": { awardedAt: 1000 }
  } as typeof inMemory.companies.aapl.badges;
  loaded.companies.aapl.badges = {
    "quiz-streak-3": { awardedAt: 2000 }
  } as typeof loaded.companies.aapl.badges;

  const merged = mergeLoadedGameState(inMemory, loaded);

  assert.equal(merged.companies.aapl.xp, 120);
  assert.ok(merged.companies.aapl.badges["first-quest"]);
  assert.ok(merged.companies.aapl.badges["quiz-streak-3"]);
});

test("mergeLoadedGameState merges quiz work best scores", () => {
  const inMemory = initialState();
  const loaded = initialState();
  const key = "business:snapshot";

  inMemory.companies.aapl.questWork[key] = {
    notes: "",
    checklist: {},
    mini: {
      quiz: {
        attempts: 1,
        bestScore: 0.6,
        streak: 0,
        lastPlayedAt: 100
      }
    }
  };

  loaded.companies.aapl.questWork[key] = {
    notes: "",
    checklist: {},
    mini: {
      quiz: {
        attempts: 2,
        bestScore: 0.9,
        streak: 1,
        lastPlayedAt: 200,
        passed: true
      }
    }
  };

  const merged = mergeLoadedGameState(inMemory, loaded);
  const quiz = merged.companies.aapl.questWork[key]?.mini?.quiz;

  assert.equal(quiz?.bestScore, 0.9);
  assert.equal(quiz?.attempts, 2);
  assert.equal(quiz?.passed, true);
});

test("mergeLoadedGameState prefers in-memory pillars when progressRevision is higher (reset not undone)", () => {
  const inMemory = initialState();
  const loaded = initialState();

  loaded.companies.aapl.pillars.business.readQuestSlugs = [
    "snapshot#card-1",
    "snapshot#card-2"
  ];
  loaded.companies.aapl.pillars.business.completedQuestSlugs = ["snapshot"];
  loaded.companies.aapl.questWork["business:snapshot"] = {
    notes: "",
    checklist: {},
    mini: {
      quiz: {
        attempts: 2,
        bestScore: 0.9,
        streak: 1,
        lastPlayedAt: 200,
        passed: true
      }
    }
  };

  inMemory.companies.aapl.progressRevision = 2;
  inMemory.companies.aapl.pillars.business = initialCompanyProgress().pillars.business;

  const merged = mergeLoadedGameState(inMemory, loaded);
  const pillar = merged.companies.aapl.pillars.business;

  assert.equal(merged.companies.aapl.progressRevision, 2);
  assert.equal(pillar.readQuestSlugs.length, 0);
  assert.equal(pillar.completedQuestSlugs.length, 0);
  assert.equal(
    merged.companies.aapl.questWork["business:what-they-do"]?.mini?.quiz?.passed,
    true
  );
});

test("mergeLoadedGameState prefers loaded pillars when disk progressRevision is higher", () => {
  const inMemory = initialState();
  const loaded = initialState();

  inMemory.companies.aapl.pillars.business.readQuestSlugs = [
    "snapshot#card-1",
    "snapshot#card-2"
  ];
  inMemory.companies.aapl.pillars.business.completedQuestSlugs = ["snapshot"];

  loaded.companies.aapl.progressRevision = 3;
  loaded.companies.aapl.pillars.business = initialCompanyProgress().pillars.business;

  const merged = mergeLoadedGameState(inMemory, loaded);

  assert.equal(merged.companies.aapl.progressRevision, 3);
  assert.equal(merged.companies.aapl.pillars.business.readQuestSlugs.length, 0);
  assert.equal(
    merged.companies.aapl.pillars.business.completedQuestSlugs.length,
    0
  );
});
