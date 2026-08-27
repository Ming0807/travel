import { describe, expect, it } from "vitest";
import { normalizeAdminMediaAssetForClient } from "@/lib/media/admin-media-contract";

describe("admin media client contract", () => {
  it("keeps the UUID primary key used by media_assets", () => {
    const id = "3129fa20-c32d-4475-b653-629d4280eb01";

    expect(normalizeAdminMediaAssetForClient({
      id,
      storage_path: "homepage/hero.webp",
    }).id).toBe(id);
  });

  it("maps the database media_id to the picker id", () => {
    expect(normalizeAdminMediaAssetForClient({
      media_id: 42,
      storage_path: "general/cover.webp",
      thumbnail_storage_path: "general/cover_thumb.webp",
    })).toMatchObject({
      id: "42",
      media_id: 42,
      storage_path: "general/cover.webp",
      thumbnail_storage_path: "general/cover_thumb.webp",
    });
  });

  it("keeps an explicit client id when a compatibility source already provides one", () => {
    expect(normalizeAdminMediaAssetForClient({
      id: "17",
      media_id: 17,
      storage_path: "general/existing.webp",
    }).id).toBe("17");
  });

  it("uses an empty id instead of serializing an invalid value", () => {
    expect(normalizeAdminMediaAssetForClient({
      media_id: null,
      storage_path: "general/invalid.webp",
    }).id).toBe("");
  });
});
