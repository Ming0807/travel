"use server";

import { revalidatePath } from "next/cache";
import Papa from "papaparse";
import { z } from "zod";
import { AdminAuthError, requirePermission } from "@/lib/auth/guards";
import { AdminOfficialDataRepository } from "@/lib/repositories/admin-official-data.repository";
import { logAdminMutation } from "@/lib/services/audit-log.service";

const csvRowSchema = z.object({
  province_name: z.string().min(1, "Province name is required"),
  year: z.coerce.number().int().min(2000).max(2100),
  month: z
    .union([z.coerce.number().int().min(1).max(12), z.literal(""), z.undefined()])
    .transform((value) => (value === "" || value === undefined ? undefined : value)),
  tourist_type: z.enum(["thai", "foreign", "total", "unknown"]).default("total"),
  visitor_count: z.coerce.number().int().min(0),
  revenue_amount: z
    .union([z.coerce.number().min(0), z.literal(""), z.undefined()])
    .transform((value) => (value === "" || value === undefined ? undefined : value)),
  currency_code: z.string().trim().min(1).max(3).default("THB")
});

type OfficialImportResult = {
  success: boolean;
  error?: string;
  message?: string;
  details?: string[];
};

const MAX_OFFICIAL_IMPORT_ROWS = 5000;
const MAX_OFFICIAL_IMPORT_BYTES = 2 * 1024 * 1024;

function safeImportError(message = "Import failed. Please try again."): OfficialImportResult {
  return { success: false, error: message };
}

function normalizeProvinceName(value: string) {
  return value.trim().toLowerCase().replace(/^จังหวัด\s*/u, "");
}

export async function parseAndImportOfficialStats(formData: FormData): Promise<OfficialImportResult> {
  try {
    const guard = await requirePermission("official_data.import");
    const file = formData.get("file") as File | null;
    const sourceName = String(formData.get("source_name") ?? "").trim();
    const sourceUrl = String(formData.get("source_url") ?? "").trim();

    if (!file || !sourceName) {
      return safeImportError("File and source name are required.");
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      return safeImportError("Please upload a CSV file.");
    }

    if (file.size <= 0 || file.size > MAX_OFFICIAL_IMPORT_BYTES) {
      return safeImportError("CSV file is empty or larger than the allowed import size.");
    }

    const parsed = Papa.parse<Record<string, string>>(await file.text(), {
      header: true,
      skipEmptyLines: true
    });

    if (parsed.errors.length > 0) {
      return safeImportError("CSV parsing error. Please check the file format.");
    }

    const rows = parsed.data;
    if (rows.length > MAX_OFFICIAL_IMPORT_ROWS) {
      return safeImportError(`CSV contains too many rows. Maximum is ${MAX_OFFICIAL_IMPORT_ROWS}.`);
    }

    const headers = parsed.meta.fields ?? [];
    if (!headers.includes("province_name") || !headers.includes("year") || !headers.includes("visitor_count")) {
      return safeImportError("The file is missing required columns (province_name, year, visitor_count).");
    }

    const provinces = await AdminOfficialDataRepository.getProvinces();
    const provinceMap = new Map<string, number>();
    for (const province of provinces) {
      provinceMap.set(normalizeProvinceName(province.province_name_th), province.province_id);
      provinceMap.set(normalizeProvinceName(province.province_name_en), province.province_id);
      provinceMap.set(normalizeProvinceName(province.province_name_en.replace(/ province$/i, "")), province.province_id);
    }

    const importLog = await AdminOfficialDataRepository.createImportLog({
      source_name: sourceName,
      source_url: sourceUrl || undefined,
      source_file_name: file.name,
      import_type: "tourism_stats",
      imported_by: guard.authUserId
    });

    let recordsInserted = 0;
    let recordsFailed = 0;
    const rowErrors: string[] = [];
    const validRowsToInsert: Parameters<typeof AdminOfficialDataRepository.insertTourismStats>[0] = [];

    for (const [index, row] of rows.entries()) {
      try {
        const validated = csvRowSchema.parse(row);
        const mappedProvinceId = provinceMap.get(normalizeProvinceName(validated.province_name));

        if (!mappedProvinceId) {
          throw new Error(`Province mapping failed for: ${validated.province_name}`);
        }

        validRowsToInsert.push({
          province_id: mappedProvinceId,
          year: validated.year,
          month: validated.month,
          tourist_type: validated.tourist_type,
          visitor_count: validated.visitor_count,
          revenue_amount: validated.revenue_amount,
          currency_code: validated.currency_code || "THB",
          source_name: sourceName,
          source_url: sourceUrl || undefined,
          source_file_name: file.name,
          import_log_id: importLog.import_log_id,
          imported_at: new Date().toISOString()
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Invalid row";
        rowErrors.push(`Row ${index + 2}: ${message}`);
        recordsFailed++;
      }
    }

    if (validRowsToInsert.length > 0) {
      const chunkSize = 1000;
      for (let i = 0; i < validRowsToInsert.length; i += chunkSize) {
        await AdminOfficialDataRepository.insertTourismStats(validRowsToInsert.slice(i, i + chunkSize));
      }
      recordsInserted = validRowsToInsert.length;
    }

    const finalStatus = recordsFailed > 0 ? (recordsInserted > 0 ? "partial_success" : "failed") : "success";

    await AdminOfficialDataRepository.updateImportLogStatus(importLog.import_log_id, {
      status: finalStatus,
      records_processed: rows.length,
      records_inserted: recordsInserted,
      records_failed: recordsFailed,
      metadata_json: {
        row_errors: rowErrors.slice(0, 20)
      }
    });

    await logAdminMutation({
      actor: guard.actor,
      action: "official_data.import",
      entityType: "official_tourism_stats",
      entityId: importLog.import_log_id,
      newValues: {
        source_name: sourceName,
        source_file_name: file.name,
        records_processed: rows.length,
        records_inserted: recordsInserted,
        records_failed: recordsFailed,
        status: finalStatus
      }
    });

    revalidatePath("/admin/official-data");

    if (recordsFailed > 0 && recordsInserted === 0) {
      return safeImportError("All rows failed validation. Please check province names and data types.");
    }

    return {
      success: true,
      message: `Import completed. ${recordsInserted} inserted, ${recordsFailed} failed.`,
      details: rowErrors.slice(0, 5)
    };
  } catch (error) {
    if (error instanceof AdminAuthError) return safeImportError(error.message);
    console.error("Official data import failed", error);
    return safeImportError();
  }
}
