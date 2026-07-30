import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import {
  buildStoryEngagementSignals,
  type StoryEngagementSignal,
} from "@/lib/content/story-engagement";
import {
  asRecord,
  numberValue,
  stringValue,
} from "@/lib/utils/record";
import type { StoryEngagementPersistedPayload } from "@/lib/validation/story-engagement";

type RateLimitInput = {
  sourceBucketHash: string;
  contentBucketHash: string;
  sourceLimit: number;
  contentLimit: number;
  expiresAt: string;
};

type RecordEventInput = {
  payload: StoryEngagementPersistedPayload;
  dedupHash: string;
  dedupExpiresAt: string;
};

export async function consumeStoryEngagementRateLimit(
  input: RateLimitInput,
): Promise<boolean> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.rpc(
    "consume_story_engagement_rate_limit",
    {
      p_source_bucket_hash: input.sourceBucketHash,
      p_content_bucket_hash: input.contentBucketHash,
      p_source_limit: input.sourceLimit,
      p_content_limit: input.contentLimit,
      p_expires_at: input.expiresAt,
    },
  );

  if (error) {
    throw new Error("STORY_ENGAGEMENT_RATE_LIMIT_FAILED");
  }

  return data === true;
}

export async function recordStoryEngagementEvent(
  input: RecordEventInput,
): Promise<boolean> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.rpc("record_story_engagement_event", {
    p_story_id: input.payload.storyId,
    p_related_story_id:
      input.payload.event === "related_content_click"
        ? input.payload.relatedStoryId
        : null,
    p_event_name: input.payload.event,
    p_surface: input.payload.surface,
    p_locale: input.payload.locale,
    p_position:
      "position" in input.payload ? input.payload.position : null,
    p_dedup_hash: input.dedupHash,
    p_dedup_expires_at: input.dedupExpiresAt,
  });

  if (error) {
    throw new Error("STORY_ENGAGEMENT_RECORD_FAILED");
  }

  return data === true;
}

export async function listStoryEngagementSignals(
  storyIds: readonly number[],
): Promise<Map<number, StoryEngagementSignal>> {
  const ids = [...new Set(storyIds)].filter(
    (storyId) => Number.isInteger(storyId) && storyId > 0,
  );
  if (ids.length === 0) return new Map();

  try {
    const supabase = createSupabaseServiceRoleClient();
    const rollingWindowStart = new Date(
      Date.now() - 90 * 24 * 60 * 60 * 1000,
    )
      .toISOString()
      .slice(0, 10);
    const { data, error } = await supabase
      .from("story_engagement_daily")
      .select("story_id,event_name,event_count,unique_session_count")
      .in("story_id", ids)
      .in("event_name", ["story_open", "meaningful_read_complete"])
      .gte("aggregation_day", rollingWindowStart);

    if (error || !Array.isArray(data)) return new Map();

    return buildStoryEngagementSignals(
      data.map((value) => {
        const row = asRecord(value);
        return {
          storyId: numberValue(row.story_id),
          eventName: stringValue(row.event_name),
          eventCount: numberValue(row.event_count),
          uniqueSessionCount: numberValue(row.unique_session_count),
        };
      }),
    );
  } catch {
    return new Map();
  }
}

export async function runStoryEngagementMaintenance(): Promise<{
  aggregatedRows: number;
  deletedEvents: number;
  deletedDedup: number;
  deletedRateBuckets: number;
}> {
  const supabase = createSupabaseServiceRoleClient();
  const { data: aggregateData, error: aggregateError } = await supabase.rpc(
    "aggregate_story_engagement_events",
  );
  if (aggregateError) {
    throw new Error("STORY_ENGAGEMENT_AGGREGATION_FAILED");
  }

  const { data: purgeData, error: purgeError } = await supabase.rpc(
    "purge_story_engagement_data",
  );
  if (purgeError) {
    throw new Error("STORY_ENGAGEMENT_PURGE_FAILED");
  }

  const purgeRow = asRecord(
    Array.isArray(purgeData) ? purgeData[0] : purgeData,
  );
  return {
    aggregatedRows: numberValue(aggregateData),
    deletedEvents: numberValue(purgeRow.deleted_events),
    deletedDedup: numberValue(purgeRow.deleted_dedup),
    deletedRateBuckets: numberValue(purgeRow.deleted_rate_buckets),
  };
}
