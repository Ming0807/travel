import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { initiateCheckin } from "@/app/actions/checkin-actions";
import { minimalFormSchema } from "@/lib/validation/checkin";
import { getCheckinCodeByCode, type CheckinCodeDetails } from "@/lib/repositories/checkin.repository";
import { createConsentRecord } from "@/lib/repositories/consent.repository";
import { getCheckinOriginSelection } from "@/lib/repositories/geography.repository";
import { getTouristStampByAttraction, awardTouristStamp } from "@/lib/repositories/stamp.repository";
import { getVisitById } from "@/lib/repositories/visit.repository";
import { resolveAndValidateCheckinCode } from "@/lib/services/checkin.service";
import { assignStampForVisit } from "@/lib/services/stamp.service";
import { initiateVisit } from "@/lib/services/visit.service";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth/guest", () => ({
  getOrCreateGuestIdentity: vi.fn().mockResolvedValue("mock-guest-token"),
}));

vi.mock("@/lib/auth/checkin-session", () => ({
  getCheckinSessionId: vi.fn().mockResolvedValue("mock-checkin-session"),
}));

vi.mock("@/lib/services/visit.service", () => ({
  initiateVisit: vi.fn(),
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
      q.insert.mockImplementation(() => q);
      q.update.mockImplementation(() => q);
      q.delete.mockImplementation(() => q);
      q.eq.mockImplementation(() => q);
      q.select.mockImplementation(() => q);
    },
  };
  q.reset();
  return q;
});

const mockSupabaseFrom = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: () => ({
    from: mockSupabaseFrom,
  }),
}));

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
  getCheckinOriginSelection: vi.fn(),
}));

type VisitRow = Record<string, unknown>;
type TouristStampRow = Record<string, unknown>;

