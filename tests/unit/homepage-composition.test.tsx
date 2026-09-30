import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Homepage, HomepageContent, HomepageEvidence, loadHomepageContent } from "@/components/homepage/homepage";
import { listPublicAttractionCards } from "@/lib/repositories/public-content.repository";
import { getPublicDashboardAnalytics } from "@/lib/services/dashboard.service";
import type { ReactElement } from "react";

vi.mock("@/components/homepage/HomepageEditorial", () => ({
  HomepageHero: ({ hero }: { hero: { images: string[] } }) => <h1 data-testid="hero" data-image={hero.images[0]}>Home</h1>,
  HomepageSections: ({ media }: { media: { natureImage: string } }) => <section data-testid="sections" data-image={media.natureImage} />,
  HomepageStats: ({ stats }: { stats: { label: string; value: string }[] }) => <div>{stats.map((stat) => <span key={stat.label}>{stat.label}: {stat.value}</span>)}</div>,
}));
vi.mock("@/components/homepage/HomepageMotion", () => ({ HomepageMotion: () => null }));
vi.mock("@/components/layout/SiteFooter", () => ({ SiteFooter: () => <footer /> }));
vi.mock("@/lib/repositories/public-content.repository", () => ({
  listPublicAttractionCards: vi.fn().mockResolvedValue([]),
  listPublicRestaurants: vi.fn().mockResolvedValue([]),
  listPublicAccommodations: vi.fn().mockResolvedValue([]),
  listAvailablePublicRestaurantCategories: vi.fn().mockResolvedValue({ items: [], state: "ready" }),
  listPublicStories: vi.fn().mockResolvedValue([]), listPublicRoutes: vi.fn().mockResolvedValue([]),
}));
vi.mock("@/lib/services/dashboard.service", () => ({ getPublicDashboardAnalytics: vi.fn().mockResolvedValue({ kpis: [{ key: "tourist_profiles", value: "12" }, { key: "total_visits", value: "34" }] }) }));
vi.mock("@/lib/services/settings.service", () => ({
  SettingsService: class {
    getSetting(key: string, fallback: unknown) {
      if (key === "homepage_hero") return Promise.resolve({ images: ["homepage/custom-hero.webp"] });
      if (key === "homepage_highlights") return Promise.resolve({ natureImage: "homepage/nature.webp" });
      return Promise.resolve(fallback);
    }
  },
}));

describe("Homepage streaming composition", () => {
  beforeEach(() => vi.clearAllMocks());
  it("makes the CMS hero available before unresolved attraction queries", async () => {
    let complete!: (value: []) => void;
    vi.mocked(listPublicAttractionCards).mockImplementationOnce(() => new Promise((resolve) => { complete = resolve; }));
    const page = await Homepage();
    const main = page.props.children[0] as ReactElement<{ children: ReactElement[] }>;
    render(main.props.children[1]);
    expect(screen.getByTestId("hero")).toHaveAttribute("data-image", "homepage/custom-hero.webp");
    expect(getPublicDashboardAnalytics).not.toHaveBeenCalled();
    complete([]);
  });
  it("keeps content imagery and metrics independently available without invented counts", async () => {
    render(await HomepageContent({ data: loadHomepageContent(), hero: {}, media: { natureImage: "homepage/nature.webp" } }));
    expect(screen.getByTestId("sections")).toHaveAttribute("data-image", "homepage/nature.webp");
    expect(getPublicDashboardAnalytics).not.toHaveBeenCalled();
    render(await HomepageEvidence());
    expect(screen.getByText("นักเดินทางในระบบ: 12")).toBeInTheDocument();
    expect(screen.queryByText(/ใบประกาศดิจิทัล:/)).not.toBeInTheDocument();
  });
});
