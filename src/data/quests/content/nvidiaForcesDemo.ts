/**
 * NVIDIA forces — relatable headline + visual explanation copy.
 * Grounded in real business themes; no SEC jargon on screen.
 */
import { contentKey } from "@/data/quests/content/types";
import type { QuestContentOverride } from "@/data/quests/content/types";
import { goldAnswer } from "@/lib/demo/nvidiaDemoGoldAnswer";
import { NVDA_DEMO_SOURCE } from "@/lib/demo/nvidiaDemoSources";

function force(
  slug: string,
  title: string,
  investorQuestion: string,
  takeaway: string,
  supporting: string
): [string, QuestContentOverride] {
  return [
    contentKey("forces", slug),
    {
      title,
      investorQuestion,
      plainEnglishAnswer: goldAnswer(takeaway, supporting),
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
      "On-time supply keeps NVIDIA customers reordering.",
      "NVIDIA designs the chips but partner factories actually build and ship them. When that chain runs smoothly, big tech companies get their orders on time and keep coming back for more."
    ),
    force(
      "positive-inside-technology",
      "Software people already know",
      "Why do so many coders stick with NVIDIA?",
      "Developers already know NVIDIA's software tools.",
      "Millions of coders learned NVIDIA's tools in school and on the job — like everyone already knowing how to use iPhone apps. Retraining a whole team on something new is slow and expensive, so buyers stick with what works."
    ),
    force(
      "positive-inside-financial-strength",
      "Money in the bank",
      "Do they have enough cash to keep going?",
      "Strong cash gives NVIDIA room to keep inventing.",
      "NVIDIA piled up serious cash during the AI rush with manageable debt. That buffer lets them keep funding new products even if one quarter disappoints — like savings for a rough month."
    ),
    force(
      "positive-inside-brand-strength",
      "Name people trust",
      "Does being \"NVIDIA\" actually help them sell?",
      "The NVIDIA name helps win big AI deals.",
      "When a company is betting its flagship AI launch, it rarely wants to gamble on unknown hardware. A trusted name helps NVIDIA hold pricing and stay first pick in many deals."
    ),
    force(
      "negative-inside-operational-failures",
      "Mess-ups & delays",
      "What if they drop the ball on a launch?",
      "Launch delays can open the door to rivals.",
      "Missed ship dates or buggy rollouts give customers a reason to try AMD, Intel, or their own in-house chips. Repeat mess-ups would break the trust that keeps mega-buyers reordering."
    ),
    force(
      "negative-inside-supply-disruption",
      "Factories or shipping stuck",
      "What if the factories or boats get stuck?",
      "Factory or shipping jams can stop NVIDIA revenue cold.",
      "NVIDIA relies on partner factories, so a shutdown, trade fight, or shipping snag can mean no chips while customers already promised launches. Rivals with inventory can grab those orders."
    ),
    force(
      "negative-inside-cyber-risk",
      "Hacks & outages",
      "Could a hack or outage mess them up?",
      "Cyber incidents can slow orders and shake trust.",
      "A serious hack or outage can delay customer rollouts and make partners nervous about reliability. NVIDIA would lose sales while rebuilding confidence — like a store that got robbed and has to win trust back."
    ),
    force(
      "negative-inside-financial-weakness",
      "Running low on cash",
      "What if cash got tight?",
      "Tight cash would force NVIDIA to protect survival first.",
      "If AI orders paused and cash flow dropped sharply, NVIDIA would have less room for research, factory prepayments, and returns to owners. They are not there today, but it is a real downside scenario."
    ),
    force(
      "negative-inside-reputation-damage",
      "Trust gets bruised",
      "What if a bad launch or scandal spreads online?",
      "Reputation hits can slow reorders fast.",
      "One viral product failure or scandal makes buyers pause before the next big commit. Rivals pitch reliability while NVIDIA rebuilds trust — like a brand that lost a drop and has to win fans back."
    ),
    force(
      "positive-outside-demand-growth",
      "Everyone wants AI stuff",
      "Are people still buying like crazy?",
      "The AI build-out still pulls chip orders higher.",
      "Companies racing to launch AI need more computing power behind the scenes. NVIDIA sells a huge share of the gear powering that wave, so sales rise while the AI spending frenzy continues."
    ),
    force(
      "positive-outside-competitive-advantages",
      "Still ahead of rivals",
      "Are they still the one people pick first?",
      "NVIDIA is still the default for many AI builds.",
      "Speed, coder habit, and major customers already on their stack keep \"get NVIDIA\" the easy path. That shows up as repeat orders even in a crowded chip market."
    ),
    force(
      "positive-outside-economic-growth",
      "Economy feeling okay",
      "Does a good economy help them?",
      "A healthy economy usually means more chip orders.",
      "When companies feel confident, they spend more on cloud, AI, and gaming gear. NVIDIA tends to sell more chips when those budgets expand — like people upgrading phones when they feel flush."
    ),
    force(
      "positive-outside-favorable-regulation",
      "Rules that help",
      "Can government rules ever help?",
      "Pro-AI policy can pull more chip spending forward.",
      "Government subsidies, tax breaks, or \"build AI at home\" programs can push companies to order more advanced chips sooner. When politicians push AI investment, NVIDIA can win extra orders."
    ),
    force(
      "positive-outside-global-expansion",
      "Selling around the world",
      "Does more countries wanting AI help?",
      "New regions investing in AI add more buyers.",
      "Each country building AI server rooms is another customer for NVIDIA. They already sell globally, so growth in one region can offset a slowdown somewhere else."
    ),
    force(
      "negative-outside-demand-decline",
      "Buyers hit pause",
      "What if big companies stop ordering so much?",
      "Paused AI orders would cool NVIDIA revenue fast.",
      "Recent growth came from big tech ordering again and again. If those buyers decide they built enough AI capacity, reorder rates could drop and sales would follow — like a hype cycle cooling off."
    ),
    force(
      "negative-outside-competition",
      "Other chip companies",
      "Can AMD, Intel, or DIY chips steal sales?",
      "Rivals and in-house chips threaten NVIDIA's share.",
      "AMD and Intel keep improving, and cloud giants are building their own chips to rely less on any supplier. A credible cheaper alternative could pull orders away from NVIDIA."
    ),
    force(
      "negative-outside-economic-slowdown",
      "Tough economy",
      "What if the economy gets rough?",
      "A weak economy can delay cloud and AI projects.",
      "Tighter corporate budgets often mean postponed server builds and smaller chip orders. NVIDIA still sells in a downturn, but growth gets harder to find — like fewer people upgrading gear in a recession."
    ),
    force(
      "negative-outside-regulation-risk",
      "New laws & court fights",
      "Can new rules hurt sales?",
      "Export rules can block sales overnight.",
      "U.S. restrictions on advanced chip sales to China already moved NVIDIA's business once. New limits or lawsuits can cut revenue without a single product miss — politics hitting the wallet."
    ),
    force(
      "negative-outside-geopolitical-risk",
      "Trade fights & wars",
      "Can wars or trade wars jam things up?",
      "Geopolitics can jam factories, shipping, and buyers.",
      "Tariffs, sanctions, and conflict can block markets or disrupt manufacturing partners overseas. Politics becomes a supply and sales problem, not just something you scroll past in the news."
    )
  ]);