describe("QR Check-in Flow Hardening", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseQuery.reset();
    mockSupabaseFrom.mockReset();
    mockSupabaseFrom.mockReturnValue(mockSupabaseQuery);
    vi.mocked(getCheckinOriginSelection).mockResolvedValue({
      countryId: 1,
      provinceId: 10,
      isThailand: true,
    });
    vi.mocked(createConsentRecord).mockResolvedValue(undefined);
    vi.mocked(initiateVisit).mockResolvedValue("mock-visit-id");
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

    it("returns unavailable when the attraction destination is not live", async () => {
      vi.mocked(getCheckinCodeByCode).mockResolvedValue({
        checkin_code_id: 1,
        code: "hidden-destination",
        is_active: true,
        starts_at: null,
        ends_at: null,
        attraction: {
          is_active: true,
          is_published: true,
          attraction_id: 1,
          province: {
            province_name_th: "ปัตตานี",
            is_active: true,
            destination_status: "hidden",
          },
        },
        photo_spot: null,
      } as unknown as CheckinCodeDetails);

      const res = await resolveAndValidateCheckinCode("hidden-destination");

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
        attraction: {
          is_active: true,
          is_published: true,
          attraction_id: 1,
          province: {
            province_name_th: "ยะลา",
            is_active: true,
            destination_status: "live",
          },
        },
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
        originCountryId: "1",
        originProvinceId: "10",
        ageGroup: "25_34",
        hasConsented: false,
      });

      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.flatten().fieldErrors.hasConsented?.[0]).toBeDefined();
      }
    });

    it("passes with valid data", () => {
      const res = minimalFormSchema.safeParse({
        displayName: "John",
        originCountryId: "1",
        originProvinceId: "10",
        ageGroup: "25_34",
        hasConsented: true,
      });

      expect(res.success).toBe(true);
    });

    it("keeps missing language null and accepts detected or selected provenance", () => {
      expect(minimalFormSchema.parse({
        displayName: "John",
        originCountryId: "1",
        originProvinceId: "10",
        ageGroup: "25_34",
        hasConsented: true,
        preferredLanguage: null,
        preferredLanguageSource: null,
      })).toMatchObject({ preferredLanguage: null, preferredLanguageSource: null });

      expect(minimalFormSchema.parse({
        displayName: "John",
        originCountryId: "1",
        originProvinceId: "10",
        ageGroup: "25_34",
        hasConsented: true,
        preferredLanguage: "en",
        preferredLanguageSource: "detected",
      })).toMatchObject({ preferredLanguage: "en", preferredLanguageSource: "detected" });

      expect(minimalFormSchema.parse({
        displayName: "John",
        originCountryId: "1",
        originProvinceId: "10",
        ageGroup: "25_34",
        hasConsented: true,
        preferredLanguage: "ms",
        preferredLanguageSource: "selected",
      })).toMatchObject({ preferredLanguage: "ms", preferredLanguageSource: "selected" });
    });
  });

  describe("Server Action: initiateCheckin", () => {
    const mockValidCheckinCode = () => {
      vi.mocked(getCheckinCodeByCode).mockResolvedValue({
        checkin_code_id: 1,
        code: "test",
        is_active: true,
        attraction_id: 1,
        starts_at: null,
        ends_at: null,
        attraction: {
          is_active: true,
          is_published: true,
          attraction_id: 1,
          province: {
            province_name_th: "ยะลา",
            is_active: true,
            destination_status: "live",
          },
        },
        photo_spot: null,
      } as unknown as CheckinCodeDetails);
    };

    const createValidFormData = (overrides: Record<string, string> = {}) => {
      const formData = new FormData();
      formData.set("displayName", overrides.displayName ?? "John");
      formData.set("originCountryId", overrides.originCountryId ?? "1");
      formData.set("originProvinceId", overrides.originProvinceId ?? "10");
      formData.set("ageGroup", overrides.ageGroup ?? "25_34");
      formData.set("hasConsented", overrides.hasConsented ?? "true");
      return formData;
    };

    const tableCalls = () => mockSupabaseFrom.mock.calls.map((call) => call[0]);

    it("returns form error if QR is invalid", async () => {
      vi.mocked(getCheckinCodeByCode).mockResolvedValue(null);

      const result = await initiateCheckin("invalid-code", {}, createValidFormData());

      expect(result.errors?._form?.[0]).toBeDefined();
    });

    it("returns field error if consent is missing", async () => {
      mockValidCheckinCode();

      const result = await initiateCheckin("test", {}, createValidFormData({ hasConsented: "false" }));

      expect(result.errors?.hasConsented?.[0]).toBeDefined();
    });

    it("identity lookup failure returns an error before creating tourist data", async () => {
      mockValidCheckinCode();
      mockSupabaseQuery.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: new Error("IDENTITY_LOOKUP_ERROR"),
      });

      const result = await initiateCheckin("test", {}, createValidFormData());

      expect(result.errors?._form?.[0]).toBeDefined();
      expect(mockSupabaseQuery.insert).not.toHaveBeenCalled();
      expect(createConsentRecord).not.toHaveBeenCalled();
      expect(initiateVisit).not.toHaveBeenCalled();
    });

    it("existing tourist with non-null fields is not overwritten", async () => {
      mockValidCheckinCode();
      mockSupabaseQuery.maybeSingle.mockResolvedValueOnce({
        data: {
          tourist_id: "mock-tourist-id",
          tourists: { display_name: "John", origin_country_id: 1, origin_province_id: 10, age_group: "25_34" },
        },
        error: null,
      });

      vi.mocked(redirect).mockImplementationOnce(() => {
        throw new Error("NEXT_REDIRECT");
      });

      await expect(initiateCheckin("test", {}, createValidFormData())).rejects.toThrow("NEXT_REDIRECT");

      expect(mockSupabaseQuery.update).not.toHaveBeenCalledWith(expect.objectContaining({
        origin_country_id: expect.anything(),
      }));
    });

    it("existing tourist with null fields is backfilled", async () => {
      mockValidCheckinCode();
      mockSupabaseQuery.maybeSingle.mockResolvedValueOnce({
        data: {
          tourist_id: "mock-tourist-id",
          tourists: { display_name: "John", origin_country_id: null, origin_province_id: null, age_group: null },
        },
        error: null,
      });

      vi.mocked(redirect).mockImplementationOnce(() => {
        throw new Error("NEXT_REDIRECT");
      });

      await expect(initiateCheckin("test", {}, createValidFormData())).rejects.toThrow("NEXT_REDIRECT");

      expect(mockSupabaseQuery.update).toHaveBeenCalledWith(expect.objectContaining({
        origin_country_id: 1,
        origin_province_id: 10,
        age_group: "25_34",
      }));
    });

    it("updates an edited returning profile but creates a new visit for the same tourist", async () => {
      mockValidCheckinCode();
      vi.mocked(getCheckinOriginSelection).mockResolvedValue({
        countryId: 1,
        provinceId: 10,
        isThailand: true,
      });
      mockSupabaseQuery.maybeSingle.mockResolvedValueOnce({
        data: {
          tourist_id: "returning-tourist-id",
          tourists: {
            display_name: "ชื่อเดิม",
            origin_country_id: 1,
            origin_province_id: 11,
            age_group: "18_24",
          },
        },
        error: null,
      });
      vi.mocked(redirect).mockImplementationOnce(() => {
        throw new Error("NEXT_REDIRECT");
      });

      await expect(initiateCheckin("test", {}, createValidFormData({
        displayName: "ชื่อใหม่",
        originProvinceId: "10",
        ageGroup: "25_34",
      }))).rejects.toThrow("NEXT_REDIRECT");

      expect(mockSupabaseQuery.update).toHaveBeenCalledWith(expect.objectContaining({
        display_name: "ชื่อใหม่",
        origin_province_id: 10,
        age_group: "25_34",
      }));
      expect(initiateVisit).toHaveBeenCalledWith(expect.objectContaining({
        touristId: "returning-tourist-id",
      }));
    });

    it("rejects inactive or mismatched geography IDs before creating tourist data", async () => {
      mockValidCheckinCode();
      vi.mocked(getCheckinOriginSelection).mockResolvedValue(null);

      const result = await initiateCheckin("test", {}, createValidFormData());

      expect(result.errors?.originProvinceId?.[0]).toBeDefined();
      expect(mockSupabaseQuery.insert).not.toHaveBeenCalled();
      expect(initiateVisit).not.toHaveBeenCalled();
    });

    it("existing tourist backfill failure returns an error and does not initiate visit", async () => {
      mockValidCheckinCode();
      mockSupabaseQuery.maybeSingle.mockResolvedValueOnce({
        data: {
          tourist_id: "mock-tourist-id",
          tourists: { display_name: "John", origin_country_id: null, origin_province_id: null, age_group: null },
        },
        error: null,
      });
      mockSupabaseQuery.update.mockImplementation((payload: Record<string, unknown>) => {
        if (payload.origin_country_id !== undefined) {
          return { eq: vi.fn().mockResolvedValue({ error: new Error("DB_UPDATE_ERROR") }) };
        }
        return mockSupabaseQuery;
      });

      const result = await initiateCheckin("test", {}, createValidFormData());

      expect(result.errors?._form?.[0]).toBeDefined();
      expect(initiateVisit).not.toHaveBeenCalled();
    });

    it("identity insert failure cleans up and does not initiate visit or consent", async () => {
      mockValidCheckinCode();
      mockSupabaseQuery.insert.mockImplementation((payload: Record<string, unknown>) => {
        if (payload.provider) {
          return { error: new Error("IDENTITY_INSERT_ERROR") };
        }
        return mockSupabaseQuery;
      });

      const result = await initiateCheckin("test", {}, createValidFormData());

      expect(result.errors?._form?.[0]).toBeDefined();
      expect(createConsentRecord).not.toHaveBeenCalled();
      expect(initiateVisit).not.toHaveBeenCalled();
      expect(tableCalls().slice(-3)).toEqual(["tourist_identities", "consent_records", "tourists"]);
    });

    it("consent lookup failure cleans up and does not initiate visit", async () => {
      mockValidCheckinCode();
      mockSupabaseQuery.maybeSingle
        .mockResolvedValueOnce({ data: null, error: null })
        .mockResolvedValueOnce({ data: null, error: new Error("CONSENT_LOOKUP_ERROR") });

      const result = await initiateCheckin("test", {}, createValidFormData());

      expect(result.errors?._form?.[0]).toBeDefined();
      expect(initiateVisit).not.toHaveBeenCalled();
      expect(tableCalls().slice(-3)).toEqual(["tourist_identities", "consent_records", "tourists"]);
    });

    it("consent insert failure cleans up in dependency order and does not initiate visit", async () => {
      mockValidCheckinCode();
      vi.mocked(createConsentRecord).mockRejectedValueOnce(new Error("DB_ERROR"));

      const result = await initiateCheckin("test", {}, createValidFormData());

      expect(result.errors?._form?.[0]).toBeDefined();
      expect(initiateVisit).not.toHaveBeenCalled();
      expect(tableCalls().slice(-3)).toEqual(["tourist_identities", "consent_records", "tourists"]);
    });

    it("valid Thai tourist stores geography, links identity, records consent, and redirects", async () => {
      mockValidCheckinCode();
      vi.mocked(redirect).mockImplementationOnce(() => {
        throw new Error("NEXT_REDIRECT");
      });

      await expect(initiateCheckin("test", {}, createValidFormData())).rejects.toThrow("NEXT_REDIRECT");

      expect(getCheckinOriginSelection).toHaveBeenCalledWith(1, 10);
      expect(mockSupabaseQuery.insert).toHaveBeenNthCalledWith(1, expect.objectContaining({
        origin_country_id: 1,
        origin_province_id: 10,
        age_group: "25_34",
      }));
      expect(mockSupabaseQuery.insert).toHaveBeenNthCalledWith(2, expect.objectContaining({
        provider: "anonymous_device",
        provider_user_id: "mock-guest-token",
      }));
      expect(createConsentRecord).toHaveBeenCalledWith(expect.objectContaining({
        consentType: "mandatory",
        consentVersion: "1.0",
        purposeKey: "checkin_profile_creation",
      }));
      expect(initiateVisit).toHaveBeenCalledWith(expect.objectContaining({
        entryChannel: "unknown",
        sessionId: "mock-checkin-session",
      }));
      expect(tableCalls().slice(0, 4)).toEqual(["tourist_identities", "tourists", "tourist_identities", "consent_records"]);
      expect(revalidatePath).toHaveBeenCalledWith("/checkin/test");
      expect(redirect).toHaveBeenCalledWith("/visit/mock-visit-id/photo");
    });

    it("foreign tourist stores country and null province", async () => {
      mockValidCheckinCode();
      vi.mocked(getCheckinOriginSelection).mockResolvedValue({
        countryId: 2,
        provinceId: null,
        isThailand: false,
      });
      vi.mocked(redirect).mockImplementationOnce(() => {
        throw new Error("NEXT_REDIRECT");
      });

      await expect(initiateCheckin("test", {}, createValidFormData({
        displayName: "Ali",
        originCountryId: "2",
        originProvinceId: "",
      }))).rejects.toThrow("NEXT_REDIRECT");

      expect(getCheckinOriginSelection).toHaveBeenCalledWith(2, null);
      expect(mockSupabaseQuery.insert).toHaveBeenNthCalledWith(1, expect.objectContaining({
        origin_country_id: 2,
        origin_province_id: null,
      }));
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

    it("handles concurrent award gracefully", async () => {
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
