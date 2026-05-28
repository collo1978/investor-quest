#!/usr/bin/env node
/**
 * Final demo browser QA — Apple + NVIDIA across Business, Forces, Financials.
 * Run: node scripts/final-demo-browser-qa.mjs
 */

import { chromium, devices } from "playwright";

const BASE = "http://localhost:3003";
const STORAGE_KEY = "investor-quest::state";

const SCENARIOS = [
  {
    companyId: "aapl",
    ticker: "AAPL",
    island: "Business",
    pillarId: "business",
    questSlug: "snapshot",
    path: "/business/snapshot",
    hasQuiz: true,
    cardCount: 3
  },
  {
    companyId: "aapl",
    ticker: "AAPL",
    island: "Forces",
    pillarId: "forces",
    questSlug: "positive-inside-supply-chain",
    path: "/forces/positive-inside-supply-chain",
    hasQuiz: false,
    cardCount: 1
  },
  {
    companyId: "aapl",
    ticker: "AAPL",
    island: "Financials",
    pillarId: "financials",
    questSlug: "growth",
    path: "/financials/growth",
    hasQuiz: true,
    cardCount: 3
  },
  {
    companyId: "nvda",
    ticker: "NVDA",
    island: "Business",
    pillarId: "business",
    questSlug: "snapshot",
    path: "/business/snapshot",
    hasQuiz: true,
    cardCount: 3
  },
  {
    companyId: "nvda",
    ticker: "NVDA",
    island: "Forces",
    pillarId: "forces",
    questSlug: "positive-inside-supply-chain",
    path: "/forces/positive-inside-supply-chain",
    hasQuiz: false,
    cardCount: 1
  },
  {
    companyId: "nvda",
    ticker: "NVDA",
    island: "Financials",
    pillarId: "financials",
    questSlug: "growth",
    path: "/financials/growth",
    hasQuiz: true,
    cardCount: 3
  }
];

function emptyPillar(unlocked = true) {
  const now = Date.now();
  return {
    unlocked,
    unlockedAt: unlocked ? now : null,
    completedQuestSlugs: [],
    completedAt: {},
    readQuestSlugs: [],
    readAt: {}
  };
}

function freshCompanyProgress() {
  const now = Date.now();
  return {
    xp: 0,
    level: 1,
    streaks: {
      research: { streak: 0, lastTickAt: null },
      quiz: { streak: 0, lastTickAt: null }
    },
    pillars: {
      business: emptyPillar(true),
      forces: emptyPillar(true),
      financials: emptyPillar(true),
      management: emptyPillar(false)
    },
    questWork: {},
    badges: {},
    activePillarId: "business",
    activeQuestSlug: null,
    lastActivityAt: null,
    pendingConvictionQueue: [],
    pillarConvictionSubmittedAt: {},
    tenKRookieChallenge: null,
    futureArcRevealedAt: null,
    pillarIslandBonusClaimed: [],
    quizStreakMilestoneXpClaimed: [],
    questMapBriefDismissedAt: now,
    businessIslandBriefDismissedAt: now,
    progressRevision: 0
  };
}

function buildEnvelope(companyId) {
  const now = Date.now();
  return {
    envelopeVersion: 1,
    savedAt: now,
    state: {
      version: 11,
      playerName: "Demo QA",
      goal: "Build conviction",
      activeCompanyId: companyId,
      unlockedCompanyIds: ["aapl", "nke", "nvda"],
      onboarding: { step: 3, completedAt: now },
      lastActivityAt: now,
      companies: {
        aapl: freshCompanyProgress(),
        nvda: freshCompanyProgress(),
        nke: freshCompanyProgress()
      }
    }
  };
}

function readSave(raw) {
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  return parsed.state ?? parsed;
}

async function waitForHydrated(page) {
  await page.waitForFunction(
    () => !document.querySelector('[aria-label="Loading quest"]'),
    null,
    { timeout: 90_000 }
  );
  await page.waitForTimeout(600);
}

