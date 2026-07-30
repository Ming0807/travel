export type StoryRecommendationSignal = {
  id: string;
  province: string;
  topicKey: string | null;
  publishedAt: string | null;
  publicReady: boolean;
  excluded?: boolean;
  attractionKeys?: string[];
  routeKeys?: string[];
  tagKeys?: string[];
  qualityScore?: number;
  engagementScore?: number;
  engagementSampleSize?: number;
  curatedOrder?: number;
  curatedReason?: string | null;
};

export type StoryRecommendationReason =
  | "curated"
  | "same_province"
  | "shared_destination"
  | "shared_tag"
  | "same_topic"
  | "latest";

export type StoryRecommendationScoreComponents = {
  curated: number;
  province: number;
  sharedDestination: number;
  tags: number;
  topic: number;
  freshness: number;
  quality: number;
  engagement: number;
};

export type RankedStoryRecommendation = {
  id: string;
  score: number;
  scoreComponents: StoryRecommendationScoreComponents;
  reasonKey: StoryRecommendationReason;
  reasonLabel: string;
};

const DEFAULT_MINIMUM_ENGAGEMENT_SAMPLE = 100;

function boundedScore(value: number | undefined, maximum: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(maximum, Math.max(0, value ?? 0));
}

function hasOverlap(left: string[] = [], right: string[] = []): boolean {
  if (left.length === 0 || right.length === 0) return false;
  const rightValues = new Set(right);
  return left.some((value) => rightValues.has(value));
}

function overlapCount(left: string[] = [], right: string[] = []): number {
  if (left.length === 0 || right.length === 0) return 0;
  const rightValues = new Set(right);
  return new Set(left.filter((value) => rightValues.has(value))).size;
}

function freshnessScore(
  publishedAt: string | null,
  now: Date
): number {
  if (!publishedAt) return 0;
  const published = new Date(publishedAt);
  if (!Number.isFinite(published.getTime())) return 0;
  const ageDays = Math.max(
    0,
    (now.getTime() - published.getTime()) / 86_400_000
  );
  if (ageDays <= 30) return 10;
  if (ageDays <= 90) return 6;
  if (ageDays <= 180) return 3;
  return 0;
}

function reasonFor(
  source: StoryRecommendationSignal,
  candidate: StoryRecommendationSignal
): Pick<RankedStoryRecommendation, "reasonKey" | "reasonLabel"> {
  if (candidate.curatedOrder !== undefined) {
    return {
      reasonKey: "curated",
      reasonLabel:
        candidate.curatedReason?.trim() || "คัดเลือกโดยทีมเนื้อหา",
    };
  }
  if (source.province && candidate.province === source.province) {
    return {
      reasonKey: "same_province",
      reasonLabel: `เรื่องราวจาก${candidate.province}เหมือนกัน`,
    };
  }
  if (
    hasOverlap(source.attractionKeys, candidate.attractionKeys) ||
    hasOverlap(source.routeKeys, candidate.routeKeys)
  ) {
    return {
      reasonKey: "shared_destination",
      reasonLabel: "เชื่อมโยงกับสถานที่หรือเส้นทางเดียวกัน",
    };
  }
  if (overlapCount(source.tagKeys, candidate.tagKeys) > 0) {
    return {
      reasonKey: "shared_tag",
      reasonLabel: "มีประเด็นที่คุณอาจสนใจต่อ",
    };
  }
  if (source.topicKey && candidate.topicKey === source.topicKey) {
    return {
      reasonKey: "same_topic",
      reasonLabel: "หัวข้อใกล้เคียงกับเรื่องที่กำลังอ่าน",
    };
  }
  return {
    reasonKey: "latest",
    reasonLabel: "เรื่องใหม่จากชายแดนใต้",
  };
}

export function rankStoryRecommendations(
  source: StoryRecommendationSignal,
  candidates: StoryRecommendationSignal[],
  options: {
    limit?: number;
    now?: Date;
    minimumEngagementSample?: number;
  } = {}
): RankedStoryRecommendation[] {
  const limit = Math.min(12, Math.max(1, options.limit ?? 3));
  const now = options.now ?? new Date();
  const minimumEngagementSample = Math.max(
    1,
    options.minimumEngagementSample ?? DEFAULT_MINIMUM_ENGAGEMENT_SAMPLE
  );
  const unique = new Map<string, StoryRecommendationSignal>();

  for (const candidate of candidates) {
    if (
      !candidate.publicReady ||
      candidate.excluded === true ||
      !candidate.id ||
      candidate.id === source.id
    ) {
      continue;
    }
    if (!unique.has(candidate.id)) unique.set(candidate.id, candidate);
  }

  const sorted = [...unique.values()]
    .map((candidate) => {
      const curated =
        candidate.curatedOrder !== undefined
          ? 10_000 - Math.min(9_999, Math.max(0, candidate.curatedOrder))
          : 0;
      const scoreComponents: StoryRecommendationScoreComponents = {
        curated,
        province:
          source.province && candidate.province === source.province ? 30 : 0,
        sharedDestination:
          hasOverlap(source.attractionKeys, candidate.attractionKeys) ||
          hasOverlap(source.routeKeys, candidate.routeKeys)
            ? 25
            : 0,
        tags: Math.min(
          20,
          overlapCount(source.tagKeys, candidate.tagKeys) * 5
        ),
        topic:
          source.topicKey && candidate.topicKey === source.topicKey ? 10 : 0,
        freshness: freshnessScore(candidate.publishedAt, now),
        quality: boundedScore(candidate.qualityScore, 5),
        engagement:
          (candidate.engagementSampleSize ?? 0) >= minimumEngagementSample
            ? boundedScore(candidate.engagementScore, 10)
            : 0,
      };
      const score = Object.values(scoreComponents).reduce(
        (total, component) => total + component,
        0
      );
      return {
        candidate,
        score,
        scoreComponents,
        ...reasonFor(source, candidate),
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      const rightTime = Date.parse(right.candidate.publishedAt ?? "") || 0;
      const leftTime = Date.parse(left.candidate.publishedAt ?? "") || 0;
      if (rightTime !== leftTime) return rightTime - leftTime;
      return left.candidate.id.localeCompare(right.candidate.id);
    });

  const selected: typeof sorted = [];
  const remaining = [...sorted];
  const provinces = new Set<string>();
  const topics = new Set<string>();

  while (selected.length < limit && remaining.length > 0) {
    const curatedIndex = remaining.findIndex(
      (item) => item.reasonKey === "curated"
    );
    const diversityIndex = remaining.findIndex(
      (item) =>
        !provinces.has(item.candidate.province) ||
        (item.candidate.topicKey !== null &&
          !topics.has(item.candidate.topicKey))
    );
    const nextIndex =
      curatedIndex >= 0
        ? curatedIndex
        : selected.length === 0
          ? 0
          : diversityIndex >= 0
            ? diversityIndex
            : 0;
    const [next] = remaining.splice(nextIndex, 1);
    if (!next) break;
    selected.push(next);
    if (next.candidate.province) provinces.add(next.candidate.province);
    if (next.candidate.topicKey) topics.add(next.candidate.topicKey);
  }

  return selected.map(
    ({ candidate, score, scoreComponents, reasonKey, reasonLabel }) => ({
      id: candidate.id,
      score,
      scoreComponents,
      reasonKey,
      reasonLabel,
    })
  );
}
