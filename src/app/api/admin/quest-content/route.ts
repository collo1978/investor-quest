import { NextResponse } from "next/server";

import {
  createQuestContentCard,
  listQuestContentAdmin
} from "@/lib/supabase/quests/questContentRepository";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SEC_QUEST_SECTION_MAPPINGS } from "@/lib/sec/sectionMappings";
import { QUEST_TYPES } from "@/data/quests/types";
import { QUIZ_FORMAT_REGISTRY } from "@/data/quests/types";
import type { QuestContentCardInput } from "@/lib/supabase/quests/types";
import type { PillarId } from "@/data/pillars";

export const dynamic = "force-dynamic";

const PILLARS: PillarId[] = ["business", "forces", "financials", "management"];

function validateInput(body: unknown): { ok: true; data: QuestContentCardInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Body must be a JSON object." };
  }
  const b = body as Record<string, unknown>;

  const pillarId = b.pillarId as PillarId;
  if (!PILLARS.includes(pillarId)) {
    return { ok: false, error: "Invalid pillarId." };
  }

  const slug = typeof b.slug === "string" ? b.slug.trim() : "";
  if (!slug) return { ok: false, error: "slug is required." };

  const title = typeof b.title === "string" ? b.title.trim() : "";
  const investorQuestion =
    typeof b.investorQuestion === "string" ? b.investorQuestion.trim() : "";
  const whyThisMatters =
    typeof b.whyThisMatters === "string" ? b.whyThisMatters.trim() : "";

  if (!title || !investorQuestion || !whyThisMatters) {
    return { ok: false, error: "title, investorQuestion, and whyThisMatters are required." };
  }

  const sourceFilingType = b.sourceFilingType;
  if (sourceFilingType !== "10-K" && sourceFilingType !== "10-Q" && sourceFilingType !== "DEF 14A") {
    return { ok: false, error: "Invalid sourceFilingType." };
  }

  const sourceSectionKey =
    typeof b.sourceSectionKey === "string" ? b.sourceSectionKey.trim() : "";
  const mapping = SEC_QUEST_SECTION_MAPPINGS.find(
    (m) => m.formType === sourceFilingType && m.sectionKey === sourceSectionKey
  );
  if (!mapping) {
    return { ok: false, error: "Invalid source section for filing type." };
  }

  const questType = b.questType;
  if (typeof questType !== "string" || !QUEST_TYPES.includes(questType as (typeof QUEST_TYPES)[number])) {
    return { ok: false, error: "Invalid questType." };
  }

  const quizFormat = typeof b.quizFormat === "string" ? b.quizFormat : "multiple-choice";
  if (!QUIZ_FORMAT_REGISTRY.some((f) => f.kind === quizFormat)) {
    return { ok: false, error: "Invalid quizFormat." };
  }

  return {
    ok: true,
    data: {
      slug,
      pillarId,
      questType: questType as QuestContentCardInput["questType"],
      title,
      objective: typeof b.objective === "string" ? b.objective : "",
      description: typeof b.description === "string" ? b.description : "",
      investorQuestion,
      whyThisMatters,
      plainEnglishAnswer:
        typeof b.plainEnglishAnswer === "string" ? b.plainEnglishAnswer : null,
      sourceFilingType,
      sourceSectionKey,
      sourceSectionLabel:
        typeof b.sourceSectionLabel === "string"
          ? b.sourceSectionLabel
          : mapping.sectionLabel,
      aiPromptTemplate:
        typeof b.aiPromptTemplate === "string" ? b.aiPromptTemplate : "",
      xpReward: typeof b.xpReward === "number" ? b.xpReward : 100,
      quizFormat,
      quizConfig:
        b.quizConfig && typeof b.quizConfig === "object"
          ? (b.quizConfig as QuestContentCardInput["quizConfig"])
          : null,
      displayOrder: typeof b.displayOrder === "number" ? b.displayOrder : 0,
      hubIcon: typeof b.hubIcon === "string" ? b.hubIcon : null,
      hubSubtitle: typeof b.hubSubtitle === "string" ? b.hubSubtitle : null,
      hubCardCount:
        typeof b.hubCardCount === "number" ? b.hubCardCount : null,
      hubRoute: typeof b.hubRoute === "string" ? b.hubRoute : null,
      hubLocked: typeof b.hubLocked === "boolean" ? b.hubLocked : null,
      forcesCategory:
        typeof b.forcesCategory === "string" ? b.forcesCategory : null,
      partnerIds: Array.isArray(b.partnerIds)
        ? (b.partnerIds as string[]).filter((id) => typeof id === "string")
        : [],
      isActive: b.isActive !== false
    }
  };
}

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        error: "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
        cards: [],
        countsByPillar: {},
        sectionOptions: SEC_QUEST_SECTION_MAPPINGS
      },
      { status: 503 }
    );
  }

  const partnerId = new URL(request.url).searchParams.get("partner") ?? undefined;

  try {
    const cards = await listQuestContentAdmin({ partnerId });
    const countsByPillar = PILLARS.reduce(
      (acc, pillarId) => {
        acc[pillarId] = cards.filter((c) => c.pillarId === pillarId).length;
        return acc;
      },
      {} as Record<PillarId, number>
    );

    return NextResponse.json({
      cards,
      countsByPillar,
      pillars: PILLARS,
      questTypes: QUEST_TYPES,
      quizFormats: QUIZ_FORMAT_REGISTRY.map((f) => ({ kind: f.kind, label: f.label })),
      sectionOptions: SEC_QUEST_SECTION_MAPPINGS,
      source: "supabase" as const
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load quest content.";
    return NextResponse.json(
      {
        error: message,
        cards: [],
        countsByPillar: {},
        sectionOptions: SEC_QUEST_SECTION_MAPPINGS
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const validated = validateInput(body);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  try {
    const card = await createQuestContentCard(validated.data);
    return NextResponse.json({ card }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
