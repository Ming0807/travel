import "server-only";
import { entryMatchesDashboardEvidenceScope, visitMatchesDashboardEvidenceScope } from "@/lib/dashboard/evidence-scope";

import { requirePermission } from "@/lib/auth/guards";
import * as feedbackRepository from "@/lib/repositories/attraction-feedback.repository";
import * as repository from "@/lib/repositories/attraction-analytics.repository";
import { asRecord, nullableNumber, nullableString, stringValue } from "@/lib/utils/record";
import { attractionAnalyticsFiltersSchema, type AttractionAnalyticsFilters } from "@/lib/validation/attraction-analytics";

export const ATTRACTION_SMALL_CELL_THRESHOLD = 10;

export async function getAttractionAnalyticsOptions() {
  await requirePermission("dashboard.read");
  return repository.listAttractionAnalyticsOptions();
}

type Row = Record<string, unknown>;
type Distribution = { label: string; count: number | null; sampleSize: number; denominator: number; percent: number | null; suppressed: boolean };

function relation(row: Row, key: string): Row | null {
  const value = row[key];
  if (Array.isArray(value)) return value.length > 0 ? asRecord(value[0]) : null;
  return value && typeof value === "object" ? asRecord(value) : null;
}

function relations(row: Row, key: string): Row[] {
  const value = row[key];
  if (Array.isArray(value)) return value.map(asRecord);
  return value && typeof value === "object" ? [asRecord(value)] : [];
}

