/* eslint-disable @next/next/no-html-link-for-pages */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { PublicChrome } from "@/components/layout/public-chrome";
import { SiteHeader } from "@/components/layout/site-header";
import { isFocusedPublicRoute, shouldHidePublicChrome } from "@/lib/navigation/public-route-mode";

const mockPathname = vi.hoisted(() => vi.fn());
const mockRouter = vi.hoisted(() => ({ push: vi.fn() }));
const mobileNavigationLabel = "เมนูนำทางมือถือ";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
  useRouter: () => mockRouter,
}));

vi.mock("next/link", () => ({
  default: ({ children, onClick, ...props }: React.ComponentProps<"a">) => (
    <a {...props} onClick={(event) => { event.preventDefault(); onClick?.(event); }}>{children}</a>
  ),
}));

vi.mock("@/components/account/UserNavMenu", () => ({
  UserNavMenu: () => <span>บัญชี</span>,
}));

vi.mock("@/components/checkin/PublicCheckinEntryLink", () => ({
  PublicCheckinEntryLink: ({ children, ...props }: React.ComponentProps<"a">) => (
    <a href="/c" {...props}>{children}</a>
  ),
}));

describe("public navigation", () => {
  beforeEach(() => {
    mockRouter.push.mockReset();
    mockPathname.mockReturnValue("/");
  });

  it("matches only focused route roots and their descendants", () => {
    expect(isFocusedPublicRoute("/c")).toBe(true);
    expect(isFocusedPublicRoute("/c/demo-code")).toBe(true);
    expect(isFocusedPublicRoute("/research/study/invite")).toBe(true);
    expect(isFocusedPublicRoute("/researcher")).toBe(false);
    expect(isFocusedPublicRoute("/authentication")).toBe(false);
    expect(isFocusedPublicRoute("/checkin-ish")).toBe(false);
  });

  it("hides public chrome for focused and admin routes but keeps ordinary public routes", () => {
    expect(shouldHidePublicChrome("/checkin/demo-code")).toBe(true);
    expect(shouldHidePublicChrome("/admin/dashboard")).toBe(true);
    expect(shouldHidePublicChrome("/attractions/yala")).toBe(false);
  });

  it.each(["/c", "/checkin/demo-code", "/visit/123", "/research/study", "/auth/login", "/account/link-line", "/account/confirm-link", "/admin"]) (
    "renders no public chrome or safe-area main on %s",
    (pathname) => {
      mockPathname.mockReturnValue(pathname);

      render(
        <PublicChrome appName="ท่องเที่ยวยะลา">
          <p>route content</p>
        </PublicChrome>,
      );

      expect(screen.queryByRole("banner")).not.toBeInTheDocument();
      expect(screen.queryByLabelText(mobileNavigationLabel)).not.toBeInTheDocument();
      expect(screen.queryByRole("main")).not.toBeInTheDocument();
      expect(screen.getByText("route content")).toBeInTheDocument();
    },
  );

  it.each(["/", "/attractions/yala", "/passport", "/profile"]) (
    "keeps public chrome and safe-area main on %s",
    (pathname) => {
      mockPathname.mockReturnValue(pathname);

      render(
        <PublicChrome appName="ท่องเที่ยวยะลา">
          <p>route content</p>
        </PublicChrome>,
      );

      expect(screen.getAllByRole("banner")).toHaveLength(1);
      expect(screen.getByRole("navigation", { name: "เมนูหลัก" })).toBeInTheDocument();
      expect(screen.getByLabelText(mobileNavigationLabel)).toBeInTheDocument();
      expect(screen.getByRole("main")).toHaveClass("phone-safe-bottom");
    },
  );

  it("shows the current route and distinguishes the external 360 destination", () => {
    mockPathname.mockReturnValue("/attractions");
    render(<SiteHeader appName="ท่องเที่ยวยะลา" />);
    expect(screen.getByRole("navigation", { name: "เมนูหลัก" }).querySelector('a[href="/attractions"]')).toHaveAttribute("aria-current", "page");
    const vista = screen.getByRole("navigation", { name: "เมนูหลัก" }).querySelector('a[href^="https://yala360.yru.ac.th"]');
    expect(vista).toHaveAttribute("target", "_blank");
    expect(vista).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("keeps the check-in entry available in both desktop and mobile navigation", async () => {
    mockPathname.mockReturnValue("/attractions");
    const user = userEvent.setup();
    render(<SiteHeader appName="ท่องเที่ยวยะลา" />);
    await user.click(screen.getByRole("button", { name: "เปิดเมนู" }));

    const checkinActions = screen.getAllByRole("link", { name: /สแกน QR/ });
    expect(checkinActions).toHaveLength(2);
    checkinActions.forEach((action) => {
      expect(action).toHaveAttribute("href", "/c");
    });
  });

  it("opens the mobile menu, follows a route, and restores focus after Escape", async () => {
    mockPathname.mockReturnValue("/attractions");
    const user = userEvent.setup();
    render(<SiteHeader appName="ท่องเที่ยวยะลา" />);

    const trigger = screen.getByRole("button", { name: "เปิดเมนู" });
    expect(trigger).toBeInTheDocument();
    await user.click(trigger!);

    const menu = document.getElementById("ed-site-mobile-nav");
    expect(menu).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(menu?.querySelector("a")).toHaveFocus();

    await user.click(menu!.querySelector("a")!);
    expect(document.getElementById("ed-site-mobile-nav")).not.toBeInTheDocument();

    await user.click(trigger!);
    await user.keyboard("{Escape}");
    expect(document.getElementById("ed-site-mobile-nav")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("keeps hook order stable when pathname changes", () => {
    const { rerender } = render(<SiteHeader appName="ท่องเที่ยวยะลา" />);

    mockPathname.mockReturnValue("/auth/login");
    expect(() => rerender(<SiteHeader appName="ท่องเที่ยวยะลา" />)).not.toThrow();
  });

  it("keeps the mobile nav hook order stable across focused routes", () => {
    mockPathname.mockReturnValue("/");
    const { rerender } = render(<MobileBottomNav />);

    mockPathname.mockReturnValue("/checkin/demo-code");
    expect(() => rerender(<MobileBottomNav />)).not.toThrow();
    expect(screen.queryByLabelText(mobileNavigationLabel)).not.toBeInTheDocument();
  });
});
