import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockResolveCurrentTouristId = vi.fn();

vi.mock("@/lib/auth/guards", () => ({
  resolveCurrentTouristId: () => mockResolveCurrentTouristId(),
  TouristAccessError: class extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
      this.name = "TouristAccessError";
    }
  },
}));

const mockSupabaseAuth = {
  auth: {
    getUser: vi.fn(),
  },
};

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: () => mockSupabaseAuth,
}));

type InsertPayload = Record<string, unknown>;

const mockSupabaseFromChain = {
  insert: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),
  or: vi.fn().mockReturnThis(),
  single: vi.fn(),
  maybeSingle: vi.fn(),
};

const mockAdminSupabase = {
  from: vi.fn().mockReturnValue(mockSupabaseFromChain),
};

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
      user: { id: "auth-uuid-test", app_metadata: {}, user_metadata: {} },
    },
    error: null,
  });
}

function mockIdentityResolved() {
  mockResolveCurrentTouristId.mockResolvedValue("tourist-uuid-resolved");
}

function mockProvinceExists() {
  mockSupabaseFromChain.maybeSingle.mockResolvedValue({ data: { province_id: 3 }, error: null });
}

function mockStoryInsertSuccess() {
  mockSupabaseFromChain.single.mockResolvedValue({
    data: { slug: "my-amazing-trip-1234" },
    error: null,
  });
}

function getInsertPayload(): InsertPayload {
  return (mockSupabaseFromChain.insert as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] ?? {};
}

