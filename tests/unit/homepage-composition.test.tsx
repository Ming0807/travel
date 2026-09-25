import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Homepage } from "@/components/homepage/homepage";

vi.mock("@/components/homepage/HomepageEditorial", () => ({
  HomepageEditorial: ({ hero, media, stats }: {
    hero: { images: readonly string[] };
    media: { natureImage: string };
    stats: { label: string; value: string }[];
  }) => <main data-testid="editorial" data-hero={hero.images[0]} data-nature={media.natureImage}>
    {stats.map((stat) => <span key={stat.label}>{stat.label}: {stat.value}</span>)}
  </main>,
}));
vi.mock("@/components/layout/SiteFooter", () => ({ SiteFooter: () => <footer data-testid="footer" /> }));
vi.mock("@/lib/repositories/public-content.repository", () => ({
  listPublicAttractionCards: vi.fn().mockResolvedValue([]),
  listPublicRestaurants: vi.fn().mockResolvedValue([]),
  listPublicAccommodations: vi.fn().mockResolvedValue([]),
  listAvailablePublicRestaurantCategories: vi.fn().mockResolvedValue({ items: [], state: "ready" }),
  listPublicStories: vi.fn().mockResolvedValue([]),
  listPublicRoutes: vi.fn().mockResolvedValue([]),
}));
vi.mock("@/lib/services/dashboard.service", () => ({
  getPublicDashboardAnalytics: vi.fn().mockResolvedValue({
    kpis: [
      { key: "tourist_profiles", value: "12" },
      { key: "total_visits", value: "34" },
    ],
  }),
}));
vi.mock("@/lib/services/settings.service", () => ({
  SettingsService: class {
    getSetting(key: string, fallback: unknown) {
      if (key === "homepage_hero") return Promise.resolve({ images: ["homepage/custom-hero.webp"] });
      if (key === "homepage_highlights") return Promise.resolve({ natureImage: "homepage/nature.webp" });
      return Promise.resolve(fallback);
    }
  },
}));

describe("Homepage composition", () => {
  it("uses CMS imagery and real available metrics in the editorial homepage", async () => {
    const { container } = render(await Homepage());
    expect(Array.from(container.children).map((element) => element.getAttribute("data-testid")))
      .toEqual(["editorial", "footer"]);
    expect(screen.getByTestId("editorial")).toHaveAttribute("data-hero", "homepage/custom-hero.webp");
    expect(screen.getByTestId("editorial")).toHaveAttribute("data-nature", "homepage/nature.webp");
    expect(screen.getByText("นักเดินทางในระบบ: 12")).toBeInTheDocument();
    expect(screen.queryByText(/ใบประกาศดิจิทัล:/)).not.toBeInTheDocument();
  });
});
