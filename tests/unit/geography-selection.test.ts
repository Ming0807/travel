import { beforeEach, describe, expect, it, vi } from "vitest";

import { getCheckinOriginSelection } from "@/lib/repositories/geography.repository";

function makeQuery() {
  const query = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn() };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  return query;
}

const mocks = vi.hoisted(() => ({
  country: makeQuery(),
  province: makeQuery(),
  from: vi.fn(),
}));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: () => ({ from: mocks.from }),
}));

describe("check-in geography selection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.country.select.mockReturnValue(mocks.country);
    mocks.country.eq.mockReturnValue(mocks.country);
    mocks.province.select.mockReturnValue(mocks.province);
    mocks.province.eq.mockReturnValue(mocks.province);
    mocks.from.mockImplementation((table: string) => (table === "countries" ? mocks.country : mocks.province));
  });

  it("requires an active province for Thailand", async () => {
    mocks.country.maybeSingle.mockResolvedValue({ data: { country_id: 1, iso2_code: "TH" }, error: null });
    mocks.province.maybeSingle.mockResolvedValue({ data: null, error: null });

    await expect(getCheckinOriginSelection(1, 99)).resolves.toBeNull();
  });

  it("keeps a valid Thai province master id", async () => {
    mocks.country.maybeSingle.mockResolvedValue({ data: { country_id: 1, iso2_code: "TH" }, error: null });
    mocks.province.maybeSingle.mockResolvedValue({ data: { province_id: 10 }, error: null });

    await expect(getCheckinOriginSelection(1, 10)).resolves.toEqual({
      countryId: 1,
      provinceId: 10,
      isThailand: true,
    });
  });

  it("clears Thai province data for a foreign country", async () => {
    mocks.country.maybeSingle.mockResolvedValue({ data: { country_id: 2, iso2_code: "MY" }, error: null });
    mocks.province.maybeSingle.mockResolvedValue({ data: { province_id: 10 }, error: null });

    await expect(getCheckinOriginSelection(2, 10)).resolves.toEqual({
      countryId: 2,
      provinceId: null,
      isThailand: false,
    });
  });
});
