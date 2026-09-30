import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/public/routes/[slug]/map/route";
import { getPublicRouteDetail } from "@/lib/repositories/public-content.repository";
vi.mock("@/lib/repositories/public-content.repository", () => ({ getPublicRouteDetail: vi.fn() }));
describe("public Home route map", () => {
  beforeEach(() => vi.clearAllMocks());
  it("returns 404 for hidden or unpublished itineraries", async () => {
    vi.mocked(getPublicRouteDetail).mockResolvedValue(null);
    const response = await GET(new Request("https://example.test/api/public/routes/hidden/map"), { params: Promise.resolve({ slug: "hidden" }) });
    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toContain("no-store");
  });
  it("returns a useful retryable error without exposing database errors", async () => {
    vi.mocked(getPublicRouteDetail).mockRejectedValue(new Error("private database details"));
    const response = await GET(new Request("https://example.test/api/public/routes/live/map"), { params: Promise.resolve({ slug: "live" }) });
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain("private database");
  });
});
