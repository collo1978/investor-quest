"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode
} from "react";
import { createPortal } from "react-dom";

import type { InvestorPrincipleId } from "@/lib/business/businessInvestorFramework";

type Point = { x: number; y: number };

type FlyBurst = {
  id: string;
  from: Point;
  principleId: InvestorPrincipleId;
  cardId: string;
  emoji: string;
  onComplete?: () => void;
};

type InvestorPrincipleEvidenceFlyContextValue = {
  triggerFly: (
    fromEl: HTMLElement,
    principleId: InvestorPrincipleId,
    cardId: string,
    emoji: string,
    onComplete?: () => void
  ) => void;
  inFlightKey: string | null;
};

const InvestorPrincipleEvidenceFlyContext =
  createContext<InvestorPrincipleEvidenceFlyContextValue | null>(null);

export const BUSINESS_INVESTOR_EVIDENCE_GLOW_EVENT = "iq-business-investor-evidence-glow";

function centerOf(rect: DOMRect): Point {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function resolvePrincipleTarget(
  principleId: InvestorPrincipleId,
  cardId: string
): Point | null {
  const slot = document.querySelector<HTMLElement>(
    `[data-evidence-slot="${principleId}#${cardId}"]`
  );
  if (slot) return centerOf(slot.getBoundingClientRect());

  const row = document.querySelector<HTMLElement>(`[data-principle-id="${principleId}"]`);
  if (!row) return null;
  return centerOf(row.getBoundingClientRect());
}

function FlyingParticle({
  from,
  to,
  emoji,
  reduceMotion,
  onDone
}: {
  from: Point;
  to: Point;
  emoji: string;
  reduceMotion: boolean;
  onDone: () => void;
}) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const arcLift = Math.min(-80, -Math.abs(dx) * 0.14 - 28);

  useEffect(() => {
    if (!reduceMotion) return;
    onDone();
  }, [reduceMotion, onDone]);

  if (reduceMotion) {
    return null;
  }

  return (
    <motion.div
      className="iq-investor-evidence-fly"
      style={{ left: from.x, top: from.y }}
      initial={{ x: 0, y: 0, scale: 0.4, opacity: 0 }}
      animate={{
        x: [0, dx * 0.45, dx],
        y: [0, arcLift, dy],
        scale: [0.4, 1.35, 0.95],
        opacity: [0, 1, 0.98]
      }}
      transition={{
        duration: 0.82,
        ease: [0.22, 1, 0.36, 1],
        times: [0, 0.5, 1]
      }}
      onAnimationComplete={onDone}
      aria-hidden
    >
      <span className="iq-investor-evidence-fly__glow" />
      <span className="iq-investor-evidence-fly__core">{emoji}</span>
    </motion.div>
  );
}

export function InvestorPrincipleEvidenceFlyProvider({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [burst, setBurst] = useState<FlyBurst | null>(null);
  const [inFlightKey, setInFlightKey] = useState<string | null>(null);
  const burstId = useId();
  const fallbackTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (fallbackTimerRef.current != null) {
        window.clearTimeout(fallbackTimerRef.current);
      }
    };
  }, []);

  const triggerFly = useCallback(
    (
      fromEl: HTMLElement,
      principleId: InvestorPrincipleId,
      cardId: string,
      emoji: string,
      onComplete?: () => void
    ) => {
      const from = centerOf(fromEl.getBoundingClientRect());
      const key = `${principleId}#${cardId}`;

      if (fallbackTimerRef.current != null) {
        window.clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        if (fallbackTimerRef.current != null) {
          window.clearTimeout(fallbackTimerRef.current);
          fallbackTimerRef.current = null;
        }
        onComplete?.();
        setBurst(null);
        setInFlightKey(null);
      };

      setInFlightKey(key);

      window.dispatchEvent(
        new CustomEvent(BUSINESS_INVESTOR_EVIDENCE_GLOW_EVENT, {
          detail: { principleId, cardId }
        })
      );

      if (reduceMotion) {
        finish();
        return;
      }

      fallbackTimerRef.current = window.setTimeout(finish, 950);

      setBurst({
        id: `${burstId}-${Date.now()}`,
        from,
        principleId,
        cardId,
        emoji,
        onComplete: finish
      });
    },
    [burstId, reduceMotion]
  );

  const handleFlyDone = useCallback(() => {
    burst?.onComplete?.();
  }, [burst]);

  const target =
    burst != null
      ? resolvePrincipleTarget(burst.principleId, burst.cardId) ??
        resolvePrincipleTarget(burst.principleId, burst.cardId.replace(/.*#/, ""))
      : null;

  const flyTarget =
    burst != null
      ? (target ??
        (() => {
          const row = document.querySelector<HTMLElement>(
            `[data-principle-id="${burst.principleId}"]`
          );
          return row ? centerOf(row.getBoundingClientRect()) : burst.from;
        })())
      : null;

  return (
    <InvestorPrincipleEvidenceFlyContext.Provider value={{ triggerFly, inFlightKey }}>
      {children}
      {mounted && burst && flyTarget
        ? createPortal(
            <div className="iq-investor-evidence-fly-layer">
              <FlyingParticle
                from={burst.from}
                to={flyTarget}
                emoji={burst.emoji}
                reduceMotion={Boolean(reduceMotion)}
                onDone={handleFlyDone}
              />
            </div>,
            document.body
          )
        : null}
    </InvestorPrincipleEvidenceFlyContext.Provider>
  );
}

export function useInvestorPrincipleEvidenceFly() {
  return useContext(InvestorPrincipleEvidenceFlyContext);
}
