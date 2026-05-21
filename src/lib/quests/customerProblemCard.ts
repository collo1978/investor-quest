/** Snapshot card-2 — "What problem does it solve for customers?" */

export function isCustomerProblemCard(params: {
  questSlug: string;
  cardId: string;
  cardQuestion?: string;
}): boolean {
  if (params.questSlug === "snapshot" && params.cardId === "card-2") {
    return true;
  }
  const q = params.cardQuestion?.toLowerCase() ?? "";
  return q.includes("problem") && q.includes("customer");
}

export const CUSTOMER_PROBLEM_CARD_PROMPT = `CUSTOMER PROBLEM CARD (this question only — hardest plain-English test)

The reader must instantly feel: "What pain disappears because this company exists?"

Required story arc (in order — max 4 short sentences before Why investors care):
1. REAL everyday frustration — what feels annoying, slow, broken, expensive, or confusing WITHOUT this company (games, apps, phones, shopping, work, health, travel — pick one lane from the filing).
2. CONSEQUENCE — what actually happens when that pain is left unsolved (lag, waiting, mistakes, wasted money, can't do the thing you wanted).
3. ONE analogy — "Think of it like…" (one image only).
4. CUSTOMER BENEFIT — how everyday life feels better WITH them (faster, smoother, easier, safer, cheaper, more fun) — not a company brochure.

NEVER write:
- company description → industries → technology summary
- "industries", "solutions", "innovation", "technology is crucial", "essential for", "landscape", "leverages", "strategic", "ecosystem" (buzzword)
- generic AI hype ("cutting-edge AI", "transformative", "next-generation")
- "They provide solutions for…" / "Their technology is crucial for…" / "essential for industries"

GOOD pattern (use THIS company's facts, not this exact wording):
"Without fast enough chips, games stutter, AI chat feels sluggish, and apps take forever to respond.

Think of it like trying to drive a sports car with a weak engine — everything feels held back.

They make the powerful parts inside devices so games, AI tools, and apps feel quick and smooth again.

BAD pattern (reject this shape):
"Their solutions are essential for industries where technology is crucial to innovation and growth."

Explain to a teenager, a casual gamer, or someone on their phone — not an investor conference.`;

export const CUSTOMER_PROBLEM_STYLE_REFERENCE = `STYLE REFERENCE (tone + structure only — use facts from excerpts):

"When a game stutters or an AI chat takes forever to reply, you're feeling what happens when devices aren't fast enough.

Think of it like a phone trying to run too many apps at once — everything slows down and gets frustrating.

This company makes the powerful parts inside those devices so games, apps, and smart tools feel quick and smooth again.

Why investors care:
If people keep demanding faster games and AI, demand for those parts can keep growing."`;
