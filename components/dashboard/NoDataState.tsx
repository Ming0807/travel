import { CircleAlert } from "lucide-react";

export function NoDataState({ title = "No data", description }: { title?: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
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
