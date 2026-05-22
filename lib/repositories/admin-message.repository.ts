import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export async function getContactMessages({
  page = 1,
  limit = 20,
  status,
  search,
}: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  const supabase = createSupabaseServiceRoleClient();
  let query = supabase
    .from("contact_messages")
    .select("*", { count: "exact" });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,subject.ilike.%${search}%`);
  }

  // Order by created_at descending
  query = query.order("created_at", { ascending: false });

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error("getContactMessages error:", error);
    throw new Error("Failed to fetch messages");
  }

  return {
    messages: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0,
  };
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
  const updates: any = { status };

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
