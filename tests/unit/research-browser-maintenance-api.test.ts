import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ cleanup: vi.fn() }));
vi.mock("@/lib/repositories/research-browser-grant.repository", () => ({
  cleanupExpiredResearchBrowserGrants: mocks.cleanup,
}));
import { GET } from "@/app/api/cron/research-browser-maintenance/route";

const secret = "s".repeat(32);
const request = (authorization?: string) => new NextRequest(
  "https://example.test/api/cron/research-browser-maintenance?limit=100000",
  { headers: authorization ? { authorization } : undefined },
);

describe("research browser maintenance", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("CRON_SECRET", secret);
    vi.stubEnv("RESEARCH_BROWSER_GRANT_CLEANUP_ENABLED", "true");
    mocks.cleanup.mockResolvedValue(500);
  });
  afterEach(() => vi.unstubAllEnvs());

  it("denies missing, wrong and short bearer secrets before database work", async () => {
    for (const header of [undefined, "Bearer wrong", `Bearer ${"x".repeat(32)}`]) {
      expect((await GET(request(header))).status).toBe(401);
    }
    vi.stubEnv("CRON_SECRET", "short");
    expect((await GET(request("Bearer short"))).status).toBe(401);
    expect(mocks.cleanup).not.toHaveBeenCalled();
  });
  it("stays disabled without querying an unapplied schema", async () => {
    vi.stubEnv("RESEARCH_BROWSER_GRANT_CLEANUP_ENABLED", "false");
    const response = await GET(request(`Bearer ${secret}`));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, maintenance: { skipped: true, reason: "disabled" } });
    expect(mocks.cleanup).not.toHaveBeenCalled();
  });
  it("runs one fixed batch and returns counts without claiming the backlog is empty", async () => {
    const response = await GET(request(`Bearer ${secret}`));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ success: true, maintenance: { deletedGrants: 500, batchLimit: 500, batchFull: true } });
    expect(mocks.cleanup).toHaveBeenCalledExactlyOnceWith(500);
  });
  it("reports a partial batch without looping", async () => {
    mocks.cleanup.mockResolvedValue(7);
    expect(await (await GET(request(`Bearer ${secret}`))).json()).toMatchObject({ maintenance: { deletedGrants: 7, batchFull: false } });
    expect(mocks.cleanup).toHaveBeenCalledTimes(1);
  });
  it("contains configuration and database failures", async () => {
    vi.stubEnv("RESEARCH_BROWSER_GRANT_CLEANUP_ENABLED", "invalid");
    expect((await GET(request(`Bearer ${secret}`))).status).toBe(503);
    expect(mocks.cleanup).not.toHaveBeenCalled();
    vi.stubEnv("RESEARCH_BROWSER_GRANT_CLEANUP_ENABLED", "true");
    mocks.cleanup.mockRejectedValue(new Error("private database details"));
    const response = await GET(request(`Bearer ${secret}`));
    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ success: false, error: { code: "MAINTENANCE_FAILED", message: "งานล้างสิทธิ์วิจัยที่หมดอายุยังไม่สำเร็จ" } });
  });
});
