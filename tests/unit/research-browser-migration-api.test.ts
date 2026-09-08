import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ enabled: vi.fn(), migrate: vi.fn() }));
vi.mock("@/lib/config/research-browser", () => ({ researchBrowserProvisioningEnabled: mocks.enabled }));
vi.mock("@/lib/auth/research-browser", () => ({ migrateResearchVisitCredential: mocks.migrate }));
import { POST } from "@/app/api/research/browser/migrate/route";
const visit = "11111111-1111-4111-8111-111111111111";
const request = (query = `visitId=${visit}`, origin = "https://example.test") => new Request(
  `https://example.test/api/research/browser/migrate?${query}`, { method: "POST", headers: { origin } },
);
beforeEach(() => { vi.resetAllMocks(); mocks.enabled.mockReturnValue(true); });
it("rejects cross-origin, malformed and duplicate context before migration", async () => {
  expect((await POST(request(undefined, "https://other.test"))).status).toBe(403);
  for (const query of ["", "visitId=invalid", `visitId=${visit}&visitId=${visit}`, `visitId=${visit}&extra=1`]) {
    expect((await POST(request(query))).status).toBe(400);
  }
  expect(mocks.migrate).not.toHaveBeenCalled();
});
it("does not query or migrate when rollout is disabled", async () => {
  mocks.enabled.mockReturnValue(false);
  expect((await POST(request())).status).toBe(404);
  expect(mocks.migrate).not.toHaveBeenCalled();
});
it("returns only migration status without credentials", async () => {
  mocks.migrate.mockResolvedValue(true);
  const response = await POST(request());
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(await response.json()).toEqual({ migrated: true });
  expect(mocks.migrate).toHaveBeenCalledExactlyOnceWith(visit);
  mocks.migrate.mockResolvedValue(false);
  expect(await (await POST(request())).json()).toEqual({ migrated: false });
});
it("sanitizes migration failures without claiming success", async () => {
  mocks.migrate.mockRejectedValue(new Error("private"));
  const response = await POST(request());
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({ migrated: false });
});