function round(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function average(values: number[]) {
  return values.length > 0 ? round(values.reduce((sum, value) => sum + value, 0) / values.length, 2) : null;
}

export function buildAttractionDistribution(rows: Row[], label: (row: Row) => string | null): Distribution[] {
  const counts = new Map<string, number>();
  rows.forEach((row) => {
    const value = label(row)?.trim();
    if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  });
  const denominator = [...counts.values()].reduce((sum, count) => sum + count, 0);
  const visible: Distribution[] = [];
  let suppressedSample = 0;
  counts.forEach((count, category) => {
    if (count < ATTRACTION_SMALL_CELL_THRESHOLD) {
      suppressedSample += count;
      return;
    }
    visible.push({ label: category, count, sampleSize: count, denominator, percent: denominator > 0 ? round((count / denominator) * 100) : null, suppressed: false });
  });
  visible.sort((left, right) => (right.count ?? 0) - (left.count ?? 0) || left.label.localeCompare(right.label, "th"));
  if (suppressedSample > 0) visible.push({ label: "กลุ่มขนาดเล็ก (ปกปิด)", count: null, sampleSize: suppressedSample, denominator, percent: null, suppressed: true });
  return visible;
}

function researchSessions(row: Row) {
  return relations(row, "research_sessions").filter((session) =>
    session.inclusion_status !== "excluded" && !["withdrawn", "excluded", "expired"].includes(stringValue(session.status)),
  );
}

export const visitMatchesEvidenceScope = visitMatchesDashboardEvidenceScope;
const entryMatchesEvidenceScope = entryMatchesDashboardEvidenceScope;

function percent(numerator: number, denominator: number) {
  return denominator > 0 ? round((numerator / denominator) * 100) : null;
}

export function buildAttractionChannelAnalytics(
  entryRows: Row[],
  visits: Row[],
  scope: AttractionAnalyticsFilters["evidenceScope"],
  trackingEnabled: boolean,
  generatedAt = new Date().toISOString(),
) {
  const uniqueEntries = [...new Map(entryRows.filter((row) => nullableString(row.entry_session_id)
    && ["qr", "nfc"].includes(stringValue(row.entry_channel))).map((row) => [stringValue(row.entry_session_id), row])).values()];
  const asOfTime = Date.parse(generatedAt);
  const recordedBeforeAsOf = (value: unknown) => typeof value === "string"
    && Number.isFinite(Date.parse(value)) && Date.parse(value) <= asOfTime;
  const eligible = uniqueEntries.filter((row) => entryMatchesEvidenceScope(row, scope)
    && recordedBeforeAsOf(row.created_at));
  const hasSmallChannel = ["qr", "nfc"].some((channel) => {
    const count = eligible.filter((row) => row.entry_channel === channel).length;
    return count > 0 && count < ATTRACTION_SMALL_CELL_THRESHOLD;
  });
  const unclassifiedEntries = entryRows.filter((row) => row.evidence_scope === "unknown").length;
  const channels = (["qr", "nfc"] as const).map((channel) => {
    const rows = eligible.filter((row) => row.entry_channel === channel);
    const entries = rows.length;
    const lowSample = hasSmallChannel;
    const linked = rows.filter((row) => {
      const visitId = nullableString(row.visit_id);
      return visitId !== null && recordedBeforeAsOf(relation(row, "visits")?.created_at);
    });
    const certificates = linked.filter((row) => relations(relation(row, "visits") ?? {}, "certificates")
      .some((certificate) => recordedBeforeAsOf(certificate.generated_at))).length;
    const surveys = linked.filter((row) => relations(relation(row, "visits") ?? {}, "satisfaction_surveys")
      .some((survey) => recordedBeforeAsOf(survey.submitted_at))).length;
    const privateOutcome = (count: number) => lowSample || (count > 0 && count < ATTRACTION_SMALL_CELL_THRESHOLD)
      || (entries - count > 0 && entries - count < ATTRACTION_SMALL_CELL_THRESHOLD);
    return {
      channel,
      entries: lowSample ? null : entries,
      share: lowSample ? null : percent(entries, eligible.length),
      linkedVisits: privateOutcome(linked.length) ? null : linked.length,
      visitConversion: privateOutcome(linked.length) ? null : percent(linked.length, entries),
      certificates: privateOutcome(certificates) ? null : certificates,
      certificateConversion: privateOutcome(certificates) ? null : percent(certificates, entries),
      surveys: privateOutcome(surveys) ? null : surveys,
      surveyConversion: privateOutcome(surveys) ? null : percent(surveys, entries),
      suppressed: lowSample,
    };
  });
  const dailyMap = new Map<string, { date: string; qr: number; nfc: number }>();
  eligible.forEach((row) => {
    const channel = row.entry_channel;
    if (channel !== "qr" && channel !== "nfc") return;
    const createdAt = nullableString(row.created_at);
    if (!createdAt) return;
    const date = new Date(createdAt).toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });
    const current = dailyMap.get(date) ?? { date, qr: 0, nfc: 0 };
    current[channel] += 1;
    dailyMap.set(date, current);
  });
  const dailySuppressed = hasSmallChannel || [...dailyMap.values()].some((day) =>
    [day.qr, day.nfc].some((count) => count > 0 && count < ATTRACTION_SMALL_CELL_THRESHOLD));
  const linkedEligibleVisitIds = new Set(visits.filter((visit) => relations(visit, "checkin_entry_sessions")
    .some((entry) => entryMatchesEvidenceScope(entry, scope) && recordedBeforeAsOf(entry.created_at)))
    .map((visit) => stringValue(visit.visit_id)));
  const coverageSmallCell = [linkedEligibleVisitIds.size, visits.length - linkedEligibleVisitIds.size]
    .some((count) => count > 0 && count < ATTRACTION_SMALL_CELL_THRESHOLD);
  const coverageSuppressed = coverageSmallCell || !trackingEnabled;
  const status = !trackingEnabled
    ? "tracking_not_activated" as const
    : entryRows.length === 0
      ? "no_entries" as const
      : eligible.length === 0 && unclassifiedEntries > 0
        ? "unclassified_only" as const
        : eligible.length === 0
          ? "no_entries_in_scope" as const
          : "ready" as const;

  return {
    status,
    asOf: generatedAt,
    entries: hasSmallChannel ? null : eligible.length,
    unclassifiedEntries,
    channels,
    daily: [...dailyMap.values()].sort((left, right) => left.date.localeCompare(right.date)).map((row) => ({
      date: row.date,
      qr: dailySuppressed ? null : row.qr,
      nfc: dailySuppressed ? null : row.nfc,
    })),
    attributionCoverage: coverageSuppressed ? null : percent(linkedEligibleVisitIds.size, visits.length),
    attributionLinkedVisits: coverageSuppressed ? null : linkedEligibleVisitIds.size,
    attributionVisitBase: visits.length,
    coverageSuppressed,
    note: "นับรอบเริ่มเข้าใช้งานตามวันเริ่ม และติดตามผลถึงเวลาที่ระบุ ไม่ใช่จำนวนคนหรือหลักฐานการแตะทางกายภาพ; ความครอบคลุมนับจาก Visit ในช่วงวันที่เลือก รวมรอบเข้าที่เริ่มก่อนช่วงนั้น",
  };
}

