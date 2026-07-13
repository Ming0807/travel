import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminAccessProvider } from "@/components/admin/AdminAccessContext";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { getVisibleNavGroups, navGroups } from "@/components/admin/admin-nav-items";

const mocks = vi.hoisted(() => ({
  logout: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("@/app/actions/admin-auth-actions", () => ({
  logoutAdminAction: mocks.logout,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin",
  useRouter: () => ({
    replace: mocks.replace,
    refresh: mocks.refresh,
  }),
}));

function renderTopbar() {
  return render(
    <AdminAccessProvider
      initialAdmin={{
        adminId: "admin-test-1",
        displayName: "ผู้ดูแลทดสอบ",
        email: "admin@example.test",
        roleNames: ["super_admin"],
        permissions: ["system.all"],
      }}
    >
      <AdminTopbar />
    </AdminAccessProvider>
  );
}

describe("Admin account menu", () => {
  beforeEach(() => {
    mocks.logout.mockReset();
    mocks.replace.mockReset();
    mocks.refresh.mockReset();
  });

  it("shows Thai account actions and closes with Escape", async () => {
    const user = userEvent.setup();
    renderTopbar();

    const trigger = screen.getByRole("button", { name: "เปิดเมนูบัญชีผู้ดูแลระบบ" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menuitem", { name: "โปรไฟล์ผู้ดูแลระบบ" })).toHaveAttribute("href", "/admin/profile");
    expect(screen.getByRole("menuitem", { name: "ไปยังเว็บไซต์หน้าบ้าน" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("menuitem", { name: "ออกจากระบบ" })).toBeEnabled();

    await user.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("uses the real logout action and redirects only after success", async () => {
    mocks.logout.mockResolvedValue({ success: true });
    const user = userEvent.setup();
    renderTopbar();

    await user.click(screen.getByRole("button", { name: "เปิดเมนูบัญชีผู้ดูแลระบบ" }));
    await user.click(screen.getByRole("menuitem", { name: "ออกจากระบบ" }));

    await waitFor(() => expect(mocks.logout).toHaveBeenCalledOnce());
    expect(mocks.replace).toHaveBeenCalledWith("/admin/login");
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });

  it("keeps the menu open and announces a safe error when logout fails", async () => {
    mocks.logout.mockResolvedValue({ success: false, error: "ไม่สามารถออกจากระบบได้ กรุณาลองอีกครั้ง" });
    const user = userEvent.setup();
    renderTopbar();

    await user.click(screen.getByRole("button", { name: "เปิดเมนูบัญชีผู้ดูแลระบบ" }));
    await user.click(screen.getByRole("menuitem", { name: "ออกจากระบบ" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("ไม่สามารถออกจากระบบได้ กรุณาลองอีกครั้ง");
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});

describe("Permission-aware admin navigation", () => {
  const accessLabels = ["ผู้ดูแลระบบ", "บทบาทและสิทธิ์", "บันทึกการใช้งาน", "ตั้งค่าระบบ"];

  function visibleLabels(permissions: string[], resolved = true) {
    return getVisibleNavGroups(navGroups, permissions, resolved).flatMap((group) => group.items.map((item) => item.label));
  }

  it("fails closed for access-control links while permissions are loading", () => {
    const labels = visibleLabels([], false);
    accessLabels.forEach((label) => expect(labels).not.toContain(label));
    expect(labels).toContain("ข้อความ");
  });

  it("shows only access-control destinations allowed by the current permissions", () => {
    const labels = visibleLabels(["user.read", "audit.read"]);
    expect(labels).not.toContain("ผู้ดูแลระบบ");
    expect(labels).toContain("บันทึกการใช้งาน");
    expect(labels).not.toContain("บทบาทและสิทธิ์");
    expect(labels).not.toContain("ตั้งค่าระบบ");
  });

  it("shows every protected access-control destination to system administrators", () => {
    const labels = visibleLabels(["system.all"]);
    accessLabels.forEach((label) => expect(labels).toContain(label));
  });
});
