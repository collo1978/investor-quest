export const SCHOOLS_AVATAR_IDS = [
  "alex",
  "zoe",
  "jayden",
  "skylar",
  "ethan",
  "riley",
  "mason",
  "aria",
  "leo",
  "nova"
] as const;

export type SchoolsAvatarId = (typeof SCHOOLS_AVATAR_IDS)[number];

export type SchoolsAvatarAccent =
  | "violet"
  | "emerald"
  | "amber"
  | "cyan"
  | "fuchsia"
  | "rose"
  | "sky";

export type SchoolsAvatar = {
  id: SchoolsAvatarId;
  name: string;
  tagline: string;
  accent: SchoolsAvatarAccent;
};

export const SCHOOLS_AVATARS: readonly SchoolsAvatar[] = [
  { id: "alex", name: "Alex", tagline: "Future focused. Always learning.", accent: "violet" },
  { id: "zoe", name: "Zoe", tagline: "Sees patterns before others.", accent: "fuchsia" },
  { id: "jayden", name: "Jayden", tagline: "Built for long-term thinking.", accent: "emerald" },
  { id: "skylar", name: "Skylar", tagline: "Powered by curiosity.", accent: "amber" },
  { id: "ethan", name: "Ethan", tagline: "Trusts research over hype.", accent: "cyan" },
  { id: "riley", name: "Riley", tagline: "Logic first. Emotion last.", accent: "cyan" },
  { id: "mason", name: "Mason", tagline: "Thrives where others hesitate.", accent: "rose" },
  { id: "aria", name: "Aria", tagline: "Reads people and markets alike.", accent: "amber" },
  { id: "leo", name: "Leo", tagline: "Calm under pressure.", accent: "emerald" },
  { id: "nova", name: "Nova", tagline: "Thinks three moves ahead.", accent: "violet" }
];

export function getSchoolsAvatarById(id: SchoolsAvatarId): SchoolsAvatar {
  return SCHOOLS_AVATARS.find((a) => a.id === id) ?? SCHOOLS_AVATARS[0];
}
