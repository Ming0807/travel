import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function AdminPageHeader({ eyebrow, title, description, actions }: AdminPageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 pb-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F3704C]">{eyebrow}</p> : null}
        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-800">{title}</h1>
        {description ? <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
