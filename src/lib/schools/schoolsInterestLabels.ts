/**
 * Interest id → display label, mirrored from the card catalog in
 * `SchoolsPickInterestsScreen` (kept as plain data so profile-resolution
 * code doesn't import a client component just for labels).
 */
export const SCHOOLS_INTEREST_LABELS: Record<string, string> = {
  ai: "AI & Robotics",
  gaming: "Gaming & Esports",
  music: "Music & Media",
  tech: "Technology",
  sports: "Sports",
  electric_cars: "Cars",
  health: "Medicine & Healthcare",
  finance: "Money & Finance",
  energy: "Energy & Power",
  consumer: "Shopping & Brands",
  travel: "Travel & Adventure",
  food: "Food & Restaurants"
};

export function schoolsInterestLabel(id: string): string {
  return SCHOOLS_INTEREST_LABELS[id] ?? id;
}
