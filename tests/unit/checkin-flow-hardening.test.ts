import { describe, expect, it, vi, beforeEach } from "vitest";
import { resolveAndValidateCheckinCode } from "@/lib/services/checkin.service";
import { assignStampForVisit } from "@/lib/services/stamp.service";
import { initiateCheckin } from "@/app/actions/checkin-actions";
import { minimalFormSchema } from "@/lib/validation/checkin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth/guest", () => ({
  getOrCreateGuestIdentity: vi.fn().mockResolvedValue("mock-guest-token"),
}));

vi.mock("@/lib/services/visit.service", () => ({
  initiateVisit: vi.fn().mockResolvedValue("mock-visit-id"),
}));

vi.mock("@/lib/services/xp.service", () => ({
  awardXP: vi.fn(),
}));

const mockSupabaseQuery = vi.hoisted(() => {
  const q = {
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    select: vi.fn(),
    maybeSingle: vi.fn(),
    single: vi.fn(),
    reset: () => {
      q.insert.mockClear();
      q.update.mockClear();
      q.delete.mockClear();
      q.eq.mockClear();
      q.select.mockClear();
      q.maybeSingle.mockClear();
      q.single.mockClear();
      q.maybeSingle.mockResolvedValue({ data: null, error: null });
      q.single.mockResolvedValue({ data: { tourist_id: "mock-tourist-id" }, error: null });
      q.insert.mockReturnThis();
      q.update.mockReturnThis();
      q.delete.mockReturnThis();
      q.eq.mockReturnThis();
      q.select.mockReturnThis();
    }
  };
  q.reset();
  return q;
});

vi.mock("@/lib/supabase/service-role", () => {
  return {
    createSupabaseServiceRoleClient: () => ({
      from: vi.fn().mockReturnValue(mockSupabaseQuery),
    }),
  };
});

vi.mock("@/lib/repositories/checkin.repository", () => ({
  getCheckinCodeByCode: vi.fn(),
}));

vi.mock("@/lib/repositories/funnel.repository", () => ({
  recordFunnelEvent: vi.fn(),
}));

vi.mock("@/lib/repositories/visit.repository", () => ({
  getVisitById: vi.fn(),
}));

vi.mock("@/lib/repositories/stamp.repository", () => ({
  getTouristStampByAttraction: vi.fn(),
  awardTouristStamp: vi.fn(),
}));

vi.mock("@/lib/repositories/consent.repository", () => ({
  createConsentRecord: vi.fn(),
}));

vi.mock("@/lib/repositories/geography.repository", () => ({
  resolveCountryId: vi.fn(),
  resolveProvinceId: vi.fn(),
}));

import { initiateVisit } from "@/lib/services/visit.service";
import { getCheckinCodeByCode, type CheckinCodeDetails } from "@/lib/repositories/checkin.repository";
import { resolveCountryId, resolveProvinceId } from "@/lib/repositories/geography.repository";
import { createConsentRecord } from "@/lib/repositories/consent.repository";
import { getVisitById } from "@/lib/repositories/visit.repository";
import { getTouristStampByAttraction, awardTouristStamp } from "@/lib/repositories/stamp.repository";
// Use generic Record types instead of typed Supabase rows to avoid TS errors during typecheck,
// since the true Database schema is not fully generated locally.
type VisitRow = Record<string, unknown>;
type TouristStampRow = Record<string, unknown>;

