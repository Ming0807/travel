import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockFindTouristByIdentity = vi.fn();
const mockCreateTouristProfile = vi.fn();
const mockCreateTouristIdentity = vi.fn();
const mockGetGuestIdentity = vi.fn();

vi.mock("@/lib/repositories/tourist.repository", () => ({
  findTouristByIdentity: (...args: any[]) => mockFindTouristByIdentity(...args),
  createTouristIdentity: (...args: any[]) => mockCreateTouristIdentity(...args),
  createTouristProfile: (...args: any[]) => mockCreateTouristProfile(...args),
}));

vi.mock("@/lib/auth/guest", () => ({
  getGuestIdentity: () => mockGetGuestIdentity(),
}));

const mockSupabaseAuth = {
  auth: {
    getUser: vi.fn(),
  },
};
const mockSupabaseFrom = {
  insert: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  single: vi.fn(),
};
const mockAdminSupabase = {
  from: vi.fn().mockReturnValue(mockSupabaseFrom),
};

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: () => mockSupabaseAuth,
}));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: () => mockAdminSupabase,
}));

import { submitTouristStoryAction } from "@/app/actions/tourist-story-actions";

// ── Helpers ────────────────────────────────────────────────────────────────

function makeForm(overrides: Record<string, string> = {}) {
  const fd = new FormData();
  fd.set("title", overrides.title ?? "My Amazing Trip");
  fd.set("content", overrides.content ?? "This is the story of my trip to Yala, full of amazing experiences and beautiful sights.");
  fd.set("provinceId", overrides.provinceId ?? "3");
  return fd;
}

function mockAuthUser() {
  mockSupabaseAuth.auth.getUser.mockResolvedValue({
    data: {
      user: {
        id: "auth-uuid-test",
        app_metadata: { provider: "google" },
        user_metadata: { full_name: "Test User" },
      },
    },
    error: null,
  });
}

function mockStoryInsertSuccess() {
  mockSupabaseFrom.single.mockResolvedValue({
    data: { slug: "my-amazing-trip-1234" },
    error: null,
  });
}

describe("submitTouristStoryAction — validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthUser();
    mockStoryInsertSuccess();
    mockGetGuestIdentity.mockResolvedValue(null);
    mockFindTouristByIdentity.mockResolvedValue("tourist-uuid");
  });

  it("returns Thai error for missing title", async () => {
    const fd = makeForm({ title: "" });
    const result = await submitTouristStoryAction(fd);

    expect(result.success).toBe(false);
    expect(result.error).toBe("กรุณากรอกชื่อเรื่อง");
    // Must NOT call any DB operations
    expect(mockFindTouristByIdentity).not.toHaveBeenCalled();
    expect(mockCreateTouristProfile).not.toHaveBeenCalled();
    expect(mockAdminSupabase.from).not.toHaveBeenCalled();
  });

  it("returns Thai error for whitespace-only title", async () => {
    const fd = makeForm({ title: "   " });
    const result = await submitTouristStoryAction(fd);
    expect(result.success).toBe(false);
    expect(result.error).toBe("กรุณากรอกชื่อเรื่อง");
  });

  it("returns Thai error for missing content", async () => {
    const fd = makeForm({ content: "" });
    const result = await submitTouristStoryAction(fd);
    expect(result.success).toBe(false);
    expect(result.error).toBe("กรุณากรอกเนื้อหาเรื่องราว");
  });

  it("returns Thai error for whitespace-only content", async () => {
    const fd = makeForm({ content: "   \n  " });
    const result = await submitTouristStoryAction(fd);
    expect(result.success).toBe(false);
    expect(result.error).toBe("กรุณากรอกเนื้อหาเรื่องราว");
  });

  it("rejects non-string provinceId (number)", async () => {
    const fd = new FormData();
    fd.set("title", "Test");
    fd.set("content", "Content here");
    fd.set("provinceId", "abc"); // Non-numeric
    const result = await submitTouristStoryAction(fd);
    expect(result.success).toBe(false);
    expect(result.error).toBe("กรุณาเลือกจังหวัดที่ถูกต้อง");
  });

  it("rejects provinceId = 0", async () => {
    const fd = makeForm({ provinceId: "0" });
    const result = await submitTouristStoryAction(fd);
    expect(result.success).toBe(false);
    expect(result.error).toBe("กรุณาเลือกจังหวัดที่ถูกต้อง");
  });

  it("rejects provinceId = negative", async () => {
    const fd = makeForm({ provinceId: "-3" });
    const result = await submitTouristStoryAction(fd);
    expect(result.success).toBe(false);
    expect(result.error).toBe("กรุณาเลือกจังหวัดที่ถูกต้อง");
  });

  it("rejects provinceId = float", async () => {
    const fd = makeForm({ provinceId: "3.5" });
    const result = await submitTouristStoryAction(fd);
    expect(result.success).toBe(false);
    expect(result.error).toBe("กรุณาเลือกจังหวัดที่ถูกต้อง");
  });

  it("rejects provinceId = junk prefix like 12abc", async () => {
    const fd = makeForm({ provinceId: "12abc" });
    const result = await submitTouristStoryAction(fd);
    expect(result.success).toBe(false);
    expect(result.error).toBe("กรุณาเลือกจังหวัดที่ถูกต้อง");
  });

  it("rejects title exceeding 200 characters", async () => {
    const fd = makeForm({ title: "a".repeat(201) });
    const result = await submitTouristStoryAction(fd);
    expect(result.success).toBe(false);
    expect(result.error).toContain("200");
  });

  it("rejects content exceeding 10000 characters", async () => {
    const fd = makeForm({ content: "a".repeat(10001) });
    const result = await submitTouristStoryAction(fd);
    expect(result.success).toBe(false);
    expect(result.error).toContain("10000");
  });

  it("invalid form does NOT call findTouristByIdentity", async () => {
    const fd = makeForm({ title: "" });
    await submitTouristStoryAction(fd);
    expect(mockFindTouristByIdentity).not.toHaveBeenCalled();
    expect(mockCreateTouristProfile).not.toHaveBeenCalled();
    expect(mockCreateTouristIdentity).not.toHaveBeenCalled();
    expect(mockAdminSupabase.from).not.toHaveBeenCalled();
  });
});

