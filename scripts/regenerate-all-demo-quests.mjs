/**
 * Regenerate all 6 demo companies (Business / Financials / Management / Forces)
 * with smart-friend prompts. Requires dev server on port 3003.
 *
 * Usage: npm run dev   (separate terminal)
 *        node scripts/regenerate-all-demo-quests.mjs
 *
 * Or one company: node scripts/regenerate-all-demo-quests.mjs MSFT
 */
const BASE = process.env.QUEST_REGEN_BASE_URL ?? "http://localhost:3003";
const TICKERS = ["AAPL", "MSFT", "TSLA", "NVDA", "NKE", "SPOT"];
const argTicker = process.argv[2]?.trim().toUpperCase();
const targets = argTicker ? [argTicker] : TICKERS;

async function regenCompany(ticker) {
  const url = `${BASE}/api/admin/quest-generation/regenerate`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ticker,
      extract: false,
      fast: false,
      force: true
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? data.detail ?? `HTTP ${res.status}`);
  }
  return data;
}

async function main() {
  console.log(`Regenerating quest copy (${targets.join(", ")}) via ${BASE}…\n`);
  const reports = [];

  for (const ticker of targets) {
    const started = Date.now();
    process.stdout.write(`→ ${ticker} … `);
    try {
      const result = await regenCompany(ticker);
      const sec = ((Date.now() - started) / 1000).toFixed(0);
      reports.push({ ticker, ok: true, result });
      console.log(
        `done in ${sec}s — generated ${result.totalGenerated ?? 0}, errors ${result.totalErrors ?? 0}`
      );
    } catch (err) {
      reports.push({
        ticker,
        ok: false,
        error: err instanceof Error ? err.message : String(err)
      });
      console.log(`FAILED — ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log("\n--- Summary ---");
  for (const r of reports) {
    if (!r.ok) {
      console.log(`${r.ticker}: FAILED — ${r.error}`);
      continue;
    }
    const p = r.result.pillars ?? [];
    console.log(
      `${r.ticker}: ${r.result.totalGenerated ?? 0} cards updated, ${r.result.totalErrors ?? 0} errors`
    );
    for (const pillar of p) {
      if (pillar.errors?.length) {
        console.log(
          `  ${pillar.pillarId}: ${pillar.errors.length} error(s) — ${pillar.errors[0]?.message}`
        );
      }
    }
  }

  const failed = reports.filter((r) => !r.ok || (r.result?.totalErrors ?? 0) > 0);
  if (failed.length) process.exitCode = 1;
}

main();
