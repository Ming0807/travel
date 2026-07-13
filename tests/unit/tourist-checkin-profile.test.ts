import { beforeEach, describe, expect, it, vi } from "vitest";

import { getGuestCheckinProfile } from "@/lib/repositories/tourist.repository";

function createQuery() {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn(),
  };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  return query;
}

const mocks = vi.hoisted(() => ({
  identityQuery: createQuery(),
  consentQuery: createQuery(),
  from: vi.fn(),
}));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: () => ({ from: mocks.from }),
}));

describe("returning guest check-in profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.identityQuery.select.mockReturnValue(mocks.identityQuery);
    mocks.identityQuery.eq.mockReturnValue(mocks.identityQuery);
    mocks.consentQuery.select.mockReturnValue(mocks.consentQuery);
    mocks.consentQuery.eq.mockReturnValue(mocks.consentQuery);
    mocks.from.mockImplementation((table: string) =>
      table === "tourist_identities" ? mocks.identityQuery : mocks.consentQuery,
    );
  });

  it("returns null without exposing a missing identity as an error", async () => {
    mocks.identityQuery.maybeSingle.mockResolvedValue({ data: null, error: null });

    await expect(getGuestCheckinProfile("guest-token")).resolves.toBeNull();
    expect(mocks.consentQuery.maybeSingle).not.toHaveBeenCalled();
  });

  it("returns only reusable profile fields and current consent status", async () => {
    mocks.identityQuery.maybeSingle.mockResolvedValue({
      data: {
        tourist_id: "tourist-1",
        tourists: {
          display_name: "นักเดินทางเดิม",
          origin_country_id: 1,
          origin_province_id: 10,
          age_group: "25_34",
        },
      },
      error: null,
    });
    mocks.consentQuery.maybeSingle.mockResolvedValue({ data: { consent_id: "consent-1" }, error: null });

    const result = await getGuestCheckinProfile("secret-guest-token");

    expect(result).toEqual({
      displayName: "นักเดินทางเดิม",
      originCountryId: 1,
      originProvinceId: 10,
      ageGroup: "25_34",
      hasCurrentConsent: true,
    });
    expect(result).not.toHaveProperty("touristId");
    expect(result).not.toHaveProperty("providerUserId");
    expect(JSON.stringify(result)).not.toContain("secret-guest-token");
  });
});
