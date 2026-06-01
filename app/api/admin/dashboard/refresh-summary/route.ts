import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { refreshDashboardSummary } from "@/lib/repositories/dashboard-summary.repository";

export async function POST() {
  try {
    await requirePermission("dashboard.read");
  } catch {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    await refreshDashboardSummary();
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to refresh summary";
    console.error("Refresh summary error:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
