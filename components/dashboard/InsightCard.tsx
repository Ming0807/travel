import type { InsightCardData } from "@/types/dashboard";

const categoryTone: Record<InsightCardData["category"], string> = {
  improvement: "border-rose-200 bg-rose-50 text-rose-700",
  promotion: "border-emerald-200 bg-emerald-50 text-emerald-700",
  concentration: "border-[#D6A13D]/30 bg-[#D6A13D]/10 text-[#8A5A05]",
  data_quality: "border-slate-200 bg-slate-50 text-slate-700",
  opportunity: "border-[#0A6B62]/20 bg-[#E6F4EF] text-[#0A6B62]"
};

export function InsightCard({ insight }: { insight: InsightCardData }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-black text-[#073F37]">{insight.title}</h3>
        <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${categoryTone[insight.category]}`}>
          {insight.confidence} confidence
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{insight.description}</p>
      <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700">{insight.evidence}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{insight.suggestedAction}</p>
    </article>
  );
}
