import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ enabled: vi.fn(), permission: vi.fn(), limit: vi.fn(), upload: vi.fn(), preview: vi.fn() }));
vi.mock("@/lib/config/nfc-evidence", () => ({ nfcEvidenceUploadEnabled: mocks.enabled }));
vi.mock("@/lib/auth/guards", () => ({ requirePermission: mocks.permission, AdminAuthError: class extends Error { code = "UNAUTHORIZED"; } }));
vi.mock("@/lib/utils/rate-limit", () => ({ rateLimit: mocks.limit }));
vi.mock("@/lib/services/nfc-evidence.service", () => ({ uploadNfcEvidence: mocks.upload, getNfcEvidencePreview: mocks.preview }));
import { GET, POST } from "@/app/api/admin/nfc/evidence/route";
import { AdminAuthError } from "@/lib/auth/guards";
const id = "11111111-1111-4111-8111-111111111111";
const base = "https://tourism.test/api/admin/nfc/evidence";
const request = (headers: Record<string, string> = {}, query = `tagId=${id}&version=2`) => new Request(`${base}?${query}`, {
  method: "POST", headers: { origin: "https://tourism.test", "content-type": "image/jpeg", ...headers }, body: "raw",
});
beforeEach(() => {
  vi.resetAllMocks(); mocks.enabled.mockReturnValue(true); mocks.permission.mockResolvedValue({ adminId: id });
  mocks.limit.mockReturnValue({ success: true }); mocks.upload.mockResolvedValue({ assetId: id, width: 800, height: 600, sizeBytes: 100 });
  mocks.preview.mockResolvedValue("https://private.test/timed");
});
it("keeps disabled routes closed without authentication or service calls", async () => {
  mocks.enabled.mockReturnValue(false);
  expect((await POST(request())).status).toBe(404);
  expect((await GET(new Request(base))).status).toBe(404);
  expect(mocks.permission).not.toHaveBeenCalled(); expect(mocks.upload).not.toHaveBeenCalled(); expect(mocks.preview).not.toHaveBeenCalled();
});
it("rejects cross-origin and unauthenticated uploads before reading bytes", async () => {
  expect((await POST(request({ origin: "https://other.test" }))).status).toBe(403);
  mocks.permission.mockRejectedValue(new AdminAuthError("UNAUTHORIZED", "denied"));
  expect((await POST(request())).status).toBe(401);
  expect(mocks.permission).toHaveBeenCalledWith("checkin_code.manage", { unauthenticated: "throw" });
  expect(mocks.upload).not.toHaveBeenCalled();
});
it("uses an actor-scoped rate limit and no-store responses", async () => {
  mocks.limit.mockReturnValue({ success: false });
  const response = await POST(request());
  expect(response.status).toBe(429); expect(response.headers.get("cache-control")).toContain("no-store");
  expect(mocks.limit).toHaveBeenCalledWith(`nfc-evidence:${id}`, 10, 60000);
  expect(mocks.upload).not.toHaveBeenCalled();
});
it("rejects oversized, compressed and duplicate-parameter requests", async () => {
  expect((await POST(request({ "content-length": String(4 * 1024 * 1024) }))).status).toBe(413);
  expect((await POST(request({ "content-encoding": "gzip" }))).status).toBe(415);
  expect((await POST(request({}, `tagId=${id}&version=2&version=3`))).status).toBe(400);
  expect(mocks.upload).not.toHaveBeenCalled();
});
it("passes bounded binary bytes and exact tag context to the guarded service", async () => {
  const response = await POST(request());
  expect(response.status).toBe(200);
  expect(mocks.upload.mock.calls[0][0]).toEqual({ tagId: id, version: 2 });
  const file = mocks.upload.mock.calls[0][1];
  expect(file.type).toBe("image/jpeg"); expect(file.size).toBe(3);
  expect(Buffer.from(await file.arrayBuffer()).toString()).toBe("raw");
  expect(await response.json()).toEqual({ success: true, data: { assetId: id, width: 800, height: 600, sizeBytes: 100 } });
});
it("returns short-lived private preview metadata and sanitizes failures", async () => {
  const url = `${base}?assetId=${id}&tagId=${id}`;
  const response = await GET(new Request(url));
  expect(await response.json()).toEqual({ success: true, data: { url: "https://private.test/timed", expiresIn: 60 } });
  expect(response.headers.get("cache-control")).toBe("private, no-store");
  mocks.preview.mockRejectedValue(new Error("private database password"));
  const failed = await GET(new Request(url));
  expect(failed.status).toBe(503); expect(await failed.text()).not.toContain("password");
});
