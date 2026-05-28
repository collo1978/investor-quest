const BASE = "http://localhost:3003";
const checks = [
  ["AAPL", "business", "snapshot", "card-1"],
  ["AAPL", "financials", "growth", "card-1"],
  ["AAPL", "forces", "positive-inside-supply-chain", "card-1"],
  ["AAPL", "management", "mgmt-governance", "card-1"],
  ["NVDA", "business", "snapshot", "card-1"],
  ["NVDA", "business", "revenue", "card-1"],
  ["NVDA", "financials", "growth", "card-1"],
  ["NVDA", "forces", "positive-inside-supply-chain", "card-1"],
  ["NVDA", "management", "mgmt-1", "card-1"],
  ["NKE", "business", "snapshot", "card-1"],
  ["NKE", "management", "mgmt-governance", "card-4"],
  ["MSFT", "business", "snapshot", "card-1"],
  ["TSLA", "business", "snapshot", "card-1"],
  ["SPOT", "business", "snapshot", "card-1"]
];

for (const [t, p, s, c] of checks) {
  const r = await fetch(
    `${BASE}/api/admin/quest-generation/card-source?ticker=${t}&pillar=${p}&slug=${s}&cardId=${c}`
  );
  const j = await r.json();
  console.log(
    `${t} ${p}/${s}/${c}: ${j.playerSees}${j.playerAnswerPreview ? " — has copy" : " — EMPTY"}`
  );
}
