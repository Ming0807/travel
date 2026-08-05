import type { ReactNode } from "react";

type AnalyticsSectionHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  headingId: string;
};

export function AnalyticsSectionHeader({ title, description, actions, headingId }: AnalyticsSectionHeaderProps) {
  return (
    <header className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <h2 id={headingId} className="text-xl font-bold text-slate-950">{title}</h2>
        {description ? <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex min-w-0 flex-wrap items-center gap-2 sm:shrink-0">{actions}</div> : null}
    </header>
  );
}
