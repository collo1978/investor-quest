/**
 * Mirrors canonical `/schools/*` App Router pages under `/schools/demo/*`.
 * Run on dev start so presenter demo URLs always re-export the same screens.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const schoolsRoot = path.join(root, "src", "app", "schools");
const demoRoot = path.join(schoolsRoot, "demo");

const SKIP_DIRS = new Set(["demo", "preview"]);
const DEMO_ENTRY_PAGE = path.join(demoRoot, "page.tsx");

function listCanonicalPageFiles(dir, segments = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const pages = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      pages.push(
        ...listCanonicalPageFiles(path.join(dir, entry.name), [
          ...segments,
          entry.name
        ])
      );
      continue;
    }
    if (entry.name === "page.tsx") {
      // `/schools/page.tsx` redirects to `/schools/demo` — never mirror it onto the demo entry.
      if (segments.length === 0) continue;
      pages.push({
        segments,
        canonicalPath: path.join(dir, "page.tsx")
      });
    }
  }

  return pages;
}

function readExports(canonicalFile) {
  const source = fs.readFileSync(canonicalFile, "utf8");
  const names = new Set(["default"]);
  const re = /export\s*\{\s*([^}]+)\s*\}\s*from/g;
  let match;
  while ((match = re.exec(source))) {
    for (const part of match[1].split(",")) {
      const name = part.trim().split(/\s+as\s+/)[0]?.trim();
      if (name) names.add(name);
    }
  }
  if (/export\s+async\s+function\s+generateStaticParams/.test(source)) {
    names.add("generateStaticParams");
  }
  if (/export\s+function\s+generateStaticParams/.test(source)) {
    names.add("generateStaticParams");
  }
  if (/export\s+const\s+generateStaticParams/.test(source)) {
    names.add("generateStaticParams");
  }
  return [...names];
}

function buildMirrorSource(importPath, exportNames) {
  const ordered = [
    "default",
    ...exportNames.filter((n) => n !== "default").sort()
  ];
  return `export { ${ordered.join(", ")} } from "${importPath}";\n`;
}

function syncMirror({ segments, canonicalPath }) {
  const importPath = `@/app/schools/${segments.join("/")}/page`;
  const exportNames = readExports(canonicalPath);
  const mirrorDir = path.join(demoRoot, ...segments);
  const mirrorPath = path.join(mirrorDir, "page.tsx");
  const nextSource = buildMirrorSource(importPath, exportNames);

  if (fs.existsSync(mirrorPath)) {
    const existing = fs.readFileSync(mirrorPath, "utf8");
    if (existing === nextSource) return { wrote: false, path: mirrorPath };
  }

  fs.mkdirSync(mirrorDir, { recursive: true });
  fs.writeFileSync(mirrorPath, nextSource, "utf8");
  return { wrote: true, path: mirrorPath };
}

function main() {
  if (!fs.existsSync(schoolsRoot)) {
    console.warn("[sync-schools-demo] missing schools app dir");
    return;
  }

  const pages = listCanonicalPageFiles(schoolsRoot);
  let created = 0;
  let updated = 0;

  for (const page of pages) {
    const result = syncMirror(page);
    if (!result.wrote) continue;
    if (fs.existsSync(result.path)) {
      const stat = fs.statSync(result.path);
      if (stat.size > 0) updated++;
    }
    created++;
  }

  const openingPath = path.join(schoolsRoot, "opening", "page.tsx");
  if (fs.existsSync(openingPath)) {
    const importPath = "@/app/schools/opening/page";
    const entrySource = buildMirrorSource(importPath, readExports(openingPath));
    const existingEntry = fs.existsSync(DEMO_ENTRY_PAGE)
      ? fs.readFileSync(DEMO_ENTRY_PAGE, "utf8")
      : "";
    if (existingEntry !== entrySource) {
      fs.mkdirSync(demoRoot, { recursive: true });
      fs.writeFileSync(DEMO_ENTRY_PAGE, entrySource, "utf8");
      created++;
    }
  } else if (!fs.existsSync(DEMO_ENTRY_PAGE)) {
    console.warn("[sync-schools-demo] demo entry page missing — opening page not found");
  }

  if (created > 0) {
    console.log(`[sync-schools-demo] synced ${created} demo route mirror(s)`);
  }
}

main();
