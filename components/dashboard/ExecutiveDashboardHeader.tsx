import { Clock } from "@phosphor-icons/react/dist/ssr";
import { ExportCsvButton } from "@/components/dashboard/ExportCsvButton";
import type { DashboardViewModel } from "@/types/dashboard";

export function ExecutiveDashboardHeader({ data }: { data: DashboardViewModel }) {
  const updatedAt = data.summaryRefreshTimestamp ?? data.generatedAt;

  return (
    <header className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 id="executive-overview-heading" className="text-2xl font-black text-slate-950 sm:text-[1.65rem]">ภาพรวมการท่องเที่ยว</h1>
        <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-600">ข้อมูลเพื่อวางแผนและตัดสินใจ จังหวัดยะลา</p>
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500"><Clock aria-hidden="true" size={15} />อัปเดต {new Date(updatedAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}</span>
        <ExportCsvButton filters={data.filters} quality={data.quality} />
      </div>
    </header>
  );
}
