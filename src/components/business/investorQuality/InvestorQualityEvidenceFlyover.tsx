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

import {
  resolveChecklistItem,
  type InvestorQualityChecklistItemId
} from "@/lib/business/investorQualityChecklist";

type Point = { x: number; y: number };

type FlyBurst = {
  id: string;
  from: Point;
  itemIds: readonly InvestorQualityChecklistItemId[];
  onComplete?: () => void;
};

type EvidenceFlyContextValue = {
  triggerFly: (
    fromEl: HTMLElement,
    itemIds: readonly InvestorQualityChecklistItemId[],
    onComplete?: () => void
  ) => void;
  /** Hide incoming chips at destination until the fly-in lands. */
  inFlightItemIds: readonly InvestorQualityChecklistItemId[];
};

const EvidenceFlyContext = createContext<EvidenceFlyContextValue | null>(null);

function centerOf(rect: DOMRect): Point {
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  };
}

function resolveChecklistTarget(itemId: InvestorQualityChecklistItemId): Point | null {
  const row = document.querySelector<HTMLElement>(
    `[data-checklist-item-id="${itemId}"]`
  );
  if (!row) return null;

  const segments = row.querySelector<HTMLElement>(
    ".iq-investor-quality-quest-panel__segments"
  );
  const targetEl =
    segments ??
    row.querySelector<HTMLElement>(".iq-investor-quality-quest-panel__row-head") ??
    row;
  return centerOf(targetEl.getBoundingClientRect());
}

function FlyingEvidenceParticle({
  from,
  to,
  emoji,
  label,
  delaySec,
  reduceMotion,
  onDone
}: {
  from: Point;
  to: Point;
  emoji: string;
  label: string;
  delaySec: number;
  reduceMotion: boolean;
  onDone: () => void;
}) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const arcLift = Math.min(-72, -Math.abs(dx) * 0.12 - 24);

  if (reduceMotion) {
    return null;
  }

  return (
    <motion.div
      className="iq-evidence-fly"
      style={{ left: from.x, top: from.y }}
      initial={{ x: 0, y: 0, scale: 0.35, opacity: 0 }}
      animate={{
        x: [0, dx * 0.42, dx],
        y: [0, arcLift, dy],
        scale: [0.35, 1.18, 0.92],
        opacity: [0, 1, 0.98]
      }}
      transition={{
        duration: 0.78,
        delay: delaySec,
        ease: [0.22, 1, 0.36, 1],
        times: [0, 0.52, 1]
      }}
      onAnimationComplete={onDone}
      aria-hidden
    >
      <span className="iq-evidence-fly__glow" />
      <span className="iq-evidence-fly__core">
        <span className="iq-evidence-fly__emoji">{emoji}</span>
        <span className="iq-evidence-fly__label">{label}</span>
      </span>
    </motion.div>
  );
}

function SourceBurst({ from, reduceMotion }: { from: Point; reduceMotion: boolean }) {
  if (reduceMotion) return null;

  return (
    <motion.div
      className="iq-evidence-fly__source-burst"
      style={{ left: from.x, top: from.y }}
      initial={{ scale: 0.4, opacity: 0.85 }}
      animate={{ scale: 2.4, opacity: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      aria-hidden
    />
  );
}

function EvidenceFlyLayer({
  burst,
  onFinished
}: {
  burst: FlyBurst;
  onFinished: () => void;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const completedRef = useRef(0);
  const finishedRef = useRef(false);

  const targets = burst.itemIds
    .map((itemId) => {
      const to = resolveChecklistTarget(itemId);
      if (!to) return null;
      const item = resolveChecklistItem(itemId);
      return { itemId, to, emoji: item.emoji, label: item.shortLabel };
    })
    .filter(Boolean) as {
    itemId: InvestorQualityChecklistItemId;
    to: Point;
    emoji: string;
    label: string;
  }[];

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    burst.onComplete?.();
    onFinished();
  }, [burst, onFinished]);

  useEffect(() => {
    if (reduceMotion || targets.length === 0) {
      finish();
    }
  }, [reduceMotion, targets.length, finish]);

  if (typeof document === "undefined") return null;
  if (reduceMotion || targets.length === 0) return null;

  const handleParticleDone = () => {
    completedRef.current += 1;
    if (completedRef.current >= targets.length) {
      finish();
    }
  };

  return createPortal(
    <div className="iq-evidence-fly-layer" aria-hidden>
      <SourceBurst from={burst.from} reduceMotion={reduceMotion} />
      {targets.map((target, index) => (
        <FlyingEvidenceParticle
          key={`${burst.id}-${target.itemId}`}
          from={burst.from}
          to={target.to}
          emoji={target.emoji}
          label={target.label}
          delaySec={index * 0.11}
          reduceMotion={reduceMotion}
          onDone={handleParticleDone}
        />
      ))}
    </div>,
    document.body
  );
}

export function EvidenceFlyProvider({ children }: { children: ReactNode }) {
  const baseId = useId();
  const seqRef = useRef(0);
  const [burst, setBurst] = useState<FlyBurst | null>(null);
  const [inFlightItemIds, setInFlightItemIds] = useState<
    readonly InvestorQualityChecklistItemId[]
  >([]);

  const triggerFly = useCallback(
    (
      fromEl: HTMLElement,
      itemIds: readonly InvestorQualityChecklistItemId[],
      onComplete?: () => void
    ) => {
      if (itemIds.length === 0) {
        onComplete?.();
        return;
      }

      const from = centerOf(fromEl.getBoundingClientRect());
      seqRef.current += 1;
      setInFlightItemIds(itemIds);
      setBurst({
        id: `${baseId}-${seqRef.current}`,
        from,
        itemIds,
        onComplete
      });
    },
    [baseId]
  );

  const handleFinished = useCallback(() => {
    setBurst(null);
    setInFlightItemIds([]);
  }, []);

  const value: EvidenceFlyContextValue = {
    triggerFly,
    inFlightItemIds
  };

  return (
    <EvidenceFlyContext.Provider value={value}>
      {children}
      {burst ? <EvidenceFlyLayer burst={burst} onFinished={handleFinished} /> : null}
    </EvidenceFlyContext.Provider>
  );
}

export function useEvidenceFly(): EvidenceFlyContextValue | null {
  return useContext(EvidenceFlyContext);
}
