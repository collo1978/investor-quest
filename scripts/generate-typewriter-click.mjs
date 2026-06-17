import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public", "sounds");
const sampleRate = 44100;

function encodeWav(floatSamples) {
  const numSamples = floatSamples.length;
  const buffer = Buffer.alloc(44 + numSamples * 2);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(numSamples * 2, 40);
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, floatSamples[i]));
    buffer.writeInt16LE(Math.floor(s * 32767 * 0.9), 44 + i * 2);
  }
  return buffer;
}

/** Mechanical key click — noise transient + short body thump. */
function makeClick(seedOffset = 0) {
  const duration = 0.028;
  const length = Math.floor(sampleRate * duration);
  const samples = new Float32Array(length);

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const r = Math.sin((i + seedOffset) * 12.9898) * 43758.5453;
    const rnd = r - Math.floor(r);

    const attack = t < 0.0025 ? 1 : Math.exp(-(t - 0.0025) * 320);
    const noise = (rnd * 2 - 1) * attack * 0.75;
    const thump = Math.sin(2 * Math.PI * (165 + seedOffset * 3) * t) * Math.exp(-t * 95) * 0.38;
    const snap = Math.sin(2 * Math.PI * 2400 * t) * Math.exp(-t * 500) * 0.12;

    samples[i] = noise + thump + snap;
  }

  return samples;
}

fs.mkdirSync(outDir, { recursive: true });

const merged = makeClick(0);
fs.writeFileSync(
  path.join(outDir, "schools-typewriter-key.wav"),
  encodeWav(merged)
);

for (let v = 0; v < 3; v++) {
  fs.writeFileSync(
    path.join(outDir, `schools-typewriter-key-${v + 1}.wav`),
    encodeWav(makeClick(v * 17 + 1))
  );
}

console.log("Wrote typewriter click WAVs to public/sounds/");
