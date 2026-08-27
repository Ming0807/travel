import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Homepage } from "@/components/homepage/homepage";

vi.mock("@/components/homepage/sections/HomepageHero", () => ({ HomepageHero: () => <div data-testid="hero" /> }));
vi.mock("@/components/homepage/HomepageQuickActions", () => ({ HomepageQuickActions: () => <div data-testid="quick-actions" /> }));
vi.mock("@/components/homepage/sections/HomepageDiscoveryWorkspace", () => ({ HomepageDiscoveryWorkspace: () => <div data-testid="discovery" /> }));
vi.mock("@/components/homepage/sections/HomepageHowItWorks", () => ({ HomepageHowItWorks: () => <div data-testid="journey" /> }));
vi.mock("@/components/homepage/sections/HomepageStories", () => ({ HomepageStories: () => <div data-testid="stories" /> }));
vi.mock("@/components/homepage/sections/HomepageDashboardPreview", () => ({ HomepageDashboardPreview: () => <div data-testid="statistics" /> }));
vi.mock("@/components/homepage/sections/HomepageCertificateCta", () => ({ HomepageCertificateCta: () => <div data-testid="passport-cta" /> }));
vi.mock("@/components/layout/SiteFooter", () => ({ SiteFooter: () => <div data-testid="footer" /> }));
vi.mock("@/lib/repositories/public-content.repository", () => ({
  listPublicAttractionCards: vi.fn().mockResolvedValue([]),
  listPublicStories: vi.fn().mockResolvedValue([]),
  listPublicRoutes: vi.fn().mockResolvedValue([]),
}));
vi.mock("@/lib/services/settings.service", () => ({
  SettingsService: class {
    getSetting(_key: string, fallback: unknown) { return Promise.resolve(fallback); }
  },
}));

describe("Homepage composition", () => {
  it("renders the approved content order without hidden reveal wrappers", async () => {
    const { container } = render(await Homepage());
    const ids = Array.from(container.children).map((element) => element.getAttribute("data-testid"));

    expect(ids).toEqual([
      "hero",
      "quick-actions",
      "statistics",
      "journey",
      "discovery",
      "stories",
      "passport-cta",
      "footer",
    ]);
    expect(screen.queryByText("ประสบการณ์จากนักเดินทาง")).not.toBeInTheDocument();
  });
});
