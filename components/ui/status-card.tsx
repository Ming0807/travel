import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type StatusCardProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  className?: string;
};

export function StatusCard({ title, description, icon, className }: StatusCardProps) {
  return (
    <div className={cn("rounded-xl border border-white bg-white p-5 shadow-card", className)}>
      {icon ? <div className="mb-4 text-[#0F766E]">{icon}</div> : null}
      <h2 className="text-lg font-black text-[#073F37]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
