import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("photo upload flow separation", () => {
  it("keeps QR visit photos on the tourist-owned endpoint", () => {
    const client = source("components/checkin/PhotoUploadClient.tsx");

    expect(client).toContain('fetch("/api/upload/photo"');
    expect(client).toContain("prepareVisitPhotoForUpload");
    expect(client).not.toContain("/api/admin/media");
  });

  it("keeps attraction CMS images on the permission-protected admin endpoint", () => {
    const manager = source("components/admin/attractions/MediaManager.tsx");

    expect(manager).toContain('endpoint: "/api/admin/media/upload"');
    expect(manager).toContain("uploadAdminImage");
    expect(manager).not.toContain("/api/upload/photo");
  });
});
