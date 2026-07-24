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

export type SchoolsAvatarGender = "male" | "female";

export type SchoolsAvatar = {
  id: SchoolsAvatarId;
  name: string;
  tagline: string;
  accent: SchoolsAvatarAccent;
  /** Drives voice selection for the spoken selection reaction. */
  gender: SchoolsAvatarGender;
  /** Spoken + shown in a speech bubble when this avatar is selected. */
  greeting: string;
};

export const SCHOOLS_AVATARS: readonly SchoolsAvatar[] = [
  { id: "alex", name: "Alex", tagline: "Future focused. Always learning.", accent: "violet", gender: "male", greeting: "Hi, I'm Alex! Let's begin our journey." },
  { id: "zoe", name: "Zoe", tagline: "Sees patterns before others.", accent: "fuchsia", gender: "female", greeting: "Hi, I'm Zoe! Let's begin our journey." },
  { id: "jayden", name: "Jayden", tagline: "Built for long-term thinking.", accent: "emerald", gender: "male", greeting: "Hey, I'm Jayden! Ready when you are." },
  { id: "skylar", name: "Skylar", tagline: "Powered by curiosity.", accent: "amber", gender: "female", greeting: "Hi, I'm Skylar! Let's explore together." },
  { id: "ethan", name: "Ethan", tagline: "Trusts research over hype.", accent: "cyan", gender: "male", greeting: "Hi, I'm Ethan! Let's dig into the research." },
  { id: "riley", name: "Riley", tagline: "Logic first. Emotion last.", accent: "cyan", gender: "female", greeting: "Hey, I'm Riley! Let's think this through." },
  { id: "mason", name: "Mason", tagline: "Thrives where others hesitate.", accent: "rose", gender: "male", greeting: "Hi, I'm Mason! Let's go for it." },
  { id: "aria", name: "Aria", tagline: "Reads people and markets alike.", accent: "amber", gender: "female", greeting: "Hi, I'm Aria! Let's read the markets." },
  { id: "leo", name: "Leo", tagline: "Calm under pressure.", accent: "emerald", gender: "male", greeting: "Hey, I'm Leo! Let's stay calm and focused." },
  { id: "nova", name: "Nova", tagline: "Thinks three moves ahead.", accent: "violet", gender: "female", greeting: "Hi, I'm Nova! Let's think three moves ahead." }
];

export function getSchoolsAvatarById(id: SchoolsAvatarId): SchoolsAvatar {
  return SCHOOLS_AVATARS.find((a) => a.id === id) ?? SCHOOLS_AVATARS[0];
}
