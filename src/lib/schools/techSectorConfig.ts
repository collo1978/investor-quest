export const TECH_SECTOR_IMAGE_SRC = "/screens/tech-sector.png";

/** Widescreen desktop map art (`public/screens/tech-sector.png`). */
export const TECH_SECTOR_IMAGE_NATURAL = {
  width: 1672,
  height: 941
} as const;

/** Title-safe upward bias when `object-fit: cover` crops on ultrawide desktops. */
export const TECH_SECTOR_IMAGE_OBJECT_POSITION = "center center";

export type TechSubsectorSlug =
  | "ai-robotics"
  | "software"
  | "semiconductors"
  | "cloud-computing"
  | "cybersecurity";

export type TechSectorButtonPlacement = {
  left?: string;
  right?: string;
  top?: string;
  bottom?: string;
  transform?: string;
};

export type TechSectorButton = {
  id: TechSubsectorSlug;
  title: string;
  href: string;
  /** Viewport-relative label position (desktop game-screen layout). */
  placement: TechSectorButtonPlacement;
  border: string;
  glow: string;
  glowHover: string;
};

export const TECH_SECTOR_BUTTON_SIZE = {
  width: 300,
  height: 54
} as const;

/** Map labels — viewport % anchors, fixed 300×54px panels. */
export const TECH_SECTOR_BUTTONS: readonly TechSectorButton[] = [
  {
    id: "ai-robotics",
    title: "AI & Robotics Stocks",
    href: "/schools/preview/tech-sector/ai-robotics",
    placement: { left: "13%", top: "54%" },
    border: "rgba(56,189,248,0.55)",
    glow: "rgba(56,189,248,0.22)",
    glowHover: "rgba(56,189,248,0.55)"
  },
  {
    id: "software",
    title: "Software Stocks",
    href: "/schools/preview/tech-sector/software",
    placement: { right: "13%", top: "54%" },
    border: "rgba(74,222,128,0.55)",
    glow: "rgba(74,222,128,0.22)",
    glowHover: "rgba(74,222,128,0.55)"
  },
  {
    id: "semiconductors",
    title: "Semiconductor Stocks",
    href: "/schools/preview/tech-sector/semiconductors",
    placement: { left: "10%", bottom: "8%" },
    border: "rgba(192,132,252,0.55)",
    glow: "rgba(192,132,252,0.22)",
    glowHover: "rgba(192,132,252,0.55)"
  },
  {
    id: "cloud-computing",
    title: "Cloud Computing Stocks",
    href: "/schools/preview/tech-sector/cloud-computing",
    placement: { left: "50%", bottom: "8%", transform: "translateX(-50%)" },
    border: "rgba(34,211,238,0.55)",
    glow: "rgba(34,211,238,0.22)",
    glowHover: "rgba(34,211,238,0.55)"
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity Stocks",
    href: "/schools/preview/tech-sector/cybersecurity",
    placement: { right: "10%", bottom: "8%" },
    border: "rgba(251,146,60,0.55)",
    glow: "rgba(251,146,60,0.22)",
    glowHover: "rgba(251,146,60,0.55)"
  }
] as const;
