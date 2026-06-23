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
    const guard = await requirePermission("export.tourist_summary");
    const format = parseExportFormat(request.nextUrl.searchParams.get("format"));

    const maxRows = getServerEnv().EXPORT_MAX_ROWS;

    const supabase = createSupabaseServiceRoleClient();

    const { data, error } = await supabase
      .from("tourists")
      .select(`
        countries (country_name_en, country_name_th),
        provinces (province_name_en, province_name_th),
        created_at,
        tourist_identities (provider),
        visits (
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
        action: "export.tourist_summary.too_large",
        entityType: "tourist_export",
        result: "failed",
        metadata: { maxRows }
      });
      return NextResponse.json({ error: "Export is too large. Please apply more filters." }, { status: 413 });
    }

    const rows = ((data || []) as ExportRecord[]).map((row, index) => {
      const country = firstJoin(row.countries as SupabaseJoin<ExportRecord>);
      const province = firstJoin(row.provinces as SupabaseJoin<ExportRecord>);
      const identities = (row.tourist_identities ?? []) as ExportRecord[];
      const providers = identities.map((i) => String(i.provider || ""));
      const uniqueProviders = new Set(providers.filter(Boolean));
      const visits = (row.visits ?? []) as ExportRecord[];
      const visitCount = visits.length;
      const certificateCount = visits.reduce((sum, v) => {
        const certificates = (v.certificates ?? []) as ExportRecord[];
        return sum + certificates.length;
      }, 0);

      return {
        "Profile Ref": `T-${String(index + 1).padStart(6, "0")}`,
        "Country (EN)": country?.country_name_en || "",
        "Country (TH)": country?.country_name_th || "",
        "Province (EN)": province?.province_name_en || "",
        "Province (TH)": province?.province_name_th || "",
        "Identity Provider Summary": summarizeIdentityProviders(uniqueProviders),
        "Total Visits": String(visitCount),
        "Total Certificates": String(certificateCount),
        "Registered Month": formatMonth(row.created_at),
      };
    });

    await logAuditAction({
      actor: guard.actor,
      action: `export.tourist_summary.${format}`,
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

function summarizeIdentityProviders(providers: Set<string>): string {
  if (providers.size === 0) return "unknown";
  if (providers.size > 1) return "multiple";
  if (providers.has("anonymous_device")) return "guest_only";
  if (providers.has("line")) return "line_linked";
  if (providers.has("email")) return "email_linked";
  if (providers.has("google") || providers.has("google_optional")) return "google_linked";
  return "linked";
}

function formatMonth(value: unknown): string {
  if (typeof value !== "string" || value.length < 7) return "";
  return value.slice(0, 7);
}
