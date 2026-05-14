import Image from "next/image";

/** Intrinsic dimensions for layout; displayed size is controlled by className (object-contain, no stretch). */
const LOGO_WIDTH = 520;
const LOGO_HEIGHT = 160;

export type InvestorQuestBrandLogoProps = {
  priority?: boolean;
  /** Tailwind classes for height/width; keep w-auto and object-contain for correct aspect ratio. */
  className?: string;
  /** Center the mark (e.g. cinematic intro); default aligns left for nav bars. */
  align?: "left" | "center";
  /** Passed to `next/image` `sizes` for responsive loading. */
  sizes?: string;
};

/**
 * Wordmark with subtle violet glow. Decorative layers use pointer-events-none per UI rules.
 */
export function InvestorQuestBrandLogo({
  priority,
  className = "h-11 w-auto sm:h-12",
  align = "left",
  sizes = "(max-width: 640px) 280px, 340px"
}: InvestorQuestBrandLogoProps) {
  const objectAlign = align === "center" ? "object-center" : "object-left";
  return (
    <span className="relative inline-flex shrink-0 items-center align-middle">
      {/* Outer violet bloom — premium, non-interactive */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-4 rounded-[22px] bg-[radial-gradient(ellipse_125%_90%_at_45%_48%,rgba(192,132,252,0.38),rgba(139,92,246,0.18)_40%,rgba(88,28,135,0.08)_55%,transparent_72%)] blur-[20px] opacity-[0.92]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-2 rounded-2xl bg-[radial-gradient(ellipse_110%_75%_at_50%_52%,rgba(167,139,250,0.28),transparent_62%)] blur-[10px]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-1 rounded-xl bg-[radial-gradient(ellipse_95%_70%_at_50%_55%,rgba(139,92,246,0.2),transparent_60%)] blur-[5px]"
      />
      <Image
        src="/logos/investor-quest-logo.png"
        alt="Investor Quest"
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        priority={priority}
        sizes={sizes}
        className={`relative z-[1] object-contain ${objectAlign} select-none [filter:drop-shadow(0_0_14px_rgba(167,139,250,0.35))] ${className}`}
      />
    </span>
  );
}
