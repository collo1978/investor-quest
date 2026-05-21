import sharp from "sharp";

const boxes = [
  { name: "snapshot", l: 0.365, t: 0.075, w: 0.27, h: 0.17, color: "red" },
  { name: "revenue", l: 0.045, t: 0.325, w: 0.25, h: 0.2, color: "lime" },
  { name: "operations", l: 0.705, t: 0.325, w: 0.25, h: 0.2, color: "cyan" },
  { name: "advantage", l: 0.045, t: 0.655, w: 0.25, h: 0.2, color: "yellow" },
  { name: "industry", l: 0.705, t: 0.655, w: 0.25, h: 0.2, color: "magenta" }
];

const meta = await sharp("public/screens/business-quest.png").metadata();
const W = meta.width;
const H = meta.height;

const rects = boxes
  .map((b) => {
    const x = Math.round(b.l * W);
    const y = Math.round(b.t * H);
    const w = Math.round(b.w * W);
    const h = Math.round(b.h * H);
    const lockX = x + w - Math.round(w * 0.06);
    const lockY = y + Math.round(h * 0.1);
    return [
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${b.color}" stroke-width="3"/>`,
      `<circle cx="${lockX}" cy="${lockY}" r="14" fill="${b.color}" opacity="0.9"/>`
    ].join("");
  })
  .join("");

const svg = Buffer.from(
  `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${rects}</svg>`
);

await sharp("public/screens/business-quest.png")
  .composite([{ input: svg, top: 0, left: 0 }])
  .toFile("tmp-hotspot-debug.png");

console.log("wrote tmp-hotspot-debug.png");
