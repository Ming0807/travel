export const RELATED_CONTENT_TYPES = [
  "attractions",
  "restaurants",
  "accommodations",
  "stories",
] as const;

export type RelatedContentType = (typeof RELATED_CONTENT_TYPES)[number];

export const RELATED_CONTENT_MODES = [
  "automatic",
  "manual",
  "hybrid",
  "hidden",
] as const;

export type RelatedContentMode = (typeof RELATED_CONTENT_MODES)[number];

export type CoordinateEvidence = {
  latitude: number | null;
  longitude: number | null;
};

export type RelatedContentEvidence = CoordinateEvidence & {
  provinceId: string | number | null;
  districtId: string | number | null;
  categoryIds: readonly (string | number)[];
  directVerifiedRelation?: boolean;
  contentReadiness?: number;
  publishedAt?: string | null;
};

export type RelatedContentSource = {
  id: string;
  evidence: RelatedContentEvidence;
};

export type RelatedContentEligibility = {
  published: boolean;
  active: boolean;
  inLaunchScope: boolean;
  usableTitle: boolean;
  usableSlug: boolean;
  contentReady?: boolean;
  directVerifiedRelation?: boolean;
  isMock?: boolean;
  isDemo?: boolean;
  excluded?: boolean;
};

export type RelatedContentCandidate = {
  id: string;
  title: string | null;
  slug: string | null;
  evidence: RelatedContentEvidence;
  eligibility: RelatedContentEligibility;
  curatedOrder?: number | null;
};

export type RelatedContentEligibilityFailure =
  | "missing_id"
  | "self_reference"
  | "unpublished"
  | "inactive"
  | "out_of_launch_scope"
  | "unusable_title"
  | "unusable_slug"
  | "missing_story_relation"
  | "mock_record"
  | "demo_record"
  | "excluded";

export type RelatedContentReasonKey =
  | "curated"
  | "nearby"
  | "same_district"
  | "same_area"
  | "shared_category"
  | "verified_relation"
  | "content_ready"
  | "same_province"
  | "fresh_story"
  | "published_content";

export type RelatedContentScoreComponents = {
  distance: number;
  sameArea: number;
  sharedCategories: number;
  contentReadiness: number;
  verifiedRelation: number;
  freshness: number;
};

export type RankedRelatedContent = {
  id: string;
  title: string;
  slug: string;
  source: "curated" | "automatic";
  score: number;
  scoreComponents: RelatedContentScoreComponents;
  reasonKey: RelatedContentReasonKey;
  reasonLabel: string;
  distanceKm?: number;
};

export type UnavailableCuratedContent = {
  id: string;
  title: string | null;
  slug: string | null;
  reasons: RelatedContentEligibilityFailure[];
};

export type ComposedRelatedContent = {
  items: RankedRelatedContent[];
  unavailableCurated: UnavailableCuratedContent[];
};

export type ComposeRelatedContentInput = {
  contentType: RelatedContentType;
  source: RelatedContentSource;
  mode: RelatedContentMode;
  curatedCandidates?: readonly RelatedContentCandidate[];
  automaticCandidates?: readonly RelatedContentCandidate[];
  limit?: number;
  now?: Date;
};

type ScoredCandidate = {
  candidate: RelatedContentCandidate;
  score: number;
  scoreComponents: RelatedContentScoreComponents;
  reasonKey: RelatedContentReasonKey;
  reasonLabel: string;
  distanceKm: number | null;
  inputIndex: number;
};

const DEFAULT_LIMITS: Record<RelatedContentType, number> = {
  attractions: 4,
  restaurants: 4,
  accommodations: 4,
  stories: 3,
};

const MAX_LIMIT = 8;
const EARTH_RADIUS_KM = 6_371;
const DISTANCE_CAP_KM = 50;

