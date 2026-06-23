/**
 * Parse labeled takeaway supporting blocks into short, scannable UI chunks.
 */

export type SegmentPanel = {
  title: string;
  items: string[];
};

export type ScannableSupportChunk =
  | { kind: "text"; text: string }
  | { kind: "bullet"; text: string }
  | { kind: "sublist"; lead: string; items: string[] }
  | { kind: "segmentGrid"; segments: [SegmentPanel, SegmentPanel] };

function stripBulletPrefix(line: string): string {
  return line.replace(/^[\u2022•\-\*]\s*/, "").trim();
}

function isSubItemLine(line: string): boolean {
  return /^[\-\*]\s+\S/.test(line);
}

function isTopBulletLine(line: string): boolean {
  return /^[\u2022•]\s+\S/.test(line);
}

function isSegmentHeaderLine(line: string): boolean {
  return !isTopBulletLine(line) && !isSubItemLine(line);
}

function tryParseSegmentBlock(
  lines: string[],
  start: number
): { segment: SegmentPanel; next: number } | null {
  if (start >= lines.length) return null;
  const header = lines[start]!;
  if (!isSegmentHeaderLine(header)) return null;

  const items: string[] = [];
  let i = start + 1;
  while (i < lines.length && isTopBulletLine(lines[i]!)) {
    items.push(stripBulletPrefix(lines[i]!));
    i++;
  }
  if (items.length === 0) return null;

  return { segment: { title: header, items }, next: i };
}

function tryParseSegmentGridPair(
  lines: string[],
  start: number
): { chunk: ScannableSupportChunk; next: number } | null {
  const first = tryParseSegmentBlock(lines, start);
  if (!first) return null;
  const second = tryParseSegmentBlock(lines, first.next);
  if (!second) return null;

  return {
    chunk: {
      kind: "segmentGrid",
      segments: [first.segment, second.segment]
    },
    next: second.next
  };
}

export function hasStructuredSupportBody(text: string): boolean {
  return /^[\s]*[\u2022•\-]/m.test(text);
}

/** Turn multiline supporting copy into flashcard-sized beats. */
export function parseScannableSupportBody(text: string): ScannableSupportChunk[] {
  const lines = text
    .split(/\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const chunks: ScannableSupportChunk[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i]!;

    const segmentGrid = tryParseSegmentGridPair(lines, i);
    if (segmentGrid) {
      chunks.push(segmentGrid.chunk);
      i = segmentGrid.next;
      continue;
    }

    if (isSubItemLine(line)) {
      const items: string[] = [];
      while (i < lines.length && isSubItemLine(lines[i]!)) {
        items.push(stripBulletPrefix(lines[i]!));
        i++;
      }
      if (items.length) {
        const prev = chunks.at(-1);
        const lead =
          prev?.kind === "text" ? prev.text.replace(/:$/, "") : "Details";
        if (prev?.kind === "text") chunks.pop();
        chunks.push({ kind: "sublist", lead, items });
      }
      continue;
    }

    const bulletText = isTopBulletLine(line) ? stripBulletPrefix(line) : null;

    if (bulletText != null) {
      if (bulletText.endsWith(":") && i + 1 < lines.length && isSubItemLine(lines[i + 1]!)) {
        const items: string[] = [];
        i++;
        while (i < lines.length && isSubItemLine(lines[i]!)) {
          items.push(stripBulletPrefix(lines[i]!));
          i++;
        }
        chunks.push({
          kind: "sublist",
          lead: bulletText.replace(/:$/, ""),
          items
        });
        continue;
      }

      chunks.push({ kind: "bullet", text: bulletText });
      i++;
      continue;
    }

    if (line.endsWith(":") && i + 1 < lines.length && isSubItemLine(lines[i + 1]!)) {
      const items: string[] = [];
      const lead = line.replace(/:$/, "");
      i++;
      while (i < lines.length && isSubItemLine(lines[i]!)) {
        items.push(stripBulletPrefix(lines[i]!));
        i++;
      }
      chunks.push({ kind: "sublist", lead, items });
      continue;
    }

    chunks.push({ kind: "text", text: line });
    i++;
  }

  return chunks;
}