function hasChild(row: Row, key: string) {
  return relations(row, key).length > 0;
}

function hasSubmittedResearch(row: Row) {
  return researchSessions(row).some((session) => relations(session, "research_responses").some((response) => response.status === "submitted"));
}

export function buildAttractionFunnel(visits: Row[], events: Row[]) {
  const includedVisitIds = new Set(visits.map((row) => stringValue(row.visit_id)));
  const linkedEntryVisitIds = new Set<string>();
  events.forEach((event) => {
    if (!["qr_scanned", "landing_viewed"].includes(stringValue(event.event_type))) return;
    const visitId = nullableString(event.visit_id);
    if (!visitId || !includedVisitIds.has(visitId)) return;
    linkedEntryVisitIds.add(visitId);
  });
  const entryCoverageComplete = visits.length > 0 && linkedEntryVisitIds.size === visits.length;
  const photoVisits = visits.filter((row) => hasChild(row, "visit_photos"));
  const certificateVisits = photoVisits.filter((row) => hasChild(row, "certificates"));
  const stampedVisits = certificateVisits.filter((row) => relations(row, "tourist_stamps").some((stamp) => stamp.status === "earned"));
  const surveyedVisits = stampedVisits.filter((row) => hasChild(row, "satisfaction_surveys"));
  const evaluatedVisits = surveyedVisits.filter(hasSubmittedResearch);
  const stages = [
    { key: "entry", label: "เปิดจุดเช็กอิน", count: linkedEntryVisitIds.size, available: entryCoverageComplete, note: entryCoverageComplete ? "Entry event เชื่อมกับ Visit ได้ครบ" : `เชื่อม Entry event ได้ ${linkedEntryVisitIds.size} จาก ${visits.length} Visits จึงไม่คำนวณ Conversion ขั้นนี้` },
    { key: "visit", label: "กรอกข้อมูลพื้นฐาน", count: visits.length, available: true },
    { key: "photo", label: "อัปโหลดรูป", count: photoVisits.length, available: true },
    { key: "certificate", label: "สร้างใบประกาศ", count: certificateVisits.length, available: true },
    { key: "stamp", label: "ได้รับตราประทับ", count: stampedVisits.length, available: true },
    { key: "survey", label: "ตอบแบบสำรวจท่องเที่ยว", count: surveyedVisits.length, available: true },
    { key: "research", label: "ส่งแบบประเมินงานวิจัย", count: evaluatedVisits.length, available: true },
  ];
  return stages.map((stage, index) => {
    const previous = index > 0 ? stages[index - 1] : null;
    const denominator = previous?.available ? previous.count : null;
    return {
      ...stage,
      conversionFromPrevious: denominator && denominator > 0 ? round((stage.count / denominator) * 100) : null,
      dropOffFromPrevious: denominator && denominator > 0 ? round(((denominator - stage.count) / denominator) * 100) : null,
    };
  });
}

function scoreMetric(visits: Row[], key: string, label: string) {
  const values = visits.flatMap((visit) => relations(visit, "satisfaction_surveys")).map((survey) => nullableNumber(survey[key])).filter((value): value is number => value !== null);
  const suppressed = values.length > 0 && values.length < ATTRACTION_SMALL_CELL_THRESHOLD;
  return { key, label, sampleSize: values.length, value: suppressed ? null : average(values), suppressed };
}

type PeerComparisonScope = Pick<
  AttractionAnalyticsFilters,
  "attractionId" | "dateFrom" | "dateTo" | "evidenceScope"
> & {
  provinceId: number;
  attractionTypeId: number;
};

function privacySafeScore(visits: Row[], key: string) {
  const values = visits
    .flatMap((visit) => relations(visit, "satisfaction_surveys"))
    .map((survey) => nullableNumber(survey[key]))
    .filter((value): value is number => value !== null);
  const suppressed = values.length > 0 && values.length < ATTRACTION_SMALL_CELL_THRESHOLD;
  return { value: suppressed ? null : average(values), sampleSize: values.length, suppressed };
}

