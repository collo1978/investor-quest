"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { ConfettiBurst } from "@/ui/effects/ConfettiBurst";
import { useOptionalGame } from "@/components/GameProvider";
import { XP_KEY_TERMS_CHECK } from "@/engine/progression/xpEconomy";
import type { HqMissionTerm } from "@/lib/business/businessIslandHqDecodeContent";

type Props = {
  /** Terms introduced during the mission (title + definition). */
  terms: readonly HqMissionTerm[];
  /** Reason label for XP telemetry. */
  xpReason?: string;
  /** Fired once every match is correct and the student continues. */
  onComplete: () => void;
};

type DefinitionCard = {
  /** Internal id — never shown to the student. */
  id: string;
  correctTermId: string;
  text: string;
};

/** Deterministic-ish client-only shuffle (component mounts after user action). */
function shuffle<T>(input: readonly T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Key Terms Check — full-screen matching activity played after the final
 * Evidence File. Drag each term onto its definition; confirm to grade; correct
 * pairs lock, wrong ones return to the pool; repeat until mastered → XP.
 *
 * Prototype: wired only for the first Business mission ("What NVIDIA Does").
 */
export function KeyTermsCheck({ terms, xpReason = "Key Terms Check", onComplete }: Props) {
  const reduceMotion = useReducedMotion();
  const game = useOptionalGame();

  const definitions = useMemo<DefinitionCard[]>(
    () =>
      shuffle(
        terms.map((t) => ({
          id: `def-${t.id}`,
          correctTermId: t.id,
          text: t.explanation
        }))
      ),
    [terms]
  );
  const termTitleById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const t of terms) map[t.id] = t.title;
    return map;
  }, [terms]);

  const [assignments, setAssignments] = useState<Record<string, string | null>>(
    () => Object.fromEntries(definitions.map((d) => [d.id, null]))
  );
  const [locked, setLocked] = useState<Set<string>>(new Set());
  const [wrongDefs, setWrongDefs] = useState<Set<string>>(new Set());
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{ correct: number; total: number } | null>(
    null
  );
  const [checking, setChecking] = useState(false);
  const [mastered, setMastered] = useState(false);
  const awardedRef = useRef(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const usedTermIds = useMemo(() => {
    const set = new Set<string>();
    for (const v of Object.values(assignments)) if (v) set.add(v);
    return set;
  }, [assignments]);

  const poolTerms = useMemo(
    () => terms.filter((t) => !usedTermIds.has(t.id)),
    [terms, usedTermIds]
  );

  const allFilled = definitions.every((d) => assignments[d.id]);
  const confirmDisabled = !allFilled || checking || mastered;

  const assignTerm = useCallback(
    (defId: string, termId: string) => {
      setAssignments((prev) => {
        if (locked.has(defId)) return prev;
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          if (next[key] === termId && !locked.has(key)) next[key] = null;
        }
        next[defId] = termId;
        return next;
      });
      setSelectedTermId(null);
    },
    [locked]
  );

  const unassignDef = useCallback(
    (defId: string) => {
      if (locked.has(defId)) return;
      setAssignments((prev) => ({ ...prev, [defId]: null }));
    },
    [locked]
  );

  const returnTermToPool = useCallback(
    (termId: string) => {
      setAssignments((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          if (next[key] === termId && !locked.has(key)) next[key] = null;
        }
        return next;
      });
    },
    [locked]
  );

  const handleSlotClick = useCallback(
    (defId: string) => {
      if (checking || locked.has(defId)) return;
      if (selectedTermId) {
        assignTerm(defId, selectedTermId);
        return;
      }
      if (assignments[defId]) unassignDef(defId);
    },
    [assignTerm, assignments, checking, locked, selectedTermId, unassignDef]
  );

  const handleConfirm = useCallback(() => {
    if (confirmDisabled) return;
    const wrong: string[] = [];
    const nextLocked = new Set(locked);
    let correct = 0;
    for (const d of definitions) {
      if (assignments[d.id] === d.correctTermId) {
        nextLocked.add(d.id);
        correct += 1;
      } else {
        wrong.push(d.id);
      }
    }
    setLocked(nextLocked);
    setLastResult({ correct, total: definitions.length });

    if (correct === definitions.length) {
      setMastered(true);
      if (!awardedRef.current) {
        awardedRef.current = true;
        game?.actions.awardBonusXp(XP_KEY_TERMS_CHECK, xpReason);
      }
      return;
    }

    // Flash the wrong slots, then send those terms back to the pool.
    setWrongDefs(new Set(wrong));
    setChecking(true);
    window.setTimeout(
      () => {
        setAssignments((prev) => {
          const next = { ...prev };
          for (const id of wrong) next[id] = null;
          return next;
        });
        setWrongDefs(new Set());
        setChecking(false);
      },
      reduceMotion ? 350 : 1100
    );
  }, [assignments, confirmDisabled, definitions, game, locked, reduceMotion, xpReason]);

  const overlay = (
    <motion.section
      className="iq-key-terms-check"
      role="dialog"
      aria-modal="true"
      aria-label="Key Terms Check"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <ConfettiBurst triggerKey={mastered ? "kt-master" : null} count={40} />

      <AnimatePresence mode="wait">
        {mastered ? (
          <motion.div
            key="mastered"
            className="iq-key-terms-check__done"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.span
              className="iq-key-terms-check__done-check"
              aria-hidden
              initial={reduceMotion ? false : { scale: 0, rotate: -18 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.05 }}
            >
              ✅
            </motion.span>
            <h2 className="iq-key-terms-check__done-title">Key Terms Mastered!</h2>
            <p className="iq-key-terms-check__done-score">
              {definitions.length} of {definitions.length} correct
            </p>
            <motion.p
              className="iq-key-terms-check__done-xp"
              initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.2 }}
            >
              +{XP_KEY_TERMS_CHECK} XP
            </motion.p>
            <button
              type="button"
              className="iq-hq-mission__primary iq-key-terms-check__continue"
              onClick={onComplete}
            >
              Continue to Analyst Challenge →
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="board"
            className="iq-key-terms-check__inner"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="iq-key-terms-check__head">
              <h2 className="iq-key-terms-check__title">📘 Key Terms Check</h2>
              <p className="iq-key-terms-check__subtitle">
                Match each term to its correct meaning before continuing your
                investigation.
              </p>
            </header>

            <div className="iq-key-terms-check__board">
              {/* Left — draggable term pool */}
              <div
                className="iq-key-terms-check__pool"
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const termId = e.dataTransfer.getData("text/plain");
                  if (termId) returnTermToPool(termId);
                }}
              >
                <p className="iq-key-terms-check__col-label">Terms</p>
                {poolTerms.length === 0 ? (
                  <p className="iq-key-terms-check__pool-empty">
                    All terms placed — review, then confirm.
                  </p>
                ) : null}
                {poolTerms.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={[
                      "iq-key-terms-check__term",
                      selectedTermId === t.id
                        ? "iq-key-terms-check__term--selected"
                        : ""
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    draggable={!checking}
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", t.id);
                      e.dataTransfer.effectAllowed = "move";
                      setSelectedTermId(null);
                    }}
                    onClick={() =>
                      setSelectedTermId((prev) => (prev === t.id ? null : t.id))
                    }
                    disabled={checking}
                  >
                    {t.title}
                  </button>
                ))}
              </div>

              {/* Right — definition drop targets */}
              <div className="iq-key-terms-check__defs">
                <p className="iq-key-terms-check__col-label">Meanings</p>
                {definitions.map((d) => {
                  const assignedTermId = assignments[d.id];
                  const isLocked = locked.has(d.id);
                  const isWrong = wrongDefs.has(d.id);
                  return (
                    <div
                      key={d.id}
                      className={[
                        "iq-key-terms-check__def",
                        isLocked ? "iq-key-terms-check__def--locked" : "",
                        isWrong ? "iq-key-terms-check__def--wrong" : ""
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onDragOver={(e) => {
                        if (isLocked || checking) return;
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                      }}
                      onDrop={(e) => {
                        if (isLocked || checking) return;
                        e.preventDefault();
                        const termId = e.dataTransfer.getData("text/plain");
                        if (termId) assignTerm(d.id, termId);
                      }}
                    >
                      <p className="iq-key-terms-check__def-text">{d.text}</p>
                      <button
                        type="button"
                        className={[
                          "iq-key-terms-check__slot",
                          assignedTermId ? "iq-key-terms-check__slot--filled" : "",
                          isLocked ? "iq-key-terms-check__slot--locked" : ""
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() => handleSlotClick(d.id)}
                        draggable={Boolean(assignedTermId) && !isLocked && !checking}
                        onDragStart={(e) => {
                          if (!assignedTermId || isLocked) return;
                          e.dataTransfer.setData("text/plain", assignedTermId);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        disabled={isLocked || (!assignedTermId && !selectedTermId)}
                        aria-label={
                          assignedTermId
                            ? `Matched with ${termTitleById[assignedTermId]}`
                            : "Drop a term here"
                        }
                      >
                        {isLocked ? (
                          <span className="iq-key-terms-check__slot-tick" aria-hidden>
                            ✓
                          </span>
                        ) : null}
                        {assignedTermId ? (
                          <span className="iq-key-terms-check__slot-term">
                            {termTitleById[assignedTermId]}
                          </span>
                        ) : (
                          <span className="iq-key-terms-check__slot-empty">
                            Drop term here
                          </span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <footer className="iq-key-terms-check__foot">
              <AnimatePresence>
                {lastResult ? (
                  <motion.p
                    key={`res-${lastResult.correct}`}
                    className="iq-key-terms-check__result"
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    You got {lastResult.correct} of {lastResult.total} correct!
                  </motion.p>
                ) : null}
              </AnimatePresence>
              <button
                type="button"
                className="iq-hq-mission__primary iq-key-terms-check__confirm"
                onClick={handleConfirm}
                disabled={confirmDisabled}
              >
                {lastResult ? "Check Again" : "Confirm Answers"}
              </button>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );

  if (!mounted) return null;
  return createPortal(overlay, document.body);
}
