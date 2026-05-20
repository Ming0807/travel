import type { ReactNode } from "react";

type PageShellProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function PageShell({ eyebrow, title, description, children }: PageShellProps) {
  return (
    <section className="tourism-container py-12 md:py-16">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#D36B4B]">{eyebrow}</p>
        ) : null}
        <h1 className="mt-3 text-4xl font-black tracking-tight text-[#073F37] md:text-5xl">{title}</h1>
        <p className="mt-4 text-base leading-7 text-slate-600 md:text-lg">{description}</p>
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}
