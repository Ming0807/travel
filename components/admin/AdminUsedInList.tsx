import Link from "next/link";
import { LinkSimple, WarningCircle } from "@phosphor-icons/react/dist/ssr";

export type UsageReference = {
  label: string;
  href?: string;
  type: "attraction" | "story" | "route" | "restaurant" | "accommodation" | "homepage" | "setting" | "unknown";
};

type AdminUsedInListProps = {
  references: UsageReference[];
  emptyMessage?: string;
};

const typeLabels: Record<string, string> = {
  attraction: "แหล่งท่องเที่ยว",
  story: "เรื่องราว",
  route: "เส้นทาง",
  restaurant: "ร้านอาหาร",
  accommodation: "ที่พัก",
  homepage: "หน้าแรก",
  setting: "ตั้งค่า",
  unknown: "อื่นๆ",
};

export function AdminUsedInList({ references, emptyMessage }: AdminUsedInListProps) {
  if (references.length === 0) {
    return emptyMessage ? (
      <p className="text-xs text-slate-400">{emptyMessage}</p>
    ) : null;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <h4 className="mb-2 text-xs font-black uppercase tracking-wide text-slate-500">
        ใช้งานใน {references.length} ตำแหน่ง
      </h4>
      <ul className="space-y-2">
        {references.map((ref, idx) => (
          <li key={idx}>
            {ref.href ? (
              <Link
                href={ref.href}
                className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slate-600 transition hover:bg-slate-50 hover:text-[#0A6B62]"
              >
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 group-hover:bg-[#E6F4EF] group-hover:text-[#0A6B62]">
                  {typeLabels[ref.type] ?? ref.type}
                </span>
                <span className="flex-1 truncate font-semibold">{ref.label}</span>
                <LinkSimple size={12} weight="bold" className="shrink-0 text-slate-300 group-hover:text-[#0A6B62]" />
              </Link>
            ) : (
              <span className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slate-500">
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                  {typeLabels[ref.type] ?? ref.type}
                </span>
                <span className="flex-1 truncate">{ref.label}</span>
                <WarningCircle size={12} weight="fill" className="shrink-0 text-amber-500" />
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
