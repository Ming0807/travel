import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { firstJoin } from "@/lib/utils/supabase-joins";
import { asRecord, nullableString, stringValue } from "@/lib/utils/record";

export type ContentReadinessCount = {
  total: number;
  ready: number;
};

export type AdminOperationsAuditRow = {
  id: string;
  action: string;
  entityType: string | null;
  actorName: string;
  createdAt: string;
};

type CountResponse = {
  count: number | null;
  error: { message?: string } | null;
};

async function exactCount(
  metric: string,
  query: PromiseLike<CountResponse>,
): Promise<number> {
  const { count, error } = await query;
  if (error) {
    throw new Error(`ADMIN_OPERATIONS_${metric}_FAILED`);
  }
  return count ?? 0;
}

async function readiness(
  metric: string,
  totalQuery: PromiseLike<CountResponse>,
  readyQuery: PromiseLike<CountResponse>,
): Promise<ContentReadinessCount> {
  const [total, ready] = await Promise.all([
    exactCount(`${metric}_TOTAL`, totalQuery),
    exactCount(`${metric}_READY`, readyQuery),
  ]);
  return { total, ready };
}

export type AdminOperationsRepository = {
  countPendingTouristStories(): Promise<number>;
  countScheduledStories(start: string, end: string): Promise<number>;
  countUnreadMessages(): Promise<number>;
  countPendingReviews(): Promise<number>;
  countExpiredCheckinCodes(now: string): Promise<number>;
  countMissingMediaAltText(): Promise<number>;
  countTodayVisits(start: string, end: string): Promise<number>;
  countTodayCertificates(start: string, end: string): Promise<number>;
  countTodaySurveys(start: string, end: string): Promise<number>;
  countTodayAbandonedVisits(start: string, end: string): Promise<number>;
  getAttractionReadiness(): Promise<ContentReadinessCount>;
  getStoryReadiness(): Promise<ContentReadinessCount>;
  getRouteReadiness(): Promise<ContentReadinessCount>;
  getMediaReadiness(): Promise<ContentReadinessCount>;
  listRecentAuditActivity(limit: number): Promise<AdminOperationsAuditRow[]>;
};

