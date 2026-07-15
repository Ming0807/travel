import { NextRequest, NextResponse } from "next/server";
import { requirePermission, AdminAuthError } from "@/lib/auth/guards";
import { getServerEnv } from "@/lib/config/server-env";
import { exportContactMessages } from "@/lib/repositories/admin-message.repository";
import { logAuditAction } from "@/lib/services/audit-log.service";
import {
  adminMessageQuerySchema,
  messageExportFilters,
  toContactMessageExportRows,
} from "@/lib/validation/admin-message";
import { parseExportFormat, createExportResponse } from "@/lib/utils/export-response";

export const dynamic = "force-dynamic";

function auditFilterSummary(filters: ReturnType<typeof messageExportFilters>) {
  return {
    hasSearch: Boolean(filters.search),
    status: filters.status,
    sort: filters.sort,
  };
}

export async function GET(request: NextRequest) {
  try {
    await requirePermission("export.messages");
    const guard = await requirePermission("export.personal_data");
    const format = parseExportFormat(request.nextUrl.searchParams.get("format"));
    const rawParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    delete rawParams.format;
    const parsed = adminMessageQuerySchema.safeParse(rawParams);
    if (!parsed.success) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.contact_messages.invalid_filters",
        entityType: "message_export",
        result: "failed",
        metadata: { reason: "invalid_filters", privacyLevel: "restricted" }
      });
      return NextResponse.json({ error: "Invalid export filters." }, { status: 400 });
    }

    const maxRows = getServerEnv().EXPORT_MAX_ROWS;
    const filters = messageExportFilters(parsed.data);
    const filterSummary = auditFilterSummary(filters);

    const data = await exportContactMessages(filters, maxRows + 1);

    if (data.length > maxRows) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.contact_messages.too_large",
        entityType: "message_export",
        result: "failed",
        metadata: { maxRows, filters: filterSummary, privacyLevel: "restricted" }
      });
      return NextResponse.json({ error: "Export is too large. Please apply more filters." }, { status: 413 });
    }

    const rows = toContactMessageExportRows(data);

    await logAuditAction({
      actor: guard.actor,
      action: `export.contact_messages.${format}`,
      entityType: "message_export",
      result: "success",
      metadata: {
        rowCount: rows.length,
        maxRows,
        filters: filterSummary,
        privacyLevel: "restricted",
      }
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
