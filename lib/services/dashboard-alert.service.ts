import "server-only";
import type { DashboardAlert, DashboardAlertSeverity, DashboardViewModel } from "@/types/dashboard";

/* ─── severity thresholds ─── */

const DIMENSION_CRITICAL = 2.0;
const DIMENSION_WARNING = 3.0;
const FUNNEL_DROP_CRITICAL = 0.7;   // 70%+
const FUNNEL_DROP_WARNING = 0.5;    // 50%+
const SURVEY_COMPLETION_WARNING = 0.2; // < 20%
const INTENTION_WARNING = 0.5;      // < 50%

/* ─── alert factory ─── */

function alert(
  id: string,
  severity: DashboardAlertSeverity,
  title: string,
  message: string,
  source: DashboardAlert["source"],
  actionable?: boolean,
  actionLabel?: string,
  actionHref?: string,
): DashboardAlert {
  return { id, severity, title, message, source, actionable, actionLabel, actionHref };
}

/* ─── satisfaction alerts ─── */

function buildSatisfactionAlerts(data: DashboardViewModel): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];
  const s = data.satisfaction;

  if (s.responseCount === 0) {
    alerts.push(
      alert(
        "satisfaction_no_data",
        "info",
        "No satisfaction responses",
        "There are no satisfaction survey responses for the selected filters. The average satisfaction will show as No data.",
        "satisfaction",
      ),
    );
    return alerts;
  }

  // Dimension score checks
  const dimensions: { key: string; label: string; value: number | null }[] = [
    { key: "safety", label: "Safety", value: s.safetyAverage },
    { key: "cleanliness", label: "Cleanliness", value: s.cleanlinessAverage },
    { key: "accessibility", label: "Accessibility", value: s.accessibilityAverage },
    { key: "information", label: "Information", value: s.informationAverage },
    { key: "value", label: "Value", value: s.valueAverage },
    { key: "facility", label: "Facility (legacy)", value: s.facilityAverage },
  ];

  for (const dim of dimensions) {
    if (dim.value === null) continue;

    if (dim.value < DIMENSION_CRITICAL) {
      alerts.push(
        alert(
          `dimension_critical_${dim.key}`,
          "critical",
          `${dim.label} score critically low`,
          `${dim.label} average is ${dim.value.toFixed(1)} / 5 — well below the 3.0 threshold. This requires immediate attention.`,
          "satisfaction",
          true,
          "View satisfaction",
          "/admin/dashboard/satisfaction",
        ),
      );
    } else if (dim.value < DIMENSION_WARNING) {
      alerts.push(
        alert(
          `dimension_warning_${dim.key}`,
          "warning",
          `${dim.label} score below target`,
          `${dim.label} average is ${dim.value.toFixed(1)} / 5. Consider reviewing visitor experience at affected areas.`,
          "satisfaction",
          true,
          "View details",
          "/admin/dashboard/satisfaction",
        ),
      );
    }
  }

  // Overall satisfaction low warning
  if (s.averageOverall !== null && s.averageOverall < DIMENSION_WARNING && s.responseCount >= 3) {
    alerts.push(
      alert(
        "overall_satisfaction_low",
        "warning",
        "Overall satisfaction below target",
        `Average overall satisfaction is ${s.averageOverall.toFixed(1)} / 5 — below the 3.0 threshold.`,
        "satisfaction",
        true,
        "View satisfaction",
        "/admin/dashboard/satisfaction",
      ),
    );
  }

  // Revisit intention low
  if (s.revisitIntentionRate !== null && s.revisitIntentionRate < INTENTION_WARNING) {
    alerts.push(
      alert(
        "revisit_intention_low",
        "warning",
        "Low revisit intention",
        `Only ${Math.round(s.revisitIntentionRate * 100)}% of respondents intend to revisit. This may indicate experience gaps.`,
        "satisfaction",
      ),
    );
  }

  // Recommend intention low
  if (s.recommendIntentionRate !== null && s.recommendIntentionRate < INTENTION_WARNING) {
    alerts.push(
      alert(
        "recommend_intention_low",
        "warning",
        "Low recommendation intention",
        `Only ${Math.round(s.recommendIntentionRate * 100)}% of respondents would recommend to others. Word-of-mouth potential is limited.`,
        "satisfaction",
      ),
    );
  }

  return alerts;
}

/* ─── funnel alerts ─── */

