type AnswerBlock =
  | { kind: "prose"; text: string }
  | { kind: "titledBullets"; title: string; bullets: string[] }
  | { kind: "bulletsOnly"; bullets: string[] };

const REGION_PERCENT_BULLET =
  /(?:americas|europe|china|japan|asia|pacific|region).{0,40}\d+\s*%|\d+\s*%.{0,40}(?:americas|europe|china|japan|asia|pacific)/i;

function isRegionPercentLine(text: string): boolean {
  return REGION_PERCENT_BULLET.test(text);
}

/** Drop filing % breakdown lines when the map already shows percentages. */
export function filterGeographicSupportBlocks(
  blocks: readonly AnswerBlock[]
): AnswerBlock[] {
  const out: AnswerBlock[] = [];
  for (const block of blocks) {
    if (block.kind === "prose") {
      if (isRegionPercentLine(block.text)) continue;
      out.push(block);
      continue;
    }
    const bullets = block.bullets.filter((b) => !isRegionPercentLine(b));
    if (bullets.length === 0) continue;
    if (block.kind === "titledBullets") {
      out.push({ ...block, bullets });
    } else {
      out.push({ kind: "bulletsOnly", bullets });
    }
  }
  return out;
}
