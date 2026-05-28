import { BEHAVIORAL_METRIC_CATALOG, METRIC_BY_ID } from "@/platform/gamification/behavioralDesign/analytics/metricCatalog";
import { BINDINGS_BY_FRAMEWORK } from "@/platform/gamification/behavioralDesign/analytics/metricBindings";
import {
  formatMetricValue,
  metricTrend
} from "@/platform/gamification/behavioralDesign/analytics/placeholderAnalytics";
import type {
  BehavioralAnalyticsSnapshot,
  FrameworkAnalyticsLayer,
  FrameworkAnalyticsQuestion
} from "@/platform/gamification/behavioralDesign/analytics/types";

const FRAMEWORK_LABELS: Record<FrameworkAnalyticsLayer["frameworkId"], string> = {
  octalysis: "Octalysis Analytics",
  hook: "Hook Model Analytics",
  sdt: "Self-Determination Analytics",
  fogg: "Fogg Behavior Analytics"
};

function metricMap(snapshot: BehavioralAnalyticsSnapshot) {
  return Object.fromEntries(snapshot.metrics.map((m) => [m.metricId, m]));
}

function previewInsight(
  metricId: string,
  value: number | null,
  previous: number | null | undefined
): string | undefined {
  if (value == null) return undefined;
  const trend = metricTrend(value, previous);
  const label = METRIC_BY_ID[metricId]?.label ?? metricId;
  const formatted = formatMetricValue(metricId, value);
  if (!trend || trend === "flat") return `${label}: ${formatted} (stable)`;
  return `${label}: ${formatted} (${trend === "up" ? "↑" : "↓"} vs prior window)`;
}

export function buildFrameworkAnalyticsLayers(
  snapshot: BehavioralAnalyticsSnapshot
): FrameworkAnalyticsLayer[] {
  const values = metricMap(snapshot);
  const hasLive = snapshot.metrics.some((m) => m.status === "live");
  const layerStatus = hasLive ? "live" : snapshot.source === "placeholder" ? "placeholder" : "unavailable";

  return (["octalysis", "hook", "sdt", "fogg"] as const).map((frameworkId) => {
    const bindings = BINDINGS_BY_FRAMEWORK[frameworkId] ?? [];
    const questionMap = new Map<string, FrameworkAnalyticsQuestion>();

    for (const b of bindings) {
      for (let i = 0; i < b.analyticsQuestions.length; i++) {
        const q = b.analyticsQuestions[i]!;
        const id = `${frameworkId}-${b.dimensionId}-q${i}`;
        if (!questionMap.has(id)) {
          const firstMetric = b.metricIds[0];
          const mv = firstMetric ? values[firstMetric] : undefined;
          questionMap.set(id, {
            id,
            question: q,
            metricIds: b.metricIds,
            insightPreview: firstMetric
              ? previewInsight(firstMetric, mv?.value ?? null, mv?.previousValue)
              : undefined
          });
        }
      }
    }

    const metricIds = new Set<string>();
    for (const b of bindings) {
      for (const id of b.metricIds) metricIds.add(id);
    }

    const metricHighlights = [...metricIds].slice(0, 4).map((metricId) => {
      const mv = values[metricId];
      const def = METRIC_BY_ID[metricId];
      return {
        metricId,
        label: def?.label ?? metricId,
        value: formatMetricValue(metricId, mv?.value ?? null),
        trend: metricTrend(mv?.value ?? null, mv?.previousValue)
      };
    });

    const populated = [...metricIds].filter((id) => values[id]?.value != null).length;
    const analyticsHealthPercent =
      metricIds.size > 0 ? Math.round((populated / metricIds.size) * 100) : null;

    return {
      frameworkId,
      label: FRAMEWORK_LABELS[frameworkId],
      status: layerStatus,
      questions: [...questionMap.values()],
      analyticsHealthPercent,
      metricHighlights
    };
  });
}

/** Readiness summary for Mission Control reporting UI */
export function analyticsReadinessSummary(snapshot: BehavioralAnalyticsSnapshot) {
  const total = BEHAVIORAL_METRIC_CATALOG.length;
  const wired = BEHAVIORAL_METRIC_CATALOG.filter((m) => m.analyticsEvent).length;
  const withValues = snapshot.metrics.filter((m) => m.value != null).length;
  return {
    catalogSize: total,
    eventLinked: wired,
    populatedInSnapshot: withValues,
    source: snapshot.source
  };
}
