import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

type QueryResult = {
  data: unknown;
  error: unknown;
  count?: number | null;
};

type MockFn = ReturnType<typeof vi.fn>;
type MockBuilder = {
  select: MockFn;
  eq: MockFn;
  is: MockFn;
  not: MockFn;
  or: MockFn;
  order: MockFn;
  range: MockFn;
  limit: MockFn;
  maybeSingle: MockFn;
  then: <TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) => Promise<TResult1 | TResult2>;
};

const serviceRoleMocks = vi.hoisted(() => ({ from: vi.fn() }));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: () => ({ from: serviceRoleMocks.from }),
}));

import {
  exportAdminCertificateTemplates,
  getAdminCertificateTemplateForStudio,
  listAdminCertificateTemplates,
} from "@/lib/repositories/admin-certificate-template.repository";

function createBuilder(result: QueryResult): MockBuilder {
  const builder = {} as MockBuilder;
  for (const method of ["select", "eq", "is", "not", "or", "order", "range", "limit"] as const) {
    builder[method] = vi.fn(() => builder);
  }
  builder.then = (onfulfilled, onrejected) => Promise.resolve(result).then(onfulfilled, onrejected);
  builder.maybeSingle = vi.fn(async () => result);
  return builder;
}

const templateRow = {
  template_id: 4,
  template_name: "Yala Memory",
  attraction_id: 11,
  background_path: "certificate-templates/yala.webp",
  language: "th",
  is_default: false,
  is_active: true,
  created_at: "2026-07-01T00:00:00.000Z",
  updated_at: null,
  layout_config_json: { orientation: "portrait", photoX: 52 },
  attractions: { name_th: "สกายวอล์คอัยเยอร์เวง", name_en: "Aiyerweng Skywalk" },
};

describe("admin certificate template repository", () => {
  let builder: MockBuilder;

  beforeEach(() => {
    vi.clearAllMocks();
    builder = createBuilder({ data: [templateRow], error: null, count: 13 });
    serviceRoleMocks.from.mockReturnValue(builder);
  });

  it("applies list filters, attraction scope, stable sort, and pagination", async () => {
    const result = await listAdminCertificateTemplates({
      page: 2,
      pageSize: 12,
      search: "Yala_100%",
      status: "active",
      language: "th",
      scope: "attraction",
      sort: "name_desc",
    });

    expect(serviceRoleMocks.from).toHaveBeenCalledWith("certificate_templates");
    expect(builder.or).toHaveBeenCalledWith('template_name.ilike."%Yala\\_100\\%%"');
    expect(builder.eq).toHaveBeenCalledWith("is_active", true);
    expect(builder.eq).toHaveBeenCalledWith("language", "th");
    expect(builder.not).toHaveBeenCalledWith("attraction_id", "is", null);
    expect(builder.order).toHaveBeenNthCalledWith(1, "template_name", { ascending: false });
    expect(builder.order).toHaveBeenNthCalledWith(2, "template_id", { ascending: true });
    expect(builder.range).toHaveBeenCalledWith(12, 23);
    expect(result).toMatchObject({ total: 13, page: 2, pageSize: 12 });
    expect(result.items[0]).toMatchObject({ attraction_name: "สกายวอล์คอัยเยอร์เวง" });
  });

  it("supports global scope and identical bounded export filters", async () => {
    const rows = await exportAdminCertificateTemplates(
      {
        search: "Memory",
        status: "inactive",
        language: "en",
        scope: "global",
        sort: "oldest",
      },
      51
    );

    expect(builder.is).toHaveBeenCalledWith("attraction_id", null);
    expect(builder.eq).toHaveBeenCalledWith("is_active", false);
    expect(builder.eq).toHaveBeenCalledWith("language", "en");
    expect(builder.order).toHaveBeenNthCalledWith(1, "created_at", { ascending: true });
    expect(builder.limit).toHaveBeenCalledWith(51);
    expect(builder.range).not.toHaveBeenCalled();
    expect(rows[0]?.template_name).toBe("Yala Memory");
  });

  it("returns a normalized typed layout for the studio", async () => {
    builder = createBuilder({ data: templateRow, error: null });
    serviceRoleMocks.from.mockReturnValue(builder);

    const result = await getAdminCertificateTemplateForStudio(4);

    expect(builder.eq).toHaveBeenCalledWith("template_id", 4);
    expect(result).toMatchObject({
      template_id: 4,
      layoutConfig: {
        version: 1,
        orientation: "portrait",
        photoX: 52,
        contentX: 50,
      },
    });
  });
});
