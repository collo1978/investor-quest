export type RocketEmblemTreatment = "light" | "dark" | "color";

/** Known local marks — skip canvas detect (avoids wrong tint on hub art). */
const PRESET_TREATMENT_BY_PATH: Record<string, RocketEmblemTreatment> = {
  "/logos/companies/nke.svg": "light",
  "/logos/companies/aapl.svg": "light"
};

const SAMPLE = 36;

export function normalizeLogoPath(logoUrl: string): string {
  const trimmed = logoUrl.trim();
  if (!trimmed) return "";
  try {
    if (trimmed.startsWith("/")) return trimmed.split("?")[0] ?? trimmed;
    return new URL(trimmed).pathname;
  } catch {
    return trimmed.split("?")[0] ?? trimmed;
  }
}

export function presetEmblemTreatment(
  logoUrl: string
): RocketEmblemTreatment | null {
  const path = normalizeLogoPath(logoUrl);
  return PRESET_TREATMENT_BY_PATH[path] ?? null;
}

export async function resolveEmblemTreatment(
  logoUrl: string
): Promise<RocketEmblemTreatment> {
  const preset = presetEmblemTreatment(logoUrl);
  if (preset) return preset;
  return detectRocketEmblemTreatment(logoUrl);
}

/** Hub + search: crisp mono marks; color brands keep depth. */
export function emblemDisplayFilter(
  treatment: RocketEmblemTreatment
): string | undefined {
  if (treatment === "color") return rocketEmblemFilter("color");
  return brandMarkFilter(treatment);
}

/**
 * Classifies a logo for the Forces rocket emblem:
 * - light: pale marks on transparency (keep as-is + soft halo)
 * - dark: dark monochrome marks → lift to white for the hull
 * - color: saturated brand marks → keep color, add depth only
 */
export async function detectRocketEmblemTreatment(
  src: string
): Promise<RocketEmblemTreatment> {
  if (typeof window === "undefined") return "color";

  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = SAMPLE;
        canvas.height = SAMPLE;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          resolve("color");
          return;
        }

        ctx.drawImage(img, 0, 0, SAMPLE, SAMPLE);
        const { data } = ctx.getImageData(0, 0, SAMPLE, SAMPLE);

        let lum = 0;
        let sat = 0;
        let n = 0;

        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 20) continue;
          const r = data[i] / 255;
          const g = data[i + 1] / 255;
          const b = data[i + 2] / 255;
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          lum += 0.299 * r + 0.587 * g + 0.114 * b;
          sat += max === 0 ? 0 : (max - min) / max;
          n += 1;
        }

        if (n === 0) {
          resolve("color");
          return;
        }

        const avgLum = lum / n;
        const avgSat = sat / n;

        if (avgSat > 0.2) resolve("color");
        else if (avgLum < 0.4) resolve("dark");
        else resolve("light");
      } catch {
        resolve("color");
      }
    };

    img.onerror = () => resolve("color");
    img.src = src;
  });
}

/**
 * Crisp logo on compact dark UI (search rows, nav chips).
 * No glow stacks — those blur small white marks (e.g. Nike swoosh).
 */
export function brandMarkFilter(
  treatment: RocketEmblemTreatment
): string | undefined {
  switch (treatment) {
    case "dark":
      return "brightness(0) invert(1)";
    case "light":
      return undefined;
    default:
      return "brightness(1.04)";
  }
}

/** CSS filter stack — no visible frame, readable on dark rocket art. */
export function rocketEmblemFilter(treatment: RocketEmblemTreatment): string {
  switch (treatment) {
    case "dark":
      return [
        "brightness(0)",
        "invert(1)",
        "drop-shadow(0 0 10px rgba(255,255,255,0.38))",
        "drop-shadow(0 2px 6px rgba(0,0,0,0.5))"
      ].join(" ");
    case "light":
      return [
        "drop-shadow(0 0 12px rgba(255,255,255,0.38))",
        "drop-shadow(0 2px 6px rgba(0,0,0,0.45))"
      ].join(" ");
    default:
      return [
        "brightness(1.06)",
        "saturate(1.12)",
        "drop-shadow(0 2px 8px rgba(0,0,0,0.55))",
        "drop-shadow(0 0 10px rgba(255,255,255,0.18))"
      ].join(" ");
  }
}
