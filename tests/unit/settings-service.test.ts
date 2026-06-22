import { afterEach, describe, expect, it, vi } from "vitest";
import { SettingsService } from "@/lib/services/settings.service";
import type { SiteSetting } from "@/lib/repositories/settings.repository";
import type { Json } from "@/types/database";

class ThrowingSettingsRepository {
  async getSetting(): Promise<SiteSetting | null> {
    throw new Error("supabaseKey is required");
  }

  async getAllSettings(): Promise<SiteSetting[]> {
    throw new Error("supabaseKey is required");
  }

  async updateSetting(): Promise<boolean> {
    throw new Error("supabaseKey is required");
  }
}

class InMemorySettingsRepository {
  constructor(private readonly setting: SiteSetting | null) {}

  async getSetting(): Promise<SiteSetting | null> {
    return this.setting;
  }

  async getAllSettings(): Promise<SiteSetting[]> {
    return this.setting ? [this.setting] : [];
  }

  async updateSetting(): Promise<boolean> {
    return true;
  }
}

const sampleSetting: SiteSetting = {
  setting_key: "homepage_hero",
  setting_value: { title: "Test Hero" },
  description: null,
  updated_at: "2026-06-21T00:00:00.000Z",
};

describe("SettingsService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns stored setting values", async () => {
    const service = new SettingsService(new InMemorySettingsRepository(sampleSetting));

    await expect(service.getSetting("homepage_hero", { title: "Default" })).resolves.toEqual({
      title: "Test Hero",
    });
  });

  it("falls back to the provided default when the settings repository fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const service = new SettingsService(new ThrowingSettingsRepository());

    await expect(service.getSetting("homepage_hero", { title: "Default" })).resolves.toEqual({
      title: "Default",
    });
  });

  it("returns an empty list when settings list loading fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const service = new SettingsService(new ThrowingSettingsRepository());

    await expect(service.getAllSettings()).resolves.toEqual([]);
  });

  it("returns false when a settings update fails before a database response", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const service = new SettingsService(new ThrowingSettingsRepository());

    await expect(service.updateSetting("homepage_hero", { title: "Test" } satisfies Json)).resolves.toBe(false);
  });
});
