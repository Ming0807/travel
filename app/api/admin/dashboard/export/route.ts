import { NextResponse } from "next/server";
import { DashboardServiceError, getDashboardAnalytics } from "@/lib/services/dashboard.service";
import { requirePermission, type AdminAuthError } from "@/lib/auth/guards";
import { getDashboardRepositoryPayload } from "@/lib/repositories/dashboard.repository";
import { parseDashboardFilters } from "@/lib/validation/dashboard-filters";
import type { DashboardFilters } from "@/types/dashboard";
import { generateCsv } from "@/lib/utils/csv";
import { parseExportFormat, createExportResponse } from "@/lib/utils/export-response";

function mapAdminError(error: AdminAuthError): DashboardServiceError {
  if (error.code === "UNAUTHORIZED") {
    return new DashboardServiceError("UNAUTHORIZED", "Please sign in to view this dashboard.");
  }
  return new DashboardServiceError("FORBIDDEN", "You do not have permission to view this dashboard.");
}

function safeString(val: unknown): string {
  if (val === null || val === undefined) return "";
  return String(val);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    const format = parseExportFormat(searchParams.get("format"));
    const exportType = params.type || "summary";
    const parsed = parseDashboardFilters(params);
    if (!parsed.success) {
      return new NextResponse("Invalid filters", { status: 400 });
    }

    try {
      await requirePermission("dashboard.read");
    } catch (error) {
      const err = mapAdminError(error as AdminAuthError);
      return new NextResponse(err.message, { status: err.code === "UNAUTHORIZED" ? 401 : 403 });
    }

    const datePrefix = new Date().toISOString().split('T')[0];
    let csv = "";
    // Inline CSV types (expenses, summary) remain CSV-only; structured types (tourists, visits, surveys) get xlsx support
    const filename = `dashboard_export_${exportType}_${datePrefix}.csv`;

    if (exportType === "expenses") {
      const data = await getDashboardAnalytics(params, "expenses");

      csv += "Expense Category,Responses,Min Range (THB),Max Range (THB)\n";
      data.expense.spendingRanges.forEach((range) => {
        csv += `"${range.label}",${range.value},,,\n`;
      });
      csv += "\n";
      csv += `Estimated Range,${data.expense.estimatedMin ?? "N/A"},${data.expense.estimatedMax ?? "N/A (+ if open-ended)"}\n`;
      csv += `Response Count,${data.expense.responseCount}\n`;
      csv += `Has Open-Ended Range,${data.expense.hasOpenEndedRange}\n`;
      csv += `Methodology Note,"${data.expense.methodologyNote}"\n`;

      // Expense category breakdown
      csv += "\nExpense Categories\n";
      csv += "Category,Responses,Percentage\n";
      data.expense.expenseCategories.forEach((cat) => {
        csv += `"${cat.label}",${cat.value},${cat.percent !== null ? (cat.percent * 100).toFixed(1) + "%" : "N/A"}\n`;
      });
    } else if (exportType === "summary") {
      const data = await getDashboardAnalytics(params, "executive");

      csv += "Dashboard Export - Top Attractions Summary\n";
      csv += `Generated at: ${new Date(data.generatedAt).toLocaleString("th-TH")}\n\n`;

      csv += "Rank,Attraction,Province,Visits,Certificates,Surveys,Avg Satisfaction\n";
      data.executive.topAttractions.forEach((attr) => {
        csv += `${attr.rank},"${attr.attractionName}","${attr.provinceName}",${attr.visitCount},${attr.certificateCount},${attr.surveyResponseCount},${attr.averageSatisfaction ?? "N/A"}\n`;
      });
    } else {
      // Raw data exports - NO PII is queried in the payload
      const payload = await getDashboardRepositoryPayload(parsed.data as DashboardFilters, exportType);

      if (exportType === "tourists") {
        const uniqueTourists = new Map<string, any>();
        payload.visits.forEach(v => {
          if (v.tourists && v.tourist_id) {
            uniqueTourists.set(String(v.tourist_id), v.tourists);
          }
        });

        const rows = Array.from(uniqueTourists.values()).map(t => {
          const country = t.countries as any;
          const province = t.provinces as any;
          return {
            "Age Group": safeString(t.age_group),
            "Preferred Language": safeString(t.preferred_language),
            "Origin Country (EN)": safeString(country?.country_name_en),
            "Origin Province (EN)": safeString(province?.province_name_en)
          };
        });

        if (rows.length === 0) {
          csv = '"No data available"';
        } else if (format === "xlsx") {
          return await createExportResponse(rows, `dashboard_export_tourists_${datePrefix}`, format);
        } else {
          csv = generateCsv(rows);
        }
      } else if (exportType === "visits") {
        const rows = payload.visits.map(v => {
          const t = v.tourists as any;
          const country = t?.countries as any;
          const originProvince = t?.provinces as any;
          const attr = v.attractions as any;
          const destProvince = attr?.provinces as any;
          const companion = v.travel_companions as any;
          const transport = v.transport_modes as any;
          const purpose = v.travel_purposes as any;
          return {
            "Visit Date": safeString(v.visit_date),
            "Attraction": safeString(attr?.name_en || attr?.name_th),
            "Destination Province": safeString(destProvince?.province_name_en),
            "Age Group": safeString(t?.age_group),
            "Origin Country": safeString(country?.country_name_en),
            "Origin Province": safeString(originProvince?.province_name_en),
            "Group Size": safeString(v.group_size),
            "Overnight": safeString(v.overnight_status),
            "Nights": safeString(v.nights),
            "Companion": safeString(companion?.name_en),
            "Transport": safeString(transport?.name_en),
            "Purpose": safeString(purpose?.name_en)
          };
        });

        if (rows.length === 0) {
          csv = '"No data available"';
        } else if (format === "xlsx") {
          return await createExportResponse(rows, `dashboard_export_visits_${datePrefix}`, format);
        } else {
          csv = generateCsv(rows);
        }
      } else if (exportType === "surveys") {
        const rows = payload.surveys.map(s => {
          const v = s.visits as any;
          const attr = v?.attractions as any;
          const province = attr?.provinces as any;
          return {
            "Submitted At": safeString(s.submitted_at),
            "Visit Date": safeString(v?.visit_date),
            "Attraction": safeString(attr?.name_en || attr?.name_th),
            "Province": safeString(province?.province_name_en),
            "Overall Score": safeString(s.overall_score),
            "Cleanliness Score": safeString(s.cleanliness_score),
            "Facility Score": safeString(s.facility_score),
            "Safety Score": safeString(s.safety_score),
            "Revisit Intention": safeString(s.revisit_intention),
            "Recommend Intention": safeString(s.recommend_intention)
          };
        });

        if (rows.length === 0) {
          csv = '"No data available"';
        } else if (format === "xlsx") {
          return await createExportResponse(rows, `dashboard_export_surveys_${datePrefix}`, format);
        } else {
          csv = generateCsv(rows);
        }
      } else {
        return new NextResponse("Unknown export type", { status: 400 });
      }
    }

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error("Dashboard export error:", error);
    const message = error instanceof DashboardServiceError ? error.message : "Failed to export data";
    return new NextResponse(message, { status: 500 });
  }
}
