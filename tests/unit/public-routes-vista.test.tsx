import { render, screen } from "@testing-library/react";
import { createElement, type ImgHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("next/image", () => ({
  default: ({ fill: _fill, priority, ...props }: ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }) =>
    createElement("img", { ...props, "data-priority": priority ? "true" : undefined }),
}));

const { state, client, mediaQuery } = vi.hoisted(() => {
  type Result = { data: unknown; error: unknown };
  const state = {
    routeListResult: { data: [], error: null } as Result,
    routeDetailResult: { data: null, error: null } as Result,
    vistaResult: { data: [], error: null } as Result,
    routeSelects: [] as string[],
    vistaSelect: "",
  };

  const routeBuilder = () => {
    const query: Record<string, ReturnType<typeof vi.fn>> = {};
    query.select = vi.fn((value: string) => {
      state.routeSelects.push(value);
      return query;
    });
    query.eq = vi.fn().mockReturnValue(query);
    query.in = vi.fn().mockReturnValue(query);
    query.order = vi.fn().mockReturnValue(query);
    query.limit = vi.fn().mockImplementation(async () => state.routeListResult);
    query.maybeSingle = vi.fn().mockImplementation(async () => state.routeDetailResult);
    return query;
  };

  const vistaBuilder = () => {
    const query: Record<string, ReturnType<typeof vi.fn>> = {};
    query.select = vi.fn((value: string) => {
      state.vistaSelect = value;
      return query;
    });
    query.eq = vi.fn().mockReturnValue(query);
    query.in = vi.fn().mockReturnValue(query);
    query.order = vi.fn().mockReturnValue(query);
    query.limit = vi.fn().mockImplementation(async () => state.vistaResult);
    return query;
  };

  const mediaQuery: Record<string, ReturnType<typeof vi.fn>> = {};
  mediaQuery.select = vi.fn().mockReturnValue(mediaQuery);
  mediaQuery.in = vi.fn().mockResolvedValue({ data: [], error: null });

  const client = {
    from: vi.fn((table: string) => {
      if (table === "suggested_routes") return routeBuilder();
      if (table === "attractions") return vistaBuilder();
      if (table === "media_assets") return mediaQuery;
      throw new Error(`Unexpected table: ${table}`);
    }),
  };

  return { state, client, mediaQuery };
});

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn().mockResolvedValue(client),
}));

vi.mock("@/lib/repositories/destination-scope.repository", () => ({
  listLiveDestinationProvinceIds: vi.fn().mockResolvedValue([1]),
  listLiveDestinationProvinces: vi.fn().mockResolvedValue([
    { provinceId: 1, nameTh: "ยะลา", nameEn: "Yala", displayOrder: 1 },
  ]),
}));

import { PublicRouteTimeline } from "@/components/routes/PublicRouteTimeline";
import { PublicVistaGrid } from "@/components/vista/PublicVistaGrid";
import { buildRouteDirectionsUrl } from "@/lib/routes/public-route";
import {
  getPublicRouteDetail,
  listPublicRoutes,
  listPublicVirtualTours,
} from "@/lib/repositories/public-content.repository";

function publicAttraction(overrides: Record<string, unknown> = {}) {
  return {
    attraction_id: 12,
    province_id: 1,
    slug: "yala-old-town",
    name_th: "ย่านเมืองเก่ายะลา",
    name_en: null,
    latitude: 6.541,
    longitude: 101.281,
    is_active: true,
    is_published: true,
    provinces: { province_id: 1, is_active: true, province_name_th: "ยะลา", province_name_en: "Yala" },
    content_media: [{
      media_type: "image",
      storage_path: "attractions/yala-old-town.webp",
      alt_text_th: "ย่านเมืองเก่ายะลา",
      alt_text_en: null,
      is_cover: true,
      is_active: true,
      lifecycle_status: "active",
      display_order: 0,
    }],
    ...overrides,
  };
}

const routeRow = {
  route_id: 7,
  slug: "one-day-yala",
  name_th: "หนึ่งวันในยะลา",
  name_en: null,
  description_th: "เส้นทางเที่ยวเมืองยะลา",
  description_en: null,
  content_media: [{
    media_type: "image",
    storage_path: "routes/yala.webp",
    alt_text_th: "เส้นทางหนึ่งวันในยะลา",
    alt_text_en: null,
    is_cover: true,
    is_active: true,
    lifecycle_status: "active",
    display_order: 0,
  }],
  suggested_route_stops: [
    { day_number: 1, display_order: 2, attractions: publicAttraction({ attraction_id: 13, slug: "yala-park", name_th: "สวนขวัญเมือง", latitude: 6.542, longitude: 101.282 }) },
    { day_number: 1, display_order: 1, attractions: publicAttraction({ latitude: "6.541", longitude: "101.281" }) },
  ],
};

