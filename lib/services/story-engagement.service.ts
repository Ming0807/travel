import "server-only";

import { getServerEnv } from "@/lib/config/server-env";
import {
  consumeStoryEngagementRateLimit,
  recordStoryEngagementEvent,
} from "@/lib/repositories/story-engagement.repository";
import { createStoryEngagementDigest } from "@/lib/security/story-engagement";
import type {
  StoryEngagementPayload,
  StoryEngagementPersistedPayload,
} from "@/lib/validation/story-engagement";

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

type StoryEngagementRequestContext = {
  transientSource: string;
  origin: string;
  now?: Date;
};

function toPersistedPayload(
  payload: StoryEngagementPayload,
): StoryEngagementPersistedPayload {
  const common = {
    storyId: payload.storyId,
    locale: payload.locale,
  };

  switch (payload.event) {
    case "story_impression":
      return {
        ...common,
        event: payload.event,
        surface: payload.surface,
        position: payload.position,
      };
    case "story_open":
      return {
        ...common,
        event: payload.event,
        surface: payload.surface,
      };
    case "related_content_click":
      return {
        ...common,
        event: payload.event,
        surface: payload.surface,
        relatedStoryId: payload.relatedStoryId,
        position: payload.position,
      };
    case "meaningful_read_complete":
      return {
        ...common,
        event: payload.event,
        surface: payload.surface,
      };
  }
}

export async function recordStoryEngagementSignal(
  payload: StoryEngagementPayload,
  context: StoryEngagementRequestContext,
): Promise<{ accepted: boolean }> {
  const secret = getServerEnv().CONTENT_ENGAGEMENT_HASH_SECRET;
  if (!secret) {
    throw new Error("STORY_ENGAGEMENT_NOT_CONFIGURED");
  }

  const now = context.now ?? new Date();
  const rateBucket = Math.floor(now.getTime() / FIVE_MINUTES_MS).toString();
  const relatedStoryId =
    payload.event === "related_content_click"
      ? payload.relatedStoryId.toString()
      : "";

  const sourceBucketHash = createStoryEngagementDigest(
    secret,
    "rate-limit",
    [context.transientSource, context.origin, rateBucket, "all"],
  );
  const contentBucketHash = createStoryEngagementDigest(
    secret,
    "rate-limit",
    [
      context.transientSource,
      context.origin,
      rateBucket,
      payload.storyId.toString(),
    ],
  );

  const withinLimit = await consumeStoryEngagementRateLimit({
    sourceBucketHash,
    contentBucketHash,
    sourceLimit: 120,
    contentLimit: 30,
    expiresAt: new Date(now.getTime() + TWENTY_FOUR_HOURS_MS).toISOString(),
  });

  if (!withinLimit) {
    return { accepted: false };
  }

  const dedupHash = createStoryEngagementDigest(secret, "dedup", [
    payload.nonce,
    payload.event,
    payload.storyId.toString(),
    relatedStoryId,
  ]);

  const accepted = await recordStoryEngagementEvent({
    payload: toPersistedPayload(payload),
    dedupHash,
    dedupExpiresAt: new Date(
      now.getTime() + TWENTY_FOUR_HOURS_MS,
    ).toISOString(),
  });

  return { accepted };
}
