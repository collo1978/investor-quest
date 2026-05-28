/**
 * Status report for all 6 demo companies. Requires dev server on :3003.
 */
const BASE = process.env.QUEST_REGEN_BASE_URL ?? "http://localhost:3003";
const TICKERS = ["AAPL", "MSFT", "TSLA", "NVDA", "NKE", "SPOT"];
const PILLARS = ["business", "financials", "management", "forces"];
const BIZ_SLUGS = ["snapshot", "revenue", "operations", "advantage", "industry"];

const CORPORATE_RE =
  /\b(designs and sells|operates across|provides solutions|in simple terms|think of it like a (?:kitchen|bakery))\b/i;

async function getJson(path) {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function businessPillar(ticker) {
  const statuses = {};
  let ready = 0;
  let missing = 0;
  let toneOk = 0;
  let toneBad = 0;
  for (const slug of BIZ_SLUGS) {
    const p = await getJson(
      `/api/companies/${ticker}/business-quest-answers/${slug}`
    );
    if (!p) continue;
    statuses[slug] = p.status;
    if (p.status === "missing_extract") missing++;
    for (const id of p.expectedCardIds ?? []) {
      const text = p.cards?.[id]?.plainEnglishAnswer ?? "";
      if (text.trim()) {
        ready++;
        if (CORPORATE_RE.test(text)) toneBad++;
        else toneOk++;
      }
    }
  }
  return { statuses, ready, missing, toneOk, toneBad };
}

async function pillarSample(ticker, pillar, slug) {
  const path =
    pillar === "business"
      ? `/api/companies/${ticker}/business-quest-answers/${slug}`
      : pillar === "financials"
        ? `/api/companies/${ticker}/financial-quest-answers/${slug}`
        : pillar === "management"
          ? `/api/companies/${ticker}/management-quest-answers/${slug}`
          : `/api/companies/${ticker}/forces-quest-answers/${slug}`;
  return getJson(path);
}

async function companyRow(ticker) {
  const biz = await businessPillar(ticker);
  const filingReady = biz.missing === 0 && !Object.values(biz.statuses).includes("missing_extract");

  const pillarCards = {};
  for (const pillar of PILLARS) {
    if (pillar === "business") {
      pillarCards.business = biz.ready;
      continue;
    }
    const slug =
      pillar === "financials"
        ? "growth"
        : pillar === "management"
          ? "mgmt-1"
          : "positive-inside-supply-chain";
    const p = await pillarSample(ticker, pillar, slug);
    if (!p) {
      pillarCards[pillar] = 0;
      continue;
    }
    const count = (p.expectedCardIds ?? []).filter((id) =>
      Boolean(p.cards?.[id]?.plainEnglishAnswer?.trim())
    ).length;
    pillarCards[pillar] = p.status === "missing_extract" ? 0 : count;
  }

  const src = await getJson(
    `/api/admin/quest-generation/card-source?ticker=${ticker}&pillar=business&slug=snapshot&cardId=card-1`
  );

  return {
    ticker,
    filingReady,
    playerSource: src?.playerSees ?? "unknown",
    pillars: pillarCards,
    toneOk: biz.toneOk,
    toneBad: biz.toneBad
  };
}

async function main() {
  const rows = [];
  for (const t of TICKERS) {
    rows.push(await companyRow(t));
  }
  console.log(JSON.stringify(rows, null, 2));
}

main();
