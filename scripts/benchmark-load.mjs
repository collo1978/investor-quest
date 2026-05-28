/**
 * Quick load-time audit for key player routes (dev server on 3003).
 * Usage: node scripts/benchmark-load.mjs
 */
const BASE = process.env.BASE_URL ?? "http://localhost:3003";

const ROUTES = [
  { name: "Home", path: "/home" },
  { name: "Quest map", path: "/map" },
  { name: "Explore", path: "/explore" },
  { name: "Business hub", path: "/business" },
  { name: "Business quest", path: "/business/revenue?partner=demo-riverside-academy" },
  { name: "Financials hub", path: "/financials" },
  { name: "Forces hub", path: "/forces" },
  { name: "Management hub", path: "/management" },
  { name: "API product-service", path: "/api/companies/AAPL/product-service" },
  { name: "API geographic", path: "/api/companies/AAPL/geographic-revenue" }
];

async function measure(path, label) {
  const url = `${BASE}${path}`;
  const t0 = performance.now();
  try {
    const res = await fetch(url, {
      headers: { Accept: "text/html,application/json" },
      redirect: "follow"
    });
    const body = await res.arrayBuffer();
    const ms = Math.round(performance.now() - t0);
    const kb = Math.round(body.byteLength / 1024);
    return {
      label,
      path,
      ok: res.ok,
      status: res.status,
      ms,
      kb
    };
  } catch (e) {
    return {
      label,
      path,
      ok: false,
      status: 0,
      ms: Math.round(performance.now() - t0),
      kb: 0,
      error: e.message
    };
  }
}

async function main() {
  console.log(`Load audit — ${BASE}\n`);

  // Warm Next.js
  await measure("/", "warmup");

  const rows = [];
  for (const r of ROUTES) {
    const cold = await measure(r.path, r.name);
    const warm = await measure(r.path, r.name);
    rows.push({ ...r, cold: cold.ms, warm: warm.ms, kb: warm.kb, ok: warm.ok, status: warm.status, error: warm.error ?? cold.error });
  }

  const pad = (s, n) => String(s).padEnd(n);
  console.log(
    pad("Route", 22) +
      pad("Cold ms", 10) +
      pad("Warm ms", 10) +
      pad("Size KB", 10) +
      "Status"
  );
  console.log("-".repeat(62));
  for (const r of rows) {
    console.log(
      pad(r.name, 22) +
        pad(r.cold, 10) +
        pad(r.warm, 10) +
        pad(r.kb, 10) +
        (r.ok ? String(r.status) : `ERR ${r.error ?? r.status}`)
    );
  }

  const player = rows.filter((r) => !r.path.startsWith("/api"));
  const apis = rows.filter((r) => r.path.startsWith("/api"));
  const avgWarm = (arr) =>
    Math.round(arr.reduce((s, r) => s + r.warm, 0) / Math.max(arr.length, 1));

  console.log("\nSummary (warm):");
  console.log(`  Player pages avg: ${avgWarm(player)} ms`);
  console.log(`  API routes avg:   ${avgWarm(apis)} ms`);
  console.log(`  Slowest page:     ${player.sort((a, b) => b.warm - a.warm)[0]?.name} (${player[0]?.warm} ms)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
