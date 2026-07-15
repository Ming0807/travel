import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import {
  buildContactMessageSearchFilter,
  type AdminMessageExportFilters,
  type AdminMessageQuery,
  type ContactMessageRow,
} from "@/lib/validation/admin-message";

export async function getContactMessages({
  page = 1,
  pageSize = 20,
  status,
  search,
  sort = "newest",
}: AdminMessageQuery) {
  const supabase = createSupabaseServiceRoleClient();
  let query = supabase
    .from("contact_messages")
    .select("*", { count: "exact" });

  query = applyContactMessageFiltersAndSort(query, { status, search, sort });

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error("getContactMessages error:", error);
    throw new Error("Failed to fetch messages");
  }

  return {
    messages: (data || []) as ContactMessageRow[],
    total: count || 0,
    page,
    limit: pageSize,
    pageSize,
    totalPages: count ? Math.ceil(count / pageSize) : 0,
  };
}

type ContactMessageFilterQuery<T> = {
  eq(column: string, value: unknown): T;
  or(filters: string): T;
  order(column: string, options: { ascending: boolean }): T;
};

function applyContactMessageFiltersAndSort<T extends ContactMessageFilterQuery<T>>(
  query: T,
  filters: AdminMessageExportFilters
): T {
  let filteredQuery = query;

  if (filters.status !== "all") {
    filteredQuery = filteredQuery.eq("status", filters.status);
  }

  if (filters.search) {
    filteredQuery = filteredQuery.or(buildContactMessageSearchFilter(filters.search));
  }

  return filteredQuery.order("created_at", { ascending: filters.sort === "oldest" });
}

export async function exportContactMessages(
  filters: AdminMessageExportFilters,
  limit: number
): Promise<ContactMessageRow[]> {
  const supabase = createSupabaseServiceRoleClient();
  let query = supabase
    .from("contact_messages")
    .select("*");

  query = applyContactMessageFiltersAndSort(query, filters);
  const { data, error } = await query.limit(limit);

  if (error) {
    console.error("exportContactMessages error:", error);
    throw new Error("Failed to export messages");
  }

  return (data || []) as ContactMessageRow[];
}

export async function getContactMessageById(id: string) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("getContactMessageById error:", error);
    return null;
  }

  return data;
}

export async function updateMessageStatus(id: string, status: "unread" | "read" | "archived", adminId: string) {
  const supabase = createSupabaseServiceRoleClient();
  const updates: {
    status: "unread" | "read" | "archived";
    read_at?: string;
    read_by?: string;
  } = { status };

  if (status === "read") {
    updates.read_at = new Date().toISOString();
    updates.read_by = adminId;
  }

  const { error } = await supabase
    .from("contact_messages")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("updateMessageStatus error:", error);
    throw new Error("Failed to update message status");
  }
}

export async function markMessageAsReplied(id: string, isReplied: boolean) {
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase
    .from("contact_messages")
    .update({ is_replied: isReplied })
    .eq("id", id);

  if (error) {
    console.error("markMessageAsReplied error:", error);
    throw new Error("Failed to mark message as replied");
  }
}

export async function deleteContactMessage(id: string) {
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase
    .from("contact_messages")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteContactMessage error:", error);
    throw new Error("Failed to delete message");
  }
}

export async function getUnreadMessagesCount() {
  const supabase = createSupabaseServiceRoleClient();
  const { count, error } = await supabase
    .from("contact_messages")
    .select("*", { count: "exact", head: true })
    .eq("status", "unread");

  if (error) {
    console.error("getUnreadMessagesCount error:", error);
    return 0;
  }

  return count || 0;
}
