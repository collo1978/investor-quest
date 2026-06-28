"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { useGame } from "@/components/GameProvider";
import { getSchoolsArmorById } from "@/lib/schools/schoolsIdentities";
import { navigateSchoolsDemoStep } from "@/lib/schools/navigateSchoolsDemoStep";
import {
  SCHOOLS_SCREEN5_ONBOARDING_ROUTE
} from "@/lib/schools/schoolsMissionBriefInvitationContent";
import { isSchoolsDemoPath, resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";
import { saveSchoolsArmor } from "@/lib/schools/schoolsIdentityStorage";
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
const OPEN_EMERGE_RATIO = 0.22;
const FIRST_LINE_EMERGE_RATIO = 0.3;
const LINE_STEP_RATIO = 0.034;

const MBI_LOGO_SRC = "/logos/current-schools-logo.png";

type ScenePhase = "logo" | "envelope" | "opening" | "reading";

const EASE = [0.22, 1, 0.36, 1] as const;

export function SchoolsMissionBriefInvitationScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { actions, state } = useGame();
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<ScenePhase>("logo");
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

    if (!inner || !seal) return;

    const envBox = envelope.getBoundingClientRect();
    const bodyTop = envBox.height * OPENING_RATIO;
    const sealTop = seal.getBoundingClientRect().top - envBox.top;
    const innerBox = inner.getBoundingClientRect();
    const currentY = new DOMMatrix(getComputedStyle(sheet).transform).m42;
    const innerTopAtZero = innerBox.top - currentY - envBox.top;
    const innerBottomAtZero = innerBox.bottom - currentY - envBox.top;
    let pull = 0;

    if (innerBottomAtZero > sealTop - SEAL_CLEARANCE) {
      pull = sealTop - SEAL_CLEARANCE - innerBottomAtZero;
    }

    const innerTop = innerTopAtZero + pull;
    const revealTop = bodyTop - EMERGE_MARGIN - 20;
    if (innerTop > revealTop) {
      pull -= innerTop - revealTop;
    }

    const stepPull = -Math.round(envH * (FIRST_LINE_EMERGE_RATIO + lineIndex * LINE_STEP_RATIO));
    let target = Math.min(0, pull, stepPull);

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
  const sealInteractive =
    phase === "envelope" || (reading && lineIndex >= 0 && !acceptanceReady);

  const clearTimers = useCallback(() => {
    if (openTimerRef.current != null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (typeTimerRef.current != null) {
      window.clearTimeout(typeTimerRef.current);
      typeTimerRef.current = null;
    }
  }, []);

  const finishTyping = useCallback(() => {
    if (typeTimerRef.current != null) {
      window.clearTimeout(typeTimerRef.current);
      typeTimerRef.current = null;
    }
    setCharCount(currentLine.length);
    setTypingDone(true);
  }, [currentLine]);

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

  useEffect(() => {
    if (phase !== "logo") return;
    const delay = reduceMotion === true ? 300 : 2000;
    const id = window.setTimeout(() => setPhase("envelope"), delay);
    return () => window.clearTimeout(id);
  }, [phase, reduceMotion]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  useEffect(() => {
    if (lineIndex < 0) return;
    startTyping(LETTER_LINES[lineIndex] ?? "");
    return () => {
      if (typeTimerRef.current != null) {
        window.clearTimeout(typeTimerRef.current);
        typeTimerRef.current = null;
      }
    };
  }, [lineIndex, startTyping]);

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

  function advanceLetter() {
    if (lineIndex < 0) return;

    if (!typingDone) {
      finishTyping();
      return;
    }

    if (isLastLine) return;

    setLineIndex((index) => index + 1);
  }

  function handleSealClick() {
    if (phase === "envelope") {
      openSeal();
      return;
    }
    if (reading) {
      advanceLetter();
    }
  }

  function handleBeginQuest() {
    const pioneer = getSchoolsArmorById("pioneer");
    saveSchoolsArmor("pioneer");
    actions.setProfile({
      playerName: pioneer.title,
      goal: state.goal ?? "Build investing mastery"
    });
    actions.completeOpeningScreen();
    actions.completeWelcomeScreen();

    if (isSchoolsDemoPath(pathname)) {
      navigateSchoolsDemoStep("onboarding", pathname, router);
      return;
    }

    markFunnelTransition("onboarding");
    router.replace(
      resolveSchoolsLearnerHref(SCHOOLS_SCREEN5_ONBOARDING_ROUTE, pathname)
    );
  }

  useEffect(() => {
    router.prefetch(
      resolveSchoolsLearnerHref(SCHOOLS_SCREEN5_ONBOARDING_ROUTE, pathname)
    );
  }, [pathname, router]);

  const promptText =
    phase === "envelope" ? "Click the seal" : "Click the seal to continue";

  const sealAriaLabel =
    phase === "envelope"
      ? "Click the seal to open your invitation"
      : "Click the seal to continue reading the letter";

  const showPrompt = (phase === "envelope" || reading) && !acceptanceReady;

  return (
    <main className="iq-mbi-screen">
      <div className="iq-mbi-vignette" aria-hidden />
      <div className="iq-mbi-spotlight" aria-hidden />

      <motion.img
        src={MBI_LOGO_SRC}
        alt="Investor Quest"
        width={560}
        height={140}
        draggable={false}
        className="iq-mbi-invitation__logo"
        initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.9, ease: EASE }}
      />

      <section className="iq-mbi-invitation">
        <div className="iq-mbi-stage">
          <motion.div
            className="iq-mbi-assembly"
            initial={{ opacity: 0, y: reduceMotion === true ? 0 : 48, scale: 0.97 }}
            animate={
              phase === "logo"
                ? { opacity: 0, y: 48, scale: 0.97 }
                : { opacity: 1, y: 0, scale: 1 }
            }
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
                  animate={opened ? { rotateX: -168 } : { rotateX: 0 }}
                  transition={{ duration: reduceMotion === true ? 0.15 : 1.05, ease: EASE }}
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
              {promptText}
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
