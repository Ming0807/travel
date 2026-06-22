import { SettingsRepository, SiteSetting } from "../repositories/settings.repository";
import type { Json } from "@/types/database";

type SettingsRepositoryLike = Pick<SettingsRepository, "getSetting" | "getAllSettings" | "updateSetting">;

function describeSettingsError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export class SettingsService {
  private repository: SettingsRepositoryLike;

  constructor(repository: SettingsRepositoryLike = new SettingsRepository()) {
    this.repository = repository;
  }

  async getSetting<T = Json | null>(key: string, defaultValue: T = null as T): Promise<T> {
    try {
      const setting = await this.repository.getSetting(key);
      return setting ? (setting.setting_value as T) : defaultValue;
    } catch (error) {
      console.error(`Settings read failed for ${key}:`, describeSettingsError(error));
      return defaultValue;
    }
  }

  async getAllSettings(): Promise<SiteSetting[]> {
    try {
      return await this.repository.getAllSettings();
    } catch (error) {
      console.error("Settings list read failed:", describeSettingsError(error));
      return [];
    }
  }

  async updateSetting(key: string, value: Json): Promise<boolean> {
    try {
      return await this.repository.updateSetting(key, value);
    } catch (error) {
      console.error(`Settings update failed for ${key}:`, describeSettingsError(error));
      return false;
    }
  }
}