function privacySafeYesRate(visits: Row[], key: string) {
  const answers = visits
    .flatMap((visit) => relations(visit, "satisfaction_surveys"))
    .map((survey) => nullableString(survey[key]))
    .filter((answer): answer is string => answer !== null);
  const suppressed = answers.length > 0 && answers.length < ATTRACTION_SMALL_CELL_THRESHOLD;
  return {
    value: suppressed || answers.length === 0
      ? null
      : round((answers.filter((answer) => answer === "yes").length / answers.length) * 100),
    sampleSize: answers.length,
    suppressed,
  };
}

function privacySafeTopExpense(visits: Row[], relationKey: "expense_categories" | "spending_ranges", labelKey: string) {
  const labels = visits
    .flatMap((visit) => relations(visit, "visit_expenses"))
    .map((expense) => nullableString(relation(expense, relationKey)?.[labelKey]));
  const answered = labels.filter((label): label is string => label !== null);
  const counts = new Map<string, number>();
  answered.forEach((label) => counts.set(label, (counts.get(label) ?? 0) + 1));
  const top = [...counts.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], "th"))[0];
  const suppressed = answered.length > 0 && (!top || top[1] < ATTRACTION_SMALL_CELL_THRESHOLD);
  return { label: suppressed ? null : top?.[0] ?? null, sampleSize: answered.length, suppressed };
}

function visitCompletionRate(visits: Row[], predicate: (visit: Row) => boolean) {
  return visits.length > 0 ? round((visits.filter(predicate).length / visits.length) * 100) : null;
}

export function isOpenFeedbackIssue(status: string) {
  return status === "open";
}

export function buildAttractionPeerComparison(rows: Row[], scope: PeerComparisonScope) {
  const eligibleRows = rows.filter((row) => {
    if (!visitMatchesEvidenceScope(row, scope.evidenceScope)) return false;
    const attraction = relation(row, "attractions");
    return attraction?.is_active !== false
      && Number(attraction?.province_id) === scope.provinceId
      && Number(attraction?.attraction_type_id) === scope.attractionTypeId;
  });
  const grouped = new Map<number, Row[]>();
  eligibleRows.forEach((row) => {
    const attractionId = Number(row.attraction_id);
    if (!Number.isFinite(attractionId)) return;
    grouped.set(attractionId, [...(grouped.get(attractionId) ?? []), row]);
  });

  function summarize(attractionId: number, visits: Row[]) {
    const attraction = relation(visits[0] ?? {}, "attractions");
    const surveyedVisits = visits.filter((visit) => hasChild(visit, "satisfaction_surveys"));
    return {
      attractionId,
      nameTh: nullableString(attraction?.name_th) ?? `สถานที่ ${attractionId}`,
      visits: visits.length,
      surveyResponses: surveyedVisits.length,
      surveyCoverage: visits.length > 0 ? round((surveyedVisits.length / visits.length) * 100) : null,
      overallSatisfaction: privacySafeScore(visits, "overall_score"),
      satisfaction: [
        { key: "safety_score", label: "ความปลอดภัย", ...privacySafeScore(visits, "safety_score") },
        { key: "cleanliness_score", label: "ความสะอาด", ...privacySafeScore(visits, "cleanliness_score") },
        { key: "accessibility_score", label: "การเข้าถึง", ...privacySafeScore(visits, "accessibility_score") },
        { key: "information_score", label: "ข้อมูลและป้าย", ...privacySafeScore(visits, "information_score") },
        { key: "value_score", label: "ความคุ้มค่า", ...privacySafeScore(visits, "value_score") },
      ],
      revisitRate: privacySafeYesRate(visits, "revisit_intention"),
      recommendRate: privacySafeYesRate(visits, "recommend_intention"),
      photoCompletion: visitCompletionRate(visits, (visit) => hasChild(visit, "visit_photos")),
      certificateCompletion: visitCompletionRate(visits, (visit) => hasChild(visit, "certificates")),
      stampCompletion: visitCompletionRate(visits, (visit) => relations(visit, "tourist_stamps").some((stamp) => stamp.status === "earned")),
      surveyCompletion: visitCompletionRate(visits, (visit) => hasChild(visit, "satisfaction_surveys")),
      researchCompletion: visitCompletionRate(visits, hasSubmittedResearch),
      topExpenseRange: privacySafeTopExpense(visits, "spending_ranges", "range_label_th"),
      topExpenseCategory: privacySafeTopExpense(visits, "expense_categories", "name_th"),
    };
  }

  const selectedRows = grouped.get(scope.attractionId) ?? [];
  const eligiblePeers = [...grouped.entries()]
    .filter(([attractionId, visits]) => attractionId !== scope.attractionId && visits.length >= ATTRACTION_SMALL_CELL_THRESHOLD)
    .map(([attractionId, visits]) => summarize(attractionId, visits))
    .sort((left, right) => right.visits - left.visits || left.nameTh.localeCompare(right.nameTh, "th"));
  const rankPopulation = [
    ...(selectedRows.length > 0 ? [{ attractionId: scope.attractionId, visits: selectedRows.length }] : []),
    ...eligiblePeers.map((peer) => ({ attractionId: peer.attractionId, visits: peer.visits })),
  ].sort((left, right) => right.visits - left.visits || left.attractionId - right.attractionId);
  const selectedRank = rankPopulation.findIndex((row) => row.attractionId === scope.attractionId);

  return {
    status: eligiblePeers.length >= 2 ? "ready" as const : "insufficient_peers" as const,
    unavailableReason: null,
    eligibilityNote: `จังหวัดเดียวกัน ประเภทหลักเดียวกัน ช่วง ${scope.dateFrom} ถึง ${scope.dateTo} และมีอย่างน้อย ${ATTRACTION_SMALL_CELL_THRESHOLD} Visits`,
    dateFrom: scope.dateFrom,
    dateTo: scope.dateTo,
    dateAligned: true,
    eligiblePeerCount: eligiblePeers.length,
    rankDenominator: rankPopulation.length,
    selectedRank: selectedRank >= 0 ? selectedRank + 1 : null,
    selected: selectedRows.length > 0 ? summarize(scope.attractionId, selectedRows) : null,
    peers: eligiblePeers.slice(0, 3),
  };
}

