import type { ReactNode } from "react";

type PublicEdgePageProps = {
  code: string;
  title: string;
  description: string;
  icon: ReactNode;
  actions: ReactNode;
  tone?: "neutral" | "error";
};

export function PublicEdgePage({
  code,
  title,
  description,
  icon,
  actions,
  tone = "neutral",
}: PublicEdgePageProps) {
  const iconClasses = tone === "error"
    ? "border-red-200 bg-red-50 text-red-700"
    : "border-black/10 bg-white text-[var(--public-teal)]";

  return (
    <section className="border-y border-black/10 bg-[var(--public-canvas)]">
      <div className="mx-auto grid min-h-[68vh] w-full max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-8">
        <div className="max-w-2xl">
          <div className={`grid h-12 w-12 place-items-center rounded-[var(--public-radius-control)] border ${iconClasses}`}>
            {icon}
          </div>
          <p className="mt-8 text-sm font-semibold text-[var(--public-coral)]">รหัสสถานะ {code}</p>
          <h1 className="mt-3 text-balance text-3xl font-semibold leading-tight text-[var(--public-ink)] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-[65ch] text-pretty text-base leading-8 text-black/65 sm:text-lg">
            {description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">{actions}</div>
        </div>

        <div aria-hidden="true" className="hidden border-l border-black/10 pl-10 lg:block">
          <span className="block text-[7rem] font-semibold leading-none text-black/[0.06]">{code}</span>
          <span className="mt-4 block h-2 w-20 bg-[var(--public-coral)]" />
        </div>
      </div>
    </section>
  );
}
