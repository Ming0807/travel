import { readFileSync } from "node:fs";
import { join } from "node:path";
import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Drawer } from "@/components/admin/Drawer";
import { EmptyState } from "@/components/admin/EmptyState";
import { EditableBlock } from "@/components/admin/forms/EditableBlock";

const foundationFiles = [
  "components/admin/AdminShell.tsx",
  "components/admin/AdminSidebar.tsx",
  "components/admin/AdminTopbar.tsx",
  "components/admin/MobileAdminNav.tsx",
  "components/admin/AdminPageHeader.tsx",
  "components/admin/ListPageShell.tsx",
  "components/admin/DataTable.tsx",
  "components/admin/LoadingState.tsx",
  "components/admin/EmptyState.tsx",
  "components/admin/ErrorState.tsx",
  "components/admin/Drawer.tsx",
  "components/admin/Pagination.tsx",
  "components/admin/StatusBadge.tsx",
];

describe("admin visual foundation", () => {
  it("keeps shared operational components square, restrained, and free of decorative effects", () => {
    const source = foundationFiles
      .map((file) => readFileSync(join(process.cwd(), file), "utf8"))
      .join("\n");

    expect(source).not.toMatch(/rounded-(?:xl|2xl|3xl)/);
    expect(source).not.toContain("backdrop-blur");
    expect(source).not.toContain("bg-gradient");
    expect(source).toContain("#E77455");
  });

  it("declares scoped admin design tokens", () => {
    const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");

    expect(css).toContain(".admin-app");
    expect(css).toContain("--admin-accent: #E77455");
    expect(css).toContain("--admin-radius-control: 4px");
    expect(css).toContain("--admin-radius-panel: 6px");
    expect(css).toContain("--admin-control-height: 44px");
  });

  it("renders one page heading with actions and a useful empty state", () => {
    render(
      <>
        <AdminPageHeader
          eyebrow="จัดการเนื้อหา"
          title="สถานที่ท่องเที่ยว"
          description="แก้ไขข้อมูลที่แสดงบนเว็บไซต์"
          actions={<button type="button">เพิ่มสถานที่</button>}
        />
        <EmptyState
          title="ยังไม่มีสถานที่"
          description="เพิ่มสถานที่แรกเพื่อเริ่มจัดการเนื้อหา"
          action={<button type="button">เพิ่มสถานที่</button>}
        />
      </>,
    );

    expect(screen.getByRole("heading", { level: 1, name: "สถานที่ท่องเที่ยว" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "ยังไม่มีสถานที่" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "เพิ่มสถานที่" })).toHaveLength(2);
  });
});

function DrawerHarness() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>เปิดตัวแก้ไข</button>
      <Drawer isOpen={open} onClose={() => setOpen(false)} title="แก้ไขข้อมูล">
        <label htmlFor="drawer-name">ชื่อ</label>
        <input id="drawer-name" />
        <button type="button">บันทึก</button>
      </Drawer>
    </>
  );
}

describe("admin drawer accessibility", () => {
  it("locks page scroll, focuses the close control, and restores focus after Escape", async () => {
    const user = userEvent.setup();
    render(<DrawerHarness />);

    const trigger = screen.getByRole("button", { name: "เปิดตัวแก้ไข" });
    await user.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "แก้ไขข้อมูล" });
    expect(dialog.parentElement?.parentElement).toBe(document.body);
    expect(dialog.className).toContain("h-[100dvh]");
    expect(document.body).toHaveStyle({ overflow: "hidden" });
    await waitFor(() => expect(screen.getByRole("button", { name: "ปิด แก้ไขข้อมูล" })).toHaveFocus());

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
    expect(trigger).toHaveFocus();
  });

  it("keeps edit actions visible and touch-sized on small screens", () => {
    render(
      <EditableBlock id="gallery" label="รูปภาพ" onEdit={() => undefined}>
        <div>ตัวอย่างรูปภาพ</div>
      </EditableBlock>,
    );

    const editButton = screen.getByRole("button", { name: "แก้ไข รูปภาพ" });
    expect(editButton).toHaveClass("min-h-11");
    expect(editButton.parentElement).toHaveClass("opacity-100");
    expect(editButton.parentElement).toHaveClass("relative");
    expect(editButton.parentElement).toHaveClass("sm:absolute");
    expect(editButton.parentElement).not.toHaveClass("absolute");
  });
});