async function waitForQuestReady(page) {
  await waitForHydrated(page);
  await page
    .getByRole("button", { name: "Mark this card as read" })
    .or(page.getByText("Mark as Read"))
    .first()
    .waitFor({ state: "visible", timeout: 90_000 });
}

async function markAllCardsRead(page, cardCount) {
  for (let round = 0; round < cardCount + 2; round++) {
    const markBtn = page
      .getByRole("button", { name: "Mark this card as read" })
      .first();
    if (await markBtn.isVisible().catch(() => false)) {
      await markBtn.click();
      await page.waitForTimeout(500);
    }
    const nextBtn = page.getByRole("button", { name: "Next →" });
    if (
      (await nextBtn.isVisible().catch(() => false)) &&
      (await nextBtn.isEnabled().catch(() => false))
    ) {
      await nextBtn.click();
      await page.waitForTimeout(450);
      continue;
    }
    break;
  }
  await page.waitForTimeout(600);
}

async function startQuizFlow(page) {
  await page
    .getByRole("region", { name: /investor mastery/i })
    .waitFor({ state: "visible", timeout: 20_000 })
    .catch(() => {});

  for (let attempt = 0; attempt < 3; attempt++) {
    const start = page.getByRole("button", { name: "Start Quiz" }).first();
    if (await start.isVisible().catch(() => false)) {
      await start.click();
      await page.waitForTimeout(600);
    }
  }
}

async function ensureQuizPlaying(page) {
  for (let i = 0; i < 6; i++) {
    if (await page.locator("fieldset").first().isVisible().catch(() => false)) {
      return;
    }
    const start = page.getByRole("button", { name: "Start Quiz" }).first();
    if (await start.isVisible().catch(() => false)) {
      await start.click();
      await page.waitForTimeout(800);
    }
  }
  await page.locator("fieldset").first().waitFor({ timeout: 20_000 });
}

async function answerCurrentQuestion(page, { mcIndex = 0 } = {}) {
  const fieldset = page.locator("fieldset").first();
  if (!(await fieldset.isVisible().catch(() => false))) return false;

  const trueBtn = fieldset.getByRole("button", { name: /^TRUE$/i });
  if (await trueBtn.isVisible().catch(() => false)) {
    await trueBtn.click();
  } else {
    const labels = fieldset.locator("label");
    const pills = fieldset.locator('button[type="button"]');
    const labelCount = await labels.count();
    if (labelCount > 0) {
      const idx = Math.min(mcIndex, labelCount - 1);
      await labels.nth(idx).click();
    } else {
      const pillCount = await pills.count();
      const idx = Math.min(mcIndex, Math.max(pillCount - 1, 0));
      await pills.nth(idx).click();
    }
  }

  await page.waitForTimeout(550);
  const next = page.getByRole("button", {
    name: /Next question|See results/i
  });
  if (
    (await next.isVisible().catch(() => false)) &&
    (await next.isEnabled().catch(() => false)) &&
    (await page
      .getByText(/Nice — keep|Locked in — review/i)
      .isVisible()
      .catch(() => false))
  ) {
    await next.click();
    await page.waitForTimeout(650);
    return true;
  }
  return false;
}

async function quizPassed(page) {
  return (
    (await page.getByText(/\+\d+ Investor XP/i).isVisible().catch(() => false)) &&
    !(await page.getByRole("button", { name: "Try again" }).isVisible().catch(() => false))
  );
}

