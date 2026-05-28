/**
 * Customer / audience card copy — WHO buys, WHY they buy, WHY the model is strong.
 * Used in AI prompts, human-first gates, and communication audits.
 */

/** Weak generic audience phrasing — auto-rejected on customer/audience cards. */
export const GENERIC_CUSTOMER_AUDIENCE_RE =
  /\b(regular people|normal consumers?|everyone|all kinds of users?|people upgrading (?:phones?|laptops?|devices?)|most buyers are regular|ordinary (?:people|consumers?)|average consumer|general public|typical users?|just (?:people|consumers?) who|anyone who needs a (?:phone|device)|random consumers?)\b/i;

/** Main story names a segment, motive, or business-model strength. */
export const TARGET_CUSTOMER_FOCUS_RE =
  /\b(willing to pay|premium|enterprise|business(es)?|developers?|loyal|loyalty|ecosystem|switching|repeat|subscription|contracts?|segment|buyers? who|customers? who|pay(?:s|ing)? more|stay with|come back|value proposition|network|app store|switch(?:ing)? costs?|recurring|stick with|higher.?margin|institutional|wholesale|retail partners?|professionals?|gamers?|creators?|families|households)\b/i;

export const CUSTOMER_AUDIENCE_HARD_RULES = `CUSTOMER / AUDIENCE CARDS (who buys)
- Sentence 1: WHO the target customer is — specific segment + how they buy (not "regular people" or "everyone").
- Sentence 2: WHY they buy — value proposition in plain language.
- Sentence 3: WHY the business model is strong — loyalty, repeat purchases, ecosystem, switching costs, developer pull, or enterprise adoption (pick what the filing supports).
- BANNED: regular people, everyone, normal consumers, people upgrading phones, all kinds of users, vague "most buyers".
- Tone: smart, simple, insightful, beginner-friendly — not marketing fluff or childish filler.`;

export const CUSTOMER_AUDIENCE_STYLE_REFERENCE = `STYLE REFERENCE (who customers are — tone only):
"Apple mainly sells to consumers willing to pay more for premium devices and a connected ecosystem.

They come back for seamless devices, App Store habits, and services that stack on the phone they already own.

Developers build for iOS because that is where paying users already are, which reinforces the loop.

Why investors care:
Premium buyers who stay in the ecosystem support higher margins and steadier revenue than one-off discount phone sales."`;

export const GENERIC_CUSTOMER_AUDIENCE_PATTERNS: ReadonlyArray<{
  id: string;
  re: RegExp;
}> = [
  { id: "regular_people", re: /\bregular people\b/i },
  { id: "normal_consumers", re: /\bnormal consumers?\b/i },
  { id: "everyone", re: /\beveryone\b/i },
  { id: "all_kinds_of_users", re: /\ball kinds of users?\b/i },
  {
    id: "people_upgrading_phones",
    re: /\bpeople upgrading (?:phones?|laptops?|devices?)\b/i
  },
  { id: "most_buyers_regular", re: /\bmost buyers are regular\b/i }
];

export function hasGenericCustomerAudiencePhrasing(text: string): boolean {
  return GENERIC_CUSTOMER_AUDIENCE_RE.test(text);
}

export function hasTargetCustomerFocus(text: string): boolean {
  return TARGET_CUSTOMER_FOCUS_RE.test(text);
}
