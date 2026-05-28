#!/usr/bin/env node
/**
 * Audit Forces routes — hub, categories, topics, legacy redirects.
 * Run: node scripts/audit-forces-routes.mjs
 */

import { chromium } from "playwright";

const BASE = process.env.FORCES_AUDIT_BASE_URL ?? "http://localhost:3003";

const CATEGORY_IDS = [
  "positive-inside",
  "negative-inside",
  "positive-outside",
  "negative-outside"
];

/** Matches src/data/quests/templates/forces.ts topic decks (excludes hub rows). */
const TOPIC_SLUGS = [
  "positive-inside-supply-chain",
  "positive-inside-technology",
  "positive-inside-financial-strength",
  "positive-inside-brand-strength",
  "negative-inside-operational-failures",
  "negative-inside-supply-disruption",
  "negative-inside-cyber-risk",
  "negative-inside-financial-weakness",
  "negative-inside-reputation-damage",
  "positive-outside-demand-growth",
  "positive-outside-competitive-advantages",
  "positive-outside-economic-growth",
  "positive-outside-favorable-regulation",
  "positive-outside-global-expansion",
  "negative-outside-demand-decline",
  "negative-outside-competition",
  "negative-outside-economic-slowdown",
  "negative-outside-regulation-risk",
  "negative-outside-geopolitical-risk"
];

const PATHS = [
  "/forces",
  ...CATEGORY_IDS.map((id) => `/forces/category/${id}`),
  ...TOPIC_SLUGS.map((slug) => `/forces/${slug}`),
  "/forces/positive-inside-business-strength"
];

async function checkPath(page, path) {
  const url = `${BASE}${path}`;
  const response = await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 60_000
  });
  const finalUrl = page.url();
  const title = await page.title();
  const is404 =
    (response?.status() === 404) ||
    (await page.getByText(/page not found/i).isVisible().catch(() => false));
  return {
    path,
    status: response?.status() ?? 0,
    finalUrl: finalUrl.replace(BASE, ""),
    redirected: finalUrl.replace(BASE, "") !== path,
    is404,
    title
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results = [];

  for (const path of PATHS) {
    try {
      results.push(await checkPath(page, path));
    } catch (err) {
      results.push({
        path,
        status: 0,
        finalUrl: "",
        redirected: false,
        is404: true,
        title: "",
        error: err instanceof Error ? err.message : String(err)
      });
    }
  }

  await browser.close();

  const broken = results.filter((r) => r.is404 || r.error);
  const legacy = results.find(
    (r) => r.path === "/forces/positive-inside-business-strength"
  );

  console.log(
    JSON.stringify(
      {
        ok: broken.length === 0,
        total: results.length,
        broken: broken.length,
        legacyRedirectOk:
          legacy &&
          !legacy.is404 &&
          legacy.finalUrl === "/forces/positive-inside-brand-strength",
        results
      },
      null,
      2
    )
  );

  process.exit(broken.length === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
