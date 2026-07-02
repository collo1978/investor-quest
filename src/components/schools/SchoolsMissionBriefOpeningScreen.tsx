"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { SCHOOLS_LOGO_REVEAL_LOGO_SRC } from "@/lib/schools/schoolsLogoRevealContent";

const LETTER_LINES = [
  "Welcome to Investor Quest",
  "You're about to unlock the same company documents trusted by the world's greatest investors.",
  "Hidden inside these reports are the insights professional investors use to understand the businesses behind every stock they invest in.",
  "Most people never read them because they're thousands of pages long and filled with technical jargon.",
  "We've transformed them into an epic adventure, keeping only what matters, so you can learn how great investors think, faster.",
  "Every island you complete unlocks investing skills you'll use for the rest of your life.",
  "Your journey starts here."
] as const;

type OpeningState = "sealed" | "opening" | "open";

export function SchoolsMissionBriefOpeningScreen() {
  const reduceMotion = useReducedMotion();
  const [state, setState] = useState<OpeningState>("sealed");
  const [paragraphIndex, setParagraphIndex] = useState(0);
  const openingStarted = state !== "sealed";
  const letterRevealed = state === "open";
  const isLastParagraph = paragraphIndex === LETTER_LINES.length - 1;

  function openEnvelope() {
    if (state !== "sealed") return;
    setParagraphIndex(0);
    setState("opening");
    window.setTimeout(() => setState("open"), reduceMotion ? 120 : 680);
  }

  function continueBriefing() {
    setParagraphIndex((index) => Math.min(index + 1, LETTER_LINES.length - 1));
  }

  return (
    <main className="iq-mbo-screen iq-mbo-desk-scene relative min-h-[100dvh] overflow-hidden px-6 py-8 text-slate-100">
      <div className="iq-mbo-desk-light pointer-events-none absolute inset-0" aria-hidden />
      <div className="iq-mbo-desk-grain pointer-events-none absolute inset-0" aria-hidden />
      <div className="iq-mbo-pen pointer-events-none absolute right-[8vw] top-[13vh]" aria-hidden />
      <div className="iq-mbo-compass pointer-events-none absolute bottom-[12vh] left-[7vw]" aria-hidden />

      <section className="relative z-10 mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-6xl flex-col items-center justify-center">
        <motion.img
          src={SCHOOLS_LOGO_REVEAL_LOGO_SRC}
          alt="Investor Quest"
          width={720}
          height={180}
          draggable={false}
          className="iq-mbo-scene-logo mb-8 h-auto w-[min(54vw,20rem)] select-none object-contain"
          initial={{ opacity: 0, y: 12, filter: "blur(8px) brightness(0.65)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px) brightness(1)" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />

        <motion.div
          className="iq-mbo-object-stage relative grid w-full place-items-center"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.45, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.button
            type="button"
            aria-label="Open confidential Investor Quest envelope"
            disabled={state !== "sealed"}
            onClick={openEnvelope}
            className="iq-mbo-physical-envelope-button relative z-20 border-0 bg-transparent p-0 disabled:cursor-default"
            whileHover={state === "sealed" && !reduceMotion ? { y: -10, rotate: -0.4 } : undefined}
            whileTap={state === "sealed" ? { scale: 0.99 } : undefined}
          >
            <div className={`iq-mbo-physical-envelope ${openingStarted ? "iq-mbo-physical-envelope--open" : ""}`}>
              <motion.div
                className={`iq-mbo-letter-half ${letterRevealed ? "iq-mbo-letter-half--revealed" : ""}`}
                aria-live="polite"
                animate={
                  letterRevealed
                    ? { y: reduceMotion ? "-30%" : "-33%", opacity: 1 }
                    : { y: "82%", opacity: 0 }
                }
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="iq-mbo-letter-copy">
                  <motion.p
                    key={paragraphIndex}
                    className={paragraphIndex === 0 ? "iq-mbo-letter-title" : "iq-mbo-letter-line"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {LETTER_LINES[paragraphIndex]}
                  </motion.p>
                </div>
              </motion.div>

              <div className="iq-mbo-envelope-paper iq-mbo-envelope-paper--back" aria-hidden />
              <motion.div
                className="iq-mbo-envelope-flap"
                aria-hidden
                animate={openingStarted ? { rotateX: -168, y: -12 } : { rotateX: 0, y: 0 }}
                transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
              />
              <div className="iq-mbo-envelope-front" aria-hidden>
                <img
                  src={SCHOOLS_LOGO_REVEAL_LOGO_SRC}
                  alt=""
                  draggable={false}
                  className="iq-mbo-envelope-embossed-logo"
                />
                <span className="iq-mbo-envelope-academy">Investor Quest Academy</span>
                <span className="iq-mbo-envelope-to">
                  <span>TO:</span>
                  Future Investor
                </span>
                <span className="iq-mbo-envelope-confidential">CONFIDENTIAL</span>
                <span className="iq-mbo-envelope-stamp">BEGINNER ACCESS</span>
              </div>
              <motion.span
                className="iq-mbo-wax-seal"
                aria-hidden
                animate={
                  openingStarted
                    ? { scale: [1, 1.08, 0.92], rotate: [0, -2, 1] }
                    : { scale: [1, 1.025, 1] }
                }
                transition={
                  openingStarted
                    ? { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
                    : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
                }
              >
                <span className="iq-mbo-wax-seal__pulse" />
                <span className="iq-mbo-wax-seal__spark iq-mbo-wax-seal__spark--a" />
                <span className="iq-mbo-wax-seal__spark iq-mbo-wax-seal__spark--b" />
                <span className="iq-mbo-wax-seal__arrow" />
                <span className="iq-mbo-wax-seal__crack iq-mbo-wax-seal__crack--a" />
                <span className="iq-mbo-wax-seal__crack iq-mbo-wax-seal__crack--b" />
                <span className="iq-mbo-wax-seal__mark">IQ</span>
              </motion.span>
            </div>
          </motion.button>

          <motion.p
            className="iq-mbo-instruction mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: state === "sealed" ? 1 : 0 }}
            transition={{ delay: 0.85, duration: 0.4 }}
          >
            Click the seal to unlock your briefing
          </motion.p>

          {letterRevealed ? (
            <motion.button
              type="button"
              className="iq-mbo-begin-quest mt-7"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              onClick={isLastParagraph ? undefined : continueBriefing}
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={{ scale: 0.985 }}
            >
              {isLastParagraph ? "Begin Quest" : "Continue"}
            </motion.button>
          ) : null}
        </motion.div>
      </section>
    </main>
  );
}
