import { AlertTriangle, BarChart3 } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { dashboardPreviewMetrics } from "@/components/homepage/homepage-data";
import { StatusCard } from "@/components/ui/status-card";

export default function DashboardPage() {
  return (
    <PageShell
      description="A Phase 01 dashboard shell. Phase 09 will add protected, server-side aggregated metrics that follow the dashboard metric dictionary."
      eyebrow="Privacy-safe analytics"
      title="Dashboard"
    >
      <div className="grid gap-4 md:grid-cols-4">
        {dashboardPreviewMetrics.map((metric) => (
          <StatusCard
            description={metric.note}
            icon={<BarChart3 aria-hidden="true" />}
            key={metric.label}
            title={`${metric.label}: ${metric.value}`}
          />
        ))}
      </div>
      <div className="mt-6 flex gap-3 rounded-[1.5rem] bg-[#073F37] p-5 text-white">
        <AlertTriangle aria-hidden="true" className="mt-0.5 shrink-0 text-[#D6A13D]" />
        <p className="text-sm leading-6 text-white/78">
          Dashboard access must be protected before real data is connected. QR scans are not visits,
          estimated spending is not revenue, and missing satisfaction is No data.
        </p>
      </div>
    </PageShell>
  );
}
