import { beforeEach, describe, expect, it, vi } from "vitest";

type MockFn = ReturnType<typeof vi.fn>;
type Builder = {
  select: MockFn;
  update: MockFn;
  delete: MockFn;
  eq: MockFn;
  is: MockFn;
  single: MockFn;
  then: <TResult1 = unknown, TResult2 = never>(
    onfulfilled?: ((value: unknown) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) => Promise<TResult1 | TResult2>;
};

const mocks = vi.hoisted(() => ({
  requirePermission: vi.fn(),
  from: vi.fn(),
  createServiceRole: vi.fn(),
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/auth/guards", () => ({ requirePermission: mocks.requirePermission }));
vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: mocks.createServiceRole,
}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createServerClient,
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import {
  setTemplateAsDefault,
  toggleTemplateStatus,
} from "@/app/actions/admin-certificate-templates";

function builder(result: unknown): Builder {
  const query = {} as Builder;
  for (const method of ["select", "update", "delete", "eq", "is"] as const) {
    query[method] = vi.fn(() => query);
  }
  query.single = vi.fn(async () => result);
  query.then = (onfulfilled, onrejected) => Promise.resolve(result).then(onfulfilled, onrejected);
  return query;
}

describe("admin certificate template actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requirePermission.mockResolvedValue({ adminId: "admin-1" });
    mocks.createServiceRole.mockReturnValue({ from: mocks.from });
    mocks.createServerClient.mockRejectedValue(new Error("anon client must not be used"));
  });

  it("uses the service-role boundary after permission checks", async () => {
    mocks.from
      .mockReturnValueOnce(builder({ data: { is_default: false }, error: null }))
      .mockReturnValueOnce(builder({ error: null }));

    await expect(toggleTemplateStatus(4, false)).resolves.toBeUndefined();
    expect(mocks.requirePermission).toHaveBeenCalledWith("certificate.template_manage");
    expect(mocks.createServiceRole).toHaveBeenCalledTimes(1);
    expect(mocks.createServerClient).not.toHaveBeenCalled();
  });

  it("rejects an invalid template id before creating a service-role client", async () => {
    await expect(toggleTemplateStatus(Number.NaN, false)).rejects.toThrow(
      "รหัสเทมเพลตไม่ถูกต้อง"
    );
    expect(mocks.requirePermission).toHaveBeenCalledWith("certificate.template_manage");
    expect(mocks.createServiceRole).not.toHaveBeenCalled();
  });

  it("prevents deactivating the default template on the server", async () => {
    mocks.from.mockReturnValueOnce(
      builder({ data: { is_default: true }, error: null })
    );

    await expect(toggleTemplateStatus(4, false)).rejects.toThrow(
      "เทมเพลตเริ่มต้นต้องเปิดใช้งานเสมอ"
    );
    expect(mocks.from).toHaveBeenCalledTimes(1);
  });

  it("does not set a new default when clearing the previous default fails", async () => {
    mocks.from
      .mockReturnValueOnce(
        builder({ data: { language: "th", attraction_id: null }, error: null })
      )
      .mockReturnValueOnce(builder({ error: { message: "update failed" } }));

    await expect(setTemplateAsDefault(4)).rejects.toThrow(
      "ไม่สามารถยกเลิกเทมเพลตเริ่มต้นเดิมได้"
    );
    expect(mocks.from).toHaveBeenCalledTimes(2);
  });
});
