"use server";

import { requireAdmin } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";
import {
  getContactMessages,
  getContactMessageById,
  updateMessageStatus,
  markMessageAsReplied,
  deleteContactMessage,
} from "@/lib/repositories/admin-message.repository";

export async function listAdminMessages(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  await requireAdmin();
  return getContactMessages(params);
}

export async function getAdminMessage(id: string) {
  const admin = await requireAdmin();
  const message = await getContactMessageById(id);
  
  if (!message) return null;

  // Auto-mark as read if unread
  if (message.status === "unread") {
    await updateMessageStatus(id, "read", admin.adminId);
    message.status = "read";
    message.read_at = new Date().toISOString();
    message.read_by = admin.adminId;
    revalidatePath("/admin/messages");
  }

  return message;
}

export async function setAdminMessageStatus(id: string, status: "unread" | "read" | "archived") {
  const admin = await requireAdmin();
  await updateMessageStatus(id, status, admin.adminId);
  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${id}`);
}

export async function toggleAdminMessageReplied(id: string, isReplied: boolean) {
  await requireAdmin();
  await markMessageAsReplied(id, isReplied);
  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${id}`);
}

export async function removeAdminMessage(id: string) {
  await requireAdmin();
  await deleteContactMessage(id);
  revalidatePath("/admin/messages");
}
