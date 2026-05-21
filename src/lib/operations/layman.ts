import type { HealthSeverity } from "@/lib/gameHealth/types";

/** User-facing label for issue severity (not "critical" / "warning"). */
export function issueSeverityLabel(severity: HealthSeverity): string {
  switch (severity) {
    case "critical":
      return "Needs fix now";
    case "warning":
      return "Watch this";
    default:
      return "Info";
  }
}

const TECHNICAL_REPLACEMENTS: Array<[RegExp, string]> = [
  [/openai/gi, "AI answer writer"],
  [/timeout/gi, "taking longer than normal"],
  [/generation pipeline/gi, "answer builder"],
  [/supabase/gi, "saved data"],
  [/sec[- ]?api/gi, "filing data service"],
  [/questAnswerQualityPipeline/gi, "answer quality check"],
  [/ECONNREFUSED/gi, "could not connect"],
  [/503/gi, "temporarily unavailable"],
  [/failed to fetch/gi, "could not reach the server"],
  [/OPENAI_API_KEY/gi, "AI key"],
  [/SEC_API_KEY/gi, "filing key"]
];

/** Turn log/API errors into phone-friendly sentences. */
export function humanizeTechnicalMessage(raw: string): string {
  let text = raw.trim();
  if (!text) return "Something went wrong. Try again in a moment.";

  for (const [pattern, replacement] of TECHNICAL_REPLACEMENTS) {
    text = text.replace(pattern, replacement);
  }

  if (text.length > 160) {
    return `${text.slice(0, 157)}…`;
  }
  return text;
}
