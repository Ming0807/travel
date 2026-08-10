/* eslint-disable @next/next/no-html-link-for-pages */

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { PublicChrome } from "@/components/layout/public-chrome";
import { SiteHeader } from "@/components/layout/site-header";
import { isFocusedPublicRoute, shouldHidePublicChrome } from "@/lib/navigation/public-route-mode";

const mockPathname = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
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

  it.each(["/c", "/checkin/demo-code", "/visit/123", "/research/study", "/auth/login", "/account/link-line", "/admin"]) (
    "renders no public chrome or safe-area main on %s",
    (pathname) => {
      mockPathname.mockReturnValue(pathname);

      render(
        <PublicChrome appName="ท่องเที่ยวยะลา">
          <p>route content</p>
        </PublicChrome>,
      );

      expect(screen.queryByRole("banner")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Mobile navigation")).not.toBeInTheDocument();
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

      expect(screen.getAllByRole("banner")).toHaveLength(2);
      expect(screen.getByLabelText("Mobile navigation")).toBeInTheDocument();
      expect(screen.getByRole("main")).toHaveClass("phone-safe-bottom");
    },
  );

  it("supports click, ArrowDown, Escape, outside pointer, and route selection for desktop menus", async () => {
    const user = userEvent.setup();
    render(<SiteHeader appName="ท่องเที่ยวยะลา" />);

    const trigger = screen.getAllByRole("button", { name: /menu/i })[0];
    const menuId = trigger.getAttribute("aria-controls");
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(menuId).toBeTruthy();

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById(menuId!)).toBeVisible();

    await user.keyboard("{Escape}");
    expect(document.getElementById(menuId!)).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();

    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById(menuId!)?.querySelector("a")).toHaveFocus();

    await user.click(document.body);
    expect(document.getElementById(menuId!)).not.toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: "Enter" });
    expect(document.getElementById(menuId!)).toBeVisible();
    fireEvent.keyDown(trigger, { key: "Escape" });
    fireEvent.keyDown(trigger, { key: " " });
    expect(document.getElementById(menuId!)).toBeVisible();
    await user.keyboard("{Escape}");

    await user.click(trigger);
    await user.click(document.getElementById(menuId!)!.querySelector("a")!);
    expect(document.getElementById(menuId!)).not.toBeInTheDocument();
  });

  it("opens the mobile menu, focuses its first link, and restores focus after Escape", async () => {
    const user = userEvent.setup();
    render(<SiteHeader appName="ท่องเที่ยวยะลา" />);

    const trigger = document.querySelector<HTMLButtonElement>("button[aria-controls='public-mobile-menu']");
    expect(trigger).toBeInTheDocument();
    await user.click(trigger!);

    const menu = document.getElementById("public-mobile-menu");
    expect(menu).toBeInTheDocument();
    expect(menu).not.toHaveAttribute("aria-hidden");
    expect(menu?.querySelector("a")).toHaveFocus();

    await user.click(menu!.querySelector("a")!);
    expect(document.getElementById("public-mobile-menu")).not.toBeInTheDocument();

    await user.click(trigger!);
    await user.keyboard("{Escape}");
    expect(document.getElementById("public-mobile-menu")).not.toBeInTheDocument();
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
    expect(screen.queryByLabelText("Mobile navigation")).not.toBeInTheDocument();
  });
});
