import { CircleAlert } from "lucide-react";

export function NoDataState({ title = "ยังไม่มีข้อมูล", description }: { title?: string; description: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
      <div className="flex items-start gap-3">
        <CircleAlert aria-hidden="true" className="mt-0.5 text-[#D6A13D]" size={18} />
        <div>
          <p className="font-black text-slate-800">{title}</p>
          <p className="mt-1 leading-6">{description}</p>
        </div>
      </div>
    </div>
  );
}
