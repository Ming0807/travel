import { NoDataState } from "@/components/dashboard/NoDataState";
import { localizeDashboardInsight } from "@/components/dashboard/dashboard-localization";
import type { DashboardViewModel, InsightCardData } from "@/types/dashboard";

const CATEGORY: Record<InsightCardData["category"], string> = {
  improvement: "ควรปรับปรุง",
  promotion: "ควรส่งเสริม",
  concentration: "การกระจุกตัว",
  data_quality: "คุณภาพข้อมูล",
  opportunity: "โอกาส",
};

const CONFIDENCE: Record<InsightCardData["confidence"], string> = { low: "หลักฐานยังน้อย", medium: "หลักฐานปานกลาง", high: "หลักฐานค่อนข้างชัด" };

export function SustainableTourismSection({ data }: { data: DashboardViewModel }) {
  return (
    <section className="space-y-5" aria-labelledby="sustainability-heading">
      <div>
        <h2 id="sustainability-heading" className="text-lg font-bold text-slate-900">ข้อสังเกตเพื่อการท่องเที่ยวยั่งยืน</h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">ข้อสังเกตสร้างจากกติกาและข้อมูลที่มี ไม่ใช่คำตัดสินจาก AI หรือสถิติทางการ ทุกข้อแสดงหลักฐานและระดับความมั่นใจ</p>
      </div>
      {data.insights.length === 0 ? <NoDataState description="ยังไม่มีข้อมูลเพียงพอสำหรับสร้างข้อสังเกตเชิงวางแผน" /> : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="divide-y divide-slate-200">
            {data.insights.map(localizeDashboardInsight).map((insight, index) => (
              <article key={`${insight.title}-${index}`} className="grid gap-3 p-4 lg:grid-cols-[160px_1fr_1fr]">
                <div><span className="inline-flex rounded-md border border-[#E8B8A8] bg-[#FFF7F3] px-2.5 py-1 text-xs font-bold text-[#8F351F]">{CATEGORY[insight.category]}</span><p className="mt-2 text-xs text-slate-500">{CONFIDENCE[insight.confidence]}</p></div>
                <div><h3 className="font-bold text-slate-900">{insight.title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{insight.description}</p><p className="mt-2 text-xs leading-5 text-slate-500"><strong>หลักฐาน:</strong> {insight.evidence}</p></div>
                <div className="border-l-0 border-slate-200 lg:border-l lg:pl-4"><p className="text-xs font-semibold text-slate-500">แนวทางพิจารณา</p><p className="mt-1 text-sm leading-6 text-slate-700">{insight.suggestedAction}</p></div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
