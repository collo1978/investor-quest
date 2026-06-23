import { splitIntoSentences } from "@/lib/quests/scannableAnswer";
import {
  parseScannableSupportBody,
  type ScannableSupportChunk
} from "@/lib/quests/scannableTakeawayBody";

export type LessonLayoutParts = {
  intro: string | null;
  focusTitle: string | null;
  focusBullets: string[];
  /** Final sentence — flows as normal lesson text, not a callout box. */
  closing: string | null;
  middleChunks: ScannableSupportChunk[];
};

const LESSON_LABEL_RE =
  /\b(LESSON_INTRO|LESSON_MIDDLE|LESSON_FOCUS|LESSON_CLOSING|KEY TAKEAWAY):/i;

function stripBulletPrefix(line: string): string {
  return line.replace(/^[\u2022•\-\*]\s*/, "").trim();
}

function extractLabeledSection(text: string, label: string): string | null {
  const re = new RegExp(
    `${label}:\\s*([\\s\\S]*?)(?=\\n\\s*(?:LESSON_INTRO|LESSON_MIDDLE|LESSON_FOCUS|LESSON_CLOSING|KEY TAKEAWAY):\\s*|$)`,
    "i"
  );
  return text.match(re)?.[1]?.trim() ?? null;
}

function stripLabeledSection(text: string, label: string): string {
  return text
    .replace(
      new RegExp(
        `\\n?\\s*${label}:\\s*[\\s\\S]*?(?=\\n\\s*(?:LESSON_INTRO|LESSON_MIDDLE|LESSON_FOCUS|LESSON_CLOSING|KEY TAKEAWAY):\\s*|$)`,
        "i"
      ),
      "\n"
    )
    .trim();
}

function normalizeFocusTitle(lead: string): string {
  const trimmed = lead.trim();
  if (trimmed.endsWith("?")) return trimmed;
  const base = trimmed.replace(/:+$/, "").trim();
  return `${base}:`;
}

export function hasLessonSupportingFormat(text: string): boolean {
  return LESSON_LABEL_RE.test(text);
}

/** Parse labeled lesson sections from supporting copy. */
export function parseLessonSupportingBody(
  supportRaw: string
): LessonLayoutParts | null {
  if (!hasLessonSupportingFormat(supportRaw)) return null;

  const intro = extractLabeledSection(supportRaw, "LESSON_INTRO");
  const middleRaw = extractLabeledSection(supportRaw, "LESSON_MIDDLE");
  const focusRaw = extractLabeledSection(supportRaw, "LESSON_FOCUS");
  const closingRaw =
    extractLabeledSection(supportRaw, "LESSON_CLOSING") ??
    extractLabeledSection(supportRaw, "KEY TAKEAWAY");
  const closing = closingRaw?.trim() ?? null;

  let focusTitle: string | null = null;
  let focusBullets: string[] = [];
  if (focusRaw) {
    const lines = focusRaw
      .split(/\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    focusTitle = lines[0] ? normalizeFocusTitle(lines[0]) : null;
    focusBullets = lines
      .slice(1)
      .map(stripBulletPrefix)
      .filter((line) => line.length > 0);
  }

  let middle = supportRaw;
  middle = stripLabeledSection(middle, "LESSON_INTRO");
  middle = stripLabeledSection(middle, "LESSON_MIDDLE");
  middle = stripLabeledSection(middle, "LESSON_FOCUS");
  middle = stripLabeledSection(middle, "LESSON_CLOSING");
  middle = stripLabeledSection(middle, "KEY TAKEAWAY");
  const middleChunks = middleRaw
    ? parseScannableSupportBody(middleRaw)
    : middle
      ? parseScannableSupportBody(middle)
      : [];

  return {
    intro,
    focusTitle,
    focusBullets,
    closing,
    middleChunks
  };
}

/** Build lesson sections from legacy takeaway + scannable chunks. */
export function inferLessonLayout(
  chunks: ScannableSupportChunk[] | undefined,
  support: string | null
): LessonLayoutParts {
  if (!chunks?.length) {
    const sentences = support
      ? splitIntoSentences(support.replace(/\n+/g, " "))
      : [];
    return {
      intro: sentences[0]?.trim() || null,
      focusTitle: null,
      focusBullets: [],
      closing:
        sentences.length > 1 ? sentences.slice(1).join(" ").trim() || null : null,
      middleChunks: []
    };
  }

  const middleChunks = chunks.filter((c) => c.kind === "segmentGrid");
  const rest = chunks.filter((c) => c.kind !== "segmentGrid");

  const texts = rest
    .filter((c): c is Extract<ScannableSupportChunk, { kind: "text" }> => c.kind === "text")
    .map((c) => c.text);
  const sublists = rest.filter(
    (c): c is Extract<ScannableSupportChunk, { kind: "sublist" }> => c.kind === "sublist"
  );
  const bullets = rest
    .filter((c): c is Extract<ScannableSupportChunk, { kind: "bullet" }> => c.kind === "bullet")
    .map((c) => c.text);

  let intro: string | null = texts[0] ?? null;
  let focusTitle: string | null = null;
  let focusBullets: string[] = [];
  let closing: string | null = null;

  if (sublists[0]) {
    focusTitle = normalizeFocusTitle(sublists[0].lead);
    focusBullets = sublists[0].items;
    if (sublists.length > 1) {
      focusBullets = [
        ...focusBullets,
        ...sublists.slice(1).flatMap((s) => s.items)
      ];
    }

    if (bullets.length > 1) {
      if (!intro) intro = bullets[0]!;
      closing = bullets.at(-1)!;
    } else if (bullets.length === 1) {
      if (!intro) intro = bullets[0]!;
      else closing = bullets[0]!;
    }
  } else if (bullets.length > 0) {
    focusTitle = bullets.length > 1 ? "Used in:" : null;
    focusBullets = bullets.length > 1 ? bullets.slice(0, -1) : bullets;
    if (bullets.length > 1) closing = bullets.at(-1)!;
  }

  if (!closing && texts.length > 1) {
    closing = texts.at(-1)!;
    if (texts[0] === closing) closing = null;
  }

  if (texts.length === 1 && !focusBullets.length && !middleChunks.length && !closing) {
    closing = texts[0]!;
    intro = null;
  }

  if (closing === intro) closing = null;

  return {
    intro,
    focusTitle,
    focusBullets,
    closing,
    middleChunks
  };
}

export function buildLessonSupportingBody(parts: {
  intro?: string;
  focusTitle?: string;
  focusBullets?: string[];
  middle?: string;
  closing?: string;
  /** @deprecated Use `closing` */
  keyTakeaway?: string;
}): string {
  const lines: string[] = [];
  const closingLine = parts.closing?.trim() ?? parts.keyTakeaway?.trim();

  if (parts.intro?.trim()) {
    lines.push("LESSON_INTRO:", parts.intro.trim());
  }
  if (parts.middle?.trim()) {
    if (lines.length) lines.push("");
    lines.push("LESSON_MIDDLE:", parts.middle.trim());
  }
  if (parts.focusTitle?.trim()) {
    if (lines.length) lines.push("");
    lines.push("LESSON_FOCUS:", parts.focusTitle.trim());
    for (const bullet of parts.focusBullets ?? []) {
      lines.push(`• ${bullet.trim()}`);
    }
  }
  if (closingLine) {
    if (lines.length) lines.push("");
    lines.push("LESSON_CLOSING:", closingLine);
  }

  return lines.join("\n");
}
