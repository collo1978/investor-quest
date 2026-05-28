/** Deterministic shuffle for order-quiz steps — hydration-safe (seeded by question id). */

function hashSeed(id: string): number {
  let h = 5381;
  for (let i = 0; i < id.length; i++) {
    h = ((h * 33) ^ id.charCodeAt(i)) >>> 0;
  }
  return h >>> 0;
}

function makeRng(seed: number): () => number {
  let s = seed | 0;
  if (s === 0) s = 1;
  return () => {
    s = (s * 9301 + 49297) | 0;
    s = ((s % 233280) + 233280) % 233280;
    return s / 233280;
  };
}

/** Permutation `p` where item `p[i]` displays at slot `i`. */
export function shuffleIndices(n: number, idSeed: string, salt: string): number[] {
  const out = Array.from({ length: n }, (_, i) => i);
  const rng = makeRng(hashSeed(idSeed + "::" + salt));
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function initialOrderPermutation(questionId: string, stepCount: number): number[] {
  return shuffleIndices(stepCount, questionId, "order");
}

export function orderPermutationsEqual(a: readonly number[], b: readonly number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}
