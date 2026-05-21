import { downloadFilingContent } from "@/lib/sec/downloadService";
import type { SecSectionMapping } from "@/lib/sec/sectionMappings";

const MAX_SECTION_CHARS = 500_000;

type ProxyPattern = {
  sectionKey: string;
  patterns: RegExp[];
};

const PROXY_PATTERNS: ProxyPattern[] = [
  {
    sectionKey: "proxy_board",
    patterns: [/board\s+of\s+directors/i, /director\s+nominees/i, /election\s+of\s+directors/i]
  },
  {
    sectionKey: "proxy_executives",
    patterns: [/executive\s+officers/i, /named\s+executive\s+officers/i, /officers\s+and\s+directors/i]
  },
  {
    sectionKey: "proxy_compensation",
    patterns: [
      /executive\s+compensation/i,
      /compensation\s+discussion\s+and\s+analysis/i,
      /cd&a/i,
      /director\s+compensation/i
    ]
  },
  {
    sectionKey: "proxy_governance",
    patterns: [
      /corporate\s+governance/i,
      /governance\s+guidelines/i,
      /board\s+practices/i,
      /audit\s+committee/i
    ]
  },
  {
    sectionKey: "proxy_ownership",
    patterns: [
      /security\s+ownership/i,
      /beneficial\s+ownership/i,
      /stock\s+ownership/i,
      /ownership\s+of\s+.*\s+stock/i
    ]
  }
];

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findHeadingPositions(text: string): { index: number; key: string }[] {
  const hits: { index: number; key: string }[] = [];

  for (const { sectionKey, patterns } of PROXY_PATTERNS) {
    let best = -1;
    for (const pattern of patterns) {
      const index = text.search(pattern);
      if (index >= 0 && (best < 0 || index < best)) best = index;
    }
    if (best >= 0) hits.push({ index: best, key: sectionKey });
  }

  return hits.sort((a, b) => a.index - b.index);
}

function capText(text: string): { text: string; truncated: boolean } {
  if (text.length <= MAX_SECTION_CHARS) {
    return { text, truncated: false };
  }
  return { text: text.slice(0, MAX_SECTION_CHARS), truncated: true };
}

/**
 * DEF 14A has no SEC-API Extractor items — pull HTML via Archive API and
 * slice governance/compensation/ownership blocks by heading heuristics.
 */
export async function extractDef14AProxySections(
  filingUrl: string,
  mappings: SecSectionMapping[]
): Promise<
  Map<string, { text: string; truncated: boolean; sectionLabel: string }>
> {
  const html = await downloadFilingContent(filingUrl);
  const plain = stripHtml(html);
  const headings = findHeadingPositions(plain);
  const out = new Map<
    string,
    { text: string; truncated: boolean; sectionLabel: string }
  >();

  if (!headings.length) {
    const fallback = capText(plain.slice(0, Math.min(plain.length, 80_000)));
    const boardMapping = mappings.find((m) => m.sectionKey === "proxy_board");
    if (boardMapping && fallback.text.length > 200) {
      out.set(boardMapping.sectionKey, {
        ...fallback,
        sectionLabel: boardMapping.sectionLabel
      });
    }
    return out;
  }

  for (let i = 0; i < headings.length; i++) {
    const start = headings[i].index;
    const end =
      i + 1 < headings.length ? headings[i + 1].index : plain.length;
    const slice = plain.slice(start, end).trim();
    const mapping = mappings.find((m) => m.sectionKey === headings[i].key);
    if (!mapping || slice.length < 120) continue;

    const capped = capText(slice);
    out.set(mapping.sectionKey, {
      ...capped,
      sectionLabel: mapping.sectionLabel
    });
  }

  return out;
}
