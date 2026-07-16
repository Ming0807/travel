import { NextRequest, NextResponse } from "next/server";
import { AdminAuthError, requirePermission } from "@/lib/auth/guards";
import { getServerEnv } from "@/lib/config/server-env";
import { exportAdminCertificateTemplates } from "@/lib/repositories/admin-certificate-template.repository";
import { logAuditAction } from "@/lib/services/audit-log.service";
import { createExportResponse, parseExportFormat } from "@/lib/utils/export-response";
import {
  adminCertificateTemplateFiltersSchema,
  certificateTemplateExportFilters,
} from "@/lib/validation/admin-certificate-template";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requirePermission("certificate.template_manage");
    const guard = await requirePermission("export.certificate_templates");
    const format = parseExportFormat(request.nextUrl.searchParams.get("format"));
    const rawParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    delete rawParams.format;
    const parsed = adminCertificateTemplateFiltersSchema.safeParse(rawParams);

    if (!parsed.success) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.certificate_templates.invalid_filters",
        entityType: "certificate_template_export",
        result: "failed",
        metadata: { reason: "invalid_filters", privacyLevel: "internal" },
      });
      return NextResponse.json({ error: "Invalid export filters." }, { status: 400 });
    }

    const filters = certificateTemplateExportFilters(parsed.data);
    const filterSummary = {
      hasSearch: Boolean(filters.search),
      status: filters.status ?? null,
      language: filters.language ?? null,
      scope: filters.scope ?? null,
      sort: filters.sort,
    };
    const maxRows = getServerEnv().EXPORT_MAX_ROWS;
    const data = await exportAdminCertificateTemplates(filters, maxRows + 1);

    if (data.length > maxRows) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.certificate_templates.too_large",
        entityType: "certificate_template_export",
        result: "failed",
        metadata: { maxRows, filters: filterSummary, privacyLevel: "internal" },
      });
      return NextResponse.json(
        { error: "Export is too large. Please apply more filters." },
        { status: 413 }
      );
    }

    const rows = data.map((template) => ({
      "รหัสเทมเพลต": String(template.template_id),
      "ชื่อเทมเพลต": template.template_name,
      "ภาษา": template.language,
      "ขอบเขต": template.attraction_id ? "เฉพาะสถานที่" : "ส่วนกลาง",
      "สถานที่": template.attraction_name ?? "",
      "สถานะ": template.is_active ? "ใช้งานอยู่" : "ปิดใช้งาน",
      "ค่าเริ่มต้น": template.is_default ? "ใช่" : "ไม่ใช่",
      "สร้างเมื่อ": template.created_at,
      "แก้ไขล่าสุด": template.updated_at ?? "",
    }));

    await logAuditAction({
      actor: guard.actor,
      action: `export.certificate_templates.${format}`,
      entityType: "certificate_template_export",
      result: "success",
      metadata: {
        rowCount: rows.length,
        maxRows,
        filters: filterSummary,
        privacyLevel: "internal",
      },
    });

    const date = new Date().toISOString().split("T")[0];
    return await createExportResponse(rows, `certificate_templates_export_${date}`, format);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === "UNAUTHORIZED" ? 401 : 403 }
      );
    }
    console.error("Export Certificate Templates Error:", error);
    return NextResponse.json({ error: "Failed to export data." }, { status: 500 });
  }
}
