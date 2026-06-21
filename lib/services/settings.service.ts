import { SettingsRepository, SiteSetting } from "../repositories/settings.repository";
import type { Json } from "@/types/database";

export class SettingsService {
  private repository: SettingsRepository;

  constructor() {
    this.repository = new SettingsRepository();
  }

  async getSetting<T = Json | null>(key: string, defaultValue: T = null as T): Promise<T> {
    const setting = await this.repository.getSetting(key);
    return setting ? (setting.setting_value as T) : defaultValue;
  }

  async getAllSettings(): Promise<SiteSetting[]> {
    return this.repository.getAllSettings();
  }

  async updateSetting(key: string, value: Json): Promise<boolean> {
    return this.repository.updateSetting(key, value);
  }
}
