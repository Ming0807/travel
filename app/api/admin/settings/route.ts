import { NextResponse } from "next/server";
import { SettingsService } from "@/lib/services/settings.service";
// Depending on auth, you might want to wrap this in a role check,
// but for now we trust the route logic to handle validation if needed.

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const service = new SettingsService();

    if (key) {
      const setting = await service.getSetting(key);
      return NextResponse.json({ setting_key: key, setting_value: setting });
    }

    const allSettings = await service.getAllSettings();
    return NextResponse.json(allSettings);
  } catch (error) {
    console.error("[GET /api/admin/settings] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Missing key or value" }, { status: 400 });
    }

    const service = new SettingsService();
    const success = await service.updateSetting(key, value);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Failed to update setting" }, { status: 500 });
    }
  } catch (error) {
    console.error("[PUT /api/admin/settings] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
