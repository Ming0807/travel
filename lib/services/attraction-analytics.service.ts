import "server-only";

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

function studyKind(session: Row) {
  return nullableString(relation(session, "research_studies")?.study_kind);
}

export function visitMatchesEvidenceScope(row: Row, scope: AttractionAnalyticsFilters["evidenceScope"]) {
  if (scope === "all_records") return true;
  const sessions = researchSessions(row);
  if (scope === "pilot_only") return sessions.some((session) => studyKind(session) === "pilot" || session.collection_mode === "pilot_internal");
  if (scope === "simulated_only") return sessions.some((session) => session.collection_mode === "simulated_usability");
  if (sessions.length === 0) return true;
  return sessions.some((session) => studyKind(session) === "final_collection" && session.collection_mode === "field_observation");
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

function benchmark(rows: Row[], attractionId: number, scope: AttractionAnalyticsFilters["evidenceScope"]) {
  const included = rows.filter((row) => visitMatchesEvidenceScope(row, scope));
  const counts = new Map<number, number>();
  included.forEach((row) => {
    const id = Number(row.attraction_id);
    if (Number.isFinite(id)) counts.set(id, (counts.get(id) ?? 0) + 1);
  });
  const selectedVisits = counts.get(attractionId) ?? 0;
  const peers = [...counts.entries()].filter(([id]) => id !== attractionId).map(([, count]) => count).sort((a, b) => a - b);
  const middle = Math.floor(peers.length / 2);
  const peerMedian = peers.length === 0 ? null : peers.length % 2 ? peers[middle] : (peers[middle - 1] + peers[middle]) / 2;
  const rank = [...counts.entries()].sort((a, b) => b[1] - a[1]).findIndex(([id]) => id === attractionId) + 1;
  return { selectedVisits, peerMedian, peerCount: peers.length, rank: rank > 0 ? rank : null, comparable: peers.length >= 2 };
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
  const benchmarkData = parsed.data.campaignId || parsed.data.checkinCodeId || parsed.data.entryChannel || rows.truncated
    ? { selectedVisits: visits.length, peerMedian: null, peerCount: 0, rank: null, comparable: false }
    : benchmark(rows.peerVisits, parsed.data.attractionId, parsed.data.evidenceScope);
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
    generatedAt: new Date().toISOString(),
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
    benchmark: benchmarkData,
    improvements: {
      issueCount: issues.length,
      openIssueCount: issues.filter((issue) => !["closed", "rejected"].includes(issue.status)).length,
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
    ],
    viewer: { displayName: guard.actor.displayName, permissions: guard.actor.permissions },
    interpretation: "ข้อมูลเป็นสถิติเชิงพรรณนาจากระบบและความสัมพันธ์ที่สังเกตได้ ไม่ยืนยันเหตุและผล และไม่ควรอ้างเป็นตัวแทนนักท่องเที่ยวทั้งจังหวัดโดยไม่มีการออกแบบกลุ่มตัวอย่างรองรับ",
  };
}

export type AttractionAnalyticsViewModel = NonNullable<Awaited<ReturnType<typeof getAttractionAnalytics>>>;
