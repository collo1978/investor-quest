"use client";

type Variant = "marker" | "card" | "modal";

type Props = {
  variant?: Variant;
  className?: string;
};

const VARIANT_CLASS: Record<Variant, string> = {
  marker: "iq-business-quest-discovery-mark iq-business-quest-discovery-mark--marker",
  card: "iq-business-quest-discovery-mark iq-business-quest-discovery-mark--card",
  modal: "iq-business-quest-discovery-mark iq-business-quest-discovery-mark--modal"
};

export function BusinessQuestDiscoveryMark({
  variant = "card",
  className = ""
}: Props) {
  return (
    <span
      className={[VARIANT_CLASS[variant], className].filter(Boolean).join(" ")}
      aria-hidden
    >
      ?
    </span>
  );
}

export function BusinessQuestXpChip({
  rewardXp,
  className = ""
}: {
  rewardXp: number;
  className?: string;
}) {
  if (rewardXp <= 0) return null;
  return (
    <span
      className={["iq-business-quest-xp-chip", className].filter(Boolean).join(" ")}
    >
      +{rewardXp} XP
    </span>
  );
}
