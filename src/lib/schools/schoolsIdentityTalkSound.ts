/**
 * "Talking" reaction for avatar/armor selection — real spoken words via the
 * browser's built-in speech synthesis (no voice recordings exist for these
 * characters, and there's no way to generate real speech audio otherwise).
 * Falls back to a short synthesized blip (Web Audio oscillators, same
 * approach as `missionBriefTypewriterSound.ts`) if speech synthesis isn't
 * available in the browser.
 */

export type TalkVoiceGender = "male" | "female";

/** Deterministic-ish seed from a string id so the same character always sounds the same. */
function seedFromId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(h);
}

/** Rough estimate of spoken duration for a short phrase — used as a safety-net timeout. */
function estimateSpeechDurationMs(text: string): number {
  return Math.max(1200, Math.round(text.length * 65));
}

// ---------------------------------------------------------------------------
// Voice selection — the Web Speech API has no standard "gender" field on
// SpeechSynthesisVoice, so this matches common voice names shipped by
// Windows/Chrome/macOS/Android against known male/female sets.
// ---------------------------------------------------------------------------

const FEMALE_VOICE_HINTS = [
  "female",
  "zira",
  "susan",
  "samantha",
  "karen",
  "moira",
  "tessa",
  "veena",
  "fiona",
  "victoria",
  "allison",
  "ava",
  "serena",
  "kate",
  "aria",
  "jenny",
  "hazel",
  "eva",
  "google uk english female",
  "google us english"
];

const MALE_VOICE_HINTS = [
  "male",
  "david",
  "mark",
  "daniel",
  "fred",
  "george",
  "james",
  "guy",
  "ryan",
  "eric",
  "tom",
  "alex",
  "google uk english male"
];

let cachedVoices: SpeechSynthesisVoice[] = [];

function refreshVoiceCache(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) cachedVoices = voices;
}

if (typeof window !== "undefined" && window.speechSynthesis) {
  refreshVoiceCache();
  window.speechSynthesis.onvoiceschanged = refreshVoiceCache;
}

function pickVoiceForGender(gender?: TalkVoiceGender): SpeechSynthesisVoice | null {
  if (!gender) return null;
  refreshVoiceCache();
  if (cachedVoices.length === 0) return null;

  const hints = gender === "female" ? FEMALE_VOICE_HINTS : MALE_VOICE_HINTS;
  const englishMatch = cachedVoices.find(
    (v) => v.lang.toLowerCase().startsWith("en") && hints.some((h) => v.name.toLowerCase().includes(h))
  );
  if (englishMatch) return englishMatch;

  const anyMatch = cachedVoices.find((v) => hints.some((h) => v.name.toLowerCase().includes(h)));
  return anyMatch ?? null;
}

function speakWithBrowser(
  seed: number,
  text: string,
  gender: TalkVoiceGender | undefined,
  onEnd: (() => void) | undefined
): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;

  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = gender === "female" ? 1.05 + (seed % 20) / 100 : 0.85 + (seed % 20) / 100;
    utterance.rate = 1.05 + (seed % 15) / 100;
    utterance.volume = 0.85;

    const voice = pickVoiceForGender(gender);
    if (voice) utterance.voice = voice;

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.cancel(); // don't queue/overlap over a previous pick
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Fallback: synthesized blip sequence (Web Audio), used only if the browser
// has no speech synthesis support at all.
// ---------------------------------------------------------------------------

let audioContext: AudioContext | null = null;
let masterBus: GainNode | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    const Ctor =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    audioContext = new Ctor();
    masterBus = audioContext.createGain();
    masterBus.gain.value = 0.5;
    masterBus.connect(audioContext.destination);
  }
  if (audioContext.state === "suspended") void audioContext.resume();
  return audioContext;
}

function playFallbackBlips(seed: number, gender?: TalkVoiceGender): void {
  const ctx = getAudioContext();
  if (!ctx || !masterBus) return;
  const master = masterBus;

  const basePitch = (gender === "female" ? 220 : 150) + (seed % 90);
  const syllables = 5 + (seed % 3);
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 1800;
  filter.connect(master);

  let t = ctx.currentTime + 0.02;
  for (let i = 0; i < syllables; i++) {
    const jitter = ((seed >> (i % 24)) % 40) - 20;
    const freq = basePitch + jitter + (i % 2 === 0 ? 18 : -10);
    const dur = 0.07 + ((seed >> i) % 3) * 0.015;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.linearRampToValueAtTime(freq * 1.15, t + dur * 0.5);
    osc.frequency.linearRampToValueAtTime(freq * 0.9, t + dur);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.16, t + dur * 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc.connect(gain);
    gain.connect(filter);
    osc.start(t);
    osc.stop(t + dur + 0.01);

    t += dur + 0.02;
  }
}

export type TalkSoundOptions = {
  /** Stable per-character pitch personality (e.g. avatar/armor id). */
  seed?: string;
  /** The full line to speak and show in the speech bubble, e.g. "Hi, I'm Zoe! Let's begin our journey." */
  text: string;
  /** Picks a matching voice (best-effort — the Web Speech API has no reliable gender field). */
  gender?: TalkVoiceGender;
  /** Called when the reaction finishes (real speech end/error, or the fallback blip's estimated duration). */
  onEnd?: () => void;
};

/** Plays a "talking" reaction — real spoken words when available, else a synthesized blip. */
export function playSchoolsIdentityTalkSound(opts: TalkSoundOptions): void {
  const seed = seedFromId(opts.seed ?? "default");
  const spoke = speakWithBrowser(seed, opts.text, opts.gender, opts.onEnd);
  if (!spoke) {
    playFallbackBlips(seed, opts.gender);
    if (opts.onEnd) window.setTimeout(opts.onEnd, estimateSpeechDurationMs(opts.text));
  }
}
