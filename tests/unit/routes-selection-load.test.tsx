import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PropsWithChildren } from "react";
vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({ attractions: vi.fn(), restaurants: vi.fn(), routes: vi.fn() }));
vi.mock("@/lib/repositories/public-content.repository", () => ({ listPublicAttractionCards: mocks.attractions, listPublicRestaurants: mocks.restaurants, listPublicRoutes: mocks.routes }));
vi.mock("@/lib/services/settings.service", () => ({ SettingsService: class { getSetting = async (_key: string, fallback: unknown) => fallback; } }));
vi.mock("@/components/layout/SiteFooter", () => ({ SiteFooter: () => <footer /> }));
vi.mock("@/components/public/PublicDirectoryHero", () => ({ PublicDirectoryHero: () => <div /> }));
vi.mock("@/components/public/PublicPageFrame", () => ({ PublicPageFrame: ({ children }: PropsWithChildren) => <main>{children}</main> }));
vi.mock("next/link", () => ({ default: ({ href, children }: PropsWithChildren<{ href: string }>) => <a href={href}>{children}</a> }));
import RoutesPage from "@/app/(public)/routes/page";

describe("route selection recovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.attractions.mockResolvedValue([]);
    mocks.restaurants.mockResolvedValue([]);
    mocks.routes.mockResolvedValue([]);
  });

  it("retains both sanitized selections when retrying a failed lookup", async () => {
    mocks.attractions.mockRejectedValue(new Error("unavailable"));
    mocks.restaurants.mockRejectedValue(new Error("unavailable"));
    render(await RoutesPage({ searchParams: Promise.resolve({ selected: "first,second", restaurants: "meal", extra: "private" }) }));
    expect(screen.getByText("โหลดสถานที่ที่เลือกไม่สำเร็จ")).toBeVisible();
    expect(screen.getByText("โหลดร้านอาหารที่เลือกไม่สำเร็จ")).toBeVisible();
    for (const link of screen.getAllByRole("link", { name: "ลองโหลดรายการที่เลือกอีกครั้ง" })) {
      const url = new URL(link.getAttribute("href")!, "http://localhost");
      expect(url.searchParams.get("selected")).toBe("first,second");
      expect(url.searchParams.get("restaurants")).toBe("meal");
      expect(url.searchParams.has("extra")).toBe(false);
    }
    expect(screen.queryByText(/อาจมีบางรายการถูกปิดเผยแพร่/)).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Google Maps/ })).not.toBeInTheDocument();
    expect(screen.getByText("กำลังเตรียมเส้นทางแนะนำ")).toBeVisible();
  });

  it("keeps a successfully empty result separate from a lookup failure", async () => {
    render(await RoutesPage({ searchParams: Promise.resolve({ selected: "first" }) }));
    expect(screen.getByText(/ไม่พบสถานที่ที่เผยแพร่จากรายการนี้/)).toBeVisible();
    expect(screen.queryByText("โหลดสถานที่ที่เลือกไม่สำเร็จ")).not.toBeInTheDocument();
  });
});