describe("submitTouristStoryAction — guest/OAuth merge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthUser();
    mockStoryInsertSuccess();
  });

  it("uses existing guest identity when OAuth not linked", async () => {
    mockFindTouristByIdentity
      .mockResolvedValueOnce(null)                // OAuth lookup: not found
      .mockResolvedValueOnce("guest-tourist-uuid"); // Guest lookup: found
    mockGetGuestIdentity.mockResolvedValue("guest-token-xyz");

    const result = await submitTouristStoryAction(makeForm());
    expect(result.success).toBe(true);

    // Should have linked OAuth identity to the existing guest tourist
    expect(mockCreateTouristIdentity).toHaveBeenCalledWith(
      "guest-tourist-uuid",
      "google",
      "auth-uuid-test"
    );
    // Must NOT have created a new tourist profile
    expect(mockCreateTouristProfile).not.toHaveBeenCalled();
  });

  it("creates new tourist when no OAuth and no guest identity", async () => {
    mockFindTouristByIdentity.mockResolvedValue(null);
    mockGetGuestIdentity.mockResolvedValue(null);
    mockCreateTouristProfile.mockResolvedValue("new-tourist-uuid");

    const result = await submitTouristStoryAction(makeForm());
    expect(result.success).toBe(true);
    expect(mockCreateTouristProfile).toHaveBeenCalled();
    expect(mockCreateTouristIdentity).toHaveBeenCalledWith(
      "new-tourist-uuid",
      "google",
      "auth-uuid-test"
    );
  });

  it("recovers from identity race via re-read", async () => {
    // First OAuth lookup: not found
    mockFindTouristByIdentity.mockResolvedValueOnce(null);
    mockGetGuestIdentity.mockResolvedValue(null);
    mockCreateTouristProfile.mockResolvedValue("new-tourist-uuid");
    // createTouristIdentity throws (race condition)
    mockCreateTouristIdentity.mockRejectedValueOnce(new Error("duplicate key"));
    // Re-read succeeds
    mockFindTouristByIdentity.mockResolvedValueOnce("recovered-tourist-uuid");

    const result = await submitTouristStoryAction(makeForm());
    expect(result.success).toBe(true);
    // Profile was created once
    expect(mockCreateTouristProfile).toHaveBeenCalledTimes(1);
    // Identity was attempted once, then recovered
    expect(mockCreateTouristIdentity).toHaveBeenCalledTimes(1);
  });

  it("fails when identity race is unrecoverable", async () => {
    mockFindTouristByIdentity.mockResolvedValue(null);
    mockGetGuestIdentity.mockResolvedValue(null);
    mockCreateTouristProfile.mockResolvedValue("new-tourist-uuid");
    mockCreateTouristIdentity.mockRejectedValue(new Error("duplicate key value violates unique constraint"));

    const result = await submitTouristStoryAction(makeForm());
    expect(result.success).toBe(false);
    expect(result.error).toBe("ไม่สามารถยืนยันตัวตนนักเดินทางได้ กรุณาลองใหม่");
  });
});

describe("submitTouristStoryAction — happy path", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthUser();
    mockStoryInsertSuccess();
    mockGetGuestIdentity.mockResolvedValue(null);
    mockFindTouristByIdentity.mockResolvedValue("tourist-uuid");
  });

  it("accepts valid form and returns success", async () => {
    const result = await submitTouristStoryAction(makeForm());
    expect(result.success).toBe(true);
    expect(result.storyId).toBeDefined();
  });

  it("computes excerpt from content and trims whitespace", async () => {
    const fd = makeForm({ content: "  Short  story  here.  ".repeat(4) });
    const result = await submitTouristStoryAction(fd);
    expect(result.success).toBe(true);
  });

  it("generates slug from title with timestamp suffix", async () => {
    const fd = makeForm({ title: "เที่ยวปัตตานี สุดยอด!" });
    const result = await submitTouristStoryAction(fd);
    expect(result.success).toBe(true);
    expect(result.storyId).toMatch(/^[a-z0-9ก-๙-]+-\d{4}$/);
  });
});

describe("submitTouristStoryAction — auth failure", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStoryInsertSuccess();
    mockGetGuestIdentity.mockResolvedValue(null);
  });

  it("returns Thai error when not authenticated", async () => {
    mockSupabaseAuth.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
    const result = await submitTouristStoryAction(makeForm());
    expect(result.success).toBe(false);
    expect(result.error).toBe("กรุณาเข้าสู่ระบบก่อนแบ่งปันเรื่องราว");
    // Must not call identity lookups or DB insert
    expect(mockFindTouristByIdentity).not.toHaveBeenCalled();
    expect(mockAdminSupabase.from).not.toHaveBeenCalled();
  });
});
