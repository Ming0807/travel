import { beforeEach, describe, expect, it, vi } from "vitest";

type MockFn = ReturnType<typeof vi.fn>;
type Builder = {
  select: MockFn;
  update: MockFn;
  delete: MockFn;
  eq: MockFn;
  is: MockFn;
  single: MockFn;
  maybeSingle: MockFn;
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
  rpc: vi.fn(),
  logAdminAction: vi.fn(),
  deletePrivateFile: vi.fn(),
}));

vi.mock("@/lib/auth/guards", () => ({ requirePermission: mocks.requirePermission }));
vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: mocks.createServiceRole,
}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createServerClient,
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/repositories/admin-audit.repository", () => ({
  logAdminAction: mocks.logAdminAction,
}));
vi.mock("@/lib/storage/private-files", () => ({
  deletePrivateFile: mocks.deletePrivateFile,
}));

import {
  deleteTemplate,
  searchCertificateTemplateAttractions,
  setTemplateAsDefault,
  toggleTemplateStatus,
  updateCertificateTemplateLayout,
} from "@/app/actions/admin-certificate-templates";

function builder(result: unknown): Builder {
  const query = {} as Builder;
  for (const method of ["select", "update", "delete", "eq", "is"] as const) {
    query[method] = vi.fn(() => query);
  }
  query.single = vi.fn(async () => result);
  query.maybeSingle = vi.fn(async () => result);
  query.then = (onfulfilled, onrejected) => Promise.resolve(result).then(onfulfilled, onrejected);
  return query;
}

describe("admin certificate template actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requirePermission.mockResolvedValue({ adminId: "admin-1" });
    mocks.createServiceRole.mockReturnValue({ from: mocks.from, rpc: mocks.rpc });
    mocks.createServerClient.mockRejectedValue(new Error("anon client must not be used"));
    mocks.logAdminAction.mockResolvedValue(undefined);
    mocks.deletePrivateFile.mockResolvedValue(undefined);
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

  it("uses the atomic RPC and reports a failed default switch", async () => {
    mocks.rpc.mockResolvedValue({
      data: { success: false, error_code: "TEMPLATE_DEFAULT_UPDATE_FAILED" },
      error: null,
    });

    await expect(setTemplateAsDefault(4)).rejects.toThrow(
      "ไม่สามารถตั้งเป็นค่าเริ่มต้นได้"
    );
    expect(mocks.rpc).toHaveBeenCalledWith("set_certificate_template_default", {
      p_template_id: 4,
    });
    expect(mocks.logAdminAction).not.toHaveBeenCalled();
  });

  it("blocks deleting the default template on the server", async () => {
    mocks.from.mockReturnValueOnce(
      builder({ data: { background_path: "template.webp", is_default: true }, error: null })
    );

    await expect(deleteTemplate(4)).rejects.toThrow("ไม่สามารถลบเทมเพลตเริ่มต้นได้");
    expect(mocks.from).toHaveBeenCalledTimes(1);
    expect(mocks.deletePrivateFile).not.toHaveBeenCalled();
  });

  it("removes the private background after deleting an unused template", async () => {
    mocks.from
      .mockReturnValueOnce(
        builder({ data: { background_path: "certificate-templates/old.webp", is_default: false }, error: null })
      )
      .mockReturnValueOnce(builder({ error: null }));

    await expect(deleteTemplate(4)).resolves.toBeUndefined();
    expect(mocks.deletePrivateFile).toHaveBeenCalledWith({
      bucket: "southern-border-tourism",
      path: "certificate-templates/old.webp",
    });
    expect(mocks.logAdminAction).toHaveBeenCalledWith(
      expect.objectContaining({ action: "certificate.template_deleted", entityId: "4" })
    );
  });

  it("searches active attractions for the guided template picker", async () => {
    const query = {
      select: vi.fn(),
      eq: vi.fn(),
      or: vi.fn(),
      order: vi.fn(),
      limit: vi.fn(),
    };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.or.mockReturnValue(query);
    query.order.mockReturnValue(query);
    query.limit.mockResolvedValue({
      data: [{ attraction_id: 12, name_th: "อัยเยอร์เวง", name_en: "Aiyerweng", slug: "aiyerweng" }],
      error: null,
    });
    mocks.from.mockReturnValue(query);

    await expect(searchCertificateTemplateAttractions(" อัย ")).resolves.toMatchObject({
      success: true,
      data: [expect.objectContaining({ attraction_id: 12 })],
    });
    expect(mocks.requirePermission).toHaveBeenCalledWith("certificate.template_manage");
    expect(query.eq).toHaveBeenCalledWith("is_active", true);
    expect(query.limit).toHaveBeenCalledWith(20);
  });

  it("updates a validated studio layout and writes a privacy-safe audit event", async () => {
    const layout = {
      version: 1 as const,
      orientation: "landscape" as const,
      theme: "emerald-gold" as const,
      photoShape: "circle" as const,
      photoX: 27,
      photoY: 52,
      photoSize: 30,
      contentX: 68,
      contentY: 52,
      contentWidth: 48,
      textAlign: "left" as const,
      overlayOpacity: 10,
      textColor: "#173F37",
      accentColor: "#0A6B62",
      titleScale: 100,
      safeMargin: 6,
      showProvince: true,
      showDate: true,
    };
    mocks.from.mockReturnValueOnce(builder({ data: { template_id: 4 }, error: null }));

    await expect(updateCertificateTemplateLayout(4, layout)).resolves.toEqual({ success: true });
    expect(mocks.requirePermission).toHaveBeenCalledWith("certificate.template_manage");
    expect(mocks.logAdminAction).toHaveBeenCalledWith({
      adminId: "admin-1",
      action: "certificate.template_layout_updated",
      entityType: "certificate_template",
      entityId: "4",
      details: {
        orientation: "landscape",
        theme: "emerald-gold",
        photoShape: "circle",
      },
    });
  });

  it("rejects an out-of-bounds studio layout before opening a database query", async () => {
    await expect(
      updateCertificateTemplateLayout(4, {
        version: 1,
        orientation: "landscape",
        photoX: 999,
      })
    ).rejects.toThrow("รูปแบบเทมเพลตไม่ถูกต้อง");
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("rejects an overlapping layout even when every field is within its numeric bounds", async () => {
    const overlappingLayout = {
      version: 1,
      orientation: "landscape",
      theme: "emerald-gold",
      photoShape: "circle",
      photoX: 50,
      photoY: 50,
      photoSize: 40,
      contentX: 52,
      contentY: 50,
      contentWidth: 50,
      textAlign: "left",
      overlayOpacity: 10,
      textColor: "#173F37",
      accentColor: "#0A6B62",
      titleScale: 100,
      safeMargin: 6,
      showProvince: true,
      showDate: true,
    };

    await expect(updateCertificateTemplateLayout(4, overlappingLayout)).rejects.toThrow(
      "องค์ประกอบอยู่นอกขอบเขตปลอดภัยหรือทับกัน"
    );
    expect(mocks.from).not.toHaveBeenCalled();
  });
});
