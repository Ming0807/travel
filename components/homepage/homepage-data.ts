import type { DashboardMetricCard } from "@/types/tourism";

export const dashboardPreviewMetrics: DashboardMetricCard[] = [
  {
    label: "Tourist Profiles",
    value: "5,240",
    note: "Planning preview metric. Replace with live dashboard data before production launch.",
  },
  {
    label: "Total Visits",
    value: "8,942",
    note: "Counts visit records, not raw QR scans.",
  },
  {
    label: "Certificates",
    value: "7,880",
    note: "Generated certificates connected to tourist visits.",
  },
  {
    label: "Satisfaction",
    value: "4.6/5",
    note: "Average score from completed optional surveys.",
  },
];
