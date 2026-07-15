import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

type QueryResult = {
  data: Array<Record<string, unknown>> | null;
  error: unknown;
  count?: number | null;
};

type MockFn = ReturnType<typeof vi.fn>;

type MockQueryBuilder = {
  select: MockFn;
  order: MockFn;
  range: MockFn;
  eq: MockFn;
  or: MockFn;
  limit: MockFn;
  then: <TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) => Promise<TResult1 | TResult2>;
};

const serviceRoleMocks = vi.hoisted(() => ({
  from: vi.fn(),
}));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: () => ({
    from: serviceRoleMocks.from,
  }),
}));

vi.mock("@/lib/media/storage-paths", () => ({
  siteMediaImageUrl: (path: string | null | undefined) => (path ? `/site-media/${path}` : null),
}));

import {
  exportAdminMediaLibraryAssets,
  listAdminMediaLibraryAssets,
} from "@/lib/repositories/admin-media-library.repository";

function createBuilder(result: QueryResult = { data: [], error: null, count: 0 }): MockQueryBuilder {
  const builder = {} as MockQueryBuilder;
  const chainMethods = ["select", "order", "range", "eq", "or", "limit"] as const;

  for (const method of chainMethods) {
    builder[method] = vi.fn(() => builder);
  }

  builder.then = (onfulfilled, onrejected) => Promise.resolve(result).then(onfulfilled, onrejected);
  return builder;
}

describe("admin media library repository filters", () => {
  let builder: MockQueryBuilder;

  beforeEach(() => {
    vi.clearAllMocks();
    builder = createBuilder();
    serviceRoleMocks.from.mockReturnValue(builder);
  });

  it("applies search, category, lifecycle, media type, and pagination to the list", async () => {
    await listAdminMediaLibraryAssets({
      page: 2,
      pageSize: 20,
      search: "hero_%",
      category: "Homepage",
      lifecycleStatus: "archived",
      mediaType: "webp",
    });

    expect(serviceRoleMocks.from).toHaveBeenCalledWith("media_assets");
    expect(builder.select).toHaveBeenCalledWith(
      "id,file_name,storage_path,thumbnail_storage_path,mime_type,size_bytes,category,lifecycle_status,created_at",
      { count: "exact" },
    );
    expect(builder.or).toHaveBeenCalledWith(
      'file_name.ilike."%hero\\_\\%%",storage_path.ilike."%hero\\_\\%%",category.ilike."%hero\\_\\%%",mime_type.ilike."%hero\\_\\%%"',
    );
    expect(builder.eq).toHaveBeenCalledWith("category", "Homepage");
    expect(builder.eq).toHaveBeenCalledWith("lifecycle_status", "archived");
    expect(builder.eq).toHaveBeenCalledWith("mime_type", "image/webp");
    expect(builder.range).toHaveBeenCalledWith(20, 39);
  });

  it("applies the same filters and a hard limit to export", async () => {
    await exportAdminMediaLibraryAssets(
      {
        search: "hero_%",
        category: "Homepage",
        lifecycleStatus: "archived",
        mediaType: "webp",
      },
      501,
    );

    expect(serviceRoleMocks.from).toHaveBeenCalledWith("media_assets");
    expect(builder.or).toHaveBeenCalledWith(
      'file_name.ilike."%hero\\_\\%%",storage_path.ilike."%hero\\_\\%%",category.ilike."%hero\\_\\%%",mime_type.ilike."%hero\\_\\%%"',
    );
    expect(builder.eq).toHaveBeenCalledWith("category", "Homepage");
    expect(builder.eq).toHaveBeenCalledWith("lifecycle_status", "archived");
    expect(builder.eq).toHaveBeenCalledWith("mime_type", "image/webp");
    expect(builder.limit).toHaveBeenCalledWith(501);
    expect(builder.range).not.toHaveBeenCalled();
  });

  it("does not add a lifecycle predicate when all statuses are requested", async () => {
    await listAdminMediaLibraryAssets({
      page: 1,
      pageSize: 20,
      lifecycleStatus: "all",
    });

    expect(builder.eq).not.toHaveBeenCalledWith("lifecycle_status", expect.anything());
  });
});
