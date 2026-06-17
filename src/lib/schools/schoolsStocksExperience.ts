export const SCHOOLS_STOCKS_EXPERIENCE_STORAGE_KEY =
  "iq-schools-stocks-experience-selections";

export type SchoolsStocksExperienceId =
  | "tiktok-youtube"
  | "parents-talk"
  | "wonder-money"
  | "confusing"
  | "never-school"
  | "trading-app"
  | "useful-skill";

export type SchoolsStocksExperienceOption = {
  id: SchoolsStocksExperienceId;
  emoji: string;
  label: string;
};

export const SCHOOLS_STOCKS_EXPERIENCE_OPTIONS: readonly SchoolsStocksExperienceOption[] =
  [
    {
      id: "tiktok-youtube",
      emoji: "📱",
      label: "I've seen videos on TikTok or YouTube"
    },
    {
      id: "parents-talk",
      emoji: "👨‍👩‍👧‍👦",
      label: "I've heard my parents talk about stocks"
    },
    {
      id: "wonder-money",
      emoji: "💰",
      label: "I've wondered how people make money from stocks"
    },
    {
      id: "confusing",
      emoji: "🤔",
      label: "Money and investing seem confusing"
    },
    {
      id: "never-school",
      emoji: "🎓",
      label: "I've never learned this at school"
    },
    {
      id: "trading-app",
      emoji: "📈",
      label: "I use a trading app"
    },
    {
      id: "useful-skill",
      emoji: "🏆",
      label: "This could be a useful skill for my future"
    }
  ] as const;

export const SCHOOLS_STOCKS_EXPERIENCE_IDS: readonly SchoolsStocksExperienceId[] =
  SCHOOLS_STOCKS_EXPERIENCE_OPTIONS.map((option) => option.id);

export function readSchoolsStocksExperienceSelections(): SchoolsStocksExperienceId[] {
  if (typeof sessionStorage === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(SCHOOLS_STOCKS_EXPERIENCE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is SchoolsStocksExperienceId =>
        typeof x === "string" &&
        (SCHOOLS_STOCKS_EXPERIENCE_IDS as readonly string[]).includes(x)
    );
  } catch {
    return [];
  }
}

export function writeSchoolsStocksExperienceSelections(
  selected: SchoolsStocksExperienceId[]
): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(
      SCHOOLS_STOCKS_EXPERIENCE_STORAGE_KEY,
      JSON.stringify(selected)
    );
  } catch {
    /* ignore */
  }
}