export const adminOperationsRepository: AdminOperationsRepository = {
  countPendingTouristStories() {
    const supabase = createSupabaseServiceRoleClient();
    return exactCount(
      "PENDING_TOURIST_STORIES",
      supabase
        .from("travel_stories")
        .select("story_id", { count: "exact", head: true })
        .eq("author_type", "tourist")
        .eq("status", "submitted"),
    );
  },

  countScheduledStories(start, end) {
    const supabase = createSupabaseServiceRoleClient();
    return exactCount(
      "SCHEDULED_STORIES",
      supabase
        .from("travel_stories")
        .select("story_id", { count: "exact", head: true })
        .eq("status", "scheduled")
        .gte("scheduled_at", start)
        .lt("scheduled_at", end),
    );
  },

  countUnreadMessages() {
    const supabase = createSupabaseServiceRoleClient();
    return exactCount(
      "UNREAD_MESSAGES",
      supabase
        .from("contact_messages")
        .select("id", { count: "exact", head: true })
        .eq("status", "unread"),
    );
  },

  countPendingReviews() {
    const supabase = createSupabaseServiceRoleClient();
    return exactCount(
      "PENDING_REVIEWS",
      supabase
        .from("reviews")
        .select("review_id", { count: "exact", head: true })
        .eq("is_approved", false)
        .is("deleted_at", null),
    );
  },

  countExpiredCheckinCodes(now) {
    const supabase = createSupabaseServiceRoleClient();
    return exactCount(
      "EXPIRED_CHECKIN_CODES",
      supabase
        .from("checkin_codes")
        .select("checkin_code_id", { count: "exact", head: true })
        .eq("is_active", true)
        .not("ends_at", "is", null)
        .lt("ends_at", now),
    );
  },

  countMissingMediaAltText() {
    const supabase = createSupabaseServiceRoleClient();
    return exactCount(
      "MISSING_MEDIA_ALT_TEXT",
      supabase
        .from("content_media")
        .select("media_id", { count: "exact", head: true })
        .eq("is_active", true)
        .eq("lifecycle_status", "active")
        .in("media_type", ["image", "panorama"])
        .or("alt_text_th.is.null,alt_text_th.eq."),
    );
  },

  countTodayVisits(start, end) {
    const supabase = createSupabaseServiceRoleClient();
    return exactCount(
      "TODAY_VISITS",
      supabase
        .from("visits")
        .select("visit_id", { count: "exact", head: true })
        .gte("created_at", start)
        .lt("created_at", end),
    );
  },

  countTodayCertificates(start, end) {
    const supabase = createSupabaseServiceRoleClient();
    return exactCount(
      "TODAY_CERTIFICATES",
      supabase
        .from("certificates")
        .select("certificate_id", { count: "exact", head: true })
        .gte("generated_at", start)
        .lt("generated_at", end),
    );
  },

  countTodaySurveys(start, end) {
    const supabase = createSupabaseServiceRoleClient();
    return exactCount(
      "TODAY_SURVEYS",
      supabase
        .from("satisfaction_surveys")
        .select("survey_id", { count: "exact", head: true })
        .gte("submitted_at", start)
        .lt("submitted_at", end),
    );
  },

  countTodayAbandonedVisits(start, end) {
    const supabase = createSupabaseServiceRoleClient();
    return exactCount(
      "TODAY_ABANDONED_VISITS",
      supabase
        .from("visits")
        .select("visit_id", { count: "exact", head: true })
        .eq("completion_status", "abandoned")
        .gte("created_at", start)
        .lt("created_at", end),
    );
  },

  getAttractionReadiness() {
    const supabase = createSupabaseServiceRoleClient();
    return readiness(
      "ATTRACTIONS",
      supabase
        .from("attractions")
        .select("attraction_id", { count: "exact", head: true })
        .eq("is_active", true),
      supabase
        .from("attractions")
        .select("attraction_id", { count: "exact", head: true })
        .eq("is_active", true)
        .eq("is_published", true),
    );
  },

  getStoryReadiness() {
    const supabase = createSupabaseServiceRoleClient();
    return readiness(
      "STORIES",
      supabase
        .from("travel_stories")
        .select("story_id", { count: "exact", head: true })
        .neq("status", "archived"),
      supabase
        .from("travel_stories")
        .select("story_id", { count: "exact", head: true })
        .eq("status", "published"),
    );
  },

  getRouteReadiness() {
    const supabase = createSupabaseServiceRoleClient();
    return readiness(
      "ROUTES",
      supabase
        .from("suggested_routes")
        .select("route_id", { count: "exact", head: true })
        .eq("is_active", true),
      supabase
        .from("suggested_routes")
        .select("route_id", { count: "exact", head: true })
        .eq("is_active", true)
        .eq("is_published", true),
    );
  },

  getMediaReadiness() {
    const supabase = createSupabaseServiceRoleClient();
    const activeMedia = () => supabase
      .from("content_media")
      .select("media_id", { count: "exact", head: true })
      .eq("is_active", true)
      .eq("lifecycle_status", "active")
      .in("media_type", ["image", "panorama"]);

    return readiness(
      "MEDIA",
      activeMedia(),
      activeMedia().not("alt_text_th", "is", null).neq("alt_text_th", ""),
    );
  },

  async listRecentAuditActivity(limit) {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from("audit_logs")
      .select(`
        log_id,
        action,
        entity_type,
        created_at,
        admin_users (display_name)
      `)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error("ADMIN_OPERATIONS_RECENT_AUDIT_FAILED");
    }

    return (data ?? []).map((raw) => {
      const row = asRecord(raw);
      const admin = asRecord(firstJoin(
        row.admin_users as { display_name?: unknown } | { display_name?: unknown }[] | null,
      ));
      return {
        id: stringValue(row.log_id),
        action: stringValue(row.action),
        entityType: nullableString(row.entity_type),
        actorName: nullableString(admin.display_name) ?? "ระบบ",
        createdAt: stringValue(row.created_at),
      };
    });
  },
};
