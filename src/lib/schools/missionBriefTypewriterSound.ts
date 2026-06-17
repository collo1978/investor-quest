/**
 * Schools mission brief — mechanical typewriter keystrokes from short WAV samples.
 */

const CLICK_PATHS = [
  "/sounds/schools-typewriter-key.wav",
  "/sounds/schools-typewriter-key-1.wav",
  "/sounds/schools-typewriter-key-2.wav",
  "/sounds/schools-typewriter-key-3.wav"
] as const;

let audioContext: AudioContext | null = null;
let masterBus: GainNode | null = null;
let clickBuffers: AudioBuffer[] = [];
let loadPromise: Promise<void> | null = null;
let variantIndex = 0;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  if (!audioContext) {
    const Ctor =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    audioContext = new Ctor();
    masterBus = audioContext.createGain();
    masterBus.gain.value = 0.72;
    masterBus.connect(audioContext.destination);
  }

  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }

  return audioContext;
}

function getMasterBus(ctx: AudioContext): GainNode {
  if (!masterBus || masterBus.context !== ctx) {
    masterBus = ctx.createGain();
    masterBus.gain.value = 0.72;
    masterBus.connect(ctx.destination);
  }
  return masterBus;
}

async function loadClickBuffers(): Promise<void> {
  const ctx = getAudioContext();
  if (!ctx || clickBuffers.length > 0) return;

  const decoded = await Promise.all(
    CLICK_PATHS.map(async (path) => {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`Failed to load ${path}`);
      const ab = await res.arrayBuffer();
      return ctx.decodeAudioData(ab);
    })
  );

  clickBuffers = decoded;
}

export function primeMissionBriefAudio(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (!loadPromise) {
    loadPromise = loadClickBuffers().catch(() => {
      loadPromise = null;
    });
  }

  void loadPromise;
}

type KeystrokeOpts = {
  char?: string;
};

/** Mechanical key click — one sample per visible character. */
export function playMissionBriefKeystroke(opts: KeystrokeOpts = {}): void {
  const char = opts.char ?? "";
  if (char === " " || char === "\n" || char === "\r" || char === "\t") return;

  const ctx = getAudioContext();
  if (!ctx || clickBuffers.length === 0) {
    void loadClickBuffers().then(() => playMissionBriefKeystroke(opts));
    return;
  }

  const buffer = clickBuffers[variantIndex % clickBuffers.length]!;
  variantIndex += 1;

  const t = ctx.currentTime;
  const master = getMasterBus(ctx);
  const src = ctx.createBufferSource();
  const gain = ctx.createGain();

  src.buffer = buffer;
  src.playbackRate.value = 0.94 + (variantIndex % 5) * 0.025;

  gain.gain.setValueAtTime(0.85, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + Math.min(0.03, buffer.duration));

  src.connect(gain);
  gain.connect(master);
  src.start(t);
  src.stop(t + buffer.duration + 0.01);
}

export function playMissionBriefLineBreak(): void {
  playMissionBriefKeystroke({ char: "." });
}

export function playMissionBriefComplete(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const t = ctx.currentTime;
  const master = getMasterBus(ctx);

  [660, 880].forEach((freq, i) => {
    const start = t + i * 0.055;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(freq, start);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 2400;

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(0.08, start + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.05);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    osc.start(start);
    osc.stop(start + 0.055);
  });
}

export function stopMissionBriefAudio(): void {
  masterBus = null;
  clickBuffers = [];
  loadPromise = null;
  variantIndex = 0;
  if (!audioContext) return;
  void audioContext.close();
  audioContext = null;
}
