"use client";

import type { SchoolsAvatarAccent } from "@/lib/schools/avatars";
import {
  getSchoolsAvatarPortraitSrc,
  SCHOOLS_AVATAR_PORTRAIT_ASPECT
} from "@/lib/schools/schoolsAvatarPortraits";
import type { SchoolsAvatarId } from "@/lib/schools/avatars";

export const SCHOOLS_AVATAR_ACCENT_RING_SELECTED: Record<SchoolsAvatarAccent, string> = {
  violet:
    "border-violet-300/90 shadow-[0_0_52px_rgba(139,92,246,0.72),0_0_96px_rgba(139,92,246,0.28),inset_0_0_36px_rgba(139,92,246,0.2)]",
  fuchsia:
    "border-fuchsia-300/90 shadow-[0_0_52px_rgba(232,121,249,0.62),0_0_96px_rgba(192,38,211,0.24),inset_0_0_36px_rgba(192,38,211,0.16)]",
  emerald:
    "border-emerald-300/90 shadow-[0_0_52px_rgba(52,211,153,0.58),0_0_96px_rgba(16,185,129,0.22),inset_0_0_36px_rgba(16,185,129,0.16)]",
  amber:
    "border-amber-300/90 shadow-[0_0_52px_rgba(251,191,36,0.58),0_0_96px_rgba(217,119,6,0.22),inset_0_0_36px_rgba(217,119,6,0.16)]",
  cyan:
    "border-cyan-300/90 shadow-[0_0_52px_rgba(34,211,238,0.58),0_0_96px_rgba(8,145,178,0.22),inset_0_0_36px_rgba(8,145,178,0.16)]",
  rose:
    "border-rose-300/90 shadow-[0_0_52px_rgba(251,113,133,0.58),0_0_96px_rgba(225,29,72,0.22),inset_0_0_36px_rgba(225,29,72,0.16)]",
  sky:
    "border-sky-300/90 shadow-[0_0_52px_rgba(56,189,248,0.58),0_0_96px_rgba(2,132,199,0.22),inset_0_0_36px_rgba(2,132,199,0.16)]"
};

export const SCHOOLS_AVATAR_ACCENT_RING: Record<SchoolsAvatarAccent, string> = {
  violet:
    "border-violet-400/75 shadow-[0_0_36px_rgba(139,92,246,0.5),inset_0_0_24px_rgba(139,92,246,0.12)]",
  fuchsia:
    "border-fuchsia-400/75 shadow-[0_0_36px_rgba(232,121,249,0.45),inset_0_0_24px_rgba(192,38,211,0.1)]",
  emerald:
    "border-emerald-400/75 shadow-[0_0_36px_rgba(52,211,153,0.42),inset_0_0_24px_rgba(16,185,129,0.1)]",
  amber:
    "border-amber-400/75 shadow-[0_0_36px_rgba(251,191,36,0.42),inset_0_0_24px_rgba(217,119,6,0.1)]",
  cyan: "border-cyan-400/75 shadow-[0_0_36px_rgba(34,211,238,0.42),inset_0_0_24px_rgba(8,145,178,0.1)]",
  rose: "border-rose-400/75 shadow-[0_0_36px_rgba(251,113,133,0.42),inset_0_0_24px_rgba(225,29,72,0.1)]",
  sky: "border-sky-400/75 shadow-[0_0_36px_rgba(56,189,248,0.42),inset_0_0_24px_rgba(2,132,199,0.1)]"
};

type Props = {
  avatarId: SchoolsAvatarId;
  accent: SchoolsAvatarAccent;
  width: number;
  active?: boolean;
  selected?: boolean;
  /** Scales portrait height (mobile carousel uses ~0.88). */
  heightScale?: number;
  className?: string;
};

/** Standalone portrait card — no crop from widescreen grid. */
export function SchoolsAvatarPortraitCard({
  avatarId,
  accent,
  width,
  active = false,
  selected = false,
  heightScale = 1,
  className = ""
}: Props) {
  const height = (width / SCHOOLS_AVATAR_PORTRAIT_ASPECT) * heightScale;
  const ring = selected
    ? SCHOOLS_AVATAR_ACCENT_RING_SELECTED[accent]
    : active
      ? SCHOOLS_AVATAR_ACCENT_RING[accent]
      : "border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.45)]";

  return (
    <div
      className={[
        "relative overflow-hidden rounded-2xl border-2 bg-[#05050f] transition-[border-color,box-shadow] duration-300",
        ring,
        className
      ].join(" ")}
      style={{ width, height }}
    >
      <img
        src={getSchoolsAvatarPortraitSrc(avatarId)}
        alt=""
        aria-hidden
        draggable={false}
        decoding="async"
        className={[
          "pointer-events-none block h-full w-full select-none object-cover object-top transition-transform duration-300 ease-out",
          selected ? "scale-[1.08]" : active ? "scale-[1.035]" : "scale-100"
        ].join(" ")}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#030308]/35 via-transparent to-[#030308]/10"
      />
    </div>
  );
}
