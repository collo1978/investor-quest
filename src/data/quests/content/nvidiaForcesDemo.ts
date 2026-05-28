/**
 * NVIDIA forces — complete the loop; always land how it helps or hurts NVIDIA.
 */
import { contentKey } from "@/data/quests/content/types";
import type { QuestContentOverride } from "@/data/quests/content/types";
import { NVDA_DEMO_SOURCE } from "@/lib/demo/nvidiaDemoSources";

function force(
  slug: string,
  title: string,
  investorQuestion: string,
  plainEnglishAnswer: string
): [string, QuestContentOverride] {
  return [
    contentKey("forces", slug),
    {
      title,
      investorQuestion,
      plainEnglishAnswer,
      secSection: NVDA_DEMO_SOURCE
    }
  ];
}

export const NVIDIA_FORCES_DEMO_OVERRIDES: Record<string, QuestContentOverride> =
  Object.fromEntries([
    force(
      "positive-inside-supply-chain",
      "Getting chips built & shipped",
      "Can they actually get enough chips out the door?",
      "When factories and shipping work, NVIDIA's designs become real chips on time — big customers hit their launch dates and keep ordering.\n\nWhen the chain jams, NVIDIA takes the blame even though partners build the silicon. Staying on schedule is how they keep those mega-buyers happy."
    ),
    force(
      "positive-inside-technology",
      "Software people already know",
      "Why do so many coders stick with NVIDIA?",
      "Retraining a whole engineering team is slow and painful — millions already know NVIDIA's tools from school and work.\n\nThat habit helps NVIDIA keep selling: buyers stick with chips and software they don't want to rip out, even when rivals exist."
    ),
    force(
      "positive-inside-financial-strength",
      "Money in the bank",
      "Do they have enough cash to keep going?",
      "A big cash pile and manageable debt mean a bad quarter doesn't force NVIDIA to panic-cut R&D or fire-sale chips.\n\nThat financial strength lets them keep funding the next invention while investors argue about the stock price."
    ),
    force(
      "positive-inside-brand-strength",
      "Name people trust",
      "Does being \"NVIDIA\" actually help them sell?",
      "Big AI and gaming launches don't want to bet the headline on unknown hardware — \"we need NVIDIA\" shuts rivals out of the room.\n\nThe brand helps NVIDIA win orders and hold pricing because customers trust it won't embarrass them on launch day."
    ),
    force(
      "negative-inside-operational-failures",
      "Mess-ups & delays",
      "What if they drop the ball on a launch?",
      "Missed dates and buggy rollouts give rivals an opening to say they're more reliable.\n\nFor NVIDIA, repeated mess-ups would break the trust that keeps giants reordering — one bad launch hurts; a pattern could push customers to try someone else."
    ),
    force(
      "negative-inside-supply-disruption",
      "Factories or shipping stuck",
      "What if the factories or boats get stuck?",
      "NVIDIA doesn't own every factory — a shutdown or trade fight can mean no chips while customers already promised launches.\n\nWhen supply freezes, NVIDIA can't ship revenue; rivals with stock swoop in. That's how a factory problem becomes an NVIDIA sales problem overnight."
    ),
    force(
      "negative-inside-cyber-risk",
      "Hacks & outages",
      "Could a hack or outage mess them up?",
      "A serious hack or outage can slow orders and spook partners who need reliability.\n\nFor NVIDIA, that kind of hit means lost sales plus slower trust rebuild — partners need to believe systems and data are safe before they commit to the next big chip buy."
    ),
    force(
      "negative-inside-financial-weakness",
      "Running low on cash",
      "What if cash got tight?",
      "If giant AI orders paused and cash in dropped fast, NVIDIA would have fewer choices — less R&D, tougher terms, maybe less room to reward owners.\n\nThey're not there today, but cash trouble would force NVIDIA to protect survival before growth — and the stock would feel that immediately."
    ),
    force(
      "negative-inside-reputation-damage",
      "Trust gets bruised",
      "What if a bad launch or scandal spreads online?",
      "One viral failure makes buyers pause to see if NVIDIA is still safe to bet on.\n\nReputation damage hits NVIDIA where it hurts: slower reorders, tougher negotiations, and rivals pitching \"pick us instead\" while the story is hot."
    ),
    force(
      "positive-outside-demand-growth",
      "Everyone wants AI stuff",
      "Are people still buying like crazy?",
      "While companies race to build AI, they need more chips — NVIDIA sells a large share of the advanced ones.\n\nThat demand wave lifts NVIDIA's revenue as long as the rush continues; they're riding the AI build-out, not inventing it from zero."
    ),
    force(
      "positive-outside-competitive-advantages",
      "Still ahead of rivals",
      "Are they still the one people pick first?",
      "Speed, habit, and huge buyers already on NVIDIA's stack keep \"get NVIDIA\" the default in many deals.\n\nThat advantage means NVIDIA keeps winning orders even in a crowded market — being first choice is revenue before rivals get a meeting."
    ),
    force(
      "positive-outside-economic-growth",
      "Economy feeling okay",
      "Does a good economy help them?",
      "When companies feel rich, they spend more on cloud, AI, and games — which usually means more chip orders.\n\nA healthy economy tailwind helps NVIDIA sell more; NVIDIA rides that mood until budgets tighten."
    ),
    force(
      "positive-outside-favorable-regulation",
      "Rules that help",
      "Can government rules ever help?",
      "Subsidies, tax breaks, or easier trade can pull more AI spending and more chip buys.\n\nWhen policy tilts toward building AI at home, NVIDIA can win extra orders — governments become part of the demand story, not just the risk story."
    ),
    force(
      "positive-outside-global-expansion",
      "Selling around the world",
      "Does more countries wanting AI help?",
      "Each new country investing in AI is another market that might order advanced chips — NVIDIA already sells globally.\n\nGlobal expansion means NVIDIA can grow in a new region even if another cools off — more places to sell the same chips."
    ),
    force(
      "negative-outside-demand-decline",
      "Buyers hit pause",
      "What if big companies stop ordering so much?",
      "If mega-buyers slow AI chip orders, NVIDIA's sales can cool fast because recent growth was \"order more, again.\"\n\nDemand decline hits NVIDIA first in the revenue line — that's the fear that one big build-out was enough and reorder rates drop."
    ),
    force(
      "negative-outside-competition",
      "Other chip companies",
      "Can AMD, Intel, or DIY chips steal sales?",
      "AMD and Intel keep improving; huge customers build in-house chips to depend less on any supplier.\n\nIf a rival matched performance at a lower price, NVIDIA could lose orders fast — competition is the constant threat to NVIDIA's pricing and volume."
    ),
    force(
      "negative-outside-economic-slowdown",
      "Tough economy",
      "What if the economy gets rough?",
      "Tighter budgets mean delayed cloud, game, and AI projects — often smaller or slower chip orders.\n\nIn a slowdown NVIDIA still sells, but deals get harder and growth can stall; the stock sometimes drops before sales prove the pain."
    ),
    force(
      "negative-outside-regulation-risk",
      "New laws & court fights",
      "Can new rules hurt sales?",
      "Export bans or lawsuits can block NVIDIA from selling into a major market or raise costs overnight.\n\nRegulation risk means NVIDIA can lose revenue without missing a product cycle — a rule change is as real as a rival launch."
    ),
    force(
      "negative-outside-geopolitical-risk",
      "Trade fights & wars",
      "Can wars or trade wars jam things up?",
      "Tariffs, sanctions, and conflict can block buyers or slow factories — many NVIDIA chips are built in Taiwan.\n\nGeopolitical shocks hit NVIDIA through delayed chips, blocked markets, and nervous customers — politics becomes a sales and supply problem, not news filler."
    )
  ]);
