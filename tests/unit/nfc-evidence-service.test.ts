import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ permission: vi.fn(), tag: vi.fn(), read: vi.fn(), register: vi.fn(), decode: vi.fn(), render: vi.fn(), upload: vi.fn(), sign: vi.fn() }));
vi.mock("@/lib/auth/guards", () => ({ requirePermission: mocks.permission }));
vi.mock("@/lib/repositories/admin-nfc.repository", () => ({ readAdminNfcTag: mocks.tag }));
vi.mock("@/lib/repositories/nfc-evidence.repository", () => ({ readNfcEvidenceAsset: mocks.read, registerNfcEvidenceAsset: mocks.register }));
vi.mock("@/lib/services/admin-image-processing.service", () => ({ readAndValidateAdminImageFile: mocks.decode, renderAdminImageWebpVariant: mocks.render }));
vi.mock("@/lib/storage/private-files", () => ({ uploadPrivateFile: mocks.upload, createPrivateFileSignedUrl: mocks.sign }));
import { uploadNfcEvidence, getNfcEvidencePreview } from "@/lib/services/nfc-evidence.service";
const id = "11111111-1111-4111-8111-111111111111";
const other = "22222222-2222-4222-8222-222222222222";
const context = { tagId: id, version: 2 };
const file = { type: "image/jpeg", size: 3, arrayBuffer: vi.fn() };
const preview = { assetId: id, tagId: id };
const asset = () => ({ asset_id: id, nfc_tag_id: id, actor_id: id, storage_path: `nfc-evidence/${id}.webp`, created_at: new Date().toISOString(), nfc_field_check_photos: [] });
beforeEach(() => {
  vi.resetAllMocks();
  mocks.permission.mockResolvedValue({ adminId: id }); mocks.tag.mockResolvedValue({ version: 2 });
  mocks.read.mockResolvedValue(null); mocks.decode.mockResolvedValue({ inputBuffer: Buffer.from("raw") });
  mocks.render.mockResolvedValue({ buffer: Buffer.from("webp"), sizeBytes: 4, width: 800, height: 600 });
  mocks.upload.mockImplementation(({ path }) => ({ provider: "supabase", storagePath: path }));
  mocks.register.mockImplementation(({ asset_id }) => asset_id);
  mocks.sign.mockResolvedValue("https://private.test/timed");
});
it("authorizes before accessing tags, decoding, storage or previews", async () => {
  mocks.permission.mockRejectedValue(new Error("denied"));
  await expect(uploadNfcEvidence(context, file)).rejects.toThrow("denied");
  await expect(getNfcEvidencePreview(preview)).rejects.toThrow("denied");
  expect(mocks.tag).not.toHaveBeenCalled(); expect(mocks.read).not.toHaveBeenCalled(); expect(mocks.upload).not.toHaveBeenCalled();
});
it("rejects spoofed actor and stale tag before processing", async () => {
  await expect(uploadNfcEvidence({ ...context, actorId: other }, file)).rejects.toThrow();
  mocks.tag.mockResolvedValue({ version: 3 });
  await expect(uploadNfcEvidence(context, file)).rejects.toThrow("NFC_VERSION_CONFLICT");
  expect(mocks.decode).not.toHaveBeenCalled();
});
it("stores server-processed private bytes and returns no storage path", async () => {
  const result = await uploadNfcEvidence(context, file);
  expect(mocks.permission).toHaveBeenCalledWith("checkin_code.manage", { unauthenticated: "throw" });
  expect(mocks.decode).toHaveBeenCalledWith(file, { maxSizeMb: 3, maxPixels: 24_000_000 });
  expect(mocks.upload).toHaveBeenCalledWith({ bucket: "nfc-evidence", path: `nfc-evidence/${result.assetId}.webp`, data: Buffer.from("webp"), contentType: "image/webp" });
  expect(mocks.register.mock.calls[0][0]).toMatchObject({ actor_id: id, tag_version: 2, size_bytes: 4, sha256: expect.stringMatching(/^[0-9a-f]{64}$/) });
  expect(Object.keys(result).sort()).toEqual(["assetId", "height", "sizeBytes", "width"]);
});
it("fails before remote upload when schema is unavailable or bytes disagree", async () => {
  mocks.read.mockRejectedValueOnce(new Error("schema unavailable"));
  await expect(uploadNfcEvidence(context, file)).rejects.toThrow("schema unavailable");
  mocks.decode.mockResolvedValue({ inputBuffer: Buffer.from("larger") });
  await expect(uploadNfcEvidence(context, file)).rejects.toThrow("NFC_EVIDENCE_SIZE_INVALID");
  expect(mocks.upload).not.toHaveBeenCalled();
});
it("tries a bounded second encoding then rejects an oversized image", async () => {
  mocks.render.mockResolvedValue({ buffer: Buffer.from("webp"), sizeBytes: 3 * 1024 * 1024, width: 800, height: 600 });
  await expect(uploadNfcEvidence(context, file)).rejects.toThrow("NFC_EVIDENCE_SIZE_INVALID");
  expect(mocks.render).toHaveBeenCalledTimes(2); expect(mocks.upload).not.toHaveBeenCalled();
});
it("reconciles an uncertain registration only after exact metadata readback", async () => {
  mocks.register.mockImplementation(async (metadata) => {
    mocks.read.mockResolvedValue({ ...metadata, created_at: new Date().toISOString(), nfc_field_check_photos: [] });
    throw new Error("response lost");
  });
  expect((await uploadNfcEvidence(context, file)).assetId).toEqual(expect.any(String));
  mocks.read.mockResolvedValue(null);
  mocks.register.mockImplementation(async (metadata) => {
    mocks.read.mockResolvedValue({ ...metadata, actor_id: other }); throw new Error("response lost");
  });
  await expect(uploadNfcEvidence(context, file)).rejects.toThrow("response lost");
});
it("scopes pending previews to the uploader and a 24-hour window", async () => {
  mocks.read.mockResolvedValue({ ...asset(), actor_id: other });
  await expect(getNfcEvidencePreview(preview)).rejects.toThrow("NFC_EVIDENCE_NOT_AVAILABLE");
  mocks.read.mockResolvedValue({ ...asset(), created_at: "2020-01-01T00:00:00Z" });
  await expect(getNfcEvidencePreview(preview)).rejects.toThrow("NFC_EVIDENCE_NOT_AVAILABLE");
  mocks.read.mockResolvedValue({ ...asset(), nfc_tag_id: other, nfc_field_check_photos: [{ request_id: id }] });
  await expect(getNfcEvidencePreview(preview)).rejects.toThrow("NFC_EVIDENCE_NOT_AVAILABLE");
  expect(mocks.sign).not.toHaveBeenCalled();
});
it("allows authorized report evidence and signs for only 60 seconds", async () => {
  mocks.read.mockResolvedValue({ ...asset(), actor_id: other, created_at: "2020-01-01T00:00:00Z", nfc_field_check_photos: [{ request_id: id }] });
  expect(await getNfcEvidencePreview(preview)).toBe("https://private.test/timed");
  expect(mocks.permission).toHaveBeenCalledWith("checkin_code.read", { unauthenticated: "throw" });
  expect(mocks.sign).toHaveBeenCalledWith("nfc-evidence", `nfc-evidence/${id}.webp`, 60);
});
it("re-encodes real image bytes with orientation applied and metadata removed", async () => {
  const { default: sharp } = await import("sharp");
  const processing = await vi.importActual<typeof import("@/lib/services/admin-image-processing.service")>("@/lib/services/admin-image-processing.service");
  mocks.decode.mockImplementation(processing.readAndValidateAdminImageFile);
  mocks.render.mockImplementation(processing.renderAdminImageWebpVariant);
  const input = await sharp({ create: { width: 800, height: 400, channels: 3, background: "#ee7744" } })
    .withMetadata({ orientation: 6 }).jpeg().toBuffer();
  const actualFile = { type: "image/jpeg", size: input.byteLength, arrayBuffer: async () => Uint8Array.from(input).buffer };
  const result = await uploadNfcEvidence(context, actualFile);
  const output = await sharp(mocks.upload.mock.calls[0][0].data).metadata();
  expect(output.format).toBe("webp");
  expect(output.width).toBe(400); expect(output.height).toBe(800);
  expect(output.exif).toBeUndefined(); expect(output.orientation).toBeUndefined();
  expect(result.sizeBytes).toBeLessThanOrEqual(2 * 1024 * 1024);
});
