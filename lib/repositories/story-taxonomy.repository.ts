import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import {
  asRecord,
  booleanValue,
  nullableString,
  numberValue,
  stringValue,
} from "@/lib/utils/record";

export type StoryTopicOption = {
  id: number;
  key: string;
  nameTh: string;
  nameEn: string | null;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
};

export type StoryTagOption = {
  id: number;
  key: string;
  nameTh: string;
  nameEn: string | null;
  isActive: boolean;
};

export type StoryProvinceOption = {
  id: number;
  nameTh: string;
};

export function mapStoryTopic(value: unknown): StoryTopicOption {
  const row = asRecord(value);
  return {
    id: numberValue(row.topic_id),
    key: stringValue(row.topic_key),
    nameTh: stringValue(row.name_th),
    nameEn: nullableString(row.name_en),
    description: nullableString(row.description),
    displayOrder: numberValue(row.display_order),
    isActive: booleanValue(row.is_active),
  };
}

export function mapStoryTag(value: unknown): StoryTagOption {
  const row = asRecord(value);
  return {
    id: numberValue(row.tag_id),
    key: stringValue(row.tag_key),
    nameTh: stringValue(row.name_th),
    nameEn: nullableString(row.name_en),
    isActive: booleanValue(row.is_active),
  };
}

export function mapStoryProvince(value: unknown): StoryProvinceOption {
  const row = asRecord(value);
  return {
    id: numberValue(row.province_id),
    nameTh: stringValue(row.province_name_th),
  };
}

export async function listStoryTopics(options: { includeInactive?: boolean } = {}): Promise<StoryTopicOption[]> {
  const supabase = createSupabaseServiceRoleClient();
  let query = supabase
    .from("story_topics")
    .select("topic_id, topic_key, name_th, name_en, description, display_order, is_active")
    .order("display_order", { ascending: true })
    .order("name_th", { ascending: true });

  if (!options.includeInactive) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) throw new Error("STORY_TOPIC_LIST_FAILED");
  return (data ?? []).map(mapStoryTopic);
}

export async function listStoryTags(options: { includeInactive?: boolean } = {}): Promise<StoryTagOption[]> {
  const supabase = createSupabaseServiceRoleClient();
  let query = supabase
    .from("story_tags")
    .select("tag_id, tag_key, name_th, name_en, is_active")
    .order("name_th", { ascending: true });

  if (!options.includeInactive) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) throw new Error("STORY_TAG_LIST_FAILED");
  return (data ?? []).map(mapStoryTag);
}

export async function listStoryProvinceOptions(): Promise<StoryProvinceOption[]> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("provinces")
    .select("province_id, province_name_th")
    .order("province_name_th", { ascending: true });

  if (error) throw new Error("STORY_PROVINCE_LIST_FAILED");
  return (data ?? []).map(mapStoryProvince);
}
