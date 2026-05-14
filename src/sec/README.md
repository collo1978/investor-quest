# SEC Content Layer

Future home for SEC EDGAR-driven quest generation. Today this layer is
**all stubs** — the rest of the app is architected so concrete
implementations can drop in without changes to the data, engine, or UI
layers.

## Pipeline

```
SEC Filing → Parser → AI Summarizer → Quest Generator → QuestDefinition
   (fetcher)  (parser)  (summarizer)    (generator)        (data layer)
```

Each step is an interface in this folder:

- `fetcher.ts` — list filings & retrieve section text for a given company / form.
- `parser.ts` — split a raw filing into addressable sections (`item-1`, `item-1a`, `item-7`, ...).
- `ai-summarizer.ts` — turn a section into a structured `SecAiSummary`.
- `quest-generator.ts` — combine a `QuestTemplate` (`@/data/quests/templates`) with one or more summaries to produce a fully resolved `QuestDefinition`.

The default `secPipeline` exported from `@/sec` composes the four stubs.
Swap members for real implementations when ingestion is wired up.

## Integration points

- `@/data/sec/mappings.ts` — static reverse lookup: which SEC sections each `QuestType` and `PillarId` typically pull from.
- `QuestTemplate.secSection` — every authored template can already declare its preferred filing + section. The generator uses this hint when picking input.
- `QuestTemplate.aiTask` — the prompt template the AI summarizer / generator will feed an LLM. Use `{Company.name}` / `{Company.ticker}` tokens; they are substituted by the data layer.

## Persistence boundary

Generated quests are not persisted yet. When SEC ingestion is added, the
suggested storage is a content-addressed cache (e.g. `accessionNumber` +
`sectionId` keyed) so identical filings are processed once across users.

## Hard rule

This layer must remain pure / serverable. No React, no DOM. UI consumes
its outputs through the engine + data layers exclusively.