function finiteNumber(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function validCoordinate(value: number | null | undefined, minimum: number, maximum: number): boolean {
  const number = finiteNumber(value);
  return number !== null && number >= minimum && number <= maximum;
}

function normalizedKey(value: string | number | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const key = String(value).trim();
  return key.length > 0 ? key : null;
}

function hasSameKey(left: string | number | null, right: string | number | null): boolean {
  const leftKey = normalizedKey(left);
  const rightKey = normalizedKey(right);
  return leftKey !== null && leftKey === rightKey;
}

function sharedCategoryCount(
  source: readonly (string | number)[],
  candidate: readonly (string | number)[]
): number {
  const candidateKeys = new Set(
    candidate.map((value) => normalizedKey(value)).filter((value): value is string => value !== null)
  );
  const sourceKeys = new Set(
    source.map((value) => normalizedKey(value)).filter((value): value is string => value !== null)
  );
  let count = 0;
  for (const value of sourceKeys) {
    if (candidateKeys.has(value)) count += 1;
  }
  return count;
}

function boundedUnitScore(value: number | undefined): number {
  const number = finiteNumber(value);
  if (number === null) return 0;
  return Math.min(1, Math.max(0, number));
}

function hasVerifiedRelation(candidate: RelatedContentCandidate): boolean {
  return candidate.eligibility.directVerifiedRelation ??
    candidate.evidence.directVerifiedRelation === true;
}

function roundScore(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}

function formatDistance(distanceKm: number): string {
  const rounded = Math.round(distanceKm * 10) / 10;
  return `อยู่ห่างประมาณ ${rounded.toFixed(1)} กม.`;
}

export function haversineDistanceKm(
  source: CoordinateEvidence,
  candidate: CoordinateEvidence
): number | null {
  const sourceLatitudeValue = finiteNumber(source.latitude);
  const sourceLongitudeValue = finiteNumber(source.longitude);
  const candidateLatitudeValue = finiteNumber(candidate.latitude);
  const candidateLongitudeValue = finiteNumber(candidate.longitude);
  if (
    sourceLatitudeValue === null ||
    sourceLongitudeValue === null ||
    candidateLatitudeValue === null ||
    candidateLongitudeValue === null ||
    !validCoordinate(sourceLatitudeValue, -90, 90) ||
    !validCoordinate(sourceLongitudeValue, -180, 180) ||
    !validCoordinate(candidateLatitudeValue, -90, 90) ||
    !validCoordinate(candidateLongitudeValue, -180, 180)
  ) {
    return null;
  }

  const sourceLatitude = (sourceLatitudeValue * Math.PI) / 180;
  const candidateLatitude = (candidateLatitudeValue * Math.PI) / 180;
  const latitudeDelta = ((candidateLatitudeValue - sourceLatitudeValue) * Math.PI) / 180;
  const longitudeDelta = ((candidateLongitudeValue - sourceLongitudeValue) * Math.PI) / 180;
  const haversine = Math.min(
    1,
    Math.max(
      0,
      Math.sin(latitudeDelta / 2) ** 2 +
        Math.cos(sourceLatitude) *
          Math.cos(candidateLatitude) *
          Math.sin(longitudeDelta / 2) ** 2
    )
  );
  const centralAngle = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  return roundScore(EARTH_RADIUS_KM * centralAngle);
}

function distanceScore(distanceKm: number | null, weight: number): number {
  if (distanceKm === null) return 0;
  const proximity = Math.max(0, 1 - Math.min(distanceKm, DISTANCE_CAP_KM) / DISTANCE_CAP_KM);
  return weight * proximity;
}

function freshnessScore(publishedAt: string | null | undefined, now?: Date): number {
  if (!publishedAt || !now) return 0;
  const timestamp = Date.parse(publishedAt);
  if (!Number.isFinite(timestamp)) return 0;
  const nowTimestamp = now.getTime();
  if (!Number.isFinite(nowTimestamp)) return 0;
  const ageDays = Math.max(0, (nowTimestamp - timestamp) / 86_400_000);
  if (ageDays <= 30) return 10;
  if (ageDays <= 90) return 6;
  if (ageDays <= 180) return 3;
  return 0;
}

function reasonFor(
  contentType: RelatedContentType,
  source: RelatedContentSource,
  candidate: RelatedContentCandidate,
  distanceKm: number | null,
  scoreComponents: RelatedContentScoreComponents
): Pick<ScoredCandidate, "reasonKey" | "reasonLabel"> {
  if (contentType === "stories") {
    return {
      reasonKey: "verified_relation",
      reasonLabel: "เรื่องราวที่กล่าวถึงสถานที่นี้",
    };
  }

  if (contentType === "restaurants" && scoreComponents.verifiedRelation > 0) {
    return {
      reasonKey: "verified_relation",
      reasonLabel: "เชื่อมโยงกับสถานที่นี้โดยตรง",
    };
  }
  if (distanceKm !== null && scoreComponents.distance > 0) {
    return { reasonKey: "nearby", reasonLabel: formatDistance(distanceKm) };
  }
  if (hasSameKey(source.evidence.districtId, candidate.evidence.districtId)) {
    return {
      reasonKey: "same_district",
      reasonLabel: "อยู่ในอำเภอเดียวกัน",
    };
  }
  if (
    contentType === "attractions" &&
    scoreComponents.sharedCategories > 0
  ) {
    return {
      reasonKey: "shared_category",
      reasonLabel: "มีหมวดหมู่เดียวกัน",
    };
  }
  if (
    contentType === "restaurants" &&
    hasSameKey(source.evidence.provinceId, candidate.evidence.provinceId)
  ) {
    return { reasonKey: "same_area", reasonLabel: "อยู่ในพื้นที่เดียวกัน" };
  }
  if (
    contentType === "accommodations" &&
    hasSameKey(source.evidence.provinceId, candidate.evidence.provinceId)
  ) {
    return { reasonKey: "same_area", reasonLabel: "อยู่ในพื้นที่เดียวกัน" };
  }
  if (scoreComponents.contentReadiness > 0) {
    return {
      reasonKey: "content_ready",
      reasonLabel: "มีข้อมูลพร้อมแนะนำ",
    };
  }
  if (hasSameKey(source.evidence.provinceId, candidate.evidence.provinceId)) {
    return { reasonKey: "same_province", reasonLabel: "อยู่ในจังหวัดเดียวกัน" };
  }
  return {
    reasonKey: "published_content",
    reasonLabel: "เนื้อหาที่เผยแพร่แล้ว",
  };
}

export function getRelatedContentEligibilityFailures(
  contentType: RelatedContentType,
  source: RelatedContentSource,
  candidate: RelatedContentCandidate
): RelatedContentEligibilityFailure[] {
  const failures: RelatedContentEligibilityFailure[] = [];
  if (!candidate.id.trim()) failures.push("missing_id");
  if (candidate.id === source.id) failures.push("self_reference");
  if (!candidate.eligibility.published) failures.push("unpublished");
  if (!candidate.eligibility.active) failures.push("inactive");
  if (!candidate.eligibility.inLaunchScope) failures.push("out_of_launch_scope");
  if (!candidate.eligibility.usableTitle || !candidate.title?.trim()) {
    failures.push("unusable_title");
  }
  if (!candidate.eligibility.usableSlug || !candidate.slug?.trim()) {
    failures.push("unusable_slug");
  }
  if (candidate.eligibility.isMock) failures.push("mock_record");
  if (candidate.eligibility.isDemo) failures.push("demo_record");
  if (candidate.eligibility.excluded) failures.push("excluded");
  if (
    contentType === "stories" &&
    !hasVerifiedRelation(candidate)
  ) {
    failures.push("missing_story_relation");
  }
  return failures;
}

export function isPubliclyEligible(
  contentType: RelatedContentType,
  source: RelatedContentSource,
  candidate: RelatedContentCandidate
): boolean {
  return getRelatedContentEligibilityFailures(contentType, source, candidate).length === 0;
}

function scoreCandidate(
  contentType: RelatedContentType,
  source: RelatedContentSource,
  candidate: RelatedContentCandidate,
  inputIndex: number,
  now?: Date
): ScoredCandidate {
  const distanceKm = haversineDistanceKm(source.evidence, candidate.evidence);
  const sameDistrict = hasSameKey(source.evidence.districtId, candidate.evidence.districtId);
  const sameProvince = hasSameKey(source.evidence.provinceId, candidate.evidence.provinceId);
  const sharedCategories = sharedCategoryCount(
    source.evidence.categoryIds,
    candidate.evidence.categoryIds
  );
  const readiness = boundedUnitScore(candidate.evidence.contentReadiness);
  const verifiedRelation = hasVerifiedRelation(candidate);
  const scoreComponents: RelatedContentScoreComponents = {
    distance: 0,
    sameArea: 0,
    sharedCategories: 0,
    contentReadiness: 0,
    verifiedRelation: 0,
    freshness: 0,
  };

  if (contentType === "attractions") {
    scoreComponents.distance = distanceScore(distanceKm, 40);
    scoreComponents.sameArea = sameDistrict ? 25 : 0;
    scoreComponents.sharedCategories = sharedCategories > 0 ? 25 : 0;
    scoreComponents.contentReadiness = readiness * 10;
  } else if (contentType === "restaurants") {
    scoreComponents.verifiedRelation = verifiedRelation ? 50 : 0;
    scoreComponents.distance = distanceScore(distanceKm, 30);
    scoreComponents.sameArea = sameDistrict || sameProvince ? 20 : 0;
  } else if (contentType === "accommodations") {
    scoreComponents.distance = distanceScore(distanceKm, 50);
    scoreComponents.sameArea = sameDistrict || sameProvince ? 25 : 0;
    scoreComponents.contentReadiness = readiness * 25;
  } else {
    scoreComponents.verifiedRelation = 70;
    scoreComponents.contentReadiness = readiness * 20;
    scoreComponents.freshness = freshnessScore(candidate.evidence.publishedAt, now);
  }

  const score = Object.values(scoreComponents).reduce(
    (total, component) => total + component,
    0
  );
  const reason = reasonFor(contentType, source, candidate, distanceKm, scoreComponents);
  return {
    candidate,
    score: roundScore(score),
    scoreComponents: {
      distance: roundScore(scoreComponents.distance),
      sameArea: roundScore(scoreComponents.sameArea),
      sharedCategories: roundScore(scoreComponents.sharedCategories),
      contentReadiness: roundScore(scoreComponents.contentReadiness),
      verifiedRelation: roundScore(scoreComponents.verifiedRelation),
      freshness: roundScore(scoreComponents.freshness),
    },
    reasonKey: reason.reasonKey,
    reasonLabel: reason.reasonLabel,
    distanceKm,
    inputIndex,
  };
}

function compareStrings(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function compareScoredCandidates(left: ScoredCandidate, right: ScoredCandidate): number {
  if (right.score !== left.score) return right.score - left.score;
  if (left.distanceKm !== null && right.distanceKm !== null && left.distanceKm !== right.distanceKm) {
    return left.distanceKm - right.distanceKm;
  }
  const idComparison = compareStrings(left.candidate.id, right.candidate.id);
  return idComparison !== 0 ? idComparison : left.inputIndex - right.inputIndex;
}

function normalizeLimit(contentType: RelatedContentType, limit: number | undefined): number {
  const fallback = DEFAULT_LIMITS[contentType];
  if (limit === undefined || !Number.isFinite(limit)) return fallback;
  return Math.min(MAX_LIMIT, Math.max(0, Math.trunc(limit)));
}

function uniqueCandidates(
  candidates: readonly RelatedContentCandidate[]
): Array<{ candidate: RelatedContentCandidate; inputIndex: number }> {
  const seen = new Set<string>();
  const unique: Array<{ candidate: RelatedContentCandidate; inputIndex: number }> = [];
  candidates.forEach((candidate, inputIndex) => {
    if (seen.has(candidate.id)) return;
    seen.add(candidate.id);
    unique.push({ candidate, inputIndex });
  });
  return unique;
}

function toPublicResult(
  item: ScoredCandidate,
  source: "curated" | "automatic",
  reasonKey: RelatedContentReasonKey = item.reasonKey,
  reasonLabel: string = item.reasonLabel
): RankedRelatedContent {
  const result: RankedRelatedContent = {
    id: item.candidate.id,
    title: item.candidate.title?.trim() ?? "",
    slug: item.candidate.slug?.trim() ?? "",
    source,
    score: item.score,
    scoreComponents: item.scoreComponents,
    reasonKey,
    reasonLabel,
  };
  if (item.distanceKm !== null) result.distanceKm = item.distanceKm;
  return result;
}

export function rankRelatedContent(
  contentType: RelatedContentType,
  source: RelatedContentSource,
  candidates: readonly RelatedContentCandidate[],
  options: { limit?: number; now?: Date } = {}
): RankedRelatedContent[] {
  const limit = normalizeLimit(contentType, options.limit);
  const scored = uniqueCandidates(candidates)
    .filter(({ candidate }) => isPubliclyEligible(contentType, source, candidate))
    .map(({ candidate, inputIndex }) =>
      scoreCandidate(contentType, source, candidate, inputIndex, options.now)
    )
    .sort(compareScoredCandidates)
    .slice(0, limit);
  return scored.map((item) => toPublicResult(item, "automatic"));
}

function curatedScore(
  contentType: RelatedContentType,
  source: RelatedContentSource,
  candidate: RelatedContentCandidate,
  inputIndex: number,
  now?: Date
): ScoredCandidate {
  const scored = scoreCandidate(contentType, source, candidate, inputIndex, now);
  return {
    ...scored,
    score: roundScore(10_000 - Math.max(0, candidate.curatedOrder ?? inputIndex)),
    reasonKey: "curated",
    reasonLabel: "คัดเลือกโดยทีมเนื้อหา",
  };
}

function sortCurated(
  left: { candidate: RelatedContentCandidate; inputIndex: number },
  right: { candidate: RelatedContentCandidate; inputIndex: number }
): number {
  const leftOrder = finiteNumber(left.candidate.curatedOrder);
  const rightOrder = finiteNumber(right.candidate.curatedOrder);
  if (leftOrder !== null && rightOrder !== null && leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }
  if (leftOrder !== null && rightOrder === null) return -1;
  if (leftOrder === null && rightOrder !== null) return 1;
  return left.inputIndex - right.inputIndex;
}

function getUnavailableCurated(
  contentType: RelatedContentType,
  source: RelatedContentSource,
  candidates: readonly RelatedContentCandidate[]
): UnavailableCuratedContent[] {
  return uniqueCandidates(candidates)
    .map(({ candidate }) => ({
      candidate,
      reasons: getRelatedContentEligibilityFailures(contentType, source, candidate),
    }))
    .filter(({ reasons }) => reasons.length > 0)
    .map(({ candidate, reasons }) => ({
      id: candidate.id,
      title: candidate.title,
      slug: candidate.slug,
      reasons,
    }));
}

export function composeRelatedContent(
  input: ComposeRelatedContentInput
): ComposedRelatedContent {
  const curatedCandidates = input.curatedCandidates ?? [];
  const automaticCandidates = input.automaticCandidates ?? [];
  const limit = normalizeLimit(input.contentType, input.limit);
  const unavailableCurated = getUnavailableCurated(
    input.contentType,
    input.source,
    curatedCandidates
  );

  if (input.mode === "hidden" || limit === 0) {
    return { items: [], unavailableCurated };
  }

  const curated = uniqueCandidates(curatedCandidates)
    .sort(sortCurated)
    .filter(({ candidate }) =>
      isPubliclyEligible(input.contentType, input.source, candidate)
    )
    .map(({ candidate, inputIndex }) =>
      curatedScore(input.contentType, input.source, candidate, inputIndex, input.now)
    );

  if (input.mode === "manual") {
    return {
      items: curated.slice(0, limit).map((item) =>
        toPublicResult(item, "curated", "curated", "คัดเลือกโดยทีมเนื้อหา")
      ),
      unavailableCurated,
    };
  }

  const automatic = uniqueCandidates(automaticCandidates)
    .filter(({ candidate }) => isPubliclyEligible(input.contentType, input.source, candidate))
    .map(({ candidate, inputIndex }) =>
      scoreCandidate(input.contentType, input.source, candidate, inputIndex, input.now)
    )
    .sort(compareScoredCandidates);

  if (input.mode === "automatic") {
    return {
      items: automatic
        .slice(0, limit)
        .map((item) => toPublicResult(item, "automatic")),
      unavailableCurated,
    };
  }

  const selected: Array<{ item: ScoredCandidate; source: "curated" | "automatic" }> = curated
    .slice(0, limit)
    .map((item) => ({ item, source: "curated" }));
  const selectedIds = new Set(selected.map(({ item }) => item.candidate.id));
  for (const item of automatic) {
    if (selected.length >= limit) break;
    if (selectedIds.has(item.candidate.id)) continue;
    selected.push({ item, source: "automatic" });
    selectedIds.add(item.candidate.id);
  }

  return {
    items: selected.map(({ item, source }) => toPublicResult(item, source)),
    unavailableCurated,
  };
}
