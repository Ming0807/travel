import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const mocks = vi.hoisted(() => {
  class MockTouristAccessError extends Error {
    constructor(
      public readonly code: string,
      message: string,
    ) {
      super(message);
      this.name = "TouristAccessError";
    }
  }

  return {
    TouristAccessError: MockTouristAccessError,
    requireTouristVisitAccess: vi.fn(),
    getCertificateByVisitId: vi.fn(),
    getPhotoById: vi.fn(),
    uploadPrivateFile: vi.fn(),
    deletePrivateFile: vi.fn(),
    processCertificateGeneration: vi.fn(),
    assignStampForVisit: vi.fn(),
  };
});

vi.mock("@/lib/auth/guards", () => ({
  TouristAccessError: mocks.TouristAccessError,
  requireTouristVisitAccess: mocks.requireTouristVisitAccess,
}));

vi.mock("@/lib/repositories/certificate.repository", () => ({
  getCertificateByVisitId: mocks.getCertificateByVisitId,
}));

vi.mock("@/lib/repositories/visit-photo.repository", () => ({
  getPhotoById: mocks.getPhotoById,
}));

vi.mock("@/lib/storage/private-files", () => ({
  uploadPrivateFile: mocks.uploadPrivateFile,
  deletePrivateFile: mocks.deletePrivateFile,
}));

vi.mock("@/lib/services/certificate.service", () => ({
  processCertificateGeneration: mocks.processCertificateGeneration,
}));

vi.mock("@/lib/services/stamp.service", () => ({
  assignStampForVisit: mocks.assignStampForVisit,
}));

import { POST } from "@/app/api/certificate/generate/route";

const visitId = "550e8400-e29b-41d4-a716-446655440000";
const photoId = "660e8400-e29b-41d4-a716-446655440000";
const pngDataUrl =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

function request(body: Record<string, unknown>) {
  return {
    json: async () => body,
  } as unknown as NextRequest;
}

async function json(response: Response) {
  return (await response.json()) as Record<string, unknown>;
}

describe("POST /api/certificate/generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireTouristVisitAccess.mockResolvedValue({
      visit: {
        tourist_id: "tourist-1",
        attraction_id: 12,
        checkin_code_id: 34,
      },
    });
    mocks.getCertificateByVisitId.mockResolvedValue(null);
    mocks.getPhotoById.mockResolvedValue({ photo_id: photoId, visit_id: visitId });
    mocks.uploadPrivateFile.mockImplementation(async (params: { path: string }) => ({
      storagePath: params.path,
    }));
    mocks.processCertificateGeneration.mockResolvedValue("certificate-1");
    mocks.assignStampForVisit.mockResolvedValue({ success: true, status: "earned", stampId: "stamp-1" });
  });

  it("rejects visits the current tourist does not own before upload", async () => {
    mocks.requireTouristVisitAccess.mockRejectedValueOnce(
      new mocks.TouristAccessError("VISIT_ACCESS_DENIED", "ไม่พบสิทธิ์เข้าถึงข้อมูลนี้"),
    );

    const response = await POST(request({ visitId, base64Image: pngDataUrl }));
    const body = await json(response);

    expect(response.status).toBe(403);
    expect(body.code).toBe("VISIT_ACCESS_DENIED");
    expect(mocks.uploadPrivateFile).not.toHaveBeenCalled();
    expect(mocks.processCertificateGeneration).not.toHaveBeenCalled();
  });

  it("rejects a photoId that belongs to another visit before upload", async () => {
    mocks.getPhotoById.mockResolvedValueOnce({
      photo_id: photoId,
      visit_id: "770e8400-e29b-41d4-a716-446655440000",
    });

    const response = await POST(request({ visitId, photoId, base64Image: pngDataUrl }));
    const body = await json(response);

    expect(response.status).toBe(400);
    expect(body.code).toBe("PHOTO_NOT_FOUND_FOR_VISIT");
    expect(mocks.uploadPrivateFile).not.toHaveBeenCalled();
    expect(mocks.processCertificateGeneration).not.toHaveBeenCalled();
  });

  it("rejects non-PNG bytes even when the data URL claims image/png", async () => {
    const response = await POST(request({
      visitId,
      base64Image: `data:image/png;base64,${Buffer.from("not-a-png").toString("base64")}`,
    }));
    const body = await json(response);

    expect(response.status).toBe(400);
    expect(body.code).toBe("CERTIFICATE_IMAGE_INVALID");
    expect(mocks.uploadPrivateFile).not.toHaveBeenCalled();
    expect(mocks.processCertificateGeneration).not.toHaveBeenCalled();
  });

  it("returns an existing certificate before creating another storage object", async () => {
    mocks.getCertificateByVisitId.mockResolvedValueOnce({
      certificate_id: "existing-cert",
      certificate_path: "certificates/2026/06/existing.png",
    });

    const response = await POST(request({ visitId, photoId, base64Image: pngDataUrl }));
    const body = await json(response);

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      success: true,
      certificateId: "existing-cert",
      certificateUrl: "/api/media/image?bucket=certificate-files&path=certificates%2F2026%2F06%2Fexisting.png",
    });
    expect(mocks.uploadPrivateFile).not.toHaveBeenCalled();
    expect(mocks.processCertificateGeneration).not.toHaveBeenCalled();
  });

  it("stores a certificate through the private storage adapter and returns a private media URL", async () => {
    const response = await POST(request({ visitId, photoId, base64Image: pngDataUrl }));
    const body = await json(response);

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      success: true,
      certificateId: "certificate-1",
      certificateUrl: expect.stringMatching(/^\/api\/media\/image\?bucket=certificate-files&path=/),
    });

    expect(mocks.uploadPrivateFile).toHaveBeenCalledWith(expect.objectContaining({
      bucket: "certificate-files",
      contentType: "image/png",
    }));
    const uploadArg = mocks.uploadPrivateFile.mock.calls[0][0] as { path: string; data: Buffer };
    expect(uploadArg.path).toMatch(new RegExp(`^certificates/\\d{4}/\\d{2}/${visitId}/.+\\.png$`));
    expect(Buffer.isBuffer(uploadArg.data)).toBe(true);
    expect(mocks.processCertificateGeneration).toHaveBeenCalledWith(expect.objectContaining({
      visitId,
      photoId,
      certificatePath: uploadArg.path,
    }));
  });

  it("deletes the certificate object if DB certificate creation fails", async () => {
    mocks.processCertificateGeneration.mockRejectedValueOnce(new Error("DB_DOWN"));

    const response = await POST(request({ visitId, photoId, base64Image: pngDataUrl }));
    const body = await json(response);

    expect(response.status).toBe(500);
    expect(body.code).toBe("CERTIFICATE_GENERATION_FAILED");
    const storagePath = (mocks.uploadPrivateFile.mock.calls[0][0] as { path: string }).path;
    expect(mocks.deletePrivateFile).toHaveBeenCalledWith({
      bucket: "certificate-files",
      path: storagePath,
    });
  });
});
