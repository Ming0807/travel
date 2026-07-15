import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  requirePermission: vi.fn(),
  hasPermission: vi.fn(),
  getContactMessages: vi.fn(),
  getContactMessageById: vi.fn(),
  updateMessageStatus: vi.fn(),
  markMessageAsReplied: vi.fn(),
  deleteContactMessage: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/lib/auth/guards", () => ({
  requireAdmin: mocks.requireAdmin,
  requirePermission: mocks.requirePermission,
  hasPermission: mocks.hasPermission,
}));

vi.mock("@/lib/repositories/admin-message.repository", () => ({
  getContactMessages: mocks.getContactMessages,
  getContactMessageById: mocks.getContactMessageById,
  updateMessageStatus: mocks.updateMessageStatus,
  markMessageAsReplied: mocks.markMessageAsReplied,
  deleteContactMessage: mocks.deleteContactMessage,
}));

import {
  getAdminMessage,
  listAdminMessages,
  removeAdminMessage,
  setAdminMessageStatus,
  toggleAdminMessageReplied,
} from "@/app/actions/admin-messages";

const guard = {
  adminId: "admin-1",
  actor: {
    adminId: "admin-1",
    permissions: ["message.read"],
  },
};

describe("admin message actions authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue(guard);
    mocks.requirePermission.mockResolvedValue(guard);
    mocks.hasPermission.mockReturnValue(false);
    mocks.getContactMessages.mockResolvedValue({ messages: [], total: 0, page: 1, limit: 20, totalPages: 0 });
    mocks.getContactMessageById.mockResolvedValue({
      id: "message-1",
      name: "Visitor",
      email: "visitor@example.test",
      subject: "Question",
      message: "Hello",
      status: "read",
      is_replied: false,
      read_at: null,
      read_by: null,
      created_at: "2026-07-01T09:00:00.000Z",
    });
  });

  it("requires message read permission before listing contact messages", async () => {
    await listAdminMessages({});

    expect(mocks.requirePermission).toHaveBeenCalledWith("message.read");
    expect(mocks.requireAdmin).not.toHaveBeenCalled();
  });

  it("requires message read permission before reading a message detail", async () => {
    await getAdminMessage("message-1");

    expect(mocks.requirePermission).toHaveBeenCalledWith("message.read");
    expect(mocks.requireAdmin).not.toHaveBeenCalled();
  });

  it("does not auto-mark unread messages as read without manage permission", async () => {
    mocks.getContactMessageById.mockResolvedValueOnce({
      id: "message-1",
      name: "Visitor",
      email: "visitor@example.test",
      subject: "Question",
      message: "Hello",
      status: "unread",
      is_replied: false,
      read_at: null,
      read_by: null,
      created_at: "2026-07-01T09:00:00.000Z",
    });

    const message = await getAdminMessage("message-1");

    expect(message?.status).toBe("unread");
    expect(mocks.updateMessageStatus).not.toHaveBeenCalled();
  });

  it("requires message update permission before changing message status", async () => {
    await setAdminMessageStatus("message-1", "archived");

    expect(mocks.requirePermission).toHaveBeenCalledWith("message.update");
    expect(mocks.updateMessageStatus).toHaveBeenCalledWith("message-1", "archived", "admin-1");
  });

  it("requires message update permission before marking a message replied", async () => {
    await toggleAdminMessageReplied("message-1", true);

    expect(mocks.requirePermission).toHaveBeenCalledWith("message.update");
    expect(mocks.markMessageAsReplied).toHaveBeenCalledWith("message-1", true);
  });

  it("requires message delete permission before deleting a message", async () => {
    await removeAdminMessage("message-1");

    expect(mocks.requirePermission).toHaveBeenCalledWith("message.delete");
    expect(mocks.deleteContactMessage).toHaveBeenCalledWith("message-1");
  });
});
