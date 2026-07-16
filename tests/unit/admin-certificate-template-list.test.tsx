import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/actions/admin-certificate-templates", () => ({
  toggleTemplateStatus: vi.fn(),
  setTemplateAsDefault: vi.fn(),
  deleteTemplate: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

import { TemplateListClient } from "@/components/admin/certificate-templates/TemplateListClient";

describe("TemplateListClient", () => {
  it("shows Thai status and attraction scope from server data", () => {
    render(
      <TemplateListClient
        templates={[
          {
            template_id: 4,
            template_name: "Yala Memory",
            attraction_id: 11,
            attraction_name: "สกายวอล์คอัยเยอร์เวง",
            background_path: null,
            language: "th",
            is_default: false,
            is_active: true,
            created_at: "2026-07-01T00:00:00.000Z",
            updated_at: null,
            orientation: "landscape",
          },
        ]}
      />
    );

    expect(screen.getByText("ใช้งานอยู่")).toBeInTheDocument();
    expect(screen.getByText("เฉพาะสถานที่")).toBeInTheDocument();
    expect(screen.getByText("สกายวอล์คอัยเยอร์เวง")).toBeInTheDocument();
    expect(screen.queryByText("Active")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ออกแบบเทมเพลต" })).toHaveAttribute(
      "href",
      "/admin/certificate-templates/4/edit"
    );
  });
});
