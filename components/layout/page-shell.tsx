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
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-coral">{eyebrow}</p>
        ) : null}
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink md:text-5xl">{title}</h1>
        <p className="mt-4 text-base leading-7 text-muted md:text-lg">{description}</p>
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}
