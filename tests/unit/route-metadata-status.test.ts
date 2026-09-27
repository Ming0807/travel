import { expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({ update: vi.fn(), eq: vi.fn(), select: vi.fn(), single: vi.fn() }));
vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: () => ({ from: () => {
    const builder = { update: mocks.update, eq: mocks.eq, select: mocks.select, single: mocks.single };
    for (const method of ["update", "eq", "select"] as const) builder[method].mockReturnValue(builder);
    return builder;
  } }),
}));
import { updateAdminRoute } from "@/lib/repositories/admin-route.repository";

it("does not write publication or activation flags from a stale metadata form", async () => {
  mocks.single.mockResolvedValue({ data: { route_id: 5, name_th: "หน้าถ้ำ", slug: "na-tham" }, error: null });
  await updateAdminRoute(5, { nameTh: "หน้าถ้ำ", slug: "na-tham", nameEn: null, descriptionTh: null, descriptionEn: null, isActive: true, isPublished: false, coverMediaId: null });
  expect(mocks.update).toHaveBeenCalledWith({ name_th: "หน้าถ้ำ", slug: "na-tham", name_en: null, description_th: null, description_en: null });
});