describe("submitTouristStoryAction — validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthUser();
    mockIdentityResolved();
    mockProvinceExists();
    mockStoryInsertSuccess();
  });

  it("returns Thai error for missing title", async () => {
    const fd = makeForm({ title: "" });
    const result = await submitTouristStoryAction(fd);
    expect(result.success).toBe(false);
    expect(result.error).toBe("กรุณากรอกชื่อเรื่อง");
    expect(mockResolveCurrentTouristId).not.toHaveBeenCalled();
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

  it("rejects provinceId = exponent notation 1e2", async () => {
    const fd = makeForm({ provinceId: "1e2" });
    const result = await submitTouristStoryAction(fd);
    expect(result.success).toBe(false);
  });

  it("rejects provinceId = hex notation 0x10", async () => {
    const fd = makeForm({ provinceId: "0x10" });
    const result = await submitTouristStoryAction(fd);
    expect(result.success).toBe(false);
  });

  it("rejects provinceId = whitespace-only", async () => {
    const fd = makeForm({ provinceId: "   " });
    const result = await submitTouristStoryAction(fd);
    expect(result.success).toBe(false);
  });

  it("rejects provinceId = junk prefix like 12abc", async () => {
    const fd = makeForm({ provinceId: "12abc" });
    const result = await submitTouristStoryAction(fd);
    expect(result.success).toBe(false);
    expect(result.error).toBe("กรุณาเลือกจังหวัดที่ถูกต้อง");
  });

  it("rejects provinceId = NaN string", async () => {
    const fd = makeForm({ provinceId: "NaN" });
    const result = await submitTouristStoryAction(fd);
    expect(result.success).toBe(false);
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

  it("invalid form does NOT call identity lookup or DB insert", async () => {
    const fd = makeForm({ title: "" });
    await submitTouristStoryAction(fd);
    expect(mockResolveCurrentTouristId).not.toHaveBeenCalled();
    expect(mockAdminSupabase.from).not.toHaveBeenCalled();
  });
});

describe("submitTouristStoryAction — XSS protection (entity decode + tag strip)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthUser();
    mockIdentityResolved();
    mockProvinceExists();
    mockStoryInsertSuccess();
  });

  it("strips <script> tags from content", async () => {
    const fd = makeForm({ content: "Hello <script>alert('xss')</script> World" });
    await submitTouristStoryAction(fd);
    const payload = getInsertPayload();
    expect(payload.content).toBe("Hello alert('xss') World");
    expect(payload.excerpt).not.toContain("script");
  });

  it("strips event handler attributes", async () => {
    const fd = makeForm({ content: '<img src=x onerror="alert(1)">Photo' });
    await submitTouristStoryAction(fd);
    const payload = getInsertPayload();
    expect(payload.content).not.toContain("onerror");
    expect(payload.content).not.toContain("alert");
    expect(payload.content).toBe("Photo");
  });

  it("strips javascript: URLs", async () => {
    const fd = makeForm({ content: '<a href="javascript:void(0)">link</a>' });
    await submitTouristStoryAction(fd);
    const payload = getInsertPayload();
    expect(payload.content).not.toContain("javascript:");
    expect(payload.content).not.toContain("<a");
    expect(payload.content).toBe("link");
  });

  it("strips iframe tags", async () => {
    const fd = makeForm({ content: 'Before <iframe src="http://evil"></iframe> After' });
    await submitTouristStoryAction(fd);
    const payload = getInsertPayload();
    expect(payload.content).not.toContain("iframe");
    expect(payload.content).toBe("Before  After");
  });

  it("strips object/embed tags", async () => {
    const fd = makeForm({ content: '<object data="x"></object><embed src="y"> text' });
    await submitTouristStoryAction(fd);
    const payload = getInsertPayload();
    expect(payload.content).not.toContain("object");
    expect(payload.content).not.toContain("embed");
    expect(payload.content).toContain("text");
  });

  it("handles malformed HTML gracefully", async () => {
    const fd = makeForm({ content: "text <unclosed <b>bold</b> more <<<" });
    await submitTouristStoryAction(fd);
    const payload = getInsertPayload();
    expect(payload.content).toBe("text bold more <<<");
  });

  it("preserves legitimate plain text with Thai characters", async () => {
    const fd = makeForm({ content: "เที่ยวปัตตานี สุดยอด! 👍" });
    await submitTouristStoryAction(fd);
    const payload = getInsertPayload();
    expect(payload.content).toBe("เที่ยวปัตตานี สุดยอด! 👍");
  });

  it("strips entity-encoded img tag: &lt;img src=x onerror=alert(1)&gt;", async () => {
    const fd = makeForm({ content: "&lt;img src=x onerror=alert(1)&gt;" });
    await submitTouristStoryAction(fd);
    const payload = getInsertPayload();
    expect(payload.content).not.toContain("<img");
    expect(payload.content).not.toContain("onerror");
    expect(payload.content).not.toContain("alert");
  });

  it("strips entity-encoded script tag: &#60;script&#62;alert(1)&#60;/script&#62;", async () => {
    const fd = makeForm({ content: "&#60;script&#62;alert(1)&#60;/script&#62;" });
    await submitTouristStoryAction(fd);
    const payload = getInsertPayload();
    // Tags are stripped; inner text remains but is harmless without <script> wrapper
    expect(payload.content).not.toContain("<script");
    expect(payload.content).not.toContain("</script");
  });

  it("strips entity-encoded anchor with javascript: URL", async () => {
    const fd = makeForm({ content: '&lt;a href=&quot;javascript:alert(1)&quot;&gt;click&lt;/a&gt;' });
    await submitTouristStoryAction(fd);
    const payload = getInsertPayload();
    expect(payload.content).not.toContain("javascript:");
    expect(payload.content).not.toContain("<a");
    expect(payload.content).toBe("click");
  });

  it("strips hex entity-encoded img tag: &#x3c;img src=x onerror=alert(1)&#x3e;", async () => {
    const fd = makeForm({ content: "&#x3c;img src=x onerror=alert(1)&#x3e;" });
    await submitTouristStoryAction(fd);
    const payload = getInsertPayload();
    expect(payload.content).not.toContain("<img");
    expect(payload.content).not.toContain("onerror");
    expect(payload.content).not.toContain("alert");
  });

  it("strips uppercase hex entity-encoded script: &#X3C;script&#X3E;alert(1)&#X3C;/script&#X3E;", async () => {
    const fd = makeForm({ content: "&#X3C;script&#X3E;alert(1)&#X3C;/script&#X3E;" });
    await submitTouristStoryAction(fd);
    const payload = getInsertPayload();
    expect(payload.content).not.toContain("<script");
    expect(payload.content).not.toContain("</script");
  });

  it("strips uppercase named entity: &LT;img src=x onerror=alert(1)&GT;", async () => {
    const fd = makeForm({ content: "&LT;img src=x onerror=alert(1)&GT;" });
    await submitTouristStoryAction(fd);
    const payload = getInsertPayload();
    expect(payload.content).not.toContain("<img");
    expect(payload.content).not.toContain("onerror");
  });

  it("strips double-encoded script: &amp;lt;script&amp;gt;alert(1)&amp;lt;/script&amp;gt;", async () => {
    const fd = makeForm({ content: "&amp;lt;script&amp;gt;alert(1)&amp;lt;/script&amp;gt;" });
    await submitTouristStoryAction(fd);
    const payload = getInsertPayload();
    // After 3-pass decode: &amp;lt; → &lt; → < — all tags stripped
    expect(payload.content).not.toContain("<script");
    expect(payload.content).not.toContain("</script");
    expect(payload.content).not.toContain("&lt;");
  });
});

