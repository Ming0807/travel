export type StatusBadgeTone = "green" | "gold" | "gray" | "red" | "teal";

const toneClasses: Record<StatusBadgeTone, string> = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  gold: "border-[#D6A13D]/30 bg-[#D6A13D]/10 text-[#8A5A05]",
  gray: "border-slate-200 bg-slate-100 text-slate-600",
  red: "border-rose-200 bg-rose-50 text-rose-700",
  teal: "border-[#0A6B62]/20 bg-[#E6F4EF] text-[#0A6B62]"
};

export function StatusBadge({ label, tone = "gray" }: { label: string; tone?: StatusBadgeTone }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${toneClasses[tone]}`}>
      {label}
    </span>
  );
}
