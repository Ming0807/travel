import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function AdminPageHeader({ eyebrow, title, description, actions }: AdminPageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="text-xs font-bold text-[#B94727]">{eyebrow}</p> : null}
        <h1 className="mt-1 text-2xl font-black text-[#202020]">{title}</h1>
        {description ? <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2" data-print-hide>{actions}</div> : null}
    </header>
  );
}
