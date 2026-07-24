export const SCHOOLS_ARMOR_IDS = [
  "builder",
  "pioneer",
  "titan",
  "visionary"
] as const;

export type SchoolsArmorId = (typeof SCHOOLS_ARMOR_IDS)[number];

/** @deprecated Use {@link SchoolsArmorId}. */
export type SchoolsIdentityId = SchoolsArmorId;

export type SchoolsArmor = {
  id: SchoolsArmorId;
  title: string;
  shortTitle: string;
  tagline: string;
  accent: string;
  /** Spoken + shown in a speech bubble when this armor is selected. */
  greeting: string;
};

/** Schools armor picker — four archetypes on choose-your-armor art. */
export const SCHOOLS_ARMOR_TYPES: readonly SchoolsArmor[] = [
  {
    id: "builder",
    title: "The Builder",
    shortTitle: "Builder",
    tagline: "Steady foundations.",
    accent: "#f59e0b",
    greeting: "I'm the Builder! Let's build something great."
  },
  {
    id: "pioneer",
    title: "The Pioneer",
    shortTitle: "Pioneer",
    tagline: "First into the unknown.",
    accent: "#22c55e",
    greeting: "I'm the Pioneer! Let's explore new frontiers."
  },
  {
    id: "titan",
    title: "The Titan",
    shortTitle: "Titan",
    tagline: "Power through conviction.",
    accent: "#ef4444",
    greeting: "I'm the Titan! Let's dominate the markets."
  },
  {
    id: "visionary",
    title: "The Visionary",
    shortTitle: "Visionary",
    tagline: "See what others miss.",
    accent: "#a855f7",
    greeting: "I'm the Visionary! Let's shape the future."
  }
] as const;

/** @deprecated Use {@link SCHOOLS_ARMOR_TYPES}. */
export const SCHOOLS_IDENTITIES = SCHOOLS_ARMOR_TYPES;

/** @deprecated Use {@link SCHOOLS_ARMOR_IDS}. */
export const SCHOOLS_IDENTITY_IDS = SCHOOLS_ARMOR_IDS;

export function getSchoolsArmorById(id: SchoolsArmorId): SchoolsArmor {
  return SCHOOLS_ARMOR_TYPES.find((armor) => armor.id === id) ?? SCHOOLS_ARMOR_TYPES[0];
}

/** @deprecated Use {@link getSchoolsArmorById}. */
export function getSchoolsIdentityById(id: SchoolsArmorId): SchoolsArmor {
  return getSchoolsArmorById(id);
}
