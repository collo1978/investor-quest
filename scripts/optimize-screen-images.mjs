/**
 * Compress large hub/map PNGs to WebP + AVIF under public/screens/.
 * Run: npm run optimize:screens
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screensDir = path.join(__dirname, "..", "public", "screens");

/** Source PNGs → max width (preserve aspect). */
const TARGETS = [
  { file: "biz-quest.png", maxWidth: 1920 },
  { file: "financial-quest.png", maxWidth: 1920 },
  { file: "management-quest.png", maxWidth: 1920 },
  { file: "forces-quest.png", maxWidth: 1920 },
  { file: "final-quest-map.png", maxWidth: 2048 },
  { file: "mission-brief-image.png", maxWidth: 1600 }
];

async function optimizeOne({ file, maxWidth }) {
  const input = path.join(screensDir, file);
  try {
    await fs.access(input);
  } catch {
    console.warn(`skip (missing): ${file}`);
    return;
  }

  const base = file.replace(/\.png$/i, "");
  const webpOut = path.join(screensDir, `${base}.webp`);
  const avifOut = path.join(screensDir, `${base}.avif`);

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
