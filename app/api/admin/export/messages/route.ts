import { NextRequest, NextResponse } from "next/server";
import { requirePermission, AdminAuthError } from "@/lib/auth/guards";
import { getServerEnv } from "@/lib/config/server-env";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { logAuditAction } from "@/lib/services/audit-log.service";
import { parseExportFormat, createExportResponse } from "@/lib/utils/export-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const guard = await requirePermission("export.personal_data");
    const format = parseExportFormat(request.nextUrl.searchParams.get("format"));

    const maxRows = getServerEnv().EXPORT_MAX_ROWS;

    const supabase = createSupabaseServiceRoleClient();

    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(maxRows + 1);

    if (error) {
      throw new Error("EXPORT_MESSAGES_FAILED");
    }

    if (data.length > maxRows) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.contact_messages.too_large",
        entityType: "message_export",
        result: "failed",
        metadata: { maxRows, privacyLevel: "restricted" }
      });
      return NextResponse.json({ error: "Export is too large. Please apply more filters." }, { status: 413 });
    }

    const rows = ((data || []) as Array<Record<string, unknown>>).map((row) => ({
      "Name": row.name || "",
      "Email": row.email || "",
      "Phone": row.phone || "",
      "Subject": row.subject || "",
      "Message": row.message || "",
      "Status": row.status || "",
      "Is Replied": row.is_replied ? "Yes" : "No",
      "Read At": row.read_at || "",
      "Created At": row.created_at || "",
    }));

    await logAuditAction({
      actor: guard.actor,
      action: `export.contact_messages.${format}`,
      entityType: "message_export",
      result: "success",
      metadata: { rowCount: rows.length, maxRows, privacyLevel: "restricted" }
    });

    const date = new Date().toISOString().split("T")[0];
    const baseFilename = `messages_export_${date}`;

    return await createExportResponse(rows, baseFilename, format);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "UNAUTHORIZED" ? 401 : 403 });
    }
    console.error("Export Messages Error:", error);
    return NextResponse.json({ error: "Failed to export data." }, { status: 500 });
  }
}
