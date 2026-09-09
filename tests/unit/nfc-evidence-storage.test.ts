import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ env: vi.fn(), bucket: vi.fn(), upload: vi.fn(), signed: vi.fn(), stream: vi.fn(), privateUrl: vi.fn(), publicUrl: vi.fn() }));
vi.mock("@/lib/config/server-env", () => ({ getServerEnv: mocks.env }));
vi.mock("@/lib/supabase/service-role", () => ({ createSupabaseServiceRoleClient: () => ({ storage: { getBucket: mocks.bucket, from: () => ({ upload: mocks.upload, createSignedUrl: mocks.signed }) } }) }));
vi.mock("cloudinary", () => ({ v2: { config: vi.fn(), uploader: { upload_stream: mocks.stream }, utils: { private_download_url: mocks.privateUrl }, url: mocks.publicUrl } }));
import { uploadPrivateFile, createPrivateFileSignedUrl, deletePrivateFile } from "@/lib/storage/private-files";
const path = "nfc-evidence/11111111-1111-4111-8111-111111111111.webp";
beforeEach(() => {
  vi.resetAllMocks();
  mocks.env.mockReturnValue({ STORAGE_PROVIDER: "supabase", CERTIFICATE_SIGNED_URL_TTL_SECONDS: 60,
    CLOUDINARY_CLOUD_NAME: "test", CLOUDINARY_API_KEY: "test", CLOUDINARY_API_SECRET: "test",
    CLOUDINARY_UPLOAD_FOLDER: "tourism", CLOUDINARY_DELIVERY_TYPE: "upload" });
  mocks.bucket.mockResolvedValue({ data: { public: false }, error: null });
  mocks.upload.mockResolvedValue({ error: null });
  mocks.signed.mockResolvedValue({ data: { signedUrl: "https://private.test/signed" }, error: null });
});
it("rejects public or unverifiable evidence buckets before uploading or signing", async () => {
  for (const result of [{ data: { public: true }, error: null }, { data: null, error: null }, { data: { public: false }, error: {} }]) {
    mocks.bucket.mockResolvedValue(result);
    await expect(uploadPrivateFile({ bucket: "nfc-evidence", path, data: Buffer.from("image"), contentType: "image/webp" })).rejects.toThrow("NFC_EVIDENCE_BUCKET_NOT_PRIVATE");
    await expect(createPrivateFileSignedUrl("nfc-evidence", path, 60)).rejects.toThrow("NFC_EVIDENCE_BUCKET_NOT_PRIVATE");
  }
  expect(mocks.upload).not.toHaveBeenCalled(); expect(mocks.signed).not.toHaveBeenCalled();
});
it("allows only a scoped image key and short signed URL lifetime", async () => {
  for (const bad of ["content-media/file.webp", "nfc-evidence/../file.webp", "nfc-evidence/file.svg"]) {
    await expect(uploadPrivateFile({ bucket: "nfc-evidence", path: bad, data: Buffer.from("image"), contentType: "image/webp" })).rejects.toThrow();
  }
  await expect(createPrivateFileSignedUrl("nfc-evidence", path, 301)).rejects.toThrow("NFC_EVIDENCE_TTL_INVALID");
  expect(await createPrivateFileSignedUrl("nfc-evidence", path, 60)).toBe("https://private.test/signed");
});
it("forces Cloudinary authenticated delivery despite a public CMS configuration", async () => {
  mocks.env.mockReturnValue({ ...mocks.env(), STORAGE_PROVIDER: "cloudinary" });
  mocks.stream.mockImplementation((options, callback) => ({ end: () => callback(null, { public_id: options.public_id, resource_type: "image", version: 1, format: "webp" }) }));
  const result = await uploadPrivateFile({ bucket: "nfc-evidence", path, data: Buffer.from("image"), contentType: "image/webp" });
  expect(mocks.stream.mock.calls[0][0].type).toBe("authenticated");
  expect(result.storagePath).toContain(":authenticated:");
  mocks.privateUrl.mockReturnValue("https://private.test/timed");
  expect(await createPrivateFileSignedUrl("nfc-evidence", result.storagePath, 60)).toBe("https://private.test/timed");
  expect(mocks.privateUrl.mock.calls[0][2]).toMatchObject({ type: "authenticated", attachment: false });
  await expect(createPrivateFileSignedUrl("visit-photos", result.storagePath, 60)).rejects.toThrow("NFC_EVIDENCE_BUCKET_MISMATCH");
  await expect(createPrivateFileSignedUrl("nfc-evidence", result.storagePath.replace(":authenticated:", ":upload:"), 60)).rejects.toThrow("NFC_EVIDENCE_REFERENCE_INVALID");
  expect(mocks.publicUrl).not.toHaveBeenCalled();
});
it("leaves legacy public-image storage behavior unchanged", async () => {
  await uploadPrivateFile({ bucket: "visit-photos", path: "visits/test.webp", data: Buffer.from("image"), contentType: "image/webp" });
  expect(mocks.bucket).not.toHaveBeenCalled(); expect(mocks.upload).toHaveBeenCalledOnce();
});
it("preserves Cloudinary public delivery for existing visit media", async () => {
  mocks.env.mockReturnValue({ ...mocks.env(), STORAGE_PROVIDER: "cloudinary" });
  mocks.stream.mockImplementation((options, callback) => ({ end: () => callback(null, { public_id: options.public_id, resource_type: "image", version: 1, format: "webp" }) }));
  const result = await uploadPrivateFile({ bucket: "visit-photos", path: "visits/test.webp", data: Buffer.from("image"), contentType: "image/webp" });
  expect(mocks.stream.mock.calls[0][0].type).toBe("upload");
  mocks.publicUrl.mockReturnValue("https://public.test/image");
  expect(await createPrivateFileSignedUrl("visit-photos", result.storagePath, 600)).toBe("https://public.test/image");
  expect(mocks.privateUrl).not.toHaveBeenCalled();
  expect(mocks.bucket).not.toHaveBeenCalled();
});
it("rejects relabelled evidence even without a Cloudinary root folder", async () => {
  await expect(createPrivateFileSignedUrl("visit-photos", `cloudinary:image:authenticated:v1:webp:${path.slice(0, -5)}`, 60)).rejects.toThrow("NFC_EVIDENCE_BUCKET_MISMATCH");
  await expect(deletePrivateFile({ bucket: "visit-photos", path })).rejects.toThrow("NFC_EVIDENCE_BUCKET_MISMATCH");
  await expect(deletePrivateFile({ bucket: "nfc-evidence", path: "visits/test.webp" })).rejects.toThrow("NFC_EVIDENCE_PATH_INVALID");
  expect(mocks.privateUrl).not.toHaveBeenCalled();
});
it("rejects non-WebP declarations before uploading evidence", async () => {
  await expect(uploadPrivateFile({ bucket: "nfc-evidence", path, data: Buffer.from("image"), contentType: "image/jpeg" })).rejects.toThrow("NFC_EVIDENCE_TYPE_INVALID");
  expect(mocks.upload).not.toHaveBeenCalled();
  expect(mocks.stream).not.toHaveBeenCalled();
});
it.each([0, -1, 1.5, 301, Number.NaN, Number.POSITIVE_INFINITY])("rejects an evidence TTL of %s before provider access", async (ttl) => {
  await expect(createPrivateFileSignedUrl("nfc-evidence", path, ttl)).rejects.toThrow("NFC_EVIDENCE_TTL_INVALID");
  expect(mocks.bucket).not.toHaveBeenCalled();
  expect(mocks.signed).not.toHaveBeenCalled();
});
