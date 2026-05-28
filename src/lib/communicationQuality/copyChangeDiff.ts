import {
  CORPORATE_PHRASE_PATTERNS,
  FINANCE_JARGON_PATTERNS,
  SOFT_JARGON_PATTERNS,
  TECH_JARGON_PATTERNS
} from "@/lib/communicationQuality/patterns";

export type CopyDiffSegment = {
  type: "same" | "removed" | "added";
  text: string;
};

export type CopyChangeDiff = {
  beforeSegments: CopyDiffSegment[];
  afterSegments: CopyDiffSegment[];
  removedPhrases: string[];
  addedPhrases: string[];
};

const JARGON_PATTERNS = [
  ...CORPORATE_PHRASE_PATTERNS,
  ...FINANCE_JARGON_PATTERNS,
  ...TECH_JARGON_PATTERNS,
  ...SOFT_JARGON_PATTERNS
];

function tokenize(text: string): string[] {
  return text.match(/\S+|\s+/g) ?? [text];
}

/** Word-level diff for side-by-side highlighting (client-safe). */
function diffTokenSequences(before: string, after: string): CopyChangeDiff {
  const bTok = tokenize(before.trim());
  const aTok = tokenize(after.trim());

  const m = bTok.length;
  const n = aTok.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (bTok[i - 1] === aTok[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const beforeSegments: CopyDiffSegment[] = [];
  const afterSegments: CopyDiffSegment[] = [];
  let i = m;
  let j = n;

  const beforeRev: CopyDiffSegment[] = [];
  const afterRev: CopyDiffSegment[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && bTok[i - 1] === aTok[j - 1]) {
      beforeRev.push({ type: "same", text: bTok[i - 1] });
      afterRev.push({ type: "same", text: aTok[j - 1] });
      i -= 1;
      j -= 1;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      afterRev.push({ type: "added", text: aTok[j - 1] });
      j -= 1;
    } else {
      beforeRev.push({ type: "removed", text: bTok[i - 1] });
      i -= 1;
    }
  }

  beforeRev.reverse().forEach((s) => beforeSegments.push(s));
  afterRev.reverse().forEach((s) => afterSegments.push(s));

  return { beforeSegments, afterSegments, removedPhrases: [], addedPhrases: [] };
}

function mergeSegments(segments: CopyDiffSegment[]): CopyDiffSegment[] {
  const merged: CopyDiffSegment[] = [];
  for (const seg of segments) {
    const last = merged[merged.length - 1];
    if (last && last.type === seg.type) {
      last.text += seg.text;
    } else {
      merged.push({ ...seg });
    }
  }
  return merged;
}

export function findRemovedJargonPhrases(before: string, after: string): string[] {
  const found = new Set<string>();
  for (const { re } of JARGON_PATTERNS) {
    if (!re.test(before)) continue;
    re.lastIndex = 0;
    if (re.test(after)) continue;
    re.lastIndex = 0;
    const match = before.match(re);
    if (match?.[0]) found.add(match[0]);
  }
  return [...found];
}

export function buildCopyChangeDiff(before: string, after: string): CopyChangeDiff {
  const raw = diffTokenSequences(before, after);
  const removedPhrases = findRemovedJargonPhrases(before, after);
  return {
    beforeSegments: mergeSegments(raw.beforeSegments),
    afterSegments: mergeSegments(raw.afterSegments),
    removedPhrases,
    addedPhrases: []
  };
}
