import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type {
  AtomicStoryEditorialChange,
  StoryEditorialChangeStore,
  StoryEditorialChangeStoreResult,
} from "@/lib/services/story-editorial.service";
import { asRecord, nullableString, numberValue, stringValue } from "@/lib/utils/record";

type StoryEditorialRpcResult = {
  success: boolean;
  error_code?: string;
  updated_at?: string;
  revision_number?: number;
};

function parseRpcPayload(value: unknown): StoryEditorialRpcResult | null {
  if (!value || typeof value !== "object" || !("success" in value)) return null;
  const record = value as Record<string, unknown>;
  return {
    success: record.success === true,
    error_code: typeof record.error_code === "string" ? record.error_code : undefined,
    updated_at: typeof record.updated_at === "string" ? record.updated_at : undefined,
    revision_number: typeof record.revision_number === "number" ? record.revision_number : undefined,
  };
}
export async function applyStoryEditorialChangeTransaction(
  input: AtomicStoryEditorialChange
): Promise<StoryEditorialChangeStoreResult> {
  const supabase = createSupabaseServiceRoleClient();
  const { patch, snapshot } = input;
  const { data, error } = await supabase.rpc("apply_story_editorial_change", {
    p_story_id: input.storyId,
    p_expected_updated_at: input.expectedUpdatedAt,
    p_actor_id: input.actorId,
    p_title: patch.title,
    p_slug: patch.slug,
    p_excerpt: patch.excerpt,
    p_content: patch.legacyContent,
    p_content_document: patch.contentDocument,
    p_content_schema_version: patch.contentSchemaVersion,
    p_province_id: patch.provinceId,
    p_geographic_scope: patch.geographicScope,
    p_primary_language: patch.primaryLanguage,
    p_seo_title: patch.seoTitle,
    p_seo_description: patch.seoDescription,
    p_scheduled_at: patch.scheduledAt,
    p_reading_minutes: patch.readingMinutes,
    p_content_quality_score: patch.contentQualityScore,
    p_status: patch.status,
    p_topic_ids: patch.topicIds,
    p_snapshot_extras: {
      coverMediaId: snapshot.coverMediaId,
      usesGeneratedSeo: snapshot.usesGeneratedSeo,
    },
    p_source_action: input.sourceAction,
    p_review_note: input.reviewNote,
    p_change_summary: input.changeSummary,
  });

  if (error) throw new Error("STORY_EDITORIAL_TRANSACTION_FAILED");

  const result = parseRpcPayload(data);
  if (!result) throw new Error("STORY_EDITORIAL_TRANSACTION_FAILED");
  if (!result.success) {
    if (result.error_code === "EDIT_CONFLICT") return { kind: "conflict" };
    if (result.error_code === "STORY_NOT_FOUND") return { kind: "not_found" };
    throw new Error(result.error_code ?? "STORY_EDITORIAL_TRANSACTION_FAILED");
  }

  if (!result.updated_at || !Number.isInteger(result.revision_number) || Number(result.revision_number) <= 0) {
    throw new Error("STORY_EDITORIAL_TRANSACTION_FAILED");
  }

  return {
    kind: "updated",
    updatedAt: result.updated_at,
    revisionNumber: Number(result.revision_number),
  };
}

export const storyEditorialChangeStore: StoryEditorialChangeStore = {
  applyChange: applyStoryEditorialChangeTransaction,
};

export type StoryRevisionRow = {
  revisionId: string;
  storyId: number;
  revisionNumber: number;
  snapshot: Record<string, unknown>;
  contentSchemaVersion: number;
  sourceAction: string;
  changeSummary: string | null;
  createdBy: string | null;
  createdAt: string;
};

function mapRevision(value: unknown): StoryRevisionRow {
  const row = asRecord(value);
  return {
    revisionId: stringValue(row.revision_id),
    storyId: numberValue(row.story_id),
    revisionNumber: numberValue(row.revision_number),
    snapshot: asRecord(row.snapshot),
    contentSchemaVersion: numberValue(row.content_schema_version, 1),
    sourceAction: stringValue(row.source_action),
    changeSummary: nullableString(row.change_summary),
    createdBy: nullableString(row.created_by),
    createdAt: stringValue(row.created_at),
  };
}

export async function listStoryRevisions(params: {
  storyId: number;
  page?: number;
  pageSize?: number;
}): Promise<{ items: StoryRevisionRow[]; total: number; page: number; pageSize: number }> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 20));
  const from = (page - 1) * pageSize;
  const supabase = createSupabaseServiceRoleClient();
  const { data, error, count } = await supabase
    .from("story_revisions")
    .select("*", { count: "exact" })
    .eq("story_id", params.storyId)
    .order("revision_number", { ascending: false })
    .range(from, from + pageSize - 1);

  if (error) throw new Error("STORY_REVISION_LIST_FAILED");
  return { items: (data ?? []).map(mapRevision), total: count ?? 0, page, pageSize };
}

export async function getStoryRevision(params: {
  storyId: number;
  revisionNumber: number;
}): Promise<StoryRevisionRow | null> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("story_revisions")
    .select("*")
    .eq("story_id", params.storyId)
    .eq("revision_number", params.revisionNumber)
    .maybeSingle();

  if (error) throw new Error("STORY_REVISION_READ_FAILED");
  return data ? mapRevision(data) : null;
}
