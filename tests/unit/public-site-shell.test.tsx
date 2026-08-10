import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/SiteFooter";

const getSetting = vi.fn();
const mockUsePathname = vi.fn(() => "/");

vi.mock("next/navigation", () => ({ usePathname: () => mockUsePathname() }));
vi.mock("@/components/account/UserNavMenu", () => ({ UserNavMenu: () => <span>บัญชี</span> }));
vi.mock("@/lib/services/settings.service", () => ({
  SettingsService: class {
    getSetting(...args: unknown[]) { return getSetting(...args); }
  },
}));

describe("public site shell", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/");
    getSetting.mockImplementation((_key: string, fallback: unknown) => Promise.resolve(fallback));
  });

  it("links the header search icon to the real homepage search", () => {
    render(<SiteHeader appName="ท่องเที่ยวยะลา" />);
    expect(screen.getByRole("link", { name: "ไปที่ช่องค้นหา" })).toHaveAttribute("href", "/#homepage-search");
  });

  it("keeps the public footer Yala-first and free of admin links", async () => {
    render(await SiteFooter());
    expect(screen.getByText("ขอบเขตนำร่อง: จังหวัดยะลา")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Digital Passport" })).toHaveAttribute("href", "/passport");
    expect(screen.queryByRole("link", { name: /แอดมิน|แดชบอร์ด/ })).not.toBeInTheDocument();
    expect(screen.queryByText("ปัตตานี")).not.toBeInTheDocument();
    expect(screen.queryByText("นราธิวาส")).not.toBeInTheDocument();
  });
});
