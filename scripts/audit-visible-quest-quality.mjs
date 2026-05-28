/**
 * Player-visible quest card quality audit for playable demo companies (AAPL, NKE, NVDA).
 * Uses card-source API (what players actually see).
 *
 * Usage: node scripts/audit-visible-quest-quality.mjs
 *        node scripts/audit-visible-quest-quality.mjs --json
 */
const BASE = process.env.QUEST_REGEN_BASE_URL ?? "http://localhost:3003";
const TICKERS = ["AAPL", "NKE", "NVDA"];
const JSON_OUT = process.argv.includes("--json");

const PILLAR_QUESTS = {
  business: ["snapshot", "revenue", "operations", "advantage", "industry"],
  financials: ["growth", "profitability", "expenses", "cash", "financial-strength"],
  management: [
    "mgmt-1",
    "mgmt-quiz",
    "mgmt-2",
    "mgmt-governance",
    "mgmt-financial-strength",
    "management-summary"
  ],
  forces: [
    "positive-inside-supply-chain",
    "positive-inside-technology",
    "positive-inside-financial-strength",
    "positive-inside-brand-strength",
    "negative-inside-operational-failures",
    "negative-inside-product-quality",
    "negative-inside-management-issues",
    "negative-inside-financial-weakness",
    "negative-inside-competition",
    "positive-outside-demand-growth",
    "positive-outside-industry-trends",
    "positive-outside-regulatory-tailwinds",
    "positive-outside-economic-growth",
    "positive-outside-social-trends",
    "negative-outside-demand-decline",
    "negative-outside-regulation",
    "negative-outside-competition",
    "negative-outside-economic-downturn",
    "negative-outside-geopolitical-risk"
  ]
};

const HARD_RE = [
  { id: "em_dash", re: /\s[—–]\s/ },
  { id: "spec_sheets", re: /\bspec sheets?\b/i },
  { id: "stickiness", re: /\bstickiness\b/i },
  { id: "designs_and_sells", re: /\bdesigns and sells\b/i },
  { id: "in_simple_terms", re: /\bin simple terms\b/i },
  { id: "provides_solutions", re: /\bprovides? solutions\b/i },
  { id: "operates_across", re: /\boperates across\b/i },
  { id: "landscape", re: /\blandscape\b/i },
  { id: "leverages", re: /\bleverages?\b/i },
  { id: "infrastructure", re: /\binfrastructure\b/i },
  { id: "semiconductor", re: /\bsemiconductor\b/i },
  { id: "hyperscaler", re: /\bhyperscalers?\b/i },
  { id: "transformative", re: /\btransformative\b/i },
  { id: "kitchen_analogy", re: /\bthink of (?:it|them|this) like a (?:kitchen|bakery)\b/i },
  { id: "phone_apps_analogy", re: /\bphone running too many apps\b/i }
];

const SOFT_RE = [
  { id: "ecosystem_buzz", re: /\b(?:platform|technology|compute|computing)\s+ecosystem\b|\becosystem strength\b/i },
  { id: "solutions", re: /\bsolutions\b/i },
  { id: "innovation_filler", re: /\binnovation\b/i },
  { id: "strategic", re: /\bstrategic\b/i },
  { id: "stakeholders", re: /\bstakeholders\b/i }
];

const INVESTOR_DRIFT_RE =
  /\b(spec sheets?|stickiness|investors? (?:watch|care|pay attention)|pricing power|recurring revenue|market position|ecosystem strength|customer loyalty|valuation|the product, not|revenue driver)\b/i;

const AI_PHRASE_RE =
  /\b(it'?s worth noting|in today'?s|landscape|delve|tapestry|multifaceted|pivotal|underscores|showcases|boasts|nestled|realm|ever-evolving|cutting-edge|best-in-class|world-class|mission-critical)\b/i;

const TEXTBOOK_RE =
  /\b(furthermore|moreover|consequently|nevertheless|in conclusion|it is important to note|one must consider|companies such as)\b/i;

const CLEVER_META_RE =
  /\bmost people don'?t buy .+ because they (?:love|care about)\b/i;

