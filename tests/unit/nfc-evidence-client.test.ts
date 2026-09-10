import { afterEach, beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ prepare: vi.fn(), fetch: vi.fn() }));
vi.mock("@/lib/media/admin-image-upload-client", () => ({ prepareAdminImageForUpload: mocks.prepare }));
import { loadNfcEvidencePhoto, uploadNfcEvidencePhoto } from "@/lib/media/nfc-evidence-client";
const id = "11111111-1111-4111-8111-111111111111";
const context = { tagId: id, version: 1 };
const file = new File(["webp"], "test.webp", { type: "image/webp" });
beforeEach(() => { vi.resetAllMocks(); vi.stubGlobal("fetch", mocks.fetch); mocks.prepare.mockResolvedValue({ file }); });
afterEach(() => vi.unstubAllGlobals());
it("sends prepared binary bytes to the dedicated endpoint with stage feedback", async () => {
  mocks.fetch.mockResolvedValue(Response.json({ success: true, data: { assetId: id, width: 800, height: 600, sizeBytes: 4 } }));
  const stage = vi.fn();
  expect((await uploadNfcEvidencePhoto(file, context, stage)).assetId).toBe(id);
  expect(stage.mock.calls.flat()).toEqual(["preparing", "uploading"]);
  expect(mocks.fetch.mock.calls[0][0]).toContain("/api/admin/nfc/evidence?tagId=");
  expect(mocks.fetch.mock.calls[0][1]).toMatchObject({ body: file, method: "POST", cache: "no-store" });
});
it("rejects prepared files exceeding the endpoint limit before networking", async () => {
  mocks.prepare.mockResolvedValue({ file: { size: 3 * 1024 * 1024 + 1 } });
  await expect(uploadNfcEvidencePhoto(file, context, vi.fn())).rejects.toThrow("3 MiB");
  expect(mocks.fetch).not.toHaveBeenCalled();
});
it("rejects malformed upload responses without exposing internal errors", async () => {
  mocks.fetch.mockResolvedValue(new Response("not-json", { status: 200 }));
  await expect(uploadNfcEvidencePhoto(file, context, vi.fn())).rejects.toThrow("ยังยืนยันรูปหลักฐานไม่ได้");
  mocks.fetch.mockRejectedValue(new Error("internal socket error"));
  await expect(uploadNfcEvidencePhoto(file, context, vi.fn())).rejects.toThrow("กรุณาตรวจการเชื่อมต่อ");
});
it("accepts only a validated short-lived HTTPS preview response", async () => {
  mocks.fetch.mockResolvedValue(Response.json({ success: true, data: { url: "http://unsafe.test/photo", expiresIn: 60 } }));
  await expect(loadNfcEvidencePhoto(id, id)).rejects.toThrow();
  mocks.fetch.mockResolvedValue(Response.json({ success: true, data: { url: "https://private.test/photo", expiresIn: 60 } }));
  expect(await loadNfcEvidencePhoto(id, id)).toBe("https://private.test/photo");
});
it("reuses request identity and prepared bytes after a lost response",async()=>{
  const original=new File(["source"],"retry.jpg",{type:"image/jpeg"});
  mocks.fetch.mockRejectedValueOnce(new Error("lost response"));
  await expect(uploadNfcEvidencePhoto(original,context,vi.fn())).rejects.toThrow();
  mocks.fetch.mockResolvedValueOnce(Response.json({success:true,data:{assetId:id,width:800,height:600,sizeBytes:4}}));
  await uploadNfcEvidencePhoto(original,context,vi.fn());
  expect(mocks.prepare).toHaveBeenCalledOnce();
  const first=mocks.fetch.mock.calls[0][1],second=mocks.fetch.mock.calls[1][1];
  expect(first.headers["X-NFC-Upload-Request-ID"]).toMatch(/^[0-9a-f-]{36}$/);
  expect(second.headers["X-NFC-Upload-Request-ID"]).toBe(first.headers["X-NFC-Upload-Request-ID"]);
  expect(second.body).toBe(first.body);
});
it("does not share retry identity across tag versions",async()=>{
  const original=new File(["source"],"version.jpg",{type:"image/jpeg"});mocks.fetch.mockRejectedValue(new Error("lost"));
  await expect(uploadNfcEvidencePhoto(original,context,vi.fn())).rejects.toThrow();
  await expect(uploadNfcEvidencePhoto(original,{...context,version:2},vi.fn())).rejects.toThrow();
  expect(mocks.fetch.mock.calls[0][1].headers["X-NFC-Upload-Request-ID"]).not.toBe(mocks.fetch.mock.calls[1][1].headers["X-NFC-Upload-Request-ID"]);
});
