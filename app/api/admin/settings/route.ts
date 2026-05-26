import { NextResponse } from "next/server";
import { SettingsService } from "@/lib/services/settings.service";
import { AdminAuthError, requirePermission } from "@/lib/auth/guards";
import { isSiteSettingKey } from "@/lib/config/site-settings";
import { logAdminMutation } from "@/lib/services/audit-log.service";

export async function GET(request: Request) {
  try {
    await requirePermission("system.settings_read");

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const service = new SettingsService();

    if (key) {
      if (!isSiteSettingKey(key)) {
        return NextResponse.json({ error: "ไม่พบหัวข้อ setting นี้" }, { status: 400 });
      }
      const setting = await service.getSetting(key);
      return NextResponse.json({ setting_key: key, setting_value: setting });
    }

    const allSettings = await service.getAllSettings();
    return NextResponse.json(allSettings);
  } catch (error) {
    console.error("[GET /api/admin/settings] Error:", error);
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "UNAUTHORIZED" ? 401 : 403 });
    }
    return NextResponse.json({ error: "ยังโหลด settings ไม่ได้ กรุณาลองอีกครั้ง" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const guard = await requirePermission("system.settings_update");
    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: "กรุณาระบุหัวข้อและค่าที่ต้องการบันทึก" }, { status: 400 });
    }

    if (typeof key !== "string" || !isSiteSettingKey(key)) {
      return NextResponse.json({ error: "ไม่พบหัวข้อ setting นี้" }, { status: 400 });
    }

    const service = new SettingsService();
    const oldValue = await service.getSetting(key);
    const success = await service.updateSetting(key, value);

    if (success) {
      await logAdminMutation({
        actor: guard.actor,
        action: "settings.update",
        entityType: "site_settings",
        entityId: key,
        oldValues: { value: oldValue },
        newValues: { value },
      });

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "ยังบันทึก setting ไม่ได้ กรุณาลองอีกครั้ง" }, { status: 500 });
    }
  } catch (error) {
    console.error("[PUT /api/admin/settings] Error:", error);
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "UNAUTHORIZED" ? 401 : 403 });
    }
    return NextResponse.json({ error: "ยังบันทึก setting ไม่ได้ กรุณาลองอีกครั้ง" }, { status: 500 });
  }
}