export async function getAttractionAnalytics(input: AttractionAnalyticsFilters) {
  const guard = await requirePermission("dashboard.read");
  const parsed = attractionAnalyticsFiltersSchema.safeParse(input);
  if (!parsed.success) throw new Error("ATTRACTION_ANALYTICS_FILTERS_INVALID");
  const rows = await repository.getAttractionAnalyticsRows(parsed.data);
  if (!rows) return null;
  const visits = rows.visits.filter((row) => visitMatchesEvidenceScope(row, parsed.data.evidenceScope));
  const uniqueTourists = new Map<string, Row>();
  visits.forEach((visit) => {
    const touristId = stringValue(visit.tourist_id);
    if (!uniqueTourists.has(touristId)) uniqueTourists.set(touristId, visit);
  });
  const tourists = [...uniqueTourists.values()];
  const surveys = visits.flatMap((visit) => relations(visit, "satisfaction_surveys"));
  const expenses = visits.flatMap((visit) => relations(visit, "visit_expenses"));
  const certificateVisits = visits.filter((visit) => hasChild(visit, "certificates")).length;
  const stampVisits = visits.filter((visit) => relations(visit, "tourist_stamps").some((stamp) => stamp.status === "earned")).length;
  const repeatVisits = Math.max(0, visits.length - uniqueTourists.size);
  const trendMap = new Map<string, number>();
  visits.forEach((visit) => trendMap.set(stringValue(visit.visit_date), (trendMap.get(stringValue(visit.visit_date)) ?? 0) + 1));
  const satisfaction = [
    scoreMetric(visits, "overall_score", "ภาพรวม"),
    scoreMetric(visits, "safety_score", "ความปลอดภัย"),
    scoreMetric(visits, "cleanliness_score", "ความสะอาด"),
    scoreMetric(visits, "facility_score", "สิ่งอำนวยความสะดวก"),
    scoreMetric(visits, "accessibility_score", "การเข้าถึง"),
    scoreMetric(visits, "information_score", "ข้อมูลและป้าย"),
    scoreMetric(visits, "value_score", "ความคุ้มค่า"),
  ];
  const overall = satisfaction[0];
  const surveyRate = visits.length > 0 ? round((surveys.length / visits.length) * 100) : null;
  const profileCoverage = tourists.length > 0 ? round((tourists.filter((visit) => {
    const tourist = relation(visit, "tourists");
    return tourist?.age_group && (relation(tourist, "countries") || relation(tourist, "provinces"));
  }).length / tourists.length) * 100) : null;
  const [issues, issueActions] = await Promise.all([
    feedbackRepository.listIssuesForAttraction(parsed.data.attractionId),
    Promise.resolve([]),
  ]);
  const actions = issues.length > 0 ? await feedbackRepository.listActionsForIssues(issues.map((issue) => issue.feedbackIssueId)) : issueActions;
  const funnel = buildAttractionFunnel(visits, rows.funnelEvents);
  const generatedAt = new Date().toISOString();
  const channels = buildAttractionChannelAnalytics(
    rows.entrySessions,
    visits,
    parsed.data.evidenceScope,
    rows.channelTrackingEnabled,
    rows.channelAsOf ?? generatedAt,
  );
  const comparisonBlockedReason = parsed.data.campaignId || parsed.data.checkinCodeId || parsed.data.entryChannel
    ? "ตัวกรอง Campaign จุดเช็กอิน หรือช่องทางเข้าไม่สามารถใช้กับ peer ทุกแห่งอย่างเท่าเทียม"
    : rows.truncated
      ? "ข้อมูลอย่างน้อยหนึ่งชุดเกินขีดจำกัดการอ่านสด"
      : rows.attraction.attractionTypeId === null
        ? "สถานที่นี้ยังไม่มีประเภทหลักสำหรับกำหนดกลุ่มเทียบ"
        : null;
  const peerComparison = comparisonBlockedReason || rows.attraction.attractionTypeId === null
    ? {
        status: "unavailable" as const,
        unavailableReason: comparisonBlockedReason,
        eligibilityNote: "เปรียบเทียบเฉพาะสถานที่เปิดใช้งานในจังหวัดและประเภทหลักเดียวกัน",
        dateFrom: parsed.data.dateFrom,
        dateTo: parsed.data.dateTo,
        dateAligned: true,
        eligiblePeerCount: 0,
        rankDenominator: 0,
        selectedRank: null,
        selected: null,
        peers: [],
      }
    : buildAttractionPeerComparison(rows.peerVisits, {
        attractionId: parsed.data.attractionId,
        provinceId: rows.attraction.provinceId,
        attractionTypeId: rows.attraction.attractionTypeId,
        dateFrom: parsed.data.dateFrom,
        dateTo: parsed.data.dateTo,
        evidenceScope: parsed.data.evidenceScope,
      });
  const biggestDrop = funnel.filter((stage) => stage.dropOffFromPrevious !== null).sort((left, right) => (right.dropOffFromPrevious ?? 0) - (left.dropOffFromPrevious ?? 0))[0] ?? null;
  const scopedInsights = [
    surveys.length < ATTRACTION_SMALL_CELL_THRESHOLD
      ? { tone: "data_quality" as const, title: "ฐานคำตอบยังน้อย", evidence: `${surveys.length} แบบสำรวจจาก ${visits.length} Visits`, action: "เพิ่มการเชิญตอบแบบสำรวจหลังผู้ใช้ได้รับรางวัล โดยไม่บังคับ" }
      : overall.value !== null && overall.value < 3.5
        ? { tone: "improvement" as const, title: "ควรทบทวนประสบการณ์สถานที่", evidence: `คะแนนภาพรวม ${overall.value.toFixed(2)} / 5 จาก n=${overall.sampleSize}`, action: "เปิดประเด็นที่ผ่านการทบทวนใน Improvement workflow และกำหนดผู้รับผิดชอบ" }
        : { tone: "monitor" as const, title: "ติดตามแนวโน้มต่อเนื่อง", evidence: `คะแนนภาพรวม ${overall.value === null ? "ยังไม่พร้อมสรุป" : `${overall.value.toFixed(2)} / 5`}`, action: "เทียบช่วงเวลาก่อนและหลังเมื่อฐานข้อมูลเพียงพอ" },
    biggestDrop ? { tone: "funnel" as const, title: `จุดหลุดสูงสุด: ${biggestDrop.label}`, evidence: `Drop-off ${biggestDrop.dropOffFromPrevious}% จากขั้นก่อนหน้า`, action: "ตรวจ flow บนอุปกรณ์จริงและข้อความช่วยเหลือในขั้นนี้" } : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);
  const insights = rows.truncated
    ? [{ tone: "data_quality" as const, title: "ข้อมูลเกินขีดจำกัดการอ่านสด", evidence: `อ่านได้สูงสุด ${repository.ATTRACTION_ANALYTICS_VISIT_LIMIT.toLocaleString("th-TH")} Visits หรือ ${repository.ATTRACTION_ANALYTICS_FUNNEL_LIMIT.toLocaleString("th-TH")} Funnel events ต่อคำขอ`, action: "ลดช่วงวันที่หรือใช้ summary/read model ก่อนนำตัวเลขไปตัดสินใจ" }]
    : scopedInsights;

  return {
    attraction: rows.attraction,
    filters: parsed.data,
    generatedAt,
    referenceOptions: { attractions: rows.attractions, checkinCodes: rows.checkinCodes },
    kpis: {
      uniqueTourists: uniqueTourists.size,
      visits: visits.length,
      repeatVisits,
      certificateVisits,
      stampVisits,
      surveyResponses: surveys.length,
      surveyRate,
      researchEvaluations: visits.filter(hasSubmittedResearch).length,
    },
    trend: [...trendMap.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([label, value]) => ({ label, value })),
    funnel,
    channels,
    audience: {
      originProvinces: buildAttractionDistribution(tourists, (visit) => nullableString(relation(relation(visit, "tourists") ?? {}, "provinces")?.province_name_th)),
      originCountries: buildAttractionDistribution(tourists, (visit) => nullableString(relation(relation(visit, "tourists") ?? {}, "countries")?.country_name_th)),
      ageGroups: buildAttractionDistribution(tourists, (visit) => nullableString(relation(visit, "tourists")?.age_group)),
      languages: buildAttractionDistribution(tourists, (visit) => nullableString(relation(visit, "tourists")?.preferred_language)),
      companions: buildAttractionDistribution(visits, (visit) => nullableString(relation(visit, "travel_companions")?.name_th)),
      transports: buildAttractionDistribution(visits, (visit) => nullableString(relation(visit, "transport_modes")?.name_th)),
      overnight: buildAttractionDistribution(visits, (visit) => nullableString(visit.overnight_status)),
      purposes: buildAttractionDistribution(visits, (visit) => nullableString(relation(visit, "travel_purposes")?.name_th)),
    },
    expenses: {
      ranges: buildAttractionDistribution(expenses, (expense) => nullableString(relation(expense, "spending_ranges")?.range_label_th)),
      categories: buildAttractionDistribution(expenses, (expense) => nullableString(relation(expense, "expense_categories")?.name_th)),
      responseCount: expenses.length,
      note: "ช่วงและหมวดค่าใช้จ่ายเป็นข้อมูลที่ผู้ตอบรายงานเอง ไม่ใช่รายได้ของธุรกิจหรือผลกระทบทางเศรษฐกิจอย่างเป็นทางการ",
    },
    satisfaction,
    intentions: {
      revisit: buildAttractionDistribution(surveys, (survey) => nullableString(survey.revisit_intention)),
      recommend: buildAttractionDistribution(surveys, (survey) => nullableString(survey.recommend_intention)),
      commentCount: surveys.filter((survey) => nullableString(survey.comments)).length,
    },
    quality: {
      truncated: rows.truncated,
      profileCoverage,
      surveyCoverage: surveyRate,
      expenseCoverage: visits.length > 0 ? round((new Set(expenses.map((expense) => stringValue(expense.visit_id))).size / visits.length) * 100) : null,
      smallCellThreshold: ATTRACTION_SMALL_CELL_THRESHOLD,
      scopeNote: parsed.data.evidenceScope === "field_claim"
        ? "รวม Operational visits และ final field_observation; ตัด pilot_internal, simulated_usability และ Pilot study ออกจากข้อสรุปหลัก"
        : "ขอบเขตนี้เปิดเพื่อการตรวจสอบภายใน ห้ามใช้แทนข้อสรุปภาคสนามโดยไม่ระบุ collection mode",
    },
    peerComparison,
    improvements: {
      issueCount: issues.length,
      openIssueCount: issues.filter((issue) => isOpenFeedbackIssue(issue.status)).length,
      actionCount: actions.length,
      overdueActionCount: actions.filter((action) => !["completed", "verified", "cancelled"].includes(action.status) && action.dueDate < new Date().toISOString().slice(0, 10)).length,
      recentIssues: issues.slice(0, 5).map((issue) => ({ id: issue.feedbackIssueId, dimension: issue.issueDimension, category: issue.issueCategory, status: issue.status, responseCount: issue.responseCount, currentScore: issue.currentScore })),
      recentActions: actions.slice(0, 5).map((action) => ({ id: action.improvementActionId, title: action.title, status: action.status, dueDate: action.dueDate, priority: action.priority })),
    },
    insights,
    metricContract: [
      { key: "visits", label: "รายการเข้าชม", unit: "Visit records", denominator: "ไม่มี", dateField: "visits.visit_date", source: "visits", missingRule: "ไม่นับแถวที่ไม่อยู่ใน scope", decisionUse: "ดูปริมาณกิจกรรมที่ระบบบันทึก" },
      { key: "unique_tourists", label: "โปรไฟล์นักท่องเที่ยวไม่ซ้ำ", unit: "tourist profile", denominator: "ไม่มี", dateField: "visits.visit_date", source: "visits.tourist_id", missingRule: "ไม่ตีความเป็นบุคคลจริงแบบยืนยันตัวตน", decisionUse: "ประมาณฐานผู้ใช้งานไม่ซ้ำในระบบ" },
      { key: "survey_rate", label: "อัตราตอบแบบสำรวจ", unit: "%", denominator: "Visits ใน scope", dateField: "visits.visit_date", source: "satisfaction_surveys / visits", missingRule: "เป็น null เมื่อไม่มี Visit", decisionUse: "ประเมิน coverage ของเสียงตอบรับ" },
      { key: "satisfaction", label: "คะแนนความพึงพอใจ", unit: "1-5", denominator: "คำตอบที่ไม่เป็น null ของแต่ละมิติ", dateField: "visits.visit_date", source: "satisfaction_surveys", missingRule: `ปกปิดค่าเมื่อ n < ${ATTRACTION_SMALL_CELL_THRESHOLD}`, decisionUse: "ระบุมิติที่ควรตรวจสอบและปรับปรุง" },
      { key: "expense", label: "ช่วงค่าใช้จ่ายที่รายงานเอง", unit: "category/range", denominator: "คำตอบค่าใช้จ่าย", dateField: "visits.visit_date", source: "visit_expenses", missingRule: "ไม่นำช่องว่างมาคำนวณ", decisionUse: "ดูรูปแบบการใช้จ่ายโดยไม่อ้างเป็นรายได้" },
      { key: "entry_sessions", label: "ช่องทางเริ่มเข้าใช้งาน", unit: "entry session", denominator: "Entry sessions ใน cohort และ scope เดียวกัน", dateField: "checkin_entry_sessions.created_at", source: "checkin_entry_sessions", missingRule: "unknown scope ไม่รวมใน field claim และฐานต่ำกว่าเกณฑ์ไม่แสดง conversion", decisionUse: "เปรียบเทียบการเริ่ม flow และผลลัพธ์ QR/NFC โดยไม่อ้างเหตุและผล" },
    ],
    viewer: { displayName: guard.actor.displayName, permissions: guard.actor.permissions },
    interpretation: "ข้อมูลเป็นสถิติเชิงพรรณนาจากระบบและความสัมพันธ์ที่สังเกตได้ ไม่ยืนยันเหตุและผล และไม่ควรอ้างเป็นตัวแทนนักท่องเที่ยวทั้งจังหวัดโดยไม่มีการออกแบบกลุ่มตัวอย่างรองรับ",
  };
}

export type AttractionAnalyticsViewModel = NonNullable<Awaited<ReturnType<typeof getAttractionAnalytics>>>;
