import { NextResponse } from "next/server";

import {
  getQuestContentCardById,
  updateQuestContentCard
} from "@/lib/supabase/quests/questContentRepository";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SEC_QUEST_SECTION_MAPPINGS } from "@/lib/sec/sectionMappings";
import type { QuestContentCardUpdate } from "@/lib/supabase/quests/types";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const { id } = await context.params;
  const existing = await getQuestContentCardById(id);
  if (!existing) {
    return NextResponse.json({ error: "Quest card not found." }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const patch: QuestContentCardUpdate = {};

  if (typeof body.slug === "string") patch.slug = body.slug;
  if (typeof body.pillarId === "string") patch.pillarId = body.pillarId as QuestContentCardUpdate["pillarId"];
  if (typeof body.questType === "string") patch.questType = body.questType as QuestContentCardUpdate["questType"];
  if (typeof body.title === "string") patch.title = body.title;
  if (typeof body.objective === "string") patch.objective = body.objective;
  if (typeof body.description === "string") patch.description = body.description;
  if (typeof body.investorQuestion === "string") patch.investorQuestion = body.investorQuestion;
  if (typeof body.whyThisMatters === "string") patch.whyThisMatters = body.whyThisMatters;
  if (body.plainEnglishAnswer === null || typeof body.plainEnglishAnswer === "string") {
    patch.plainEnglishAnswer = body.plainEnglishAnswer as string | null;
  }
  if (body.sourceFilingType === "10-K" || body.sourceFilingType === "10-Q" || body.sourceFilingType === "DEF 14A") {
    patch.sourceFilingType = body.sourceFilingType;
  }
  if (typeof body.sourceSectionKey === "string") patch.sourceSectionKey = body.sourceSectionKey;
  if (typeof body.sourceSectionLabel === "string") patch.sourceSectionLabel = body.sourceSectionLabel;
  if (typeof body.aiPromptTemplate === "string") patch.aiPromptTemplate = body.aiPromptTemplate;
  if (typeof body.xpReward === "number") patch.xpReward = body.xpReward;
  if (typeof body.quizFormat === "string") patch.quizFormat = body.quizFormat;
  if (body.quizConfig !== undefined) patch.quizConfig = body.quizConfig as QuestContentCardUpdate["quizConfig"];
  if (typeof body.displayOrder === "number") patch.displayOrder = body.displayOrder;
  if (body.hubIcon === null || typeof body.hubIcon === "string") {
    patch.hubIcon = body.hubIcon as string | null;
  }
  if (body.hubSubtitle === null || typeof body.hubSubtitle === "string") {
    patch.hubSubtitle = body.hubSubtitle as string | null;
  }
  if (body.hubCardCount === null || typeof body.hubCardCount === "number") {
    patch.hubCardCount = body.hubCardCount as number | null;
  }
  if (body.hubRoute === null || typeof body.hubRoute === "string") {
    patch.hubRoute = body.hubRoute as string | null;
  }
  if (body.hubLocked === null || typeof body.hubLocked === "boolean") {
    patch.hubLocked = body.hubLocked as boolean | null;
  }
  if (body.forcesCategory === null || typeof body.forcesCategory === "string") {
    patch.forcesCategory = body.forcesCategory as string | null;
  }
  if (Array.isArray(body.partnerIds)) patch.partnerIds = body.partnerIds as string[];
  if (typeof body.isActive === "boolean") patch.isActive = body.isActive;

  const filingType = patch.sourceFilingType ?? existing.source_filing_type;
  const sectionKey = patch.sourceSectionKey ?? existing.source_section_key;
  if (
    !SEC_QUEST_SECTION_MAPPINGS.some(
      (m) => m.formType === filingType && m.sectionKey === sectionKey
    )
  ) {
    return NextResponse.json(
      { error: "Invalid source section for filing type." },
      { status: 400 }
    );
  }

  try {
    const card = await updateQuestContentCard(id, patch);
    return NextResponse.json({ card });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
