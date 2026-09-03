export type AttractionImprovementContext = {
  attractionId: number;
  dateStart: string;
  dateEnd: string;
};

export type AttractionDraftSource = "low_score" | "funnel_dropoff" | "trend_point";

export function buildAttractionImprovementHref(
  context: AttractionImprovementContext,
  draft: {
    source: AttractionDraftSource;
    dimension: string;
    metric: string;
    value: number;
    date?: string;
  },
) {
  const params = new URLSearchParams({
    dateStart: context.dateStart,
    dateEnd: context.dateEnd,
    dimension: draft.dimension,
    draftSource: draft.source,
    draftMetric: draft.metric,
    draftValue: String(draft.value),
  });
  if (draft.date) params.set("draftDate", draft.date);
  return `/admin/attractions/${context.attractionId}/improvements?${params.toString()}`;
}
