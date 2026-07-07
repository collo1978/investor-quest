import confetti from "canvas-confetti";

const QUIZ_CONFETTI_COLORS = [
  "#F5C547",
  "#A855F7",
  "#22C58B",
  "#60A5FA",
  "#FBBF24",
  "#F472B6",
  "#34D399"
];

/**
 * Full-screen canvas confetti for a correct quiz answer.
 * Uses the global canvas-confetti instance so nothing is clipped by quiz panels.
 */
export function fireQuizCorrectConfetti(): void {
  const base = {
    ticks: 220,
    gravity: 0.92,
    decay: 0.9,
    startVelocity: 42,
    colors: QUIZ_CONFETTI_COLORS,
    zIndex: 10000
  };

  void confetti({
    ...base,
    particleCount: 120,
    spread: 82,
    scalar: 1.2,
    origin: { x: 0.5, y: 0.34 }
  });

  window.setTimeout(() => {
    void confetti({
      ...base,
      particleCount: 72,
      spread: 110,
      scalar: 1,
      origin: { x: 0.22, y: 0.4 }
    });
  }, 140);

  window.setTimeout(() => {
    void confetti({
      ...base,
      particleCount: 72,
      spread: 110,
      scalar: 1,
      origin: { x: 0.78, y: 0.4 }
    });
  }, 260);
}
