/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { resolveAndValidateCheckinCode } from "@/lib/services/checkin.service";
import { assignStampForVisit } from "@/lib/services/stamp.service";
import { z } from "zod";

const minimalFormSchema = z.object({
  displayName: z.string().min(1, "กรุณากรอกชื่อของคุณ").max(100),
  originCountry: z.string().min(1).max(100).default("Thailand"),
  originProvince: z.string().max(100).nullable().optional(),
  ageGroup: z.enum(["0-15", "16-24", "25-34", "35-44", "45-54", "55-64", "65+"]).nullable().optional(),
  hasConsented: z.boolean().refine((v) => v === true, { message: "กรุณายอมรับข้อตกลง" }),
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

import { getCheckinCodeByCode } from "@/lib/repositories/checkin.repository";
import { getVisitById } from "@/lib/repositories/visit.repository";
import { getTouristStampByAttraction, awardTouristStamp } from "@/lib/repositories/stamp.repository";

describe("QR Check-in Flow Hardening", () => {
  beforeEach(() => {
    vi.resetAllMocks();
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
      } as any);
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
      } as any);
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
      } as any);
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
        attraction: { is_active: true, is_published: true },
        photo_spot: null,
      } as any);
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

  describe("Duplicate Stamp Prevention (assignStampForVisit)", () => {
    it("returns already_earned if tourist already has the stamp", async () => {
      vi.mocked(getVisitById).mockResolvedValue({ tourist_id: "t1", attraction_id: 1 } as any);
      vi.mocked(getTouristStampByAttraction).mockResolvedValue({ stamp_id: "existing-id" } as any);

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
      vi.mocked(getVisitById).mockResolvedValue({ tourist_id: "t1", attraction_id: 1 } as any);
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
      vi.mocked(getVisitById).mockResolvedValue({ tourist_id: "t1", attraction_id: 1 } as any);
      // First check returns null (not found yet)
      vi.mocked(getTouristStampByAttraction)
        .mockResolvedValueOnce(null)
        // Second check after insert failure returns the concurrently inserted stamp
        .mockResolvedValueOnce({ stamp_id: "concurrent-stamp" } as any);
      
      // Simulate unique violation in repository by returning null
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
