import { SettingsRepository, SiteSetting } from "../repositories/settings.repository";

export class SettingsService {
  private repository: SettingsRepository;

  constructor() {
    this.repository = new SettingsRepository();
  }

  async getSetting(key: string, defaultValue: any = null): Promise<any> {
    const setting = await this.repository.getSetting(key);
    return setting ? setting.setting_value : defaultValue;
  }

  async getAllSettings(): Promise<SiteSetting[]> {
    return this.repository.getAllSettings();
  }

  async updateSetting(key: string, value: any): Promise<boolean> {
    return this.repository.updateSetting(key, value);
  }
}
