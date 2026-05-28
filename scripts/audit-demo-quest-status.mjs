/**
 * Full audit of 6 demo companies — filing, cards, quizzes, placeholders, tone.
 * Requires dev server on :3003.
 */
const BASE = process.env.QUEST_REGEN_BASE_URL ?? "http://localhost:3003";
const TICKERS = ["AAPL", "MSFT", "TSLA", "NVDA", "NKE", "SPOT"];

const PILLAR_CONFIG = {
  business: {
    slugs: ["snapshot", "revenue", "operations", "advantage", "industry"],
    path: (t, s) => `/api/companies/${t}/business-quest-answers/${s}`
  },
  financials: {
    slugs: ["growth", "margins", "cash", "balance", "returns"],
    path: (t, s) => `/api/companies/${t}/financial-quest-answers/${s}`
  },
  management: {
    slugs: ["mgmt-1", "mgmt-2", "mgmt-governance"],
    path: (t, s) => `/api/companies/${t}/management-quest-answers/${s}`
  },
  forces: {
    slugs: [
      "positive-inside-supply-chain",
      "negative-inside-competition",
      "positive-outside-tailwinds",
      "negative-outside-regulation",
      "forces-hub-inside",
      "forces-hub-outside"
    ],
    path: (t, s) => `/api/companies/${t}/forces-quest-answers/${s}`
  }
};

const CORPORATE_RE =
  /\b(designs and sells|operates across|provides solutions|in simple terms|think of it like a (?:kitchen|bakery))\b/i;
const PLACEHOLDER_RE =
  /\b(coming soon|not available|placeholder|lorem ipsum|could not load|failed to generate)\b/i;

async function getJson(path) {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
  if (!res.ok) return { _error: res.status, _path: path };
  return res.json();
}

async function cardSource(ticker, pillar, slug, cardId = "card-1") {
  return getJson(
    `/api/admin/quest-generation/card-source?ticker=${ticker}&pillar=${pillar}&slug=${slug}&cardId=${cardId}`
  );
}

async function auditTicker(ticker) {
  const sec = await getJson(`/api/sec/sections?ticker=${ticker}`);
  const filingReady = Array.isArray(sec.filings) && sec.filings.length > 0;

  const pillars = {};
  const issues = [];
  let totalCards = 0;
  let filledCards = 0;
  let quizQuests = 0;
  let toneBad = 0;

  for (const [pillarId, cfg] of Object.entries(PILLAR_CONFIG)) {
    let pillarFilled = 0;
    let pillarExpected = 0;
    let pillarMissingExtract = false;

    for (const slug of cfg.slugs) {
      const payload = await getJson(cfg.path(ticker, slug));
      if (payload._error) continue;
      if (payload.status === "missing_extract") pillarMissingExtract = true;

      const ids = payload.expectedCardIds ?? [];
      pillarExpected += ids.length;
      for (const id of ids) {
        const text = payload.cards?.[id]?.plainEnglishAnswer?.trim() ?? "";
        if (text) {
          pillarFilled++;
          filledCards++;
          if (CORPORATE_RE.test(text)) {
            toneBad++;
            issues.push({ type: "tone", pillarId, slug, cardId: id });
          }
          if (PLACEHOLDER_RE.test(text)) {
            issues.push({ type: "placeholder_text", pillarId, slug, cardId: id });
          }
        } else if (payload.status !== "missing_extract") {
          issues.push({ type: "empty_card", pillarId, slug, cardId: id });
        }
      }

      if (payload.quizConfig?.questions?.length) quizQuests++;
    }

    totalCards += pillarExpected;
    pillars[pillarId] = {
      expected: pillarExpected,
      filled: pillarFilled,
      ready: pillarMissingExtract ? false : pillarFilled === pillarExpected && pillarExpected > 0
    };
  }

  const snap = await cardSource(ticker, "business", "snapshot", "card-1");
  if (snap.playerSees === "template_fallback") {
    issues.push({ type: "snapshot_fallback", pillarId: "business", slug: "snapshot", cardId: "card-1" });
  }

  // Spot-check known problem cards
  if (ticker === "NKE") {
    const c4 = await cardSource(ticker, "management", "mgmt-governance", "card-4");
    if (c4.playerSees === "template_fallback") {
      issues.push({ type: "visible_fallback", pillarId: "management", slug: "mgmt-governance", cardId: "card-4" });
    }
  }

  return {
    ticker,
    filingReady,
    playerSourceSnapshot: snap.playerSees ?? "unknown",
    pillars,
    totalCards,
    filledCards,
    cardsComplete: filledCards === totalCards && totalCards > 0,
    quizQuestsWithQuestions: quizQuests,
    toneIssues: toneBad,
    issues
  };
}

async function main() {
  const rows = [];
  for (const t of TICKERS) rows.push(await auditTicker(t));
  console.log(JSON.stringify(rows, null, 2));
}

main();
