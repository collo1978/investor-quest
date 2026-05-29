/**
 * Generate 180×180 apple-touch-icon for Schools demo PWA.
 * Run: node scripts/generate-schools-demo-pwa-icon.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "public/logos/investor-quest-logo.png");
const OUT_DIR = path.join(ROOT, "public/schools/demo");
const OUT = path.join(OUT_DIR, "apple-touch-icon.png");

fs.mkdirSync(OUT_DIR, { recursive: true });

await sharp(SRC)
  .resize(180, 180, { fit: "contain", background: { r: 5, g: 1, b: 15, alpha: 1 } })
  .png()
  .toFile(OUT);

console.log(`wrote ${OUT}`);