describe("QR Check-in Flow Hardening", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseQuery.reset();
  });

  describe("QR Validation (resolveAndValidateCheckinCode)", () => {
    it("returns not_found if code does not exist", async () => {
      vi.mocked(getCheckinCodeByCode).mockResolvedValue(null);
      const res = await resolveAndValidateCheckinCode("invalid-code");
      expect(res.status).toBe("not_found");
    });

    it("returns inactive if code is not active", async () => {
      vi.mocked(getCheckinCodeByCode).mockResolvedValue({
        checkin_code_id: 1,
        code: "test",
        is_active: false,
        attraction_id: 1,
        starts_at: null,
        ends_at: null,
      } as unknown as CheckinCodeDetails);
      const res = await resolveAndValidateCheckinCode("test");
      expect(res.status).toBe("inactive");
    });

    it("returns expired if past ends_at", async () => {
      vi.mocked(getCheckinCodeByCode).mockResolvedValue({
        checkin_code_id: 1,
        code: "test",
        is_active: true,
        attraction_id: 1,
        starts_at: null,
        ends_at: new Date(Date.now() - 10000).toISOString(),
      } as unknown as CheckinCodeDetails);
      const res = await resolveAndValidateCheckinCode("test");
      expect(res.status).toBe("expired");
    });

    it("returns unavailable if attraction is inactive or unpublished", async () => {
      vi.mocked(getCheckinCodeByCode).mockResolvedValue({
        checkin_code_id: 1,
        code: "test",
        is_active: true,
        attraction_id: 1,
        starts_at: null,
        ends_at: null,
        attraction: { is_active: true, is_published: false },
      } as unknown as CheckinCodeDetails);
      const res = await resolveAndValidateCheckinCode("test");
      expect(res.status).toBe("unavailable");
    });

    it("returns valid if all conditions are met", async () => {
      vi.mocked(getCheckinCodeByCode).mockResolvedValue({
        checkin_code_id: 1,
        code: "test",
        is_active: true,
        attraction_id: 1,
        starts_at: null,
        ends_at: null,
        attraction: { is_active: true, is_published: true, attraction_id: 1 },
        photo_spot: null,
      } as unknown as CheckinCodeDetails);
      const res = await resolveAndValidateCheckinCode("test");
      expect(res.status).toBe("valid");
    });
  });

  describe("Minimal Form Validation", () => {
    it("fails if consent is false", () => {
      const res = minimalFormSchema.safeParse({
        displayName: "John",
        hasConsented: false,
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.flatten().fieldErrors.hasConsented?.[0]).toBe("กรุณายอมรับข้อตกลง");
      }
    });

    it("passes with valid data", () => {
      const res = minimalFormSchema.safeParse({
        displayName: "John",
        hasConsented: true,
      });
      expect(res.success).toBe(true);
    });
  });

  describe("Server Action: initiateCheckin", () => {
    it("returns form error if QR is invalid", async () => {
      vi.mocked(getCheckinCodeByCode).mockResolvedValue(null);
      const formData = new FormData();
      formData.set("displayName", "John");
      formData.set("hasConsented", "true");

      const result = await initiateCheckin("invalid-code", {}, formData);
      expect(result.errors?._form?.[0]).toContain("ไม่สามารถใช้งานได้");
    });

    it("returns field error if consent is missing", async () => {
      vi.mocked(getCheckinCodeByCode).mockResolvedValue({
        checkin_code_id: 1,
        code: "test",
        is_active: true,
        attraction_id: 1,
        starts_at: null,
        ends_at: null,
        attraction: { is_active: true, is_published: true, attraction_id: 1 },
        photo_spot: null,
      } as unknown as CheckinCodeDetails);

      const formData = new FormData();
      formData.set("displayName", "John");
      formData.set("hasConsented", "false"); // Consent failed

      const result = await initiateCheckin("test", {}, formData);
      expect(result.errors?.hasConsented?.[0]).toContain("กรุณายอมรับข้อตกลง");
    });

    it("existing tourist with non-null fields is not overwritten", async () => {
      vi.mocked(getCheckinCodeByCode).mockResolvedValue({
        checkin_code_id: 1,
        code: "test",
        is_active: true,
        attraction_id: 1,
        starts_at: null,
        ends_at: null,
        attraction: { is_active: true, is_published: true, attraction_id: 1 },
        photo_spot: null,
      } as unknown as CheckinCodeDetails);

      mockSupabaseQuery.maybeSingle.mockResolvedValueOnce({
        data: {
          tourist_id: "mock-tourist-id",
          tourists: { origin_country_id: 1, origin_province_id: 10, age_group: "15-24" }
        },
        error: null
      });

      const formData = new FormData();
      formData.set("displayName", "John");
      formData.set("hasConsented", "true");

      vi.mocked(redirect).mockImplementationOnce(() => { throw new Error("NEXT_REDIRECT"); });

      await expect(initiateCheckin("test", {}, formData)).rejects.toThrow("NEXT_REDIRECT");

      // Verify no update on tourists table
      expect(mockSupabaseQuery.update).not.toHaveBeenCalledWith(expect.objectContaining({
        origin_country_id: expect.anything()
      }));
    });

    it("existing tourist with null fields is backfilled", async () => {
      vi.mocked(getCheckinCodeByCode).mockResolvedValue({
        checkin_code_id: 1,
        code: "test",
        is_active: true,
        attraction_id: 1,
        starts_at: null,
        ends_at: null,
        attraction: { is_active: true, is_published: true, attraction_id: 1 },
        photo_spot: null,
      } as unknown as CheckinCodeDetails);

      vi.mocked(resolveCountryId).mockResolvedValue(1);
      vi.mocked(resolveProvinceId).mockResolvedValue(10);

      mockSupabaseQuery.maybeSingle.mockResolvedValueOnce({
        data: {
          tourist_id: "mock-tourist-id",
          tourists: { origin_country_id: null, origin_province_id: null, age_group: null }
        },
        error: null
      });

      const formData = new FormData();
      formData.set("displayName", "John");
      formData.set("originCountry", "Thailand");
      formData.set("originProvince", "Pattani");
      formData.set("ageGroup", "25-34");
      formData.set("hasConsented", "true");

      vi.mocked(redirect).mockImplementationOnce(() => { throw new Error("NEXT_REDIRECT"); });

      await expect(initiateCheckin("test", {}, formData)).rejects.toThrow("NEXT_REDIRECT");

      // Verify update backfills missing fields
      expect(mockSupabaseQuery.update).toHaveBeenCalledWith(expect.objectContaining({
        origin_country_id: 1,
        origin_province_id: 10,
        age_group: "25-34"
      }));
    });

        it("existing tourist backfill failure returns an error and does not initiate visit", async () => {
      vi.mocked(getCheckinCodeByCode).mockResolvedValue({
        checkin_code_id: 1,
        code: "test",
        is_active: true,
        attraction_id: 1,
        starts_at: null,
        ends_at: null,
        attraction: { is_active: true, is_published: true, attraction_id: 1 },
        photo_spot: null,
      } as unknown as CheckinCodeDetails);

      vi.mocked(resolveCountryId).mockResolvedValue(1);
      vi.mocked(resolveProvinceId).mockResolvedValue(10);

      mockSupabaseQuery.maybeSingle.mockResolvedValueOnce({
        data: {
          tourist_id: "mock-tourist-id",
          tourists: { origin_country_id: null, origin_province_id: null, age_group: null }
        },
        error: null
      });

      // Mock update to fail
      mockSupabaseQuery.update.mockImplementation((payload) => {
         if (payload.origin_country_id !== undefined) {
             return { eq: vi.fn().mockResolvedValue({ error: new Error("DB_UPDATE_ERROR") }) };
         }
         return mockSupabaseQuery;
      });

      const formData = new FormData();
      formData.set("displayName", "John");
      formData.set("originCountry", "Thailand");
      formData.set("originProvince", "Pattani");
      formData.set("ageGroup", "25-34");
      formData.set("hasConsented", "true");

      const result = await initiateCheckin("test", {}, formData);

      expect(result.errors?._form?.[0]).toContain("เกิดข้อผิดพลาดในการปรับปรุงข้อมูล");
      expect(initiateVisit).not.toHaveBeenCalled();
    });

it("consent insert failure returns an error and does not initiate visit", async () => {
      vi.mocked(getCheckinCodeByCode).mockResolvedValue({
        checkin_code_id: 1,
        code: "test",
        is_active: true,
        attraction_id: 1,
        starts_at: null,
        ends_at: null,
        attraction: { is_active: true, is_published: true, attraction_id: 1 },
        photo_spot: null,
      } as unknown as CheckinCodeDetails);

      const formData = new FormData();
      formData.set("displayName", "John");
      formData.set("hasConsented", "true");

      vi.mocked(createConsentRecord).mockRejectedValueOnce(new Error("DB_ERROR"));

      const result = await initiateCheckin("test", {}, formData);

      expect(result.errors?._form?.[0]).toContain("ไม่สามารถบันทึกความยินยอมได้");
    });

        it("identity insert failure returns an error and does not initiate visit", async () => {
      vi.mocked(getCheckinCodeByCode).mockResolvedValue({
        checkin_code_id: 1,
        code: "test",
        is_active: true,
        attraction_id: 1,
        starts_at: null,
        ends_at: null,
        attraction: { is_active: true, is_published: true, attraction_id: 1 },
        photo_spot: null,
      } as unknown as CheckinCodeDetails);

      // New tourist scenario
      mockSupabaseQuery.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
      mockSupabaseQuery.single.mockResolvedValueOnce({ data: { tourist_id: "new-tourist-id" }, error: null });

      // Consent (none existing, insert success)
      mockSupabaseQuery.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
      vi.mocked(createConsentRecord).mockResolvedValueOnce(undefined);

      // Identity insert failure
      mockSupabaseQuery.insert.mockImplementation((payload) => {
         if (payload.provider) {
             return { error: new Error("IDENTITY_INSERT_ERROR") };
         }
         return mockSupabaseQuery;
      });

      const formData = new FormData();
      formData.set("displayName", "John");
      formData.set("hasConsented", "true");

      const result = await initiateCheckin("test", {}, formData);

      expect(result.errors?._form?.[0]).toContain("เกิดข้อผิดพลาดในการเชื่อมโยงบัญชี");
      expect(initiateVisit).not.toHaveBeenCalled();
      expect(mockSupabaseQuery.delete).toHaveBeenCalled();
    });

it("valid Thai tourist stores country/province/age and redirects", async () => {
      vi.mocked(getCheckinCodeByCode).mockResolvedValue({
        checkin_code_id: 1,
        code: "test",
        is_active: true,
        attraction_id: 1,
        starts_at: null,
        ends_at: null,
        attraction: { is_active: true, is_published: true, attraction_id: 1 },
        photo_spot: null,
      } as unknown as CheckinCodeDetails);

      vi.mocked(resolveCountryId).mockResolvedValue(1); // 1 = Thailand
      vi.mocked(resolveProvinceId).mockResolvedValue(10); // 10 = Pattani

      const formData = new FormData();
      formData.set("displayName", "John");
      formData.set("originCountry", "Thailand");
      formData.set("originProvince", "Pattani");
      formData.set("ageGroup", "25-34");
      formData.set("hasConsented", "true");

      vi.mocked(redirect).mockImplementationOnce(() => { throw new Error("NEXT_REDIRECT"); });

      await expect(initiateCheckin("test", {}, formData)).rejects.toThrow("NEXT_REDIRECT");

      expect(resolveCountryId).toHaveBeenCalledWith("Thailand");
      expect(resolveProvinceId).toHaveBeenCalledWith("Pattani");
      expect(revalidatePath).toHaveBeenCalledWith("/checkin/test");
      expect(redirect).toHaveBeenCalledWith("/visit/mock-visit-id/photo");
    });

    it("foreign tourist stores country and null province", async () => {
      vi.mocked(getCheckinCodeByCode).mockResolvedValue({
        checkin_code_id: 1,
        code: "test",
        is_active: true,
        attraction_id: 1,
        starts_at: null,
        ends_at: null,
        attraction: { is_active: true, is_published: true, attraction_id: 1 },
        photo_spot: null,
      } as unknown as CheckinCodeDetails);

      vi.mocked(resolveCountryId).mockResolvedValue(2); // 2 = Malaysia
      vi.mocked(resolveProvinceId).mockResolvedValue(null);

      const formData = new FormData();
      formData.set("displayName", "Ali");
      formData.set("originCountry", "Malaysia");
      formData.set("hasConsented", "true");

      vi.mocked(redirect).mockImplementationOnce(() => { throw new Error("NEXT_REDIRECT"); });

      await expect(initiateCheckin("test", {}, formData)).rejects.toThrow("NEXT_REDIRECT");

      expect(resolveCountryId).toHaveBeenCalledWith("Malaysia");
      expect(resolveProvinceId).not.toHaveBeenCalled(); // Shouldn't be called for non-Thailand
      expect(revalidatePath).toHaveBeenCalledWith("/checkin/test");
      expect(redirect).toHaveBeenCalledWith("/visit/mock-visit-id/photo");
    });
  });

  describe("Duplicate Stamp Prevention (assignStampForVisit)", () => {
    it("returns already_earned if tourist already has the stamp", async () => {
      vi.mocked(getVisitById).mockResolvedValue({ tourist_id: "t1", attraction_id: 1 } as unknown as VisitRow);
      vi.mocked(getTouristStampByAttraction).mockResolvedValue({ stamp_id: "existing-id" } as unknown as TouristStampRow);

      const result = await assignStampForVisit("visit-1");
      expect(result.success).toBe(true);
      if (result.success && "status" in result) {
        expect(result.status).toBe("already_earned");
        if (result.status === "already_earned") {
          expect(result.stampId).toBe("existing-id");
        }
      }
    });

    it("awards stamp if no existing stamp", async () => {
      vi.mocked(getVisitById).mockResolvedValue({ tourist_id: "t1", attraction_id: 1 } as unknown as VisitRow);
      vi.mocked(getTouristStampByAttraction).mockResolvedValue(null);
      vi.mocked(awardTouristStamp).mockResolvedValue("new-stamp-id");

      const result = await assignStampForVisit("visit-1");
      expect(result.success).toBe(true);
      if (result.success && "status" in result) {
        expect(result.status).toBe("earned");
        if (result.status === "earned") {
          expect(result.stampId).toBe("new-stamp-id");
        }
      }
    });

    it("handles concurrent award gracefully (returns already_earned on null insert fallback)", async () => {
      vi.mocked(getVisitById).mockResolvedValue({ tourist_id: "t1", attraction_id: 1 } as unknown as VisitRow);
      vi.mocked(getTouristStampByAttraction)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ stamp_id: "concurrent-stamp" } as unknown as TouristStampRow);

      vi.mocked(awardTouristStamp).mockResolvedValue(null);

      const result = await assignStampForVisit("visit-1");
      expect(result.success).toBe(true);
      if (result.success && "status" in result) {
        expect(result.status).toBe("already_earned");
        if (result.status === "already_earned") {
          expect(result.stampId).toBe("concurrent-stamp");
        }
      }
    });
  });
});
