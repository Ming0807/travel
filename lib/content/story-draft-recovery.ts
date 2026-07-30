import { z } from "zod";
import { storyDocumentSchema, type StoryDocument } from "@/lib/content/story-document";

const recoverySchema = z.object({
  storyId: z.number().int().positive(),
  baseUpdatedAt: z.string().datetime({ offset: true }),
  html: z.string().max(500_000),
  document: storyDocumentSchema,
  savedAt: z.string().datetime({ offset: true }),
}).strict();

export type StoryDraftRecovery = {
  storyId: number;
  baseUpdatedAt: string;
  html: string;
  document: StoryDocument;
  savedAt: string;
};

export function storyDraftRecoveryKey(storyId: number): string {
  return `story-editorial-draft:${storyId}`;
}

export function parseStoryDraftRecovery(value: string | null): StoryDraftRecovery | null {
  if (!value || value.length > 650_000) return null;
  try {
    const parsed = recoverySchema.safeParse(JSON.parse(value));
    return parsed.success ? parsed.data as StoryDraftRecovery : null;
  } catch {
    return null;
  }
}

export function shouldOfferStoryDraftRecovery(
  recovery: StoryDraftRecovery | null,
  current: { storyId: number; updatedAt: string; html: string }
): recovery is StoryDraftRecovery {
  return Boolean(
    recovery &&
    recovery.storyId === current.storyId &&
    recovery.baseUpdatedAt === current.updatedAt &&
    recovery.html !== current.html
  );
}
