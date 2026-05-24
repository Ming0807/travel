import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

export type SiteSetting = {
  setting_key: string;
  setting_value: any;
  description: string | null;
  updated_at: string;
};

export class SettingsRepository {
  private supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  private supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  private getClient() {
    return createClient<Database>(this.supabaseUrl, this.supabaseServiceKey);
  }

  async getSetting(key: string): Promise<SiteSetting | null> {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from("site_settings" as any)
      .select("*")
      .eq("setting_key", key)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error(`Error fetching setting ${key}:`, error.message || JSON.stringify(error));
      return null;
    }
    return data as SiteSetting | null;
  }

  async getAllSettings(): Promise<SiteSetting[]> {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from("site_settings" as any)
      .select("*")
      .order("setting_key");

    if (error) {
      console.error("Error fetching all settings:", error.message || JSON.stringify(error));
      return [];
    }
    return data as SiteSetting[];
  }

  async updateSetting(key: string, value: any): Promise<boolean> {
    const supabase = this.getClient();
    const query: any = supabase.from("site_settings" as any);
    // @ts-ignore
    const { error } = await query
      .update({ setting_value: value, updated_at: new Date().toISOString() })
      .eq("setting_key", key);

    if (error) {
      console.error(`Error updating setting ${key}:`, error.message || JSON.stringify(error));
      return false;
    }
    return true;
  }
}