describe("public routes repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.routeSelects = [];
    state.vistaSelect = "";
    state.routeListResult = { data: [routeRow], error: null };
    state.routeDetailResult = { data: routeRow, error: null };
    state.vistaResult = { data: [], error: null };
    mediaQuery.select.mockReturnValue(mediaQuery);
    mediaQuery.in.mockResolvedValue({
      data: [
        { storage_path: "routes/yala.webp", thumbnail_storage_path: "routes/yala_thumb.webp" },
        { storage_path: "attractions/yala-old-town.webp", thumbnail_storage_path: "attractions/yala-old-town_thumb.webp" },
      ],
      error: null,
    });
  });

  it("returns optimized route cards and ordered public stop data", async () => {
    const cards = await listPublicRoutes(12);
    const detail = await getPublicRouteDetail("one-day-yala");

    expect(state.routeSelects.every((selection) => !selection.includes("*"))).toBe(true);
    expect(cards[0]).toMatchObject({
      slug: "one-day-yala",
      days: 1,
      stopCount: 2,
      imageUrl: "/site-media/routes/yala_thumb.webp",
      imageAlt: "เส้นทางหนึ่งวันในยะลา",
    });
    expect(detail?.stops.map((stop) => stop.attractionSlug)).toEqual(["yala-old-town", "yala-park"]);
    expect(detail?.mapUrl).toContain("google.com/maps/dir");
  });

  it("does not expose an incomplete route map and does not turn query errors into missing content", async () => {
    state.routeDetailResult = {
      data: {
        ...routeRow,
        suggested_route_stops: [
          routeRow.suggested_route_stops[0],
          { ...routeRow.suggested_route_stops[1], attractions: publicAttraction({ longitude: null }) },
        ],
      },
      error: null,
    };

    await expect(getPublicRouteDetail("one-day-yala")).resolves.toMatchObject({ mapUrl: null });

    state.routeDetailResult = { data: null, error: { message: "offline" } };
    await expect(getPublicRouteDetail("one-day-yala")).rejects.toThrow("PUBLIC_ROUTE_DETAIL_FAILED");
  });
});

describe("public route presentation", () => {
  it("builds directions only when every stop has valid coordinates", () => {
    expect(buildRouteDirectionsUrl([
      { latitude: 6.541, longitude: 101.281 },
      { latitude: 6.542, longitude: 101.282 },
    ])).toContain("origin=6.541%2C101.281");

    expect(buildRouteDirectionsUrl([
      { latitude: 6.541, longitude: 101.281 },
      { latitude: null, longitude: 101.282 },
    ])).toBeNull();
  });

  it("groups repeated sequence numbers by day without duplicate keys or broken attraction links", () => {
    render(<PublicRouteTimeline stops={[
      { attractionId: 1, dayNumber: 1, sequence: 1, attractionName: "จุดแรก", attractionSlug: "first", attractionImage: null, attractionImageAlt: "จุดแรก", latitude: 6.5, longitude: 101.2 },
      { attractionId: 2, dayNumber: 2, sequence: 1, attractionName: "จุดสอง", attractionSlug: "second", attractionImage: null, attractionImageAlt: "จุดสอง", latitude: 6.6, longitude: 101.3 },
    ]} />);

    expect(screen.getByRole("heading", { name: "วันที่ 1" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "วันที่ 2" })).toBeVisible();
    expect(screen.getByRole("link", { name: /จุดแรก/ })).toHaveAttribute("href", "/attractions/first");
    expect(screen.getByRole("link", { name: /จุดสอง/ })).toHaveAttribute("href", "/attractions/second");
  });
});

describe("public 360 experiences", () => {
  it("lists only published CMS-backed Yala virtual tours", async () => {
    state.vistaResult = {
      data: [
        publicAttraction({
          content_media: [
            { media_type: "image", storage_path: "attractions/yala-cover.webp", alt_text_th: "ภาพปก", is_cover: true, is_active: true, lifecycle_status: "active", display_order: 0 },
            { media_type: "video360", storage_path: "https://tour.example/yala", is_cover: false, is_active: true, lifecycle_status: "active", display_order: 1 },
          ],
        }),
        publicAttraction({ attraction_id: 99, slug: "draft", is_published: false }),
      ],
      error: null,
    };

    const tours = await listPublicVirtualTours(12);

    expect(state.vistaSelect).not.toContain("*");
    expect(tours).toEqual([expect.objectContaining({
      attractionSlug: "yala-old-town",
      href: "https://tour.example/yala",
      provider: "external",
      previewImageUrl: "/site-media/attractions/yala-cover.webp",
    })]);
  });

  it("renders honest CMS and external-provider states without a CSS panorama mock", () => {
    const { container, rerender } = render(<PublicVistaGrid items={[]} externalProviderUrl="https://vista.example" />);

    expect(screen.getByText(/ระบบภายนอก/)).toBeVisible();
    expect(screen.queryByText("มัสยิดกลางยะลา")).not.toBeInTheDocument();
    expect(container.innerHTML).not.toContain("linear-gradient");

    rerender(<PublicVistaGrid items={[{
      attractionSlug: "yala-old-town",
      attractionName: "ย่านเมืองเก่ายะลา",
      province: "ยะลา",
      mediaType: "video360",
      provider: "external",
      href: "https://tour.example/yala",
      previewImageUrl: null,
      previewImageAlt: "ย่านเมืองเก่ายะลา",
    }]} externalProviderUrl={null} />);

    expect(screen.getByRole("link", { name: /เปิดมุมมอง 360° ของย่านเมืองเก่ายะลา/ })).toHaveAttribute("href", "https://tour.example/yala");
    expect(screen.getByText("ระบบภายนอก")).toBeVisible();
  });
});
