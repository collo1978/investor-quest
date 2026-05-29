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
  { id: "alex", name: "Alex", tagline: "Curious mind. Future focused.", accent: "violet" },
  { id: "zoe", name: "Zoe", tagline: "Analytical. Always digging deeper.", accent: "fuchsia" },
  { id: "jayden", name: "Jayden", tagline: "Strategic thinker. Sees the big picture.", accent: "emerald" },
  { id: "skylar", name: "Skylar", tagline: "Creative problem solver. Bold moves.", accent: "amber" },
  { id: "ethan", name: "Ethan", tagline: "Tech lover. Always innovating.", accent: "cyan" },
  { id: "riley", name: "Riley", tagline: "Independent. Trusts the process.", accent: "cyan" },
  { id: "mason", name: "Mason", tagline: "Determined. Never gives up.", accent: "rose" },
  { id: "aria", name: "Aria", tagline: "Empathetic leader. Inspires teams.", accent: "amber" },
  { id: "leo", name: "Leo", tagline: "Calm under pressure. Masters the game.", accent: "emerald" },
  { id: "nova", name: "Nova", tagline: "Visionary. Thinks different.", accent: "violet" }
];

export function getSchoolsAvatarById(id: SchoolsAvatarId): SchoolsAvatar {
  return SCHOOLS_AVATARS.find((a) => a.id === id) ?? SCHOOLS_AVATARS[0];
}
