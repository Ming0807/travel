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

vi.mock("@/lib/supabase/service-role", () => {
  const createMockBuilder = () => {
    const builder: Record<string, unknown> = {
      maybeSingle: () => Promise.resolve({ data: null, error: null }),
      single: () => Promise.resolve({ data: { tourist_id: "mock-tourist-id" }, error: null }),
    };
    builder.select = () => builder;
    builder.insert = () => builder;
    builder.update = () => builder;
    builder.eq = () => builder;
    return builder;
  };

  const mockSupabase = {
    from: () => createMockBuilder(),
  };

  return {
    createSupabaseServiceRoleClient: () => mockSupabase,
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

import { getCheckinCodeByCode, type CheckinCodeDetails } from "@/lib/repositories/checkin.repository";
import { getVisitById } from "@/lib/repositories/visit.repository";
import { getTouristStampByAttraction, awardTouristStamp } from "@/lib/repositories/stamp.repository";
// Use generic Record types instead of typed Supabase rows to avoid TS errors during typecheck,
// since the true Database schema is not fully generated locally.
type VisitRow = Record<string, unknown>;
type TouristStampRow = Record<string, unknown>;

describe("QR Check-in Flow Hardening", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    it("creates visit and redirects if data is valid", async () => {
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

      // redirect normally throws to interrupt flow, we simulate it here just throwing an error
      // so we know it actually executed the redirect call.
      vi.mocked(redirect).mockImplementationOnce(() => { throw new Error("NEXT_REDIRECT"); });

      try {
        await initiateCheckin("test", {}, formData);
      } catch (e: unknown) {
        if (e instanceof Error) {
          expect(e.message).toBe("NEXT_REDIRECT");
        }
      }


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
