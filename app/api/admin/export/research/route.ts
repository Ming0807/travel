import { NextRequest, NextResponse } from "next/server";

import { AdminAuthError, requirePermission, type AdminActor } from "@/lib/auth/guards";
import { getServerEnv } from "@/lib/config/server-env";
import { logAuditAction } from "@/lib/services/audit-log.service";
import { loadDeidentifiedResearchExport, ResearchExportError } from "@/lib/services/research-export.service";
import { createExportResponse, parseExportFormat } from "@/lib/utils/export-response";
import { adminResearchExportFiltersSchema } from "@/lib/validation/admin-research";

export const dynamic = "force-dynamic";

function collectionModes(request: NextRequest) {
  const values = [...request.nextUrl.searchParams.getAll("collectionModes"), ...request.nextUrl.searchParams.getAll("mode")]
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);
  return values.length > 0 ? values : ["field_observation"];
}

export async function GET(request: NextRequest) {
  let actor: AdminActor | null = null;
  let exportContext: { studyId: string; dataset: string } | null = null;

  try {
    const guard = await requirePermission("research.export");
    actor = guard.actor;
    const parsed = adminResearchExportFiltersSchema.safeParse({
      studyId: request.nextUrl.searchParams.get("studyId"),
      dataset: request.nextUrl.searchParams.get("dataset"),
      dateFrom: request.nextUrl.searchParams.get("dateFrom") || undefined,
      dateTo: request.nextUrl.searchParams.get("dateTo") || undefined,
      participantType: request.nextUrl.searchParams.get("participantType") || undefined,
      collectionModes: collectionModes(request),
      minCellThreshold: 10,
      deidentified: true,
    });
    if (!parsed.success) {
      await logAuditAction({ actor: guard.actor, action: "export.research.invalid_filters", entityType: "research_export", result: "failed", metadata: { reason: "invalid_filters" } });
      return NextResponse.json({ error: "ตัวกรองการส่งออกไม่ถูกต้อง" }, { status: 400 });
    }
    exportContext = { studyId: parsed.data.studyId, dataset: parsed.data.dataset };
    const rows = await loadDeidentifiedResearchExport(parsed.data);
    const maxRows = getServerEnv().EXPORT_MAX_ROWS;
    if (rows.length > maxRows) {
      await logAuditAction({ actor: guard.actor, action: "export.research.too_large", entityType: "research_export", entityId: parsed.data.studyId, result: "failed", metadata: { dataset: parsed.data.dataset, rowCount: rows.length, maxRows } });
      return NextResponse.json({ error: "ข้อมูลมากเกินขีดจำกัด กรุณาลดช่วงวันที่" }, { status: 413 });
    }
    const format = parseExportFormat(request.nextUrl.searchParams.get("format"));
    await logAuditAction({ actor: guard.actor, action: `export.research.${parsed.data.dataset}.${format}`, entityType: "research_export", entityId: parsed.data.studyId, result: "success", metadata: { dataset: parsed.data.dataset, rowCount: rows.length, collectionModes: parsed.data.collectionModes, deidentified: true, minCellThreshold: 10 } });
    const date = new Date().toISOString().slice(0, 10);
    return createExportResponse(rows, `research_${parsed.data.dataset}_${date}`, format);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      await logAuditAction({
        action: "export.research.denied",
        entityType: "research_export",
        result: "denied",
        metadata: { code: error.code },
      });
      return NextResponse.json({ error: error.message }, { status: error.code === "UNAUTHORIZED" ? 401 : 403 });
    }
    if (error instanceof ResearchExportError) {
      const status = error.code === "STUDY_NOT_FOUND" ? 404 : error.code === "SMALL_SAMPLE" ? 422 : 409;
      await logAuditAction({
        actor,
        action: `export.research.${error.code.toLowerCase()}`,
        entityType: "research_export",
        entityId: exportContext?.studyId ?? null,
        result: "failed",
        metadata: {
          code: error.code,
          dataset: exportContext?.dataset ?? null,
          deidentified: true,
          minCellThreshold: 10,
        },
      });
      return NextResponse.json({ error: error.message, code: error.code }, { status });
    }
    await logAuditAction({
      actor,
      action: "export.research.failed",
      entityType: "research_export",
      entityId: exportContext?.studyId ?? null,
      result: "failed",
      metadata: { dataset: exportContext?.dataset ?? null, reason: "unexpected_error" },
    });
    console.error("Research export failed", error);
    return NextResponse.json({ error: "ยังส่งออกข้อมูลงานวิจัยไม่ได้" }, { status: 500 });
  }
}
