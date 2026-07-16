/**
 * Generate HANDOFF.pdf from HANDOFF.md
 * Run: node scripts/generate-handoff-pdf.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const MD_PATH = join(ROOT, "HANDOFF.md");
const PDF_PATH = join(ROOT, "HANDOFF.pdf");
const HTML_PATH = join(ROOT, "scripts", ".handoff-preview.html");

const { marked } = await import("marked");
const { markedHighlight } = await import("marked-highlight");
const hljs = (await import("highlight.js")).default;
const puppeteer = (await import("puppeteer")).default;

function stripMarkdownInline(text) {
  return String(text)
    .replace(/<[^>]+>/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}

function slugify(text) {
  return stripMarkdownInline(text)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function extractHeadings(markdown) {
  const headings = [];
  for (const line of markdown.split("\n")) {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (!match) continue;
    const level = match[1].length;
    const text = stripMarkdownInline(match[2]);
    if (level === 1) continue;
    headings.push({ level, text, id: slugify(text) });
  }
  return headings;
}

function buildTocHtml(headings) {
  const items = headings
    .map((h) => {
      const indent = h.level === 3 ? " toc-sub" : "";
      return `<li class="toc-item${indent}"><a href="#${h.id}">${h.text}</a></li>`;
    })
    .join("\n");
  return `<nav class="toc" aria-label="Table of contents"><h2>Table of Contents</h2><ol>${items}</ol></nav>`;
}

marked.use(
  markedHighlight({
    emptyLangClass: "hljs",
    langPrefix: "hljs language-",
    highlight(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    }
  })
);

marked.use({
  gfm: true,
  breaks: false,
  renderer: {
    heading({ text, depth }) {
      const id = slugify(text);
      return `<h${depth} id="${id}">${text}</h${depth}>`;
    },
    hr() {
      return '<hr class="section-rule" />';
    }
  }
});

const HLJS_CSS = `
.hljs{display:block;overflow-x:auto;padding:1em;background:#1e1e2e;color:#cdd6f4}
.hljs-comment,.hljs-quote{color:#6c7086;font-style:italic}
.hljs-keyword,.hljs-selector-tag,.hljs-addition{color:#cba6f7}
.hljs-string,.hljs-meta .hljs-string{color:#a6e3a1}
.hljs-number,.hljs-literal{color:#fab387}
.hljs-built_in,.hljs-type{color:#89dceb}
.hljs-attr,.hljs-attribute{color:#f9e2af}
.hljs-symbol,.hljs-bullet{color:#f38ba8}
.hljs-title,.hljs-section{color:#89b4fa}
.hljs-name,.hljs-selector-id,.hljs-selector-class{color:#74c7ec}
`;

const PRINT_CSS = `
@page { size: A4; margin: 18mm 16mm 22mm 16mm; }
* { box-sizing: border-box; }
html { font-size: 10.5pt; }
body {
  font-family: "Segoe UI", Inter, system-ui, -apple-system, sans-serif;
  color: #1a1f2e;
  line-height: 1.55;
  margin: 0;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.cover-page {
  page-break-after: always;
  min-height: 255mm;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: linear-gradient(165deg, #0f0a1f 0%, #1a1035 42%, #2d1b4e 100%);
  color: #f8f4ff;
  padding: 48px;
  margin: -18mm -16mm 0 -16mm;
  width: calc(100% + 32mm);
}
.cover-accent {
  width: 72px; height: 4px;
  background: linear-gradient(90deg, #a855f7, #f5c547);
  border-radius: 2px;
  margin-bottom: 28px;
}
.cover-title {
  font-size: 2.35rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 12px;
  line-height: 1.15;
}
.cover-subtitle {
  font-size: 1.2rem;
  font-weight: 500;
  color: #c4b5fd;
  margin: 0 0 36px;
}
.cover-meta {
  font-size: 0.92rem;
  color: rgba(248,244,255,0.72);
  max-width: 28rem;
  line-height: 1.6;
}
.cover-url {
  margin-top: 32px;
  font-size: 0.88rem;
  color: #f5c547;
  word-break: break-all;
}
.toc-page { page-break-after: always; padding-top: 8px; }
.toc h2 {
  font-size: 1.45rem;
  color: #4c1d95;
  border-bottom: 2px solid #e9d5ff;
  padding-bottom: 8px;
  margin: 0 0 18px;
}
.toc ol {
  margin: 0;
  padding: 0;
  list-style: none;
  columns: 2;
  column-gap: 28px;
}
.toc-item { margin: 0 0 7px; break-inside: avoid; }
.toc-item a {
  color: #5b21b6;
  text-decoration: none;
  font-size: 0.95rem;
}
.toc-item a:hover { text-decoration: underline; }
.toc-sub { padding-left: 14px; }
.toc-sub a { color: #6b7280; font-size: 0.88rem; }
.content { padding-top: 4px; }
.content h1 {
  font-size: 1.65rem;
  color: #4c1d95;
  margin: 0 0 14px;
  padding-top: 4px;
  border-bottom: 3px solid #a855f7;
  padding-bottom: 8px;
  page-break-after: avoid;
}
.content h2 {
  font-size: 1.28rem;
  color: #5b21b6;
  margin: 26px 0 10px;
  padding-top: 6px;
  border-bottom: 1px solid #e9d5ff;
  padding-bottom: 5px;
  page-break-after: avoid;
}
.content h3 {
  font-size: 1.05rem;
  color: #6d28d9;
  margin: 18px 0 8px;
  page-break-after: avoid;
}
.content p { margin: 0 0 10px; }
.content ul, .content ol { margin: 0 0 12px; padding-left: 1.35rem; }
.content li { margin: 0 0 5px; }
.content li.task-list-item { list-style: none; margin-left: -1.35rem; }
.content strong { color: #111827; }
.content a { color: #6d28d9; word-break: break-all; }
.section-rule {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 22px 0;
}
.content table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
  margin: 10px 0 16px;
  page-break-inside: avoid;
}
th {
  background: #f5f3ff;
  color: #4c1d95;
  font-weight: 600;
  text-align: left;
  padding: 8px 10px;
  border: 1px solid #ddd6fe;
}
td {
  padding: 7px 10px;
  border: 1px solid #e5e7eb;
  vertical-align: top;
}
tr:nth-child(even) td { background: #fafafa; }
pre.code-block, .content pre {
  background: #1e1e2e;
  color: #cdd6f4;
  border-radius: 8px;
  padding: 12px 14px;
  overflow-x: auto;
  font-size: 0.82rem;
  line-height: 1.45;
  margin: 10px 0 14px;
  page-break-inside: avoid;
  border: 1px solid #313244;
}
.content code {
  font-family: Consolas, "Cascadia Code", "SF Mono", monospace;
  font-size: 0.86em;
}
.content :not(pre) > code {
  background: #f3f4f6;
  color: #7c3aed;
  padding: 0.12em 0.35em;
  border-radius: 4px;
}
.content blockquote {
  margin: 10px 0 14px;
  padding: 8px 14px;
  border-left: 4px solid #a855f7;
  background: #faf5ff;
  color: #4b5563;
  font-style: italic;
}
.content em { color: #6b7280; }
`;

function buildHtml({ markdown, bodyHtml, tocHtml }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Investor Quest – Developer Handoff</title>
  <style>${HLJS_CSS}${PRINT_CSS}</style>
</head>
<body>
  <section class="cover-page">
    <div class="cover-accent" aria-hidden="true"></div>
    <h1 class="cover-title">Investor Quest – Developer Handoff</h1>
    <p class="cover-subtitle">Schools Demo Prototype</p>
    <p class="cover-meta">
      Technical handoff for developers polishing and extending the Schools presenter demo
      and Business Island experience.
    </p>
    <p class="cover-url">https://investor-quest.vercel.app/schools/demo</p>
  </section>
  <section class="toc-page">${tocHtml}</section>
  <main class="content">${bodyHtml}</main>
</body>
</html>`;
}

async function main() {
  const markdown = await readFile(MD_PATH, "utf8");
  const headings = extractHeadings(markdown);
  const tocHtml = buildTocHtml(headings);
  const bodyHtml = marked.parse(markdown);
  const html = buildHtml({ markdown, bodyHtml, tocHtml });

  await writeFile(HTML_PATH, html, "utf8");

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.pdf({
      path: PDF_PATH,
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<div></div>",
      footerTemplate: `
        <div style="width:100%; font-size:8px; color:#6b7280; padding:0 40px; display:flex; justify-content:space-between; font-family:Segoe UI, sans-serif;">
          <span>Investor Quest – Developer Handoff</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
      margin: {
        top: "16mm",
        bottom: "20mm",
        left: "0",
        right: "0"
      }
    });
  } finally {
    await browser.close();
  }

  console.log(`Wrote ${PDF_PATH}`);
  console.log(`Preview HTML: ${HTML_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
