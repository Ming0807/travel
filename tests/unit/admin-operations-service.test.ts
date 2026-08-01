import { describe, expect, it, vi } from "vitest";
import type { AdminActor } from "@/lib/auth/guards";
import type { AdminOperationsRepository } from "@/lib/repositories/admin-operations.repository";
import {
  buildBangkokDayRange,
  getAdminOperationsViewModel,
} from "@/lib/services/admin-operations.service";

function actor(permissions: AdminActor["permissions"]): AdminActor {
  return {
    adminId: "admin-1",
    authUserId: "auth-1",
    email: "admin@example.com",
    displayName: "ผู้ดูแลทดสอบ",
    roleNames: ["admin"],
    permissions,
  };
}

function repository(
  overrides: Partial<AdminOperationsRepository> = {},
): AdminOperationsRepository {
  return {
    countPendingTouristStories: vi.fn().mockResolvedValue(3),
    countScheduledStories: vi.fn().mockResolvedValue(2),
    countUnreadMessages: vi.fn().mockResolvedValue(4),
    countPendingReviews: vi.fn().mockResolvedValue(5),
    countExpiredCheckinCodes: vi.fn().mockResolvedValue(1),
    countMissingMediaAltText: vi.fn().mockResolvedValue(6),
    countTodayVisits: vi.fn().mockResolvedValue(20),
    countTodayCertificates: vi.fn().mockResolvedValue(12),
    countTodaySurveys: vi.fn().mockResolvedValue(8),
    countTodayAbandonedVisits: vi.fn().mockResolvedValue(2),
    getAttractionReadiness: vi.fn().mockResolvedValue({ total: 10, ready: 7 }),
    getStoryReadiness: vi.fn().mockResolvedValue({ total: 12, ready: 8 }),
    getRouteReadiness: vi.fn().mockResolvedValue({ total: 6, ready: 4 }),
    getMediaReadiness: vi.fn().mockResolvedValue({ total: 30, ready: 24 }),
    listRecentAuditActivity: vi.fn().mockResolvedValue([
      {
        id: "audit-1",
        action: "story.publish",
        entityType: "story",
        actorName: "ผู้ดูแลทดสอบ",
        createdAt: "2026-08-01T02:00:00.000Z",
      },
    ]),
    ...overrides,
  };
}

describe("admin operations service", () => {
  it("queries and returns only operations allowed by the actor permissions", async () => {
    const repo = repository();

    const result = await getAdminOperationsViewModel(
      actor(["story.read", "story.review", "message.read"]),
      { now: new Date("2026-08-01T03:00:00.000Z"), repository: repo },
    );

    expect(repo.countPendingTouristStories).toHaveBeenCalledOnce();
    expect(repo.countScheduledStories).toHaveBeenCalledOnce();
    expect(repo.countUnreadMessages).toHaveBeenCalledOnce();
    expect(repo.countPendingReviews).not.toHaveBeenCalled();
    expect(repo.countTodayVisits).not.toHaveBeenCalled();
    expect(repo.listRecentAuditActivity).not.toHaveBeenCalled();
    expect(result.summaryMetrics.map((metric) => metric.id)).toEqual([
      "action-required",
      "pending-stories",
      "unread-messages",
      "scheduled-stories",
    ]);
    expect(result.actionRequiredCount).toBe(7);
    expect(result.modules.flatMap((group) => group.items).map((item) => item.href)).toEqual([
      "/admin/stories",
      "/admin/messages",
    ]);
  });

  it("prioritizes expired QR codes before editorial and metadata work", async () => {
    const repo = repository();

    const result = await getAdminOperationsViewModel(actor(["system.all"]), {
      now: new Date("2026-08-01T03:00:00.000Z"),
      repository: repo,
    });

    expect(result.priorityQueue.map((item) => item.id)).toEqual([
      "expired-checkin-codes",
      "abandoned-visits",
      "pending-stories",
      "pending-reviews",
      "unread-messages",
      "missing-media-alt",
    ]);
    expect(result.todayMetrics).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "visits-today", value: 20 }),
      expect.objectContaining({ id: "certificates-today", value: 12 }),
      expect.objectContaining({ id: "surveys-today", value: 8 }),
    ]));
    expect(result.contentReadiness).toHaveLength(4);
    expect(result.recentActivity).toHaveLength(1);
    expect(result.quickActions.map((action) => action.href)).toEqual(expect.arrayContaining([
      "/admin/attractions/new",
      "/admin/stories/new",
      "/admin/checkin-codes/new",
    ]));
  });

  it("keeps the page usable and reports partial data when one bounded query fails", async () => {
    const repo = repository({
      countUnreadMessages: vi.fn().mockRejectedValue(new Error("database unavailable")),
    });

    const result = await getAdminOperationsViewModel(
      actor(["story.read", "story.review", "message.read"]),
      { now: new Date("2026-08-01T03:00:00.000Z"), repository: repo },
    );

    expect(result.unavailableCount).toBe(1);
    expect(result.summaryMetrics).toContainEqual(expect.objectContaining({
      id: "unread-messages",
      value: null,
    }));
    expect(result.priorityQueue.some((item) => item.id === "unread-messages")).toBe(false);
  });

  it("builds today boundaries in Thailand time rather than server UTC", () => {
    expect(buildBangkokDayRange(new Date("2026-08-01T20:30:00.000Z"))).toEqual({
      start: "2026-08-01T17:00:00.000Z",
      end: "2026-08-02T17:00:00.000Z",
    });
  });
});
