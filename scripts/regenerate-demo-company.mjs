/**
 * One demo company: optional SEC extract, then full smart-friend regeneration.
 * Usage: node scripts/regenerate-demo-company.mjs MSFT --extract
 */
const BASE = process.env.QUEST_REGEN_BASE_URL ?? "http://localhost:3003";
const args = process.argv.slice(2);
const ticker = args.find((a) => !a.startsWith("-"))?.toUpperCase();
const withExtract = args.includes("--extract");

if (!ticker) {
  console.error("Usage: node scripts/regenerate-demo-company.mjs <TICKER> [--extract]");
  process.exit(1);
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? data.detail ?? `HTTP ${res.status}`);
  }
  return data;
}

async function main() {
  if (withExtract) {
    console.log(`${ticker}: pulling SEC filing sections…`);
    const ex = await fetch(
      `${BASE}/api/sec/extract?ticker=${encodeURIComponent(ticker)}`,
      { method: "POST" }
    );
    const exBody = await ex.json().catch(() => ({}));
    if (!ex.ok) {
      throw new Error(exBody.error ?? exBody.detail ?? `Extract failed (${ex.status})`);
    }
    console.log(`${ticker}: extract OK`);
  }

  console.log(`${ticker}: regenerating all pillars (force, smart-friend)…`);
  const started = Date.now();
  const result = await post("/api/admin/quest-generation/regenerate", {
    ticker,
    extract: false,
    fast: false,
    force: true
  });
  const sec = ((Date.now() - started) / 1000).toFixed(0);
  console.log(
    `${ticker}: done in ${sec}s — generated ${result.totalGenerated ?? 0}, errors ${result.totalErrors ?? 0}`
  );
  for (const p of result.pillars ?? []) {
    if (p.errors?.length) {
      console.log(`  ${p.pillarId}: ${p.errors.length} error(s)`);
      for (const e of p.errors.slice(0, 3)) {
        console.log(`    ${e.questSlug}/${e.cardId}: ${e.message.slice(0, 100)}`);
      }
    }
  }
  if ((result.totalErrors ?? 0) > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(`${ticker} FAILED:`, err instanceof Error ? err.message : err);
  process.exit(1);
});
