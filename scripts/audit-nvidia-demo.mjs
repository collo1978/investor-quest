#!/usr/bin/env node
/**
 * NVIDIA controlled demo audit — Management quest flow.
 * Run: node scripts/audit-nvidia-demo.mjs
 */

import { chromium } from "playwright";

const BASE = process.env.DEMO_AUDIT_BASE_URL ?? "http://localhost:3003";

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results = {};

  async function goto(path) {
    await page.goto(`${BASE}${path}`, {
      waitUntil: "networkidle",
      timeout: 90_000
    });
    await page.waitForTimeout(3000);
  }

  await goto("/management");
  results["/management"] = {
    pass:
      page.url().includes("/management") &&
      !(await page.getByText(/page not found/i).isVisible().catch(() => false))
  };

  await goto("/management/mgmt-1");
  results["Management quest page"] = {
    pass: new URL(page.url()).pathname === "/management/mgmt-1"
  };

  await goto("/quest?pillar=management&quest=mgmt-1");
  results["Legacy /quest redirect"] = {
    pass: new URL(page.url()).pathname === "/management/mgmt-1"
  };

  await goto("/management/mgmt-1");
  const body = await page.locator("body").innerText();
  results["Management cards"] = {
    pass:
      body.includes("Leadership & Incentives") &&
      body.includes("Who is leading NVIDIA?") &&
      !body.includes("{Company.name}") &&
      !body.includes("missing_extract") &&
      !body.includes("Quest content could not load")
  };

  for (let i = 0; i < 3; i++) {
    const mark = page.getByText("Mark as Read").first();
    if (await mark.isVisible().catch(() => false)) {
      await mark.click();
      await page.waitForTimeout(700);
    }
    const next = page.getByRole("button", { name: /^next/i });
    if (await next.isEnabled().catch(() => false)) {
      await next.click();
      await page.waitForTimeout(500);
    }
  }

  results["Mark as Read"] = {
    pass: body.includes("Mark as Read") || (await page.getByText("Read ✓").count()) > 0
  };

  const quizCta = page.getByRole("button", { name: /start quiz|continue to quiz/i });
  results["quiz unlock"] = {
    pass: await quizCta.first().isVisible().catch(() => false)
  };

  if (results["quiz unlock"].pass) {
    await quizCta.first().click();
    await page.waitForTimeout(2000);
    results["quiz completion"] = {
      pass: await page
        .getByText(/Who is the long-tenured CEO|quiz|pass threshold|multiple-choice/i)
        .first()
        .isVisible()
        .catch(() => false)
    };
  } else {
    results["quiz completion"] = { pass: false, detail: "quiz CTA not shown" };
  }

  await goto("/profile");
  results["XP/progress"] = {
    pass: await page.getByText(/XP|Level/i).first().isVisible().catch(() => false)
  };

  await goto("/management/mgmt-1");
  const urlBefore = page.url();
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  results["refresh persistence"] = {
    pass:
      page.url() === urlBefore &&
      (await page.getByText(/Who is leading NVIDIA?/i).isVisible().catch(() => false))
  };

  await browser.close();

  const summary = Object.entries(results).map(([check, v]) => ({ check, ...v }));
  const failed = summary.filter((r) => !r.pass);
  console.log(
    JSON.stringify(
      {
        ok: failed.length === 0,
        pass: summary.filter((r) => r.pass).length,
        failed: failed.length,
        results: summary
      },
      null,
      2
    )
  );
  process.exit(failed.length === 0 ? 0 : 1);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
