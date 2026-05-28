#!/usr/bin/env node
/**
 * NVIDIA controlled demo route audit.
 * Run: node scripts/audit-controlled-demo-routes.mjs
 */

import { chromium } from "playwright";

const BASE = process.env.DEMO_AUDIT_BASE_URL ?? "http://localhost:3003";

const PASS_PATHS = [
  "/onboarding",
  "/map",
  "/business",
  "/business/snapshot",
  "/business/revenue",
  "/financials",
  "/financials/growth",
  "/financials/profitability",
  "/forces",
  "/forces/category/positive-inside",
  "/forces/category/negative-inside",
  "/forces/positive-inside-supply-chain",
  "/forces/positive-inside-technology",
  "/management",
  "/management/mgmt-1",
  "/management/mgmt-quiz",
  "/profile"
];

const REDIRECT_PATHS = [
  { path: "/home", expect: "/map" },
  { path: "/mission-brief", expect: "/map" },
  { path: "/explore", expect: "/map" },
  {
    path: "/quest?pillar=management&quest=mgmt-1",
    expect: "/management/mgmt-1"
  }
];

async function check(page, path, expectRedirect = false, expectFinal = null) {
  const url = `${BASE}${path}`;
  const response = await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 60_000
  });
  await page.waitForTimeout(1500);
  const finalPath = new URL(page.url()).pathname;
  const pathOnly = path.split("?")[0];
  const is404 = await page
    .getByText(/page not found/i)
    .isVisible()
    .catch(() => false);
  const redirected = finalPath !== pathOnly;
  const pass = expectRedirect
    ? redirected && finalPath === expectFinal && !is404
    : !is404 && (response?.status() ?? 0) < 400 && finalPath === pathOnly;
  return { path, pass, finalPath, status: response?.status() ?? 0, is404, redirected };
}

/** Full presenter funnel after onboarding completes → /map */
const DEMO_JOURNEY_AFTER_MAP = [
  "/business/snapshot",
  "/financials/growth",
  "/forces/positive-inside-supply-chain",
  "/management/mgmt-1",
  "/profile"
];

async function auditOnboardingToMap(page) {
  await page.goto(`${BASE}/onboarding`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000
  });
  await page.waitForTimeout(1200);

  await page.getByRole("button", { name: /AI & Robotics/i }).click();
  await page.getByRole("button", { name: /^Continue$/i }).first().click();
  await page.waitForTimeout(2500);

  const step2Text = await page.locator("body").innerText();
  const showcaseBrands = [
    "Apple",
    "Tesla",
    "Microsoft",
    "Nike",
    "Disney",
    "Spotify",
    "NVIDIA"
  ];
  const visibleBrand = showcaseBrands.some((name) => step2Text.includes(name));
  const showcaseVariety =
    step2Text.includes("recognizable companies") && visibleBrand;

  await page.getByLabel("Interested", { exact: true }).click();
  await page.getByRole("button", { name: /^Continue$/i }).click();

  await page.getByText(/NVIDIA unlocked/i).waitFor({ timeout: 25_000 });
  const step3Text = await page.locator("body").innerText();
  const nvidiaLines = [
    "NVIDIA unlocked",
    "Based on your interests",
    "Your first investor quest starts with NVIDIA"
  ];
  const nvidiaReveal = nvidiaLines.filter((line) => step3Text.includes(line)).length >= 2;

  const enterBtn = page.getByRole("button", { name: /Start on the map/i });

  await enterBtn.click();
  await page.waitForURL((url) => url.pathname === "/map", { timeout: 20_000 });

  const finalPath = new URL(page.url()).pathname;
  return {
    path: "flow:onboarding→map",
    pass: finalPath === "/map" && showcaseVariety && nvidiaReveal,
    finalPath,
    status: 200,
    is404: false,
    redirected: false,
    showcaseVariety,
    nvidiaReveal
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results = [];

  try {
    results.push(await auditOnboardingToMap(page));
  } catch (err) {
    results.push({
      path: "flow:onboarding→map",
      pass: false,
      finalPath: page.url(),
      status: 0,
      is404: false,
      redirected: false,
      error: String(err)
    });
  }

  for (const path of PASS_PATHS) {
    results.push(await check(page, path, false));
  }

  for (const path of DEMO_JOURNEY_AFTER_MAP) {
    results.push(await check(page, path, false));
  }
  for (const { path, expect } of REDIRECT_PATHS) {
    results.push({ ...(await check(page, path, true, expect)), expectRedirect: true });
  }

  await page.goto(`${BASE}/forces`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(2000);
  const hubText = await page.locator("body").innerText();
  const placeholderOk = !hubText.includes("{Company.name}");
  results.push({
    path: "hub:no-placeholder",
    pass: placeholderOk,
    finalPath: "(text)",
    status: placeholderOk ? 200 : 0,
    is404: false,
    redirected: false
  });

  await browser.close();

  const failed = results.filter((r) => !r.pass);
  console.log(JSON.stringify({ ok: failed.length === 0, failed: failed.length, results }, null, 2));
  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