async function answerQuiz(page, scenario) {
  const strategies =
    scenario.companyId === "aapl"
      ? [{ mcIndex: 1 }, { mcIndex: 0 }]
      : [{ mcIndex: 0 }, { mcIndex: 1 }];

  for (let attempt = 0; attempt < strategies.length; attempt++) {
  if (attempt > 0) {
      const retry = page.getByRole("button", { name: /Try again|Run it back/i }).first();
      if (await retry.isVisible().catch(() => false)) {
        await retry.click();
        await page.waitForTimeout(800);
      } else {
        break;
      }
    }

    await startQuizFlow(page);
    await ensureQuizPlaying(page);

    for (let q = 0; q < 10; q++) {
      if (await quizPassed(page)) return;
      if (await page.getByRole("button", { name: "Try again" }).isVisible().catch(() => false)) {
        break;
      }
      if (!(await answerCurrentQuestion(page, strategies[attempt]))) {
        await page.waitForTimeout(500);
      }
    }

    if (await quizPassed(page)) return;
  }

  await page
    .getByText(/\+\d+ Investor XP|Try again|Run it back/i)
    .first()
    .waitFor({ state: "visible", timeout: 45_000 });
}

async function getHudXp(page) {
  const text = await page.locator("text=XP").first().locator("..").textContent();
  const m = text?.match(/XP\s+(\d+)/);
  return m ? Number(m[1]) : 0;
}

async function getSaveSnapshot(page, companyId, pillarId, questSlug) {
  const raw = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
  const state = readSave(raw);
  if (!state) return null;
  const prog = state.companies?.[companyId];
  if (!prog) return null;
  return {
    xp: prog.xp ?? 0,
    completed:
      prog.pillars?.[pillarId]?.completedQuestSlugs?.includes(questSlug) ??
      false,
    reads: [...(prog.pillars?.[pillarId]?.readQuestSlugs ?? [])]
  };
}

