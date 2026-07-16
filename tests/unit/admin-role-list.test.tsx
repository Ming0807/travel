import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/actions/admin-roles", () => ({ deleteRoleAction: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

import { RoleListClient } from "@/components/admin/roles/RoleListClient";

const roles = [
  {
    role_id: 8,
    role_name: "content_editor",
    description: "ดูแลเนื้อหา",
    is_active: true,
    created_at: "2026-07-01T00:00:00.000Z",
    permissions: ["story.read", "story.update"],
  },
];

describe("RoleListClient", () => {
  it("renders only the server-provided page and hides forbidden commands", () => {
    render(
      <RoleListClient
        roles={roles}
        canUpdate={false}
        canDelete={false}
      />
    );

    expect(screen.getAllByText("content_editor").length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: "แก้ไข" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "ลบ" })).not.toBeInTheDocument();
  });

  it("shows granular update and delete commands when permitted", () => {
    render(<RoleListClient roles={roles} canUpdate canDelete />);

    expect(screen.getAllByRole("link", { name: "แก้ไข" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "ลบ" }).length).toBeGreaterThan(0);
  });
});
