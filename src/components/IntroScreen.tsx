import Image from "next/image";
import Link from "next/link";

/** Unused while `/` redirects to `/map`; kept for a future intro flow (not wired). */
const INTRO_SCREEN_PATH = "/screens/intro-screen.jpg" as const;

const INTRO_IMAGE_MISSING_COPY =
  `Intro image missing: ${INTRO_SCREEN_PATH}` as const;

type IntroScreenProps = {
  assetReady: boolean;
};

/**
 * Full-bleed launch screen. Renders ONLY `INTRO_SCREEN_PATH` when `assetReady`.
 * No fallback to other artwork.
 */
export function IntroScreen({ assetReady }: IntroScreenProps) {
  if (!assetReady) {
    return (
      <main className="relative isolate flex min-h-dvh w-full items-center justify-center overflow-hidden bg-[#030308] px-6">
        <p className="max-w-lg text-center text-sm text-ink-1" role="alert">
          {INTRO_IMAGE_MISSING_COPY}
        </p>
      </main>
    );
  }

  return (
    <main className="relative isolate min-h-dvh w-full overflow-hidden bg-[#030308]">
      <div className="absolute inset-0">
        <Image
          src={INTRO_SCREEN_PATH}
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-center select-none"
        />
      </div>

      <div
        className="group pointer-events-auto absolute bottom-[max(1.25rem,9%)] left-1/2 z-20 min-h-[52px] w-[min(92vw,24rem)] -translate-x-1/2 sm:bottom-[max(1.75rem,10.5%)] sm:min-h-14 sm:w-[min(86vw,26rem)] md:bottom-[11.5%] lg:bottom-[12%] lg:w-[min(72vw,28rem)]"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 shadow-[0_0_48px_rgba(168,85,247,0.35),0_0_96px_rgba(139,92,246,0.12)] transition-opacity duration-300 motion-reduce:transition-none group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:group-hover:opacity-0 motion-reduce:group-focus-within:opacity-0"
        />
        <Link
          href="/onboarding"
          className="absolute inset-0 cursor-pointer rounded-2xl bg-transparent outline-none [touch-action:manipulation] focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030308]"
          aria-label="Start your first quest"
        />
      </div>
    </main>
  );
}