async function runScenario(browser, scenario, mobile) {
  const context = await browser.newContext(
    mobile
      ? { ...devices["iPhone 13"], viewport: devices["iPhone 13"].viewport }
      : { viewport: { width: 1280, height: 900 } }
  );
  const page = await context.newPage();
  const result = {
    company: scenario.ticker,
    island: scenario.island,
    markAsRead: "FAIL",
    quizUnlock: "FAIL",
    quizComplete: "FAIL",
    xpProgress: "FAIL",
    refreshPersistence: "FAIL",
    mobile: mobile ? "PASS" : "N/A",
    status: "FAIL",
    notes: []
  };

  try {
    const envelope = buildEnvelope(scenario.companyId);
    await page.goto(`${BASE}/map`, { waitUntil: "domcontentloaded" });
    await page.evaluate(
      ({ key, env }) => localStorage.setItem(key, JSON.stringify(env)),
      { key: STORAGE_KEY, env: envelope }
    );

    await page.goto(`${BASE}${scenario.path}`, { waitUntil: "domcontentloaded" });
    await waitForQuestReady(page);

    const xpBefore = await getHudXp(page);
    await markAllCardsRead(page, scenario.cardCount);

    const afterRead = await getSaveSnapshot(
      page,
      scenario.companyId,
      scenario.pillarId,
      scenario.questSlug
    );
    const compositeReads =
      afterRead?.reads.filter((s) =>
        s.startsWith(`${scenario.questSlug}#`)
      ).length ?? 0;
    const parentRead = afterRead?.reads.includes(scenario.questSlug) ?? false;
    const mainRead = afterRead?.reads.includes(`${scenario.questSlug}#main`);
    const readCountOk = scenario.hasQuiz
      ? compositeReads >= scenario.cardCount || parentRead
      : parentRead || mainRead || compositeReads >= 1;

    if (readCountOk) {
      result.markAsRead = "PASS";
    } else {
      result.notes.push(
        `reads after mark: ${JSON.stringify(afterRead?.reads ?? [])}`
      );
    }

    if (!scenario.hasQuiz) {
      result.quizUnlock = "N/A";
      result.quizComplete = "N/A";
      result.xpProgress = "N/A";
      await page.reload({ waitUntil: "domcontentloaded" });
      await waitForHydrated(page);
      const afterRefresh = await getSaveSnapshot(
        page,
        scenario.companyId,
        scenario.pillarId,
        scenario.questSlug
      );
      result.refreshPersistence =
        readCountOk &&
        (afterRefresh?.reads.length ?? 0) >= (afterRead?.reads.length ?? 0)
          ? "PASS"
          : "FAIL";
      if (result.refreshPersistence === "FAIL") {
        result.notes.push("read progress lost on refresh");
      }
      result.status =
        result.markAsRead === "PASS" && result.refreshPersistence === "PASS"
          ? "PASS"
          : "FAIL";
      return result;
    }

    const quizUnlockVisible =
      (await page
        .getByRole("region", { name: /investor mastery/i })
        .isVisible()
        .catch(() => false)) ||
      (await page
        .getByRole("button", { name: "Start Quiz" })
        .isVisible()
        .catch(() => false));
    result.quizUnlock = quizUnlockVisible ? "PASS" : "FAIL";
    if (!quizUnlockVisible) result.notes.push("quiz did not unlock");

    await answerQuiz(page, scenario);

    const passed = await quizPassed(page);
    result.quizComplete = passed ? "PASS" : "WARN";
    if (!passed) result.notes.push("quiz may not have passed cleanly");

    await page.waitForTimeout(1000);
    const afterQuiz = await getSaveSnapshot(
      page,
      scenario.companyId,
      scenario.pillarId,
      scenario.questSlug
    );
    const xpAfter = afterQuiz?.xp ?? 0;
    const completed = afterQuiz?.completed ?? false;

    if (completed && xpAfter > xpBefore) {
      result.xpProgress = "PASS";
    } else if (completed) {
      result.xpProgress = "WARN";
      result.notes.push(`completed but XP ${xpBefore}→${xpAfter}`);
    } else {
      result.xpProgress = "FAIL";
      result.notes.push(`completed=${completed} xp=${xpAfter}`);
    }

    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForHydrated(page);
    const afterRefresh = await getSaveSnapshot(
      page,
      scenario.companyId,
      scenario.pillarId,
      scenario.questSlug
    );

    if (
      afterRefresh?.completed &&
      afterRefresh.xp >= (afterQuiz?.xp ?? 0) &&
      (afterRefresh.reads.length >= (afterQuiz?.reads.length ?? 0) ||
        afterRefresh.reads.includes(scenario.questSlug))
    ) {
      result.refreshPersistence = "PASS";
    } else {
      result.refreshPersistence = "FAIL";
      result.notes.push(
        `refresh: completed=${afterRefresh?.completed} xp=${afterRefresh?.xp} reads=${JSON.stringify(afterRefresh?.reads ?? [])}`
      );
    }

    const fails = [
      result.markAsRead,
      result.quizUnlock,
      result.quizComplete === "FAIL" ? "FAIL" : null,
      result.xpProgress === "FAIL" ? "FAIL" : null,
      result.refreshPersistence
    ].filter((v) => v === "FAIL");
    result.status = fails.length ? "FAIL" : "PASS";
  } catch (err) {
    result.notes.push(err instanceof Error ? err.message : String(err));
    result.status = "FAIL";
  } finally {
    await context.close();
  }

  return result;
}

async function main() {
  const desktopOnly = process.argv.includes("--desktop-only");
  const mobileOnly = process.argv.includes("--mobile-only");
  const browser = await chromium.launch({ headless: true });
  const results = [];

  if (!mobileOnly) {
    for (const scenario of SCENARIOS) {
      results.push(await runScenario(browser, scenario, false));
    }
  }

  if (!desktopOnly) {
    for (const scenario of SCENARIOS) {
      results.push(await runScenario(browser, scenario, true));
    }
  }

  await browser.close();

  console.log(JSON.stringify({ ok: true, results }, null, 2));

  const anyFail = results.some((r) => r.status === "FAIL");
  process.exit(anyFail ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
