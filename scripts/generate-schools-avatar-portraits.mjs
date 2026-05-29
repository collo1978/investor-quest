/**
 * Extract portrait-only PNGs from choose-your-avatar master.
 * Run: node scripts/generate-schools-avatar-portraits.mjs
 *
 * Crop math mirrors getAvatarPortraitCrop() in schoolsAvatarPortraits.ts.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "public/images/schools/choose-your-avatar.png");
const OUT = path.join(ROOT, "public/images/schools/avatars");
const PORTRAIT_HEIGHT_RATIO = 0.68;

/** Pixel rects from getAvatarCardCropPixels (1536×1024 master). */
const CARD_CROPS = {
  alex: { x: 400, y: 146, w: 200, h: 345 },
  zoe: { x: 628, y: 144, w: 202, h: 345 },
  jayden: { x: 856, y: 145, w: 200, h: 345 },
  skylar: { x: 1070, y: 146, w: 202, h: 345 },
  ethan: { x: 1296, y: 146, w: 202, h: 345 },
  riley: { x: 392, y: 494, w: 202, h: 322 },
  mason: { x: 618, y: 494, w: 202, h: 322 },
  aria: { x: 844, y: 494, w: 202, h: 322 },
  leo: { x: 1070, y: 494, w: 202, h: 322 },
  nova: { x: 1296, y: 494, w: 202, h: 322 }
};

fs.mkdirSync(OUT, { recursive: true });

for (const [id, card] of Object.entries(CARD_CROPS)) {
  const h = Math.round(card.h * PORTRAIT_HEIGHT_RATIO);
  const outPath = path.join(OUT, `${id}.png`);
  await sharp(SRC)
    .extract({
      left: Math.round(card.x),
      top: Math.round(card.y),
      width: Math.round(card.w),
      height: h
    })
    .png()
    .toFile(outPath);
  console.log(`wrote ${outPath} (${card.w}x${h})`);
}

console.log("done");
