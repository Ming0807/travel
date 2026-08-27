import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/SiteFooter";

const getSetting = vi.fn();
const mockUsePathname = vi.fn(() => "/");
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ push: mockPush }),
}));
vi.mock("@/components/account/UserNavMenu", () => ({ UserNavMenu: () => <span>บัญชี</span> }));
vi.mock("@/lib/services/settings.service", () => ({
  SettingsService: class {
    getSetting(...args: unknown[]) { return getSetting(...args); }
  },
}));

describe("public site shell", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/");
    mockPush.mockReset();
    getSetting.mockImplementation((_key: string, fallback: unknown) => Promise.resolve(fallback));
  });

  it("opens a real global search from the header and routes to the selected directory", async () => {
    const user = userEvent.setup();
    render(<SiteHeader appName="ท่องเที่ยวยะลา" />);

    const searchTriggers = screen.getAllByRole("button", { name: "ค้นหาทั่วเว็บไซต์" });
    await user.click(searchTriggers[0]);

    const dialog = screen.getByRole("dialog", { name: "ค้นหาข้อมูลท่องเที่ยว" });
    await user.type(screen.getByRole("searchbox", { name: "คำค้นหา" }), "โรตี");
    await user.selectOptions(screen.getByRole("combobox", { name: "ประเภทเนื้อหา" }), "restaurants");
    await user.click(screen.getByRole("button", { name: "ค้นหา", hidden: false }));

    expect(dialog).not.toBeInTheDocument();
    expect(mockPush).toHaveBeenCalledWith("/restaurants?q=%E0%B9%82%E0%B8%A3%E0%B8%95%E0%B8%B5");
  });

  it("closes global search with Escape and restores focus to its trigger", async () => {
    const user = userEvent.setup();
    render(<SiteHeader appName="ท่องเที่ยวยะลา" />);

    const trigger = screen.getAllByRole("button", { name: "ค้นหาทั่วเว็บไซต์" })[0];
    await user.click(trigger);
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog", { name: "ค้นหาข้อมูลท่องเที่ยว" })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("keeps the public footer Yala-first and free of admin links", async () => {
    render(await SiteFooter());
    expect(screen.getByText("ขอบเขตนำร่อง:")).toBeInTheDocument();
    expect(screen.getByText("จังหวัดยะลา")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Digital Passport" })).toHaveAttribute("href", "/passport");
    expect(screen.queryByRole("link", { name: /แอดมิน|แดชบอร์ด/ })).not.toBeInTheDocument();
    expect(screen.queryByText("ปัตตานี")).not.toBeInTheDocument();
    expect(screen.queryByText("นราธิวาส")).not.toBeInTheDocument();
  });
});
