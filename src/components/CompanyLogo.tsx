import Image from "next/image";

export type CompanyLogoProps = {
  src: string;
  alt: string;
  /** Tailwind size classes for the outer frame (default ~36px). */
  className?: string;
};

/**
 * Company brand mark for headers and cards — light panel on dark chrome.
 */
export function CompanyLogo({
  src,
  alt,
  className = "h-9 w-9 sm:h-10 sm:w-10"
}: CompanyLogoProps) {
  const trimmed = src.trim();
  if (!trimmed) return null;

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-amber-400/30 bg-[rgba(255,255,255,0.96)] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_0_20px_-8px_rgba(245,197,71,0.45)] ${className}`}
      title={alt}
    >
      <Image
        src={trimmed}
        alt={alt}
        width={40}
        height={40}
        className="h-full w-full object-contain"
        sizes="40px"
      />
    </span>
  );
}
