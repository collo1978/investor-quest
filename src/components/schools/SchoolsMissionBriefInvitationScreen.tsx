"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { useGame } from "@/components/GameProvider";
import { navigateSchoolsDemoStep } from "@/lib/schools/navigateSchoolsDemoStep";
import { isSchoolsDemoPath, resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";
import { markFunnelTransition } from "@/lib/startup/funnelTransition";

const LETTER_LINES = [
  "Welcome to Investor Quest.",
  "You're about to begin an educational journey unlike anything you've experienced before.",
  "We've transformed the same company documents trusted by the world's greatest investors into an epic adventure.",
  "Every island you conquer unlocks lifelong investing skills.",
  "Your journey starts here."
] as const;

const TYPE_MS = 34;
const OPEN_MS = 720;
const LETTER_Y_MS = 680;
const ACCEPT_PAUSE_MS = 920;
const STAMP_TO_CTA_MS = 780;

const OPENING_RATIO = 0.36;
const EMERGE_MARGIN = 10;
const SEAL_CLEARANCE = 12;
/** Breathing room between the stamp/last line and the envelope's front
 *  panel edge — wider than EMERGE_MARGIN (which only needs to stop actual
 *  overlap) so the stamp doesn't end up sitting flush against that edge,
 *  reading as visually cramped/cut off even though nothing is clipped. */
const BODY_PANEL_BREATHING_ROOM = 34;
const OPEN_EMERGE_RATIO = 0.22;
const FIRST_LINE_EMERGE_RATIO = 0.3;
const LINE_STEP_RATIO = 0.034;

type ScenePhase = "envelope" | "opening" | "reading";

const EASE = [0.22, 1, 0.36, 1] as const;

export function SchoolsMissionBriefInvitationScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { actions } = useGame();
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<ScenePhase>("envelope");
  const [lineIndex, setLineIndex] = useState(-1);
  const [charCount, setCharCount] = useState(0);
  const [typingDone, setTypingDone] = useState(false);
  const [sealCracking, setSealCracking] = useState(false);
  const [sheetY, setSheetY] = useState(0);
  const [showAccessStamp, setShowAccessStamp] = useState(false);
  const [showBeginCta, setShowBeginCta] = useState(false);
  const envelopeRef = useRef<HTMLDivElement>(null);
  const pocketRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const letterInnerRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLButtonElement>(null);
  const openTimerRef = useRef<number | null>(null);
  const typeTimerRef = useRef<number | null>(null);
  const acceptanceTimerRef = useRef<number | null>(null);
  const autoLineTimerRef = useRef<number | null>(null);
  /**
   * Set right before `skipInvitationAnimation` jumps `lineIndex` straight to
   * the last line. The effect below re-types whenever `lineIndex` changes —
   * necessary for normal line-by-line progression, but skip already set
   * `charCount`/`typingDone` to their finished values directly, and that
   * effect doesn't know the difference. Left unchecked it stomps those
   * back to 0/false and replays the typewriter for ~1s, which in turn
   * toggles `acceptanceReady` off and back on, hiding the stamp/CTA that
   * skip had just revealed and re-triggering the letter's position
   * calculation — the visible "up and down" jump and the CTA staying
   * missing for another ~1.7s after skip. A plain ref (not a dependency)
   * lets the effect tell "line changed because we skipped" apart from
   * "line changed because the reader advanced" without reacting to its
   * own reads.
   */
  const justSkippedRef = useRef(false);

  const opened = phase === "opening" || phase === "reading";
  const reading = phase === "reading";
  const letterVisible = opened;

  const measureSheetY = useCallback(() => {
    const envelope = envelopeRef.current;
    const sheet = sheetRef.current;
    const inner = letterInnerRef.current;
    const seal = sealRef.current;
    if (!envelope || !sheet) return;

    const envH = envelope.offsetHeight;
    if (envH <= 0) return;

    if (!opened) {
      setSheetY(0);
      return;
    }

    if (lineIndex < 0) {
      setSheetY(-Math.round(envH * OPEN_EMERGE_RATIO));
      return;
    }

    const pocket = pocketRef.current;
    if (!inner || !seal || !pocket) return;

    const envBox = envelope.getBoundingClientRect();
    const bodyTop = envBox.height * OPENING_RATIO;
    const sealTop = seal.getBoundingClientRect().top - envBox.top;

    // Measure the sheet's *untransformed* box straight from layout
    // (`offsetTop`/`offsetHeight` ignore `transform` entirely) instead of
    // reading its live, transformed screen position and subtracting the
    // currently-applied translateY to "undo" it. That subtraction needed
    // the exact transform that's *currently painted* — but framer-motion
    // commits `animate` targets on its own rAF schedule, so a value this
    // function just requested isn't necessarily on screen yet when it (or
    // the next effect) reads it back. The mismatch produced a wrong
    // intermediate target that got animated to and then abruptly
    // corrected a moment later — the letter visibly jumping to one
    // position and snapping back to another. Layout geometry has no such
    // lag: `pocket` itself is never transformed, so its box is always
    // trustworthy, and offsetTop/offsetHeight report the sheet's box as
    // laid out regardless of any transform currently animating on it.
    const pocketBox = pocket.getBoundingClientRect();
    const sheetBottomAtZero = pocketBox.bottom - envBox.top;
    const sheetTopAtZero = sheetBottomAtZero - sheet.offsetHeight;
    const innerTopAtZero = sheetTopAtZero + inner.offsetTop;
    const innerBottomAtZero = innerTopAtZero + inner.offsetHeight;
    let pull = 0;

    if (innerBottomAtZero > sealTop - SEAL_CLEARANCE) {
      pull = sealTop - SEAL_CLEARANCE - innerBottomAtZero;
    }

    // The envelope's solid front panel (`.iq-mbi-envelope__body`) starts at
    // `bodyTop` and paints above the pocket (z-index 12 vs 10) — anything
    // whose bottom edge dips past that line is hidden behind it, not just
    // visually crowded like the seal check above. This is the real ceiling
    // for what counts as "revealed"; the seal clearance alone isn't enough
    // because the seal sits further down the envelope than the panel edge,
    // so satisfying it doesn't guarantee staying above the panel too.
    const bodyClearance = bodyTop - BODY_PANEL_BREATHING_ROOM;
    if (innerBottomAtZero > bodyClearance) {
      pull = Math.min(pull, bodyClearance - innerBottomAtZero);
    }

    const innerTop = innerTopAtZero + pull;
    const revealTop = bodyTop - EMERGE_MARGIN - 20;
    if (innerTop > revealTop) {
      pull -= innerTop - revealTop;
    }

    // `stepPull` guesses how far to pull per line from a fixed ratio of the
    // envelope's height — good enough for visual pacing on the earlier
    // lines, but it doesn't know the "Access Granted" stamp is about to be
    // appended below the last line. On a short envelope (compact phones)
    // that guess over-pulls past what's actually needed, dragging the stamp
    // above the pocket's visible top edge. `pull` is measured from the real
    // DOM (it already accounts for whatever is currently rendered, stamp
    // included) and is always the smaller, sufficient correction — trust it
    // alone once we're on the final line instead of compounding it with the
    // formula guess.
    const isLastLine = lineIndex === LETTER_LINES.length - 1;
    const stepPull = -Math.round(envH * (FIRST_LINE_EMERGE_RATIO + lineIndex * LINE_STEP_RATIO));
    let target = isLastLine ? Math.min(0, pull) : Math.min(0, pull, stepPull);

    if (lineIndex === 0) {
      const titleClearLine = sealTop - SEAL_CLEARANCE - 28;
      const innerTop = innerTopAtZero + target;
      if (innerTop > titleClearLine) {
        target -= innerTop - titleClearLine;
      }
    }

    setSheetY(target);
  }, [lineIndex, opened]);

  const scheduleMeasure = useCallback(() => {
    measureSheetY();
  }, [measureSheetY]);

  const isLastLine = lineIndex === LETTER_LINES.length - 1;
  const acceptanceReady = isLastLine && typingDone;
  const currentLine = lineIndex >= 0 ? LETTER_LINES[lineIndex] : "";
  const display = currentLine.slice(0, charCount);
  const sealInteractive = phase === "envelope";

  const clearTimers = useCallback(() => {
    if (openTimerRef.current != null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (typeTimerRef.current != null) {
      window.clearTimeout(typeTimerRef.current);
      typeTimerRef.current = null;
    }
    if (autoLineTimerRef.current != null) {
      window.clearTimeout(autoLineTimerRef.current);
      autoLineTimerRef.current = null;
    }
    if (acceptanceTimerRef.current != null) {
      window.clearTimeout(acceptanceTimerRef.current);
      acceptanceTimerRef.current = null;
    }
  }, []);

  const startTyping = useCallback(
    (line: string) => {
      if (typeTimerRef.current != null) {
        window.clearTimeout(typeTimerRef.current);
        typeTimerRef.current = null;
      }

      if (reduceMotion === true) {
        setCharCount(line.length);
        setTypingDone(true);
        return;
      }

      setCharCount(0);
      setTypingDone(false);

      let index = 0;
      const tick = () => {
        index += 1;
        setCharCount(index);
        if (index >= line.length) {
          setTypingDone(true);
          typeTimerRef.current = null;
          return;
        }
        typeTimerRef.current = window.setTimeout(tick, TYPE_MS);
      };

      typeTimerRef.current = window.setTimeout(tick, TYPE_MS);
    },
    [reduceMotion]
  );

  useEffect(() => () => clearTimers(), [clearTimers]);

  useEffect(() => {
    if (lineIndex < 0) return;
    if (justSkippedRef.current) {
      justSkippedRef.current = false;
      return;
    }
    startTyping(LETTER_LINES[lineIndex] ?? "");
    return () => {
      if (typeTimerRef.current != null) {
        window.clearTimeout(typeTimerRef.current);
        typeTimerRef.current = null;
      }
    };
  }, [lineIndex, startTyping]);

  useEffect(() => {
    if (autoLineTimerRef.current != null) {
      window.clearTimeout(autoLineTimerRef.current);
      autoLineTimerRef.current = null;
    }

    if (!reading || !typingDone || isLastLine) return;

    autoLineTimerRef.current = window.setTimeout(() => {
      setLineIndex((index) => Math.min(index + 1, LETTER_LINES.length - 1));
      autoLineTimerRef.current = null;
    }, reduceMotion === true ? 120 : 620);

    return () => {
      if (autoLineTimerRef.current != null) {
        window.clearTimeout(autoLineTimerRef.current);
        autoLineTimerRef.current = null;
      }
    };
  }, [isLastLine, reading, reduceMotion, typingDone]);

  useLayoutEffect(() => {
    scheduleMeasure();
  }, [scheduleMeasure, lineIndex, opened, typingDone, phase, showAccessStamp, showBeginCta]);

  useEffect(() => {
    if (acceptanceTimerRef.current != null) {
      window.clearTimeout(acceptanceTimerRef.current);
      acceptanceTimerRef.current = null;
    }

    if (!acceptanceReady) {
      setShowAccessStamp(false);
      setShowBeginCta(false);
      return;
    }

    const pauseMs = reduceMotion === true ? 180 : ACCEPT_PAUSE_MS;
    const ctaDelayMs = reduceMotion === true ? 120 : STAMP_TO_CTA_MS;

    acceptanceTimerRef.current = window.setTimeout(() => {
      setShowAccessStamp(true);
      acceptanceTimerRef.current = window.setTimeout(() => {
        setShowBeginCta(true);
        acceptanceTimerRef.current = null;
      }, ctaDelayMs);
    }, pauseMs);

    return () => {
      if (acceptanceTimerRef.current != null) {
        window.clearTimeout(acceptanceTimerRef.current);
        acceptanceTimerRef.current = null;
      }
    };
  }, [acceptanceReady, reduceMotion]);

  useEffect(() => {
    if (lineIndex !== 0 || phase !== "reading") return;
    const id = window.setTimeout(() => scheduleMeasure(), 60);
    return () => window.clearTimeout(id);
  }, [lineIndex, phase, scheduleMeasure]);

  useEffect(() => {
    const inner = letterInnerRef.current;
    const sheet = sheetRef.current;
    const pocket = pocketRef.current;
    if (!inner || !sheet || !pocket) return;

    const observer = new ResizeObserver(() => scheduleMeasure());
    observer.observe(inner);
    observer.observe(sheet);
    observer.observe(pocket);

    const onResize = () => scheduleMeasure();
    window.addEventListener("resize", onResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [scheduleMeasure, lineIndex, opened]);

  function beginReading() {
    setPhase("reading");
    setSealCracking(false);
    if (lineIndex < 0) setLineIndex(0);
    requestAnimationFrame(() => {
      scheduleMeasure();
      requestAnimationFrame(() => scheduleMeasure());
    });
  }

  function openSeal() {
    if (phase !== "envelope") return;
    setPhase("opening");
    setSealCracking(true);
    setLineIndex(0);

    const envH = envelopeRef.current?.offsetHeight ?? 320;
    setSheetY(-Math.round(envH * FIRST_LINE_EMERGE_RATIO));

    const delay = reduceMotion === true ? 120 : OPEN_MS;
    openTimerRef.current = window.setTimeout(beginReading, delay);
  }

  function handleSealClick() {
    if (phase === "envelope") {
      openSeal();
    }
  }

  function skipInvitationAnimation() {
    clearTimers();
    if (acceptanceTimerRef.current != null) {
      window.clearTimeout(acceptanceTimerRef.current);
      acceptanceTimerRef.current = null;
    }

    const lastIndex = LETTER_LINES.length - 1;
    const envH = envelopeRef.current?.offsetHeight ?? 320;
    justSkippedRef.current = true;
    setPhase("reading");
    setSealCracking(false);
    setLineIndex(lastIndex);
    setCharCount(LETTER_LINES[lastIndex].length);
    setTypingDone(true);
    setShowAccessStamp(true);
    setShowBeginCta(true);
    setSheetY(
      -Math.round(envH * (FIRST_LINE_EMERGE_RATIO + lastIndex * LINE_STEP_RATIO))
    );
  }

  function handleBeginQuest() {
    actions.completeOpeningScreen();
    actions.completeWelcomeScreen();

    if (isSchoolsDemoPath(pathname)) {
      navigateSchoolsDemoStep("name", pathname, router);
      return;
    }

    markFunnelTransition("name");
    router.replace(resolveSchoolsLearnerHref("/schools/name", pathname));
  }

  useEffect(() => {
    router.prefetch(resolveSchoolsLearnerHref("/schools/name", pathname));
  }, [pathname, router]);

  const sealAriaLabel = "Click the seal to open your invitation";

  const showPrompt = phase === "envelope";

  return (
    <main className="iq-mbi-screen">
      <div className="iq-mbi-vault-grid" aria-hidden />
      <div className="iq-mbi-gold-ribbons" aria-hidden />
      <div className="iq-mbi-paper-halo" aria-hidden />
      <div className="iq-mbi-vignette" aria-hidden />
      <div className="iq-mbi-spotlight" aria-hidden />

      {!showBeginCta ? (
        <button
          type="button"
          className="iq-mbi-skip-button"
          onClick={skipInvitationAnimation}
        >
          Skip
        </button>
      ) : null}

      <section className="iq-mbi-invitation">
        <div className="iq-mbi-stage">
          <motion.div
            className="iq-mbi-assembly"
            initial={{ opacity: 0, y: reduceMotion === true ? 0 : 48, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            <div className="iq-mbi-envelope-wrap">
              <div
                ref={envelopeRef}
                className={`iq-mbi-envelope ${opened ? "iq-mbi-envelope--opened" : ""}`}
              >
                <div className="iq-mbi-envelope__shadow" aria-hidden />
                <div className="iq-mbi-envelope__back" aria-hidden />

                <div
                  ref={pocketRef}
                  className={`iq-mbi-envelope__pocket ${letterVisible ? "iq-mbi-envelope__pocket--visible" : ""}`}
                >
                  <motion.div
                    ref={sheetRef}
                    className={`iq-mbi-letter-sheet ${reading ? "iq-mbi-letter-sheet--reading" : ""} ${phase === "opening" ? "iq-mbi-letter-sheet--emerging" : ""}`}
                    initial={false}
                    animate={{ y: sheetY }}
                    transition={{
                      duration:
                        reduceMotion === true
                          ? 0.12
                          : phase === "opening"
                            ? OPEN_MS / 1000
                            : LETTER_Y_MS / 1000,
                      ease: EASE
                    }}
                  >
                    <div ref={letterInnerRef} className="iq-mbi-letter-sheet__inner" aria-live="polite">
                      {LETTER_LINES.map((line, index) => {
                        if (index > lineIndex) return null;
                        const isTitle = index === 0;
                        const isActive = index === lineIndex && !typingDone;
                        const text =
                          index < lineIndex || (index === lineIndex && typingDone)
                            ? line
                            : isActive
                              ? display
                              : "";

                        return (
                          <Fragment key={line}>
                            <p
                              className={
                                isTitle
                                  ? "iq-mbi-letter-sheet__title"
                                  : "iq-mbi-letter-sheet__line"
                              }
                            >
                              {text}
                              {isActive ? (
                                <span className="iq-mbi-letter-sheet__cursor" aria-hidden />
                              ) : null}
                            </p>
                            {isTitle && lineIndex >= 0 ? (
                              <div className="iq-mbi-letter-sheet__divider" aria-hidden>
                                <span />
                                <span className="iq-mbi-letter-sheet__divider-diamond" />
                                <span />
                              </div>
                            ) : null}
                          </Fragment>
                        );
                      })}

                      {showAccessStamp ? (
                        <motion.div
                          className="iq-mbi-access-stamp-wrap"
                          initial={
                            reduceMotion === true
                              ? { opacity: 1, scale: 1, rotate: -4 }
                              : { opacity: 0, scale: 1.52, rotate: -11 }
                          }
                          animate={{ opacity: 1, scale: 1, rotate: -4 }}
                          transition={{
                            duration: reduceMotion === true ? 0.12 : 0.42,
                            ease: EASE
                          }}
                        >
                          <div className="iq-mbi-access-stamp" aria-hidden>
                            <span className="iq-mbi-access-stamp__ring iq-mbi-access-stamp__ring--outer" />
                            <span className="iq-mbi-access-stamp__ring iq-mbi-access-stamp__ring--inner" />
                            <span className="iq-mbi-access-stamp__flash" />
                            <span className="iq-mbi-access-stamp__text">Access Granted</span>
                          </div>
                        </motion.div>
                      ) : null}
                    </div>
                  </motion.div>
                </div>

                <div className="iq-mbi-envelope__body" aria-hidden />

                <motion.div
                  className="iq-mbi-envelope__flap"
                  aria-hidden
                  animate={
                    reading
                      ? { rotateX: -168, opacity: 0 }
                      : opened
                        ? { rotateX: -168, opacity: 1 }
                        : { rotateX: 0, opacity: 1 }
                  }
                  transition={{
                    rotateX: { duration: reduceMotion === true ? 0.15 : 1.05, ease: EASE },
                    // The folded-back flap shares its rotation pivot with the
                    // letter's fold line — at this near-180deg angle the two
                    // coplanar 3D surfaces z-fight, flickering a sliver of
                    // the flap's edge through the letter text. It has no
                    // visual purpose once reading starts, so fade it out
                    // instead of leaving it to clash indefinitely.
                    opacity: { duration: reduceMotion === true ? 0.01 : 0.3 }
                  }}
                />

                <button
                  ref={sealRef}
                  type="button"
                  className={[
                    "iq-mbi-seal",
                    opened ? "iq-mbi-seal--opened" : "",
                    reading ? "iq-mbi-seal--reading" : "",
                    sealCracking ? "iq-mbi-seal--cracking" : "",
                    sealInteractive ? "iq-mbi-seal--lit" : ""
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-label={sealAriaLabel}
                  disabled={!sealInteractive}
                  onClick={handleSealClick}
                >
                  <span className="iq-mbi-seal__pulse iq-mbi-seal__pulse--outer" aria-hidden />
                  <span className="iq-mbi-seal__pulse" aria-hidden />
                  <span className="iq-mbi-seal__pool" aria-hidden />
                  <span className="iq-mbi-seal__wax" aria-hidden />
                  <span className="iq-mbi-seal__rim" aria-hidden />
                  <span className="iq-mbi-seal__shine" aria-hidden />
                  <span className="iq-mbi-seal__mark" aria-hidden>IQ</span>
                  <span className="iq-mbi-seal__mark iq-mbi-seal__mark--emboss" aria-hidden>IQ</span>
                  <span className="iq-mbi-seal__crack iq-mbi-seal__crack--a" aria-hidden />
                  <span className="iq-mbi-seal__crack iq-mbi-seal__crack--b" aria-hidden />
                </button>
              </div>
            </div>
          </motion.div>

          {showPrompt ? (
            <motion.p
              className="iq-mbi-prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.35, duration: 0.35 }}
            >
              Click the seal
            </motion.p>
          ) : null}

          {showBeginCta ? (
            <motion.button
              type="button"
              className="iq-mbi-begin-quest"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduceMotion === true ? 0.15 : 0.55,
                ease: EASE
              }}
              onClick={handleBeginQuest}
            >
              Begin Quest →
            </motion.button>
          ) : null}
        </div>
      </section>
    </main>
  );
}
