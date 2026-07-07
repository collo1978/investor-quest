/**
 * Generate Investor Quest developer onboarding .docx
 * Run: node scripts/generate-investor-quest-onboarding-doc.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType
} from "docx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "docs", "Investor-Quest-Developer-Onboarding.docx");

function h(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ text, heading: level, spacing: { after: 120 } });
}

function p(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, bold: opts.bold, size: opts.size })],
    spacing: { after: 80 }
  });
}

function bullet(text) {
  return new Paragraph({ text, bullet: { level: 0 }, spacing: { after: 60 } });
}

function numbered(text) {
  return new Paragraph({ text, numbering: { reference: "numbers", level: 0 }, spacing: { after: 60 } });
}

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "numbers",
        levels: [{ level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.START }]
      }
    ]
  },
  sections: [
    {
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Investor Quest", bold: true, size: 52 })],
          spacing: { after: 100 }
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Developer Onboarding & Product Vision", size: 28, color: "4B5563" })],
          spacing: { after: 200 }
        }),
        p("Document purpose: onboard a developer to build a working prototype modeled after this project."),
        p("Version: prototype reference · NVIDIA 10-K Schools demo"),
        p(""),

        h("1. Executive Summary"),
        p(
          "Investor Quest is a premium, gamified stock-research learning platform. It transforms corporate annual reports (10-K filings) into an interactive adventure that helps students build real investor literacy without reading 80,000 words of jargon."
        ),
        p(
          "The product is NOT a spreadsheet dashboard, NOT a passive LMS, and NOT a generic quiz app. It is an exploration game where progress, mastery, conviction, and XP reward demonstrated understanding."
        ),
        bullet("Core metaphor: NVIDIA's 10-K as a world map with four research islands + a central Final Challenge hub."),
        bullet("Primary demo company: NVIDIA (NVDA) — controlled MVP scope."),
        bullet("Primary audience: Schools / classroom demos."),
        bullet("Platform: Next.js 15 + React 19; optional Capacitor for iOS/Android."),
        bullet("Local dev: http://localhost:3003 (fixed port)."),

        h("2. Product Vision & Design North Star"),
        p("When a student opens Investor Quest, they should feel:", { bold: true }),
        bullet("Curiosity — \"I want to explore this company.\""),
        bullet("Progression — \"I'm leveling up as an investor.\""),
        bullet("Achievement — \"I earned this badge / XP / island completion.\""),
        bullet("Confidence — \"I understand how this business makes money and what risks matter.\""),
        p("Visual & interaction principles:", { bold: true }),
        bullet("Premium fintech game: dark sci-fi, glassmorphism, neon violet, cinematic glow."),
        bullet("Decorative layers must not block clicks (pointer-events: none on FX)."),
        bullet("Hydration-safe: no Math.random() during SSR."),
        bullet("Frame actions as unlocking knowledge and building conviction — not reading reports."),

        h("3. The Learning Journey (Schools Demo)"),
        p("Canonical presenter flow (scripted tour):", { bold: true }),
        numbered("Logo Intro — brand entry"),
        numbered("Mission Brief Cards — welcome to NVIDIA 10-K; island quest; 10K Rookie Badge"),
        numbered("Logo Reveal — product identity"),
        numbered("Onboarding (Stocks Experience)"),
        numbered("Map Brief → Quest Map"),
        numbered("Business Island → Business Quest (read cards + pass quizzes)"),
        numbered("Conviction — submit pillar conviction"),
        numbered("Profile → XP Ladder"),
        numbered("Final Challenge — 12-question capstone (3 per pillar, 70% pass)"),
        numbered("Map Return — completion loop"),
        p("Mission brief core message:", { bold: true }),
        bullet("NVIDIA's 10-K is 80,000+ words — we transformed it into an island adventure."),
        bullet("Mission: conquer all 4 islands, unlock Final Challenge, earn 10K Rookie Badge."),
        bullet("First island unlocked: Business (How do they make money?)."),
        p("Entry URL: http://localhost:3003/schools/demo"),

        h("4. World Map Structure"),
        p("All map variants share the same layout:", { bold: true }),
        bullet("Center: 10K Hub — Final Challenge"),
        bullet("Top-left: Business — How do they make money?"),
        bullet("Top-right: Risks — What are the threats?"),
        bullet("Bottom-left: Financial — Are they financially strong?"),
        bullet("Bottom-right: Management — Would you trust them?"),
        p("Map style previews (same game state, different visuals):", { bold: true }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: ["Label", "Route", "Style"].map(
                (t) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: t, bold: true })] })] })
              )
            }),
            ...[
              ["A Cinematic", "/schools/map", "Production illustrated map"],
              ["B Cartoon", "/schools/preview/map-cartoon", "Overworld adventure"],
              ["C Prodigy", "/schools/preview/map-prodigy", "Fantasy edu realm"],
              ["D DragonBox", "/schools/preview/map-dragonbox", "Minimal clarity-first"],
              ["E Roblox", "/schools/preview/map-roblox", "Blocky adventure world"],
              ["F Khan", "/schools/preview/map-khan", "LMS module journey"],
              ["G Legends", "/schools/preview/map-legends", "Vibrant edu-game islands"]
            ].map(
              ([a, b, c]) =>
                new TableRow({
                  children: [a, b, c].map((t) => new TableCell({ children: [new Paragraph(t)] }))
                })
            )
          ]
        }),
        p(""),

        h("5. The Four Pillars"),
        h("Business", HeadingLevel.HEADING_2),
        p("What the company does, who it serves, and why it wins. Map products, customers, revenue, advantage."),
        h("Forces (Risks)", HeadingLevel.HEADING_2),
        p("Competitive dynamics and disruption. Decode rivals, suppliers, substitutes, new entrants."),
        h("Financials", HeadingLevel.HEADING_2),
        p("Cash flows, margins, capital allocation. Trace revenue, balance sheet, redeployment."),
        h("Management", HeadingLevel.HEADING_2),
        p("Incentives and execution. Judge track record, communication, stewardship."),

        h("6. Quest & Content Model"),
        bullet("Quest content scoped per company in src/data/quests/"),
        bullet("Content cards (reading) + quizzes (mastery proof)"),
        bullet("Quiz pass awards XP; Mark as Read tracks reading without XP"),
        bullet("Controlled NVDA demo exposes curated quest slugs per pillar"),
        bullet("AI quest generation pipeline with admin tools at /admin/quests"),

        h("7. Progression, XP & Badges"),
        bullet("Engine: pure reducer in src/engine/ — UI reads via selectors only"),
        bullet("XP: quiz 50, perfect bonus 25, island completion 200, final challenge 1000"),
        bullet("10K Rookie Badge: all four pillars + final challenge complete"),
        bullet("Final unlock: pillars complete + reading + conviction per pillar"),
        bullet("Persistence: localStorage investor-quest::state (versioned)"),

        h("8. MVP Prototype — Must Have"),
        numbered("World map: 4 islands + 10K hub with locked/unlocked/completed states"),
        numbered("One playable pillar (Business) with quests + quizzes"),
        numbered("XP on quiz pass + progress persistence"),
        numbered("Mission brief onboarding (10-K explained in <60 seconds)"),
        numbered("Mobile-friendly; desktop-first map"),

        h("9. Technical Stack"),
        bullet("Next.js 15 App Router, React 19, Tailwind CSS 4, Framer Motion"),
        bullet("GameProvider + engine reducer (src/engine/progression/)"),
        bullet("Schools layer: src/lib/schools/, src/components/schools/"),
        bullet("Supabase optional; Capacitor for native shells"),

        h("10. Repository Map"),
        bullet("src/app/schools/ — routes (map, demo, pillar pages, previews)"),
        bullet("src/components/schools/ — map screens, mission brief, logo flows"),
        bullet("src/components/QuestQuizPanel.tsx — core quiz UX"),
        bullet("src/data/quests/ — quest catalogs and templates"),
        bullet("src/app/globals.css — map preview styles"),

        h("11. Local Setup"),
        numbered("Node >= 20.9, npm install, npm run dev"),
        numbered("Open http://localhost:3003/schools/demo after Ready"),
        numbered("Optional: QUEST_FAST_DEV=true in .env.local for fast quest iteration"),
        numbered("Typecheck: npx tsc --noEmit · Lint: npm run lint"),
        numbered("Do not change port 3003 without updating Capacitor + docs"),
        p("Useful dev URLs:", { bold: true }),
        bullet("Quest admin: /admin/quests?partner=demo-riverside-academy"),
        bullet("Game health: /admin/game-health"),
        bullet("Main map: /schools/map · Map previews: /schools/preview/map-*"),

        h("12. Prototype Phasing"),
        numbered("Week 1: Shell + static map + routing"),
        numbered("Week 2: Business pillar quests + quiz + XP"),
        numbered("Week 3: Unlock flow + mission brief"),
        numbered("Week 4: Final challenge stub + polish + one alt map style"),

        h("13. Student-Facing Questions (Copy Anchors)"),
        bullet("Business: How do they make money?"),
        bullet("Risks: What are the threats?"),
        bullet("Financial: Are they financially strong?"),
        bullet("Management: Would you trust them?"),
        bullet("Reward: 10K Rookie Badge"),

        h("14. Anti-patterns"),
        bullet("Spreadsheet dashboards, flat LMS worksheets"),
        bullet("Walls of 10-K text without checkpoints"),
        bullet("XP for scrolling — mastery only"),
        bullet("Floating map labels not attached to regions"),

        h("15. Developer Next Steps"),
        numbered("Run Schools demo; complete Business island end-to-end"),
        numbered("Review map previews A–G in Schools sidebar"),
        numbered("Read engine selectors + reducer for state contracts"),
        numbered("Pick one map style for v1 (Cinematic A or Legends G recommended)"),
        numbered("Align scope with product owner: NVDA-only vs multi-company"),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "Generated from the Investor Quest codebase.",
              size: 18,
              color: "94A3B8",
              italics: true
            })
          ],
          spacing: { before: 300 }
        })
      ]
    }
  ]
});

await mkdir(dirname(OUT), { recursive: true });
const buffer = await Packer.toBuffer(doc);
await writeFile(OUT, buffer);
console.log(`Wrote ${OUT}`);
