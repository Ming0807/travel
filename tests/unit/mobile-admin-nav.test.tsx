import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminAccessProvider } from "@/components/admin/AdminAccessContext";
import { MobileAdminNav } from "@/components/admin/MobileAdminNav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/surveys",
}));

function renderNavigation() {
  return render(
    <AdminAccessProvider
      initialAdmin={{
        permissions: ["system.all"],
        roleNames: ["super_admin"],
      }}
    >
      <MobileAdminNav />
    </AdminAccessProvider>,
  );
}

describe("mobile admin navigation", () => {
  afterEach(() => {
    document.body.style.overflow = "";
  });

  it("renders the drawer in a body-level dialog instead of the blurred header containing block", async () => {
    const user = userEvent.setup();
    renderNavigation();

    const trigger = screen.getByRole("button", { name: "เปิดเมนูผู้ดูแลระบบ" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "เมนูผู้ดูแลระบบ" });
    expect(dialog.parentElement?.parentElement).toBe(document.body);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(document.body).toHaveStyle({ overflow: "hidden" });
    await waitFor(() => expect(screen.getByRole("button", { name: "ปิดเมนูผู้ดูแลระบบ" })).toHaveFocus());
  });

  it("returns focus to the hamburger before unmounting the drawer", async () => {
    const user = userEvent.setup();
    renderNavigation();

    const trigger = screen.getByRole("button", { name: "เปิดเมนูผู้ดูแลระบบ" });
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "ปิดเมนูผู้ดูแลระบบ" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe("");
  });

  it("closes with Escape and restores focus", async () => {
    const user = userEvent.setup();
    renderNavigation();

    const trigger = screen.getByRole("button", { name: "เปิดเมนูผู้ดูแลระบบ" });
    await user.click(trigger);
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
