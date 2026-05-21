import sharp from "sharp";

const { data, info } = await sharp("public/screens/business-quest.png")
  .raw()
  .toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;
const gold = (r, g, b) => r > 180 && g > 140 && b < 120 && r + g > b * 2;

function bbox(y0, y1, x0, x1) {
  let top = H;
  let bottom = 0;
  let left = W;
  let right = 0;
  let hits = 0;
  for (let y = Math.floor(y0 * H); y < Math.floor(y1 * H); y++) {
    for (let x = Math.floor(x0 * W); x < Math.floor(x1 * W); x++) {
      const i = (y * W + x) * 3;
      if (!gold(data[i], data[i + 1], data[i + 2])) continue;
      hits++;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
      if (x < left) left = x;
      if (x > right) right = x;
    }
  }
  if (!hits) return null;
  return {
    l: +(left / W).toFixed(3),
    t: +(top / H).toFixed(3),
    w: +((right - left + 1) / W).toFixed(3),
    h: +((bottom - top + 1) / H).toFixed(3),
    hits
  };
}

const revenue = bbox(0.31, 0.53, 0.04, 0.36);
const advantage = bbox(0.63, 0.78, 0.04, 0.36);
console.log("revenue art", revenue);
console.log("advantage art", advantage);
console.log("config revenue", { l: 0.045, t: 0.325, w: 0.25, h: 0.2 });
console.log("config advantage", { l: 0.045, t: 0.655, w: 0.25, h: 0.2 });