function buildFunnelAlerts(data: DashboardViewModel): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];
  const { stages, largestDropOffStage } = data.funnel;

  if (stages.length === 0 || stages.every((s) => s.count === 0)) {
    alerts.push(
      alert(
        "funnel_no_data",
        "info",
        "No funnel event data",
        "There are no QR scan events for the selected filters. The funnel will show 0 counts across all stages.",
        "funnel",
      ),
    );
    return alerts;
  }

  // Check first stage count
  const firstStage = stages[0];
  if (firstStage && firstStage.count === 0) {
    alerts.push(
      alert(
        "funnel_no_scans",
        "info",
        "No QR scans recorded",
        "The QR scanned count is 0 for the selected filters. Check QR code placement and campaign timing.",
        "funnel",
        true,
        "Manage QR codes",
        "/admin/checkin-codes",
      ),
    );
  }

  // Largest drop-off analysis
  if (largestDropOffStage && largestDropOffStage.dropOffFromPrevious !== null) {
    const dropPct = largestDropOffStage.dropOffFromPrevious;
    const stageIndex = stages.findIndex((s) => s.key === largestDropOffStage.key);
    const prevStage = stageIndex > 0 ? stages[stageIndex - 1] : null;

    if (dropPct >= FUNNEL_DROP_CRITICAL) {
      alerts.push(
        alert(
          "funnel_drop_critical",
          "critical",
          `Critical drop-off at "${largestDropOffStage.label}"`,
          `${Math.round(dropPct * 100)}% of users drop off between ${prevStage?.label ?? "previous stage"} and ${largestDropOffStage.label}. Only ${largestDropOffStage.count.toLocaleString("th-TH")} of ${prevStage?.count.toLocaleString("th-TH") ?? "previous"} users continue.`,
          "funnel",
          true,
          "View funnel",
          "/admin/dashboard/funnel",
        ),
      );
    } else if (dropPct >= FUNNEL_DROP_WARNING) {
      alerts.push(
        alert(
          "funnel_drop_warning",
          "warning",
          `Significant drop-off at "${largestDropOffStage.label}"`,
          `${Math.round(dropPct * 100)}% of users drop off between ${prevStage?.label ?? "previous stage"} and ${largestDropOffStage.label}. Consider reviewing the user experience at this step.`,
          "funnel",
          true,
          "View funnel",
          "/admin/dashboard/funnel",
        ),
      );
    }
  }

  // Check for sequential stage drops > 50% (not just the largest)
  for (let i = 1; i < stages.length; i++) {
    const stage = stages[i];
    if (stage.dropOffFromPrevious !== null && stage.dropOffFromPrevious >= FUNNEL_DROP_WARNING) {
      // Skip if this is the same as the largest drop-off (already reported)
      if (largestDropOffStage?.key === stage.key) continue;
      alerts.push(
        alert(
          `funnel_drop_stage_${stage.key}`,
          "warning",
          `Drop-off at "${stage.label}"`,
          `${Math.round(stage.dropOffFromPrevious * 100)}% of users drop off at this stage.`,
          "funnel",
        ),
      );
    }
  }

  return alerts;
}

/* ─── survey alerts ─── */

function buildSurveyAlerts(data: DashboardViewModel): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];

  const surveyCompletionKpi = data.kpis.find((k) => k.key === "survey_completion_rate");
  const surveyCompletionRaw = surveyCompletionKpi?.rawValue;

  if (surveyCompletionRaw !== null && surveyCompletionRaw !== undefined && surveyCompletionRaw < SURVEY_COMPLETION_WARNING) {
    alerts.push(
      alert(
        "survey_completion_low",
        "warning",
        "Low survey completion rate",
        `Only ${Math.round(surveyCompletionRaw * 100)}% of certificate recipients complete the optional survey. Responses may not be representative.`,
        "survey",
      ),
    );
  }

  return alerts;
}

/* ─── expense alerts ─── */

function buildExpenseAlerts(data: DashboardViewModel): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];
  const e = data.expense;

  if (e.responseCount === 0) {
    alerts.push(
      alert(
        "expense_no_data",
        "info",
        "No expense data",
        "There are no expense survey responses for the selected filters. Estimated spending will show as No data.",
        "expense",
      ),
    );
  } else if (e.responseCount < 5) {
    alerts.push(
      alert(
        "expense_low_sample",
        "info",
        "Limited expense data",
        `Only ${e.responseCount} expense responses available. Spending estimates may not be reliable.`,
        "expense",
      ),
    );
  }

  return alerts;
}

/* ─── master builder ─── */

export function buildDashboardAlerts(data: DashboardViewModel): DashboardAlert[] {
  const alerts: DashboardAlert[] = [
    ...buildSatisfactionAlerts(data),
    ...buildFunnelAlerts(data),
    ...buildSurveyAlerts(data),
    ...buildExpenseAlerts(data),
  ];

  // Sort: critical first, then warning, then info
  const severityOrder: Record<DashboardAlertSeverity, number> = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return alerts;
}
