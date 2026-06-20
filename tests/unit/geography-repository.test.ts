import { describe, expect, it, vi, beforeEach } from "vitest";
import { resolveCountryId, resolveProvinceId } from "@/lib/repositories/geography.repository";

const mockSupabaseQuery = vi.hoisted(() => {
  const q = {
    select: vi.fn(),
    eq: vi.fn(),
    ilike: vi.fn(),
    or: vi.fn(),
    maybeSingle: vi.fn(),
    reset: () => {
      q.select.mockClear();
      q.eq.mockClear();
      q.ilike.mockClear();
      q.or.mockClear();
      q.maybeSingle.mockClear();
      q.select.mockReturnThis();
      q.eq.mockReturnThis();
      q.ilike.mockReturnThis();
      q.or.mockReturnThis();
      q.maybeSingle.mockResolvedValue({ data: null, error: null });
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

describe("Geography Repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseQuery.reset();
  });

  describe("resolveCountryId", () => {
    it("returns null if countryName is empty or only whitespace", async () => {
      expect(await resolveCountryId(null)).toBeNull();
      expect(await resolveCountryId("   ")).toBeNull();
    });

    it("normalizes whitespace and resolves by English name", async () => {
      mockSupabaseQuery.maybeSingle.mockResolvedValueOnce({ data: { country_id: 1 }, error: null });

      const id = await resolveCountryId("  United   States  ");

      expect(mockSupabaseQuery.ilike).toHaveBeenCalledWith("country_name_en", "United States");
      expect(id).toBe(1);
    });

    it("resolves by Thai name if English fails", async () => {
      mockSupabaseQuery.maybeSingle.mockResolvedValueOnce({ data: null, error: null }); // English
      mockSupabaseQuery.maybeSingle.mockResolvedValueOnce({ data: { country_id: 2 }, error: null }); // Thai

      const id = await resolveCountryId("ไทย");

      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith("country_name_th", "ไทย");
      expect(id).toBe(2);
    });

    it("resolves by ISO code if name fails", async () => {
      mockSupabaseQuery.maybeSingle.mockResolvedValueOnce({ data: null, error: null }); // English
      mockSupabaseQuery.maybeSingle.mockResolvedValueOnce({ data: null, error: null }); // Thai
      mockSupabaseQuery.maybeSingle.mockResolvedValueOnce({ data: { country_id: 3 }, error: null }); // ISO

      const id = await resolveCountryId("TH");

      expect(mockSupabaseQuery.or).toHaveBeenCalledWith("iso2_code.ilike.TH,iso3_code.ilike.TH");
      expect(id).toBe(3);
    });

    it("falls back to Other if no match", async () => {
      mockSupabaseQuery.maybeSingle.mockResolvedValueOnce({ data: null, error: null }); // English
      mockSupabaseQuery.maybeSingle.mockResolvedValueOnce({ data: null, error: null }); // Thai
      mockSupabaseQuery.maybeSingle.mockResolvedValueOnce({ data: null, error: null }); // ISO
      mockSupabaseQuery.maybeSingle.mockResolvedValueOnce({ data: { country_id: 999 }, error: null }); // Other

      const id = await resolveCountryId("UnknownCountry");

      expect(id).toBe(999);
    });

    it("throws error if fallback Other is missing", async () => {
      mockSupabaseQuery.maybeSingle.mockResolvedValue({ data: null, error: null }); // All queries return null

      await expect(resolveCountryId("UnknownCountry")).rejects.toThrow("Cannot resolve origin country and fallback is missing");
    });

    it("throws error if Supabase query fails", async () => {
      mockSupabaseQuery.maybeSingle.mockResolvedValueOnce({ data: null, error: new Error("DB down") });

      await expect(resolveCountryId("Thailand")).rejects.toThrow("Database error resolving country");
    });
  });

  describe("resolveProvinceId", () => {
    it("returns null if provinceName is empty or only whitespace", async () => {
      expect(await resolveProvinceId(null)).toBeNull();
      expect(await resolveProvinceId("   ")).toBeNull();
    });

    it("normalizes and strips จ. or จังหวัด prefix", async () => {
      mockSupabaseQuery.maybeSingle.mockResolvedValueOnce({ data: { province_id: 10 }, error: null }); // Thai

      const id = await resolveProvinceId("  จังหวัด  ปัตตานี  ");

      expect(mockSupabaseQuery.ilike).toHaveBeenCalledWith("province_name_th", "ปัตตานี");
      expect(id).toBe(10);
    });

    it("resolves by English name if Thai fails", async () => {
      mockSupabaseQuery.maybeSingle.mockResolvedValueOnce({ data: null, error: null }); // Thai
      mockSupabaseQuery.maybeSingle.mockResolvedValueOnce({ data: { province_id: 11 }, error: null }); // English

      const id = await resolveProvinceId("Pattani");

      expect(mockSupabaseQuery.ilike).toHaveBeenCalledWith("province_name_en", "Pattani");
      expect(id).toBe(11);
    });

    it("falls back to Prefer not to answer if no match", async () => {
      mockSupabaseQuery.maybeSingle.mockResolvedValueOnce({ data: null, error: null }); // Thai
      mockSupabaseQuery.maybeSingle.mockResolvedValueOnce({ data: null, error: null }); // English
      mockSupabaseQuery.maybeSingle.mockResolvedValueOnce({ data: { province_id: 888 }, error: null }); // Prefer not to answer

      const id = await resolveProvinceId("UnknownProvince");

      expect(mockSupabaseQuery.ilike).toHaveBeenCalledWith("province_name_en", "Prefer not to answer");
      expect(id).toBe(888);
    });

    it("returns null if even fallback is missing", async () => {
      mockSupabaseQuery.maybeSingle.mockResolvedValue({ data: null, error: null });

      const id = await resolveProvinceId("UnknownProvince");
      expect(id).toBeNull();
    });

    it("throws error if Supabase query fails", async () => {
      mockSupabaseQuery.maybeSingle.mockResolvedValueOnce({ data: null, error: new Error("DB down") });

      await expect(resolveProvinceId("Pattani")).rejects.toThrow("Database error resolving province");
    });
  });
});
