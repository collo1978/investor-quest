import type { BusinessIslandPlaceTheme } from "@/lib/business/businessIslandStoryLocations";

type Props = {
  theme: BusinessIslandPlaceTheme;
  className?: string;
};

/**
 * District glyph — instant visual identity in dock and experience headers.
 */
export function BusinessIslandPlaceGlyph({ theme, className }: Props) {
  const common = {
    viewBox: "0 0 32 32",
    className: className ?? "iq-business-island-place-glyph",
    "aria-hidden": true as const
  };

  switch (theme) {
    case "headquarters":
      return (
        <svg {...common}>
          <rect x="8" y="10" width="16" height="16" rx="1.5" fill="currentColor" opacity="0.9" />
          <rect x="11" y="13" width="3" height="3" fill="#050505" />
          <rect x="18" y="13" width="3" height="3" fill="#050505" />
          <rect x="11" y="19" width="3" height="3" fill="#050505" />
          <rect x="18" y="19" width="3" height="3" fill="#050505" />
          <path d="M12 10 V6 h8 v4" stroke="currentColor" strokeWidth="1.6" fill="none" />
          <rect x="13.5" y="16" width="5" height="5" rx="0.8" fill="#76b900" />
        </svg>
      );
    case "products-hall":
      return (
        <svg {...common}>
          <rect x="5" y="18" width="22" height="6" rx="1" fill="currentColor" opacity="0.75" />
          <rect x="8" y="10" width="6" height="8" rx="1" fill="currentColor" />
          <rect x="18" y="8" width="6" height="10" rx="1" fill="currentColor" opacity="0.9" />
          <path d="M11 10 V7 M21 8 V5" stroke="#bef264" strokeWidth="1.4" />
        </svg>
      );
    case "division-hub":
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="4" fill="currentColor" />
          <path
            d="M16 6 V10 M16 22 V26 M6 16 H10 M22 16 H26 M9 9 L12 12 M20 12 L23 9 M9 23 L12 20 M20 20 L23 23"
            stroke="#bef264"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "history-trail":
      return (
        <svg {...common}>
          <path
            d="M6 24 C10 18, 12 20, 16 14 C20 8, 22 10, 26 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="8" cy="22" r="2" fill="#bef264" />
          <circle cx="16" cy="14" r="2" fill="#bef264" />
          <circle cx="24" cy="8" r="2" fill="#bef264" />
        </svg>
      );
    case "manufacturing":
      return (
        <svg {...common}>
          <rect x="7" y="14" width="18" height="10" rx="1.5" fill="currentColor" opacity="0.9" />
          <path d="M10 14 V9 h4 v5 M18 14 V8 h4 v6" fill="currentColor" />
          <circle cx="12" cy="19" r="1.5" fill="#bef264" />
          <circle cx="20" cy="19" r="1.5" fill="#bef264" />
        </svg>
      );
    case "competitive-arena":
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="11" fill="none" stroke="#76b900" strokeWidth="1.4" opacity="0.7" />
          <circle cx="16" cy="16" r="7.5" fill="none" stroke="#bef264" strokeWidth="1.4" />
          <path d="M8 22 L16 8 L24 22 Z" fill="currentColor" opacity="0.9" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="8" fill="currentColor" />
        </svg>
      );
  }
}
