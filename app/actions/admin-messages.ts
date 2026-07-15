"use server";

import { hasPermission, requirePermission } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";
import {
  getContactMessages,
  getContactMessageById,
  updateMessageStatus,
  markMessageAsReplied,
  deleteContactMessage,
} from "@/lib/repositories/admin-message.repository";
import { adminMessageQuerySchema, type AdminMessageQuery } from "@/lib/validation/admin-message";

const MESSAGE_READ_PERMISSION = "message.read";
const MESSAGE_UPDATE_PERMISSION = "message.update";
const MESSAGE_DELETE_PERMISSION = "message.delete";

export async function listAdminMessages(params: Partial<AdminMessageQuery>) {
  await requirePermission(MESSAGE_READ_PERMISSION);
  const filters = adminMessageQuerySchema.parse(params);
  return getContactMessages(filters);
}

export async function getAdminMessage(id: string) {
  const admin = await requirePermission(MESSAGE_READ_PERMISSION);
  const message = await getContactMessageById(id);
  
  if (!message) return null;

  if (message.status === "unread" && hasPermission(admin.actor, MESSAGE_UPDATE_PERMISSION)) {
    await updateMessageStatus(id, "read", admin.adminId);
    message.status = "read";
    message.read_at = new Date().toISOString();
    message.read_by = admin.adminId;
    revalidatePath("/admin/messages");
  }

  return message;
}

export async function setAdminMessageStatus(id: string, status: "unread" | "read" | "archived") {
  const admin = await requirePermission(MESSAGE_UPDATE_PERMISSION);
  await updateMessageStatus(id, status, admin.adminId);
  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${id}`);
}

export async function toggleAdminMessageReplied(id: string, isReplied: boolean) {
  await requirePermission(MESSAGE_UPDATE_PERMISSION);
  await markMessageAsReplied(id, isReplied);
  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${id}`);
}

export async function removeAdminMessage(id: string) {
  await requirePermission(MESSAGE_DELETE_PERMISSION);
  await deleteContactMessage(id);
  revalidatePath("/admin/messages");
}
