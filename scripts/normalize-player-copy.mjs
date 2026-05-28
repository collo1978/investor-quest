/**
 * One-off: strip em/en dashes and "--" from player-facing source strings.
 * Run: node scripts/normalize-player-copy.mjs
 */
import fs from "node:fs";
import path from "node:path";

const SPACED_EM_EN = /\s+[—–]\s+/g;
const SPACED_DOUBLE_HYPHEN = /\s+--\s+/g;
const BARE_EM_EN = /[—–]/g;

function normalizeQuestProseDashes(text) {
  if (!/[—–]/.test(text) && !/\s--\s/.test(text)) return text;

  let out = text.replace(SPACED_EM_EN, (_match, offset, full) => {
    const after = full.slice(offset + _match.length);
    if (/^[a-z('"(\[]/.test(after)) return ", ";
    return ". ";
  });

  out = out.replace(SPACED_DOUBLE_HYPHEN, (_match, offset, full) => {
    const after = full.slice(offset + _match.length);
    if (/^[a-z('"(\[]/.test(after)) return ", ";
    return ". ";
  });

  out = out.replace(BARE_EM_EN, ". ");
  out = out.replace(/\.\s+([a-z])/g, (_m, letter) => `. ${letter.toUpperCase()}`);
  out = out.replace(/\.\s+IPhone\b/g, ". iPhone");

  return out
    .replace(/\.\s+\./g, ".")
    .replace(/,\s+,/g, ",")
    .trim();
}

const ROOTS = [
  "src/data/quests/content",
  "src/data/quests/businessQuestQuizzes.ts",
  "src/data/quests/financialsQuestQuizzes.ts",
  "src/data/quests/forcesQuestQuizzes.ts",
  "src/data/quests/managementQuestQuizzes.ts",
  "src/data/quests/templates",
  "src/components/quest/islandQuizPassMessages.ts",
  "src/lib/onboarding",
  "src/app/onboarding",
  "src/app/home"
];

function walk(filePath) {
  const c = fs.readFileSync(filePath, "utf8");
  if (!/[—–]|\s--\s/.test(c)) return;
  const next = normalizeQuestProseDashes(c);
  if (next !== c) {
    fs.writeFileSync(filePath, next, "utf8");
    console.log("updated", filePath);
  }
}

for (const root of ROOTS) {
  const abs = path.resolve(root);
  if (!fs.existsSync(abs)) continue;
  const st = fs.statSync(abs);
  if (st.isFile()) {
    walk(abs);
    continue;
  }
  for (const f of fs.readdirSync(abs, { recursive: true })) {
    const p = path.join(abs, f);
    if (fs.statSync(p).isFile() && /\.(ts|tsx)$/.test(p)) walk(p);
  }
}
