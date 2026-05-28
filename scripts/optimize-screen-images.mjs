/**
 * Compress large hub/map PNGs to WebP + AVIF under public/screens/.
 * Run: npm run optimize:screens
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Source PNGs → max width (preserve aspect) → WebP + AVIF.
 * (WebP is the primary target; AVIF is a nice-to-have for modern browsers.)
 */
const TARGETS = [
  // Hub + map scenery
  { dir: "screens", file: "biz-quest.png", maxWidth: 1920 },
  { dir: "screens", file: "financial-quest.png", maxWidth: 1920 },
  { dir: "screens", file: "management-quest.png", maxWidth: 1920 },
  { dir: "screens", file: "forces-quest.png", maxWidth: 1920 },
  { dir: "screens", file: "final-quest-map.png", maxWidth: 2048 },
  { dir: "screens", file: "mission-brief-image.png", maxWidth: 1600 },

  // Large template + logos
  { dir: "screens", file: "business-quest-template.png", maxWidth: 2048 },
  { dir: "logos", file: "business-island-screen.png", maxWidth: 2048 }
];

async function optimizeOne({ dir, file, maxWidth }) {
  const input = path.join(__dirname, "..", "public", dir, file);
  try {
    await fs.access(input);
  } catch {
    console.warn(`skip (missing): ${file}`);
    return;
  }

  const base = file.replace(/\.png$/i, "");
  const outDir = path.join(__dirname, "..", "public", dir);
  const webpOut = path.join(outDir, `${base}.webp`);
  const avifOut = path.join(outDir, `${base}.avif`);

  const pipeline = sharp(input).resize({
    width: maxWidth,
    withoutEnlargement: true
  });

  await pipeline
    .clone()
    .webp({ quality: 82, effort: 6 })
    .toFile(webpOut);

  await pipeline
    .clone()
    .avif({ quality: 50, effort: 6 })
    .toFile(avifOut);

  const [pngStat, webpStat, avifStat] = await Promise.all([
    fs.stat(input),
    fs.stat(webpOut),
    fs.stat(avifOut)
  ]);

  console.log(
    `${file}: ${(pngStat.size / 1024 / 1024).toFixed(2)} MB → webp ${(webpStat.size / 1024).toFixed(0)} KB, avif ${(avifStat.size / 1024).toFixed(0)} KB`
  );
}

async function main() {
  for (const target of TARGETS) {
    await optimizeOne(target);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
