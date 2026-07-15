import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const actionMocks = vi.hoisted(() => ({ toggleAdminUserAction: vi.fn() }));

vi.mock("@/app/actions/admin-users", () => ({
  toggleAdminUserAction: actionMocks.toggleAdminUserAction,
}));

import { UserListClient } from "@/components/admin/users/UserListClient";

const users = [
  {
    admin_id: "11111111-1111-4111-8111-111111111111",
    display_name: "ผู้ดูแลทดสอบ",
    email: "admin@example.com",
    is_active: true,
    last_login_at: null,
    created_at: "2026-07-01T00:00:00.000Z",
    roles: ["super_admin"],
  },
];

describe("UserListClient", () => {
  beforeEach(() => {
    actionMocks.toggleAdminUserAction.mockReset();
    actionMocks.toggleAdminUserAction.mockResolvedValue({ success: true });
  });

  it("renders the server-provided page without a second client-side search", () => {
    render(<UserListClient users={users} canManage />);

    expect(screen.getAllByText("ผู้ดูแลทดสอบ").length).toBeGreaterThan(0);
    expect(screen.getAllByText("admin@example.com").length).toBeGreaterThan(0);
    expect(screen.queryByRole("textbox", { name: "ค้นหาผู้ดูแลระบบ" })).not.toBeInTheDocument();
  });

  it("hides edit and status controls from read-only users", () => {
    render(<UserListClient users={users} canManage={false} />);

    expect(screen.queryByRole("link", { name: "แก้ไข" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "ปิดใช้งาน" })).not.toBeInTheDocument();
    expect(screen.queryByText("จัดการ")).not.toBeInTheDocument();
  });

  it("keeps the audited status flow available to managers", async () => {
    render(<UserListClient users={users} canManage />);

    fireEvent.click(screen.getAllByRole("button", { name: "ปิดใช้งาน" })[0]);
    expect(actionMocks.toggleAdminUserAction).toHaveBeenCalledWith(users[0].admin_id, false);
  });
});
