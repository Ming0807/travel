import { NextRequest, NextResponse } from "next/server";
import { requirePermission, AdminAuthError } from "@/lib/auth/guards";
import { getServerEnv } from "@/lib/config/server-env";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { logAuditAction } from "@/lib/services/audit-log.service";
import { parseExportFormat, createExportResponse } from "@/lib/utils/export-response";
import { firstJoin, type SupabaseJoin } from "@/lib/utils/supabase-joins";

export const dynamic = "force-dynamic";

type ExportRecord = Record<string, unknown>;

export async function GET(request: NextRequest) {
  try {
    const guard = await requirePermission("export.tourists");
    const format = parseExportFormat(request.nextUrl.searchParams.get("format"));

    const maxRows = getServerEnv().EXPORT_MAX_ROWS;

    const supabase = createSupabaseServiceRoleClient();

    const { data, error } = await supabase
      .from("tourists")
      .select(`
        tourist_id,
        display_name,
        countries (country_name_en, country_name_th),
        provinces (province_name_en, province_name_th),
        created_at,
        tourist_identities (provider),
        visits (
          visit_id,
          certificates (certificate_id)
        )
      `)
      .order("created_at", { ascending: false })
      .limit(maxRows + 1);

    if (error) {
      throw new Error("EXPORT_TOURISTS_FAILED");
    }

    if (data.length > maxRows) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.tourists.too_large",
        entityType: "tourist_export",
        result: "failed",
        metadata: { maxRows }
      });
      return NextResponse.json({ error: "Export is too large. Please apply more filters." }, { status: 413 });
    }

    const rows = ((data || []) as ExportRecord[]).map((row) => {
      const country = firstJoin(row.countries as SupabaseJoin<ExportRecord>);
      const province = firstJoin(row.provinces as SupabaseJoin<ExportRecord>);
      const identities = (row.tourist_identities ?? []) as ExportRecord[];
      const providers = identities.map((i) => i.provider).join(", ");
      const visits = (row.visits ?? []) as ExportRecord[];
      const visitCount = visits.length;
      const certificateCount = visits.reduce((sum, v) => {
        const certificates = (v.certificates ?? []) as ExportRecord[];
        return sum + certificates.length;
      }, 0);

      return {
        "ID": String(row.tourist_id),
        "Display Name": row.display_name || "",
        "Country (EN)": country?.country_name_en || "",
        "Country (TH)": country?.country_name_th || "",
        "Province (EN)": province?.province_name_en || "",
        "Province (TH)": province?.province_name_th || "",
        "Identity Providers": providers,
        "Total Visits": String(visitCount),
        "Total Certificates": String(certificateCount),
        "Registered At": row.created_at || "",
      };
    });

    await logAuditAction({
      actor: guard.actor,
      action: `export.tourists.${format}`,
      entityType: "tourist_export",
      result: "success",
      metadata: { rowCount: rows.length, maxRows }
    });

    const date = new Date().toISOString().split("T")[0];
    const baseFilename = `tourists_export_${date}`;

    return await createExportResponse(rows, baseFilename, format);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "UNAUTHORIZED" ? 401 : 403 });
    }
    console.error("Export Tourists Error:", error);
    return NextResponse.json({ error: "Failed to export data." }, { status: 500 });
  }
}
