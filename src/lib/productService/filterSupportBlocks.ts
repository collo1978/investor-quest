type AnswerBlock =
  | { kind: "prose"; text: string }
  | { kind: "titledBullets"; title: string; bullets: string[] }
  | { kind: "bulletsOnly"; bullets: string[] };

const PRODUCT_LINE =
  /^(iphone|mac|ipad|apple watch|airpods|app store|icloud|apple music|apple tv|applecare|apple pay|wearables)/i;

const PRODUCT_MIX_LINE =
  /(?:iphone|mac|ipad|services|wearables).{0,30}\d+\s*%|\d+\s*%.{0,30}(?:iphone|mac|ipad|services)/i;

function isProductListLine(text: string): boolean {
  const t = text.trim();
  if (PRODUCT_LINE.test(t)) return true;
  if (PRODUCT_MIX_LINE.test(t)) return true;
  if (/^it also earns recurring revenue/i.test(t)) return true;
  if (/^apple makes most of its money/i.test(t)) return true;
  if (/^most of apple'?s money still comes from iphone/i.test(t)) return true;
  if (/^the twist:/i.test(t)) return true;
  if (/^repeat spend from the same customers/i.test(t)) return true;
  return false;
}

/** Drop product-name bullets when the visual cards already list them. */
export function filterProductSupportBlocks(
  blocks: readonly AnswerBlock[]
): AnswerBlock[] {
  const out: AnswerBlock[] = [];
  for (const block of blocks) {
    if (block.kind === "prose") {
      if (isProductListLine(block.text)) continue;
      out.push(block);
      continue;
    }
    const title = block.kind === "titledBullets" ? block.title : "";
    if (
      block.kind === "titledBullets" &&
      /product|service|hardware|revenue from/i.test(title)
    ) {
      const bullets = block.bullets.filter((b) => !isProductListLine(b));
      if (bullets.length === 0) continue;
      out.push({ ...block, bullets });
      continue;
    }
    const bullets = block.bullets.filter((b) => !isProductListLine(b));
    if (bullets.length === 0) continue;
    if (block.kind === "titledBullets") {
      out.push({ ...block, bullets });
    } else {
      out.push({ kind: "bulletsOnly", bullets });
    }
  }
  return out;
}
