import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock("@/lib/supabase/service-role", () => ({ createSupabaseServiceRoleClient: () => ({ from: mocks.from }) }));
import { setRouteCoverFromLibraryAsset, setStoryCoverFromLibraryAsset } from "@/lib/repositories/admin-media.repository";

function query(result: { data: unknown; error: unknown }) {
  const builder = {
    select: vi.fn(), eq: vi.fn(), limit: vi.fn(), update: vi.fn(), insert: vi.fn(), delete: vi.fn(), neq: vi.fn(),
    maybeSingle: vi.fn(async () => result), single: vi.fn(async () => result),
    then: (resolve: (value: typeof result) => unknown) => Promise.resolve(result).then(resolve),
  };
  for (const method of ["select", "eq", "limit", "update", "insert", "delete", "neq"] as const) builder[method].mockReturnValue(builder);
  return builder;
}

describe("entity-owned cover links from shared library files", () => {
  beforeEach(() => vi.resetAllMocks());

  it.each(["route", "story"] as const)("creates a %s-owned association without moving another entity's media", async (type) => {
    const asset = query({ data: { storage_path: "shared.webp", mime_type: "image/webp", lifecycle_status: "active" }, error: null });
    const lookup = query({ data: null, error: null });
    const insert = query({ data: { media_id: 92 }, error: null });
    const clear = query({ data: null, error: null });
    mocks.from.mockReturnValueOnce(asset).mockReturnValueOnce(lookup).mockReturnValueOnce(insert).mockReturnValueOnce(clear);
    const save = type === "route" ? setRouteCoverFromLibraryAsset : setStoryCoverFromLibraryAsset;
    expect(await save(5, "asset-uuid", "ภาพหน้าถ้ำ")).toEqual({ mediaId: 92, storagePath: "shared.webp" });
    expect(lookup.eq).toHaveBeenCalledWith(`${type}_id`, 5);
    expect(insert.insert).toHaveBeenCalledWith({
      [`${type}_id`]: 5, media_type: "image", storage_path: "shared.webp", alt_text_th: "ภาพหน้าถ้ำ",
      is_active: true, lifecycle_status: "active", is_cover: true,
    });
    expect(clear.eq).toHaveBeenCalledWith(`${type}_id`, 5);
    expect(clear.neq).toHaveBeenCalledWith("media_id", 92);
    expect(lookup.update).not.toHaveBeenCalled();
  });

  it("reuses only the destination route's existing association", async () => {
    const asset = query({ data: { storage_path: "shared.webp", mime_type: "image/webp", lifecycle_status: "active" }, error: null });
    const lookup = query({ data: { media_id: 92 }, error: null });
    const update = query({ data: null, error: null });
    const clear = query({ data: null, error: null });
    mocks.from.mockReturnValueOnce(asset).mockReturnValueOnce(lookup).mockReturnValueOnce(update).mockReturnValueOnce(clear);
    await setRouteCoverFromLibraryAsset(5, "asset-uuid", "ภาพหน้าถ้ำ");
    expect(update.eq).toHaveBeenCalledWith("media_id", 92);
    expect(update.eq).toHaveBeenCalledWith("route_id", 5);
    expect(update.insert).not.toHaveBeenCalled();
  });

  it.each(["archived", "draft"])("rejects %s library assets before writing", async (status) => {
    const asset = query({ data: { storage_path: "shared.webp", mime_type: "image/webp", lifecycle_status: status }, error: null });
    mocks.from.mockReturnValue(asset);
    await expect(setRouteCoverFromLibraryAsset(5, "asset-uuid", "ภาพ")).rejects.toThrow("INVALID_ROUTE_COVER_ASSET");
    expect(mocks.from).toHaveBeenCalledOnce();
    expect(asset.insert).not.toHaveBeenCalled();
    expect(asset.update).not.toHaveBeenCalled();
  });

  it("does not clear the previous cover when creating the new association fails", async () => {
    const asset = query({ data: { storage_path: "shared.webp", mime_type: "image/webp", lifecycle_status: "active" }, error: null });
    const lookup = query({ data: null, error: null });
    const insert = query({ data: null, error: { code: "write_failed" } });
    mocks.from.mockReturnValueOnce(asset).mockReturnValueOnce(lookup).mockReturnValueOnce(insert);
    await expect(setRouteCoverFromLibraryAsset(5, "asset-uuid", "ภาพ")).rejects.toThrow("ROUTE_COVER_SAVE_FAILED");
    expect(mocks.from).toHaveBeenCalledTimes(3);
  });

  it("removes the new association when clearing competing cover flags fails", async () => {
    const asset = query({ data: { storage_path: "shared.webp", mime_type: "image/webp", lifecycle_status: "active" }, error: null });
    const lookup = query({ data: null, error: null });
    const insert = query({ data: { media_id: 92 }, error: null });
    const clear = query({ data: null, error: { code: "write_failed" } });
    const rollback = query({ data: null, error: null });
    mocks.from.mockReturnValueOnce(asset).mockReturnValueOnce(lookup).mockReturnValueOnce(insert).mockReturnValueOnce(clear).mockReturnValueOnce(rollback);
    await expect(setRouteCoverFromLibraryAsset(5, "asset-uuid", "ภาพ")).rejects.toThrow("ROUTE_COVER_SAVE_FAILED");
    expect(rollback.delete).toHaveBeenCalledOnce();
    expect(rollback.eq).toHaveBeenCalledWith("route_id", 5);
    expect(rollback.eq).toHaveBeenCalledWith("media_id", 92);
  });

  it("restores the existing association's original fields when clearing fails", async () => {
    const previous = { alt_text_th: "เดิม", is_active: false, lifecycle_status: "archived", is_cover: false };
    const asset = query({ data: { storage_path: "shared.webp", mime_type: "image/webp", lifecycle_status: "active" }, error: null });
    const lookup = query({ data: { media_id: 92, ...previous }, error: null });
    const update = query({ data: null, error: null });
    const clear = query({ data: null, error: { code: "write_failed" } });
    const rollback = query({ data: null, error: null });
    mocks.from.mockReturnValueOnce(asset).mockReturnValueOnce(lookup).mockReturnValueOnce(update).mockReturnValueOnce(clear).mockReturnValueOnce(rollback);
    await expect(setRouteCoverFromLibraryAsset(5, "asset-uuid", "ใหม่")).rejects.toThrow("ROUTE_COVER_SAVE_FAILED");
    expect(lookup.select).toHaveBeenCalledWith("media_id, alt_text_th, is_active, lifecycle_status, is_cover");
    expect(rollback.update).toHaveBeenCalledWith(previous);
    expect(rollback.eq).toHaveBeenCalledWith("route_id", 5);
    expect(rollback.eq).toHaveBeenCalledWith("media_id", 92);
    expect(rollback.delete).not.toHaveBeenCalled();
  });

  it("distinguishes rollback failure without acknowledging a saved cover", async () => {
    const asset = query({ data: { storage_path: "shared.webp", mime_type: "image/webp", lifecycle_status: "active" }, error: null });
    const lookup = query({ data: null, error: null });
    const insert = query({ data: { media_id: 92 }, error: null });
    const failure = query({ data: null, error: { code: "write_failed" } });
    mocks.from.mockReturnValueOnce(asset).mockReturnValueOnce(lookup).mockReturnValueOnce(insert).mockReturnValueOnce(failure).mockReturnValueOnce(failure);
    await expect(setRouteCoverFromLibraryAsset(5, "asset-uuid", "ภาพ")).rejects.toThrow("ROUTE_COVER_ROLLBACK_FAILED");
  });
});
