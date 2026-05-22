import { NextResponse } from "next/server";
import { DashboardServiceError, getDashboardAnalytics } from "@/lib/services/dashboard.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    const data = await getDashboardAnalytics(params, "executive");

    let csv = "Dashboard Export - Top Attractions Summary\n";
    csv += `Generated at: ${new Date(data.generatedAt).toLocaleString("th-TH")}\n\n`;

    csv += "Rank,Attraction,Province,Visits,Certificates,Surveys,Avg Satisfaction\n";
    data.executive.topAttractions.forEach((attr) => {
      csv += `${attr.rank},"${attr.attractionName}","${attr.provinceName}",${attr.visitCount},${attr.certificateCount},${attr.surveyResponseCount},${attr.averageSatisfaction ?? "N/A"}\n`;
    });

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="dashboard_summary_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    console.error("Dashboard export error:", error);
    const message = error instanceof DashboardServiceError ? error.message : "Failed to export data";
    return new NextResponse(message, { status: 500 });
  }
}
