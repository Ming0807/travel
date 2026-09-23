import type { AttractionAnalyticsFilters } from "@/lib/validation/attraction-analytics";

export type AttractionImprovementContext = Partial<Pick<AttractionAnalyticsFilters, "evidenceScope" | "entryChannel" | "campaignId" | "checkinCodeId">> & {
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
  if (context.evidenceScope) params.set("draftEvidenceScope", context.evidenceScope);
  if (context.entryChannel) params.set("draftEntryChannel", context.entryChannel);
  if (context.campaignId) params.set("draftCampaignId", String(context.campaignId));
  if (context.checkinCodeId) params.set("draftCheckinCodeId", String(context.checkinCodeId));
  return `/admin/attractions/${context.attractionId}/improvements?${params.toString()}`;
}
