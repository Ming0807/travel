import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  createServiceRole: vi.fn(),
}));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: mocks.createServiceRole,
}));

import { listActiveCertificateTemplatesForAttraction } from "@/lib/repositories/certificate-template.repository";

function queryBuilder(result: unknown) {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    or: vi.fn(),
  };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.or.mockResolvedValue(result);
  return query;
}

describe("certificate template repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createServiceRole.mockReturnValue({ from: mocks.from });
  });

  it("loads only active global or attraction-scoped templates", async () => {
    const query = queryBuilder({
      data: [
        {
          template_id: 8,
          template_name: "Yala",
          attraction_id: 12,
          background_path: "certificate-templates/yala.webp",
          layout_config_json: { orientation: "portrait" },
          language: "th",
          is_default: true,
        },
      ],
      error: null,
    });
    mocks.from.mockReturnValue(query);

    await expect(listActiveCertificateTemplatesForAttraction(12)).resolves.toEqual([
      expect.objectContaining({ templateId: 8, orientation: "portrait" }),
    ]);
    expect(query.eq).toHaveBeenCalledWith("is_active", true);
    expect(query.or).toHaveBeenCalledWith("attraction_id.eq.12,attraction_id.is.null");
  });

  it("uses landscape for legacy templates without orientation metadata", async () => {
    const query = queryBuilder({
      data: [
        {
          template_id: 1,
          template_name: "Legacy",
          attraction_id: null,
          background_path: null,
          layout_config_json: null,
          language: null,
          is_default: true,
        },
      ],
      error: null,
    });
    mocks.from.mockReturnValue(query);

    await expect(listActiveCertificateTemplatesForAttraction(12)).resolves.toEqual([
      expect.objectContaining({ language: "th", orientation: "landscape" }),
    ]);
  });
});
