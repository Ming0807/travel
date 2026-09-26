import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  getSetting: vi.fn().mockResolvedValue({}),
  updateSetting: vi.fn().mockResolvedValue(true),
  logAdminMutation: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/auth/guards", () => ({
  AdminAuthError: class AdminAuthError extends Error {},
  requirePermission: vi.fn().mockResolvedValue({ actor: { id: "admin" } }),
}));
vi.mock("@/lib/services/settings.service", () => ({
  SettingsService: class {
    getSetting = mocks.getSetting;
    updateSetting = mocks.updateSetting;
  },
}));
vi.mock("@/lib/services/audit-log.service", () => ({ logAdminMutation: mocks.logAdminMutation }));

import { PUT } from "@/app/api/admin/settings/route";

function request(key: string) {
  return new Request("http://localhost/api/admin/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, value: { image: "general/new-hero.webp" } }),
  });
}

describe("admin hero settings API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.updateSetting.mockResolvedValue(true);
  });

  it.each([
    ["homepage_hero", "/"],
    ["attractions_page_hero", "/attractions"],
    ["restaurants_page_hero", "/restaurants"],
    ["accommodations_page_hero", "/accommodations"],
    ["stories_page_hero", "/stories"],
    ["routes_page_hero", "/routes"],
  ])("revalidates %s after saving", async (key, path) => {
    const response = await PUT(request(key));
    expect(response.status).toBe(200);
    expect(mocks.revalidatePath).toHaveBeenCalledExactlyOnceWith(path);
  });

  it("does not revalidate a failed save", async () => {
    mocks.updateSetting.mockResolvedValue(false);
    const response = await PUT(request("restaurants_page_hero"));
    expect(response.status).toBe(500);
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("does not report a persisted setting as failed when revalidation throws", async () => {
    mocks.revalidatePath.mockImplementationOnce(() => { throw new Error("cache unavailable"); });
    const response = await PUT(request("stories_page_hero"));
    expect(response.status).toBe(200);
    expect(mocks.logAdminMutation).toHaveBeenCalled();
  });
});
