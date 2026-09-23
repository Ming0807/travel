import { previousEqualLengthPeriod } from "@/lib/dashboard/attraction-feedback-period";
import { feedbackScopeSchema } from "@/lib/validation/attraction-feedback";

type Query = Record<string, string | string[] | undefined>;
type Defaults = { dateStart: string; dateEnd: string; comparisonStart: string; comparisonEnd: string };

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function optionalId(value: string | undefined) {
  return value === undefined || value === "" ? undefined : Number(value);
}

export function parseAttractionImprovementScope(query: Query, attractionId: number, defaults: Defaults) {
  const fromDraft = Boolean(one(query.draftSource));
  const selected = (key: string, draftKey: string) => one(fromDraft ? query[draftKey] : query[key]);
  const dateStart = one(query.dateStart) ?? defaults.dateStart;
  const dateEnd = one(query.dateEnd) ?? defaults.dateEnd;
  const comparisonDefaults = previousEqualLengthPeriod(dateStart, dateEnd) ?? defaults;

  return feedbackScopeSchema.safeParse({
    attractionId,
    dateStart,
    dateEnd,
    comparisonStart: one(query.comparisonStart) ?? comparisonDefaults.comparisonStart,
    comparisonEnd: one(query.comparisonEnd) ?? comparisonDefaults.comparisonEnd,
    evidenceScope: selected("evidenceScope", "draftEvidenceScope") ?? "all_records",
    entryChannel: selected("entryChannel", "draftEntryChannel") || undefined,
    campaignId: optionalId(selected("campaignId", "draftCampaignId")),
    checkinCodeId: optionalId(selected("checkinCodeId", "draftCheckinCodeId")),
  });
}
