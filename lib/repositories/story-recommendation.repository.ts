import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { StoryRecommendationMutationInput } from "@/lib/validation/story";
import {
  asRecord,
  nullableString,
  numberValue,
  stringValue,
} from "@/lib/utils/record";
import { firstJoin } from "@/lib/utils/supabase-joins";

export type AdminStoryRecommendation = {
  targetStoryId: number;
  title: string;
  slug: string;
  provinceName: string | null;
  displayOrder: number;
  reason: string | null;
};

export type StoryRecommendationCandidate = {
  storyId: number;
  title: string;
  slug: string;
  provinceName: string | null;
};

function escapePostgrestPattern(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&").replace(/,/g, " ");
}

function mapStoryJoin(value: unknown) {
  const story = asRecord(firstJoin(value));
  const province = asRecord(firstJoin(story.provinces));
  return {
    storyId: numberValue(story.story_id),
    title: stringValue(story.title),
    slug: stringValue(story.slug),
    provinceName:
      nullableString(province.province_name_th) ??
      nullableString(province.province_name_en),
  };
}

export async function listAdminStoryRecommendations(
  sourceStoryId: number
): Promise<AdminStoryRecommendation[]> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("story_recommendations")
    .select(`
      display_order,
      reason,
      target_story:travel_stories!story_recommendations_target_story_id_fkey (
        story_id,
        title,
        slug,
        provinces (province_name_th, province_name_en)
      )
    `)
    .eq("source_story_id", sourceStoryId)
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).flatMap((raw) => {
    const row = asRecord(raw);
    const story = mapStoryJoin(row.target_story);
    if (!story.storyId || !story.slug) return [];
    return [
      {
        targetStoryId: story.storyId,
        title: story.title,
        slug: story.slug,
        provinceName: story.provinceName,
        displayOrder: numberValue(row.display_order),
        reason: nullableString(row.reason),
      },
    ];
  });
}

export async function searchStoryRecommendationCandidates(input: {
  sourceStoryId: number;
  query: string;
  limit?: number;
}): Promise<StoryRecommendationCandidate[]> {
  const trimmed = input.query.trim();
  if (!trimmed) return [];
  const supabase = createSupabaseServiceRoleClient();
  const escaped = escapePostgrestPattern(trimmed);
  const { data, error } = await supabase
    .from("travel_stories")
    .select(`
      story_id,
      title,
      slug,
      provinces (province_name_th, province_name_en)
    `)
    .eq("status", "published")
    .eq("is_published", true)
    .neq("story_id", input.sourceStoryId)
    .or(`title.ilike.%${escaped}%,slug.ilike.%${escaped}%`)
    .order("published_at", { ascending: false })
    .limit(Math.min(20, Math.max(1, input.limit ?? 12)));

  if (error) throw error;
  return (data ?? [])
    .map((row) => mapStoryJoin(row))
    .filter((story) => story.storyId > 0 && Boolean(story.slug));
}

export async function replaceStoryRecommendations(
  input: StoryRecommendationMutationInput,
  actorId: string
): Promise<void> {
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase.rpc("replace_story_recommendations", {
    p_source_story_id: input.sourceStoryId,
    p_items: input.items.map((item) => ({
      target_story_id: item.targetStoryId,
      display_order: item.displayOrder,
      reason: item.reason,
    })),
    p_actor_id: actorId,
  });
  if (error) throw error;
}