describe("submitTouristStoryAction — identity resolution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthUser();
    mockProvinceExists();
    mockStoryInsertSuccess();
  });

  it("resolves tourist via resolveCurrentTouristId", async () => {
    mockIdentityResolved();
    const result = await submitTouristStoryAction(makeForm());
    expect(result.success).toBe(true);
    expect(mockResolveCurrentTouristId).toHaveBeenCalled();
  });

  it("returns Thai error when no tourist identity found", async () => {
    mockResolveCurrentTouristId.mockRejectedValue(
      new (await import("@/lib/auth/guards")).TouristAccessError("TOURIST_IDENTITY_NOT_FOUND", "ไม่พบข้อมูลพาสปอร์ต")
    );
    const result = await submitTouristStoryAction(makeForm());
    expect(result.success).toBe(false);
    expect(result.error).toBe("ไม่พบพาสปอร์ตของคุณ กรุณาเข้าสู่ระบบใหม่หรือสร้างพาสปอร์ตก่อน");
    expect(mockSupabaseFromChain.insert).not.toHaveBeenCalled();
  });
});

describe("submitTouristStoryAction — province verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthUser();
    mockIdentityResolved();
    mockStoryInsertSuccess();
  });

  it("returns error when province does not exist", async () => {
    mockSupabaseFromChain.maybeSingle.mockResolvedValue({ data: null, error: null });
    const result = await submitTouristStoryAction(makeForm({ provinceId: "999" }));
    expect(result.success).toBe(false);
    expect(result.error).toBe("ไม่พบจังหวัดที่ระบุ กรุณาลองใหม่");
    expect(mockSupabaseFromChain.insert).not.toHaveBeenCalled();
  });

  it("returns safe error when province query fails", async () => {
    mockSupabaseFromChain.maybeSingle.mockResolvedValue({ data: null, error: new Error("connection error") });
    const result = await submitTouristStoryAction(makeForm({ provinceId: "3" }));
    expect(result.success).toBe(false);
    expect(result.error).toBe("ไม่สามารถตรวจสอบข้อมูลจังหวัดได้ กรุณาลองใหม่");
    expect(mockSupabaseFromChain.insert).not.toHaveBeenCalled();
  });
});

describe("submitTouristStoryAction — auth failure", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIdentityResolved();
    mockProvinceExists();
    mockStoryInsertSuccess();
  });

  it("returns Thai error when not authenticated", async () => {
    mockSupabaseAuth.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
    const result = await submitTouristStoryAction(makeForm());
    expect(result.success).toBe(false);
    expect(result.error).toBe("กรุณาเข้าสู่ระบบก่อนแบ่งปันเรื่องราว");
    expect(mockResolveCurrentTouristId).not.toHaveBeenCalled();
    expect(mockAdminSupabase.from).not.toHaveBeenCalled();
  });
});

describe("submitTouristStoryAction — insert payload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthUser();
    mockIdentityResolved();
    mockProvinceExists();
    mockStoryInsertSuccess();
  });

  it("inserts correct payload with safe content", async () => {
    await submitTouristStoryAction(makeForm({
      title: "เที่ยวปัตตานี",
      content: "เรื่องราวการเดินทาง <b>สุดยอด</b>",
      provinceId: "3",
    }));
    const payload = getInsertPayload();
    expect(payload.title).toBe("เที่ยวปัตตานี");
    expect(payload.content).toBe("เรื่องราวการเดินทาง สุดยอด");
    expect(payload.excerpt).not.toContain("<b>");
    expect(payload.province_id).toBe(3);
    expect(payload.tourist_id).toBe("tourist-uuid-resolved");
    expect(payload.author_type).toBe("tourist");
    expect(payload.status).toBe("pending");
    expect(payload.is_published).toBe(false);
    expect(payload.category).toBe("Story");
    expect(typeof payload.slug).toBe("string");
    expect((payload.slug as string).length).toBeGreaterThan(0);
  });

  it("computes excerpt from safe content, truncating at 150 chars", async () => {
    const longText = "บทความ".repeat(40);
    await submitTouristStoryAction(makeForm({ content: longText }));
    const payload = getInsertPayload();
    expect(payload.content).toBe(longText);
    expect((payload.excerpt as string).length).toBeLessThanOrEqual(154);
    expect((payload.excerpt as string).endsWith("...")).toBe(true);
  });
});

describe("submitTouristStoryAction — happy path", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthUser();
    mockIdentityResolved();
    mockProvinceExists();
    mockStoryInsertSuccess();
  });

  it("accepts valid form and returns success", async () => {
    const result = await submitTouristStoryAction(makeForm());
    expect(result.success).toBe(true);
    expect(result.storyId).toBeDefined();
  });
});
