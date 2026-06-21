import { beforeEach, describe, expect, it, vi } from "vitest";
import { PhotoUploadError, processVisitPhotoUpload } from "@/lib/services/photo-upload.service";

const mocks = vi.hoisted(() => ({
  requireTouristVisitAccess: vi.fn(),
  uploadPrivateFile: vi.fn(),
  deletePrivateFile: vi.fn(),
  createPrivateFileSignedUrl: vi.fn(),
  createVisitPhoto: vi.fn(),
  updateVisitStatus: vi.fn(),
  recordFunnelEvent: vi.fn(),
}));

vi.mock("@/lib/auth/guards", () => ({
  requireTouristVisitAccess: mocks.requireTouristVisitAccess,
}));

vi.mock("@/lib/storage/private-files", () => ({
  uploadPrivateFile: mocks.uploadPrivateFile,
  deletePrivateFile: mocks.deletePrivateFile,
  createPrivateFileSignedUrl: mocks.createPrivateFileSignedUrl,
}));

vi.mock("@/lib/repositories/visit-photo.repository", () => ({
  createVisitPhoto: mocks.createVisitPhoto,
}));

vi.mock("@/lib/repositories/visit.repository", () => ({
  updateVisitStatus: mocks.updateVisitStatus,
}));

vi.mock("@/lib/repositories/funnel.repository", () => ({
  recordFunnelEvent: mocks.recordFunnelEvent,
}));

vi.mock("@/lib/config/server-env", () => ({
  getServerEnv: () => ({
    ALLOWED_TOURIST_IMAGE_MIME_TYPES: "image/jpeg,image/png,image/webp",
    MAX_UPLOAD_IMAGE_SIZE_MB: 5,
    CERTIFICATE_SIGNED_URL_TTL_SECONDS: 3600,
  }),
}));

const visitId = "550e8400-e29b-41d4-a716-446655440000";
const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
  "base64",
);

function validFile(name = "tourist-real-name.png") {
  return new File([onePixelPng], name, { type: "image/png" });
}

describe("processVisitPhotoUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireTouristVisitAccess.mockResolvedValue({
      visit: {
        tourist_id: "tourist-1",
        attraction_id: 12,
        checkin_code_id: 34,
      },
    });
    mocks.uploadPrivateFile.mockImplementation(async (params: { path: string }) => ({
      storagePath: params.path,
    }));
    mocks.createVisitPhoto.mockResolvedValue("photo-1");
    mocks.createPrivateFileSignedUrl.mockResolvedValue("https://signed.example/photo.webp");
  });

  it("rejects unsupported files before ownership, storage, or metadata work", async () => {
    const file = new File(["<svg></svg>"], "unsafe.svg", { type: "image/svg+xml" });

    await expect(processVisitPhotoUpload({ visitId, file })).rejects.toMatchObject({
      code: "PHOTO_INVALID_TYPE",
      status: 400,
    });

    expect(mocks.requireTouristVisitAccess).not.toHaveBeenCalled();
    expect(mocks.uploadPrivateFile).not.toHaveBeenCalled();
    expect(mocks.createVisitPhoto).not.toHaveBeenCalled();
  });

  it("rejects visits the current tourist does not own before reading/uploading the file", async () => {
    mocks.requireTouristVisitAccess.mockRejectedValueOnce(new Error("VISIT_ACCESS_DENIED"));

    await expect(processVisitPhotoUpload({ visitId, file: validFile() })).rejects.toMatchObject({
      code: "VISIT_ACCESS_DENIED",
      status: 404,
    });

    expect(mocks.uploadPrivateFile).not.toHaveBeenCalled();
    expect(mocks.createVisitPhoto).not.toHaveBeenCalled();
  });

  it("stores optimized WebP bytes with a server-generated path and privacy-safe filename metadata", async () => {
    const result = await processVisitPhotoUpload({ visitId, file: validFile("person-name-at-home.png") });

    expect(result).toEqual({
      photoId: "photo-1",
      previewUrl: "https://signed.example/photo.webp",
      expiresIn: 3600,
    });

    expect(mocks.uploadPrivateFile).toHaveBeenCalledWith(expect.objectContaining({
      bucket: "visit-photos",
      contentType: "image/webp",
    }));
    const uploadArg = mocks.uploadPrivateFile.mock.calls[0][0] as {
      path: string;
      data: Buffer;
    };
    expect(uploadArg.path).toMatch(new RegExp(`^visit-photos/\\d{4}/\\d{2}/${visitId}/.+\\.webp$`));
    expect(uploadArg.path).not.toContain("person-name-at-home");
    expect(Buffer.isBuffer(uploadArg.data)).toBe(true);
    expect(uploadArg.data.length).toBeGreaterThan(0);

    expect(mocks.createVisitPhoto).toHaveBeenCalledWith(expect.objectContaining({
      visitId,
      originalFilename: "tourist-upload.webp",
      mimeType: "image/webp",
      approvalStatus: "approved",
    }));
    expect(mocks.updateVisitStatus).toHaveBeenCalledWith(visitId, "photo_uploaded");
    expect(mocks.recordFunnelEvent).toHaveBeenCalledWith(expect.objectContaining({
      eventName: "photo_uploaded",
      touristId: "tourist-1",
      attractionId: 12,
      checkinCodeId: 34,
      visitId,
    }));
  });

  it("cleans the uploaded object if metadata creation fails", async () => {
    mocks.createVisitPhoto.mockRejectedValueOnce(new Error("DB_DOWN"));

    await expect(processVisitPhotoUpload({ visitId, file: validFile() })).rejects.toBeInstanceOf(PhotoUploadError);

    const storagePath = (mocks.uploadPrivateFile.mock.calls[0][0] as { path: string }).path;
    expect(mocks.deletePrivateFile).toHaveBeenCalledWith({
      bucket: "visit-photos",
      path: storagePath,
    });
  });
});
