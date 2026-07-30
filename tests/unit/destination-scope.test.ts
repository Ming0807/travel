import { describe, expect, it } from "vitest";
import {
  isLiveDestinationProvince,
  routeStopsArePublicForLaunch,
  sanitizeDestinationProvinceFilter,
} from "@/lib/destinations/launch-scope";

describe("Destination launch scope", () => {
  it("treats only active live provinces as public destinations", () => {
    expect(
      isLiveDestinationProvince({
        is_active: true,
        destination_status: "live",
      }),
    ).toBe(true);
    expect(
      isLiveDestinationProvince({
        is_active: true,
        destination_status: "pilot",
      }),
    ).toBe(false);
    expect(
      isLiveDestinationProvince({
        is_active: false,
        destination_status: "live",
      }),
    ).toBe(false);
  });

  it("requires a route to have stops and every stop to be public in launch scope", () => {
    expect(routeStopsArePublicForLaunch([])).toBe(false);
    expect(
      routeStopsArePublicForLaunch([
        {
          attractions: {
            is_active: true,
            is_published: true,
            provinces: {
              is_active: true,
              destination_status: "live",
            },
          },
        },
      ]),
    ).toBe(true);
    expect(
      routeStopsArePublicForLaunch([
        {
          attractions: {
            is_active: true,
            is_published: true,
            provinces: {
              is_active: true,
              destination_status: "live",
            },
          },
        },
        {
          attractions: {
            is_active: true,
            is_published: true,
            provinces: {
              is_active: true,
              destination_status: "hidden",
            },
          },
        },
      ]),
    ).toBe(false);
  });

  it("can enforce route scope from canonical live province IDs during rollout", () => {
    expect(
      routeStopsArePublicForLaunch(
        [
          {
            attractions: {
              is_active: true,
              is_published: true,
              provinces: {
                province_id: 1,
                is_active: true,
              },
            },
          },
        ],
        new Set([1]),
      ),
    ).toBe(true);
    expect(
      routeStopsArePublicForLaunch(
        [
          {
            attractions: {
              is_active: true,
              is_published: true,
              provinces: {
                province_id: 2,
                is_active: true,
              },
            },
          },
        ],
        new Set([1]),
      ),
    ).toBe(false);
  });

  it("drops stale public province filters instead of returning an empty hidden scope", () => {
    const live = [
      { province_name_en: "Yala" },
    ];

    expect(sanitizeDestinationProvinceFilter("Yala", live)).toBe("Yala");
    expect(sanitizeDestinationProvinceFilter(" Pattani ", live)).toBeUndefined();
    expect(sanitizeDestinationProvinceFilter(undefined, live)).toBeUndefined();
  });
});
