import { storyDocumentSchema } from "@/lib/content/story-document";

export type StoryReadinessKey =
  | "title"
  | "slug"
  | "excerpt"
  | "content"
  | "cover"
  | "cover_active"
  | "cover_alt"
  | "geography"
  | "topic"
  | "seo";

export type StoryReadinessItem = {
  key: StoryReadinessKey;
  complete: boolean;
  requiredForReview: boolean;
  requiredForPublish: boolean;
  source?: "structured" | "legacy" | "none";
};

export type StoryReadinessInput = {
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  contentDocument?: unknown;
  legacyContent?: string | null;
  cover?: { mediaId: number; isActive: boolean; altText?: string | null } | null;
  provinceId?: number | null;
  geographicScope?: "province" | "cross_province";
  topicIds?: number[];
  seoDescription?: string | null;
  usesGeneratedSeo?: boolean;
};

export type StoryReadinessResult = {
  score: number;
  readyForReview: boolean;
  readyForPublish: boolean;
  blocking: StoryReadinessKey[];
  items: StoryReadinessItem[];
};

function hasText(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

function hasMeaningfulNode(value: unknown): boolean {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const node = value as Record<string, unknown>;
  if (node.type === "image") return true;
  if (node.type === "text" && typeof node.text === "string" && node.text.trim().length > 0) return true;
  return Array.isArray(node.content) && node.content.some(hasMeaningfulNode);
}

function hasMeaningfulLegacyContent(value: string | null | undefined): boolean {
  if (!hasText(value)) return false;
  const normalized = value!
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .trim();
  return normalized.length > 0 || /<img\b/i.test(value!);
}

export function evaluateStoryReadiness(input: StoryReadinessInput): StoryReadinessResult {
  const parsedDocument = storyDocumentSchema.safeParse(input.contentDocument);
  const hasStructuredContent = parsedDocument.success && parsedDocument.data.content.some(hasMeaningfulNode);
  const hasLegacyContent = hasMeaningfulLegacyContent(input.legacyContent);
  const contentSource: StoryReadinessItem["source"] = hasStructuredContent
    ? "structured"
    : hasLegacyContent
      ? "legacy"
      : "none";

  const items: StoryReadinessItem[] = [
    { key: "title", complete: hasText(input.title), requiredForReview: true, requiredForPublish: true },
    {
      key: "slug",
      complete: typeof input.slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug),
      requiredForReview: true,
      requiredForPublish: true,
    },
    { key: "excerpt", complete: hasText(input.excerpt), requiredForReview: true, requiredForPublish: true },
    {
      key: "content",
      complete: hasStructuredContent || hasLegacyContent,
      requiredForReview: true,
      requiredForPublish: true,
      source: contentSource,
    },
    { key: "cover", complete: Boolean(input.cover?.mediaId), requiredForReview: false, requiredForPublish: true },
    { key: "cover_active", complete: input.cover?.isActive === true, requiredForReview: false, requiredForPublish: true },
    { key: "cover_alt", complete: hasText(input.cover?.altText), requiredForReview: false, requiredForPublish: true },
    {
      key: "geography",
      complete:
        input.geographicScope === "cross_province" ||
        (Number.isInteger(input.provinceId) && Number(input.provinceId) > 0),
      requiredForReview: false,
      requiredForPublish: true,
    },
    {
      key: "topic",
      complete: Array.isArray(input.topicIds) && input.topicIds.some((topicId) => Number.isInteger(topicId) && topicId > 0),
      requiredForReview: false,
      requiredForPublish: true,
    },
    {
      key: "seo",
      complete: hasText(input.seoDescription) || input.usesGeneratedSeo === true,
      requiredForReview: false,
      requiredForPublish: true,
    },
  ];

  const blocking = items.filter((item) => item.requiredForPublish && !item.complete).map((item) => item.key);
  const completed = items.filter((item) => item.complete).length;

  return {
    score: Math.round((completed / items.length) * 100),
    readyForReview: items.filter((item) => item.requiredForReview).every((item) => item.complete),
    readyForPublish: blocking.length === 0,
    blocking,
    items,
  };
}
