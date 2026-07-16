import { beforeEach, describe, expect, it, vi } from "vitest";

const queryResult = { data: [], error: null, count: 0 };
const query = {
  select: vi.fn(),
  order: vi.fn(),
  range: vi.fn(),
  or: vi.fn(),
  eq: vi.fn(),
  gte: vi.fn(),
  lte: vi.fn(),
  then: (resolve: (value: typeof queryResult) => unknown) => Promise.resolve(queryResult).then(resolve),
};

for (const method of ["select", "order", "range", "or", "eq", "gte", "lte"] as const) {
  query[method].mockReturnValue(query);
}

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: () => ({ from: vi.fn(() => query) }),
}));

import { listAdminStories } from "@/lib/repositories/admin-story.repository";

describe("admin story library repository", () => {
  beforeEach(() => vi.clearAllMocks());

  it("applies author, taxonomy, readiness, date, and escaped search filters server-side", async () => {
    await listAdminStories({
      page: 1,
      pageSize: 20,
      search: "เมือง%_เก่า",
      authorType: "admin",
      provinceId: 2,
      topicId: 4,
      status: "in_review",
      readiness: "needs_work",
      dateFrom: "2026-07-01",
      dateTo: "2026-07-17",
    });

    expect(query.select.mock.calls[0]?.[0]).toContain("story_topic_links!inner");
    expect(query.or).toHaveBeenCalledWith("title.ilike.%เมือง\\%\\_เก่า%,slug.ilike.%เมือง\\%\\_เก่า%");
    expect(query.eq).toHaveBeenCalledWith("author_type", "admin");
    expect(query.eq).toHaveBeenCalledWith("province_id", 2);
    expect(query.eq).toHaveBeenCalledWith("story_topic_links.topic_id", 4);
    expect(query.eq).toHaveBeenCalledWith("status", "in_review");
    expect(query.or).toHaveBeenCalledWith("content_quality_score.lt.100,content_quality_score.is.null");
    expect(query.gte).toHaveBeenCalledWith("created_at", "2026-07-01T00:00:00.000Z");
    expect(query.lte).toHaveBeenCalledWith("created_at", "2026-07-17T23:59:59.999Z");
    expect(query.range).toHaveBeenCalledWith(0, 19);
  });
});