const FORCED_ANALOGY_RE =
  /\bthink of [\w']+ (?:like|as)\b|\bit'?s like trying to\b|\bpicture it like\b/i;

function mainStory(text) {
  if (!text) return "";
  return text
    .replace(/\n\s*Why investors care:\s*[\s\S]*$/i, "")
    .replace(/\n\s*Why it matters:\s*[\s\S]*$/i, "")
    .replace(/\n\s*Investor insight:\s*.+$/is, "")
    .trim();
}

function auditText(text, cardQuestion) {
  const issues = [];
  const body = mainStory(text);
  if (!text?.trim()) {
    issues.push({ code: "empty", severity: "critical" });
    return issues;
  }
  for (const { id, re } of HARD_RE) {
    if (re.test(body) || re.test(text)) issues.push({ code: id, severity: "hard" });
  }
  let soft = 0;
  for (const { id, re } of SOFT_RE) {
    if (re.test(body)) {
      soft++;
      issues.push({ code: id, severity: "soft" });
    }
  }
  if (soft >= 2) issues.push({ code: "soft_jargon_stack", severity: "soft" });
  if (INVESTOR_DRIFT_RE.test(body)) {
    issues.push({ code: "investor_drift", severity: "hard" });
  }
  if (AI_PHRASE_RE.test(body)) issues.push({ code: "ai_phrasing", severity: "hard" });
  if (TEXTBOOK_RE.test(body)) issues.push({ code: "textbook_tone", severity: "hard" });
  if (CLEVER_META_RE.test(body)) issues.push({ code: "clever_meta", severity: "hard" });
  if (FORCED_ANALOGY_RE.test(body)) issues.push({ code: "forced_analogy", severity: "hard" });
  if (body.split(/\s+/).length > 95) issues.push({ code: "too_long", severity: "soft" });
  const q = (cardQuestion ?? "").toLowerCase();
  if (/\bproblem\b.*\b(customer|solve)\b|\bsolve.*\bproblem\b/.test(q)) {
    if (
      !/\b(simple|connected|save time|frustrat|hassle|without|work smoothly|everyday|photos|messages|apps|files|feel simple)\b/i.test(
        body
      )
    ) {
      issues.push({ code: "question_drift_problem", severity: "hard" });
    }
  }
  return issues;
}

async function cardIdsFor(ticker, pillar, slug) {
  const paths = {
    business: `/api/companies/${ticker}/business-quest-answers/${slug}`,
    financials: `/api/companies/${ticker}/financial-quest-answers/${slug}`,
    management: `/api/companies/${ticker}/management-quest-answers/${slug}`,
    forces: `/api/companies/${ticker}/forces-quest-answers/${slug}`
  };
  const res = await fetch(`${BASE}${paths[pillar]}`, { cache: "no-store" });
  if (!res.ok) return ["card-1"];
  const data = await res.json();
  return data.expectedCardIds?.length ? data.expectedCardIds : ["card-1", "main"];
}

async function auditCard(ticker, pillar, slug, cardId) {
  const url = `${BASE}/api/admin/quest-generation/card-source?ticker=${ticker}&pillar=${pillar}&slug=${slug}&cardId=${encodeURIComponent(cardId)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return {
      ticker,
      pillar,
      slug,
      cardId,
      source: "missing",
      pass: false,
      issues: [{ code: "api_missing", severity: "critical" }],
      preview: null
    };
  }
  const data = await res.json();
  const text = data.display?.plainEnglishAnswer ?? data.playerAnswerPreview ?? "";
  const issues = auditText(text, data.investorQuestion);
  if (data.playerSees === "template_fallback") {
    issues.push({ code: "template_fallback", severity: "critical" });
  }
  return {
    ticker,
    pillar,
    slug,
    cardId,
    source: data.playerSees,
    pass: issues.length === 0,
    issues,
    preview: text ? text.slice(0, 120) : null,
    question: data.investorQuestion
  };
}

async function main() {
  const results = [];
  for (const ticker of TICKERS) {
    for (const [pillar, slugs] of Object.entries(PILLAR_QUESTS)) {
      for (const slug of slugs) {
        let cardIds;
        try {
          cardIds = await cardIdsFor(ticker, pillar, slug);
        } catch {
          cardIds = ["card-1"];
        }
        for (const cardId of cardIds) {
          results.push(await auditCard(ticker, pillar, slug, cardId));
        }
      }
    }
  }

  const failed = results.filter((r) => !r.pass);
  const byTicker = Object.fromEntries(
    TICKERS.map((t) => [
      t,
      {
        total: results.filter((r) => r.ticker === t).length,
        failed: failed.filter((r) => r.ticker === t).length,
        placeholders: failed.filter(
          (r) => r.ticker === t && r.issues.some((i) => i.code === "template_fallback")
        ).length,
        qualityFails: failed.filter(
          (r) =>
            r.ticker === t &&
            !r.issues.every((i) => i.code === "template_fallback" || i.code === "empty")
        ).length
      }
    ])
  );

  const summary = {
    auditedAt: new Date().toISOString(),
    totalCards: results.length,
    passed: results.filter((r) => r.pass).length,
    failed: failed.length,
    byTicker,
    failures: failed.map((r) => ({
      ticker: r.ticker,
      pillar: r.pillar,
      slug: r.slug,
      cardId: r.cardId,
      source: r.source,
      issues: r.issues.map((i) => i.code),
      question: r.question,
      preview: r.preview
    }))
  };

  if (JSON_OUT) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log(`Audited ${summary.totalCards} player-visible cards`);
    console.log(`Passed: ${summary.passed} | Failed: ${summary.failed}\n`);
    for (const t of TICKERS) {
      const b = byTicker[t];
      const ok = b.failed === 0;
      console.log(
        `${t}: ${ok ? "PASS" : "FAIL"} — ${b.total - b.failed}/${b.total} ok (${b.placeholders} placeholders, ${b.qualityFails} quality issues)`
      );
    }
    console.log("\n--- Quality failures (non-placeholder) ---");
    for (const f of summary.failures.filter((x) =>
      x.issues.some((c) => c !== "template_fallback" && c !== "empty" && c !== "api_missing")
    )) {
      console.log(
        `${f.ticker} ${f.pillar}/${f.slug}/${f.cardId} [${f.source}] ${f.issues.join(", ")}`
      );
      if (f.preview) console.log(`  → ${f.preview}…`);
    }
    console.log("\n--- Placeholders only ---");
    for (const f of summary.failures.filter((x) =>
      x.issues.every((c) => c === "template_fallback" || c === "empty")
    )) {
      console.log(`${f.ticker} ${f.pillar}/${f.slug}/${f.cardId}`);
    }
  }

  process.exitCode = failed.length ? 1 : 0;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
