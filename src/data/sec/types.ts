/**
 * Data Layer — SEC mapping types.
 *
 * Static metadata that maps quest types and pillars to SEC filing sections.
 * The runtime SEC pipeline lives under `src/sec/` (stubs only for now).
 */

import type { PillarId } from "@/data/pillars";
import type { QuestType, SecSectionRef } from "@/data/quests/types";

export type SecForm = "10-K" | "10-Q" | "8-K" | "DEF 14A" | "S-1" | "13F";

/** Reverse mapping: which SEC sections a quest type usually pulls from. */
export type QuestTypeSecMap = Record<QuestType, SecSectionRef[]>;

/** Reverse mapping: pillar -> primary SEC forms. */
export type PillarSecMap = Record<PillarId, SecForm[]>;
