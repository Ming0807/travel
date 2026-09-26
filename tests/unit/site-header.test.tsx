import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/attractions" }));
vi.mock("@/components/account/UserNavMenu", () => ({ UserNavMenu: () => <span>บัญชี</span> }));
vi.mock("@/components/layout/PublicGlobalSearch", () => ({ PublicGlobalSearch: () => <button>ค้นหา</button> }));
vi.mock("@/components/checkin/PublicCheckinEntryLink", () => ({
  PublicCheckinEntryLink: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

import { SiteHeader } from "@/components/layout/site-header";
import { VISTA_360_EXTERNAL_URL } from "@/constants/product";

describe("public site header", () => {
  it("links directly to the external 360 provider from desktop navigation", () => {
    render(<SiteHeader appName="ท่องเที่ยวยะลา" />);
    const link = within(screen.getByRole("navigation", { name: "เมนูหลัก" })).getByRole("link", { name: /ชม 360°.*เว็บไซต์ภายนอก/ });
    expect(link).toHaveAttribute("href", VISTA_360_EXTERNAL_URL);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("link", { name: "สถานที่" })).toHaveAttribute("aria-current", "page");
  });

  it("keeps the external link and key journeys in the mobile menu", async () => {
    render(<SiteHeader appName="ท่องเที่ยวยะลา" />);
    await userEvent.click(screen.getByRole("button", { name: "เปิดเมนู" }));
    const menu = screen.getByRole("navigation", { name: "เมนูมือถือ" });
    expect(within(menu).getByRole("link", { name: /ชม 360°.*เว็บไซต์ภายนอก/ })).toHaveAttribute("href", VISTA_360_EXTERNAL_URL);
    expect(within(menu).getByRole("link", { name: "Digital Passport" })).toHaveAttribute("href", "/passport");
    expect(within(menu).getByRole("link", { name: "ร้านอาหาร" })).toHaveAttribute("href", "/restaurants");
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("navigation", { name: "เมนูมือถือ" })).not.toBeInTheDocument();
  });
});
