import type { ReactNode } from "react";
import Link from "next/link";

export type LegalSection = {
  id: string;
  title: string;
  summary?: string;
  content: ReactNode;
};

type RelatedLink = {
  href: string;
  label: string;
};

type LegalDocumentProps = {
  eyebrow: string;
  title: string;
  introduction: string;
  updatedAt: string;
  notice: ReactNode;
  sections: LegalSection[];
  relatedLinks: RelatedLink[];
};

export function LegalDocument({
  eyebrow,
  title,
  introduction,
  updatedAt,
  notice,
  sections,
  relatedLinks,
}: LegalDocumentProps) {
  return (
    <main className="min-h-screen bg-[#F7F8F6] text-ink">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <header className="grid gap-8 border-b border-ink/20 pb-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-black text-coral">{eyebrow}</p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-balance sm:text-5xl">{title}</h1>
            <p className="mt-5 max-w-[70ch] text-base leading-8 text-slate-700 text-pretty">{introduction}</p>
          </div>
          <dl className="border-t border-ink/20 pt-4 text-sm">
            <dt className="font-bold text-slate-500">ปรับปรุงล่าสุด</dt>
            <dd className="mt-1 font-black text-ink">{updatedAt}</dd>
          </dl>
        </header>

        <div className="mt-8 border border-amber-300 bg-amber-50 px-5 py-4 text-sm leading-7 text-amber-950">
          {notice}
        </div>

        <nav aria-label="สารบัญเอกสาร" className="mt-8 overflow-x-auto border-y border-ink/15 bg-white">
          <div className="flex min-w-max">
            {sections.map((section, index) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="inline-flex min-h-12 items-center border-r border-ink/10 px-4 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:text-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-teal"
              >
                <span className="mr-2 text-xs tabular-nums text-coral">{String(index + 1).padStart(2, "0")}</span>
                {section.title}
              </a>
            ))}
          </div>
        </nav>

        <div className="mt-10 grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
          <aside className="hidden lg:block">
            <div className="sticky top-28 border-l border-ink/20 pl-5">
              <p className="text-xs font-black text-slate-500">หัวข้อในเอกสาร</p>
              <ol className="mt-4 space-y-3">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a className="text-sm font-semibold leading-6 text-slate-600 hover:text-teal" href={`#${section.id}`}>
                      {index + 1}. {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          <article className="min-w-0 divide-y divide-ink/15 border-b border-ink/15">
            {sections.map((section, index) => (
              <section key={section.id} id={section.id} className="scroll-mt-28 py-9 first:pt-0 sm:py-11">
                <div className="grid gap-4 sm:grid-cols-[54px_minmax(0,1fr)]">
                  <p aria-hidden="true" className="text-2xl font-black tabular-nums text-coral/70">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <div>
                    <h2 className="text-2xl font-black leading-tight text-balance sm:text-3xl">{section.title}</h2>
                    {section.summary ? <p className="mt-2 text-sm leading-6 text-slate-600">{section.summary}</p> : null}
                    <div className="mt-6 space-y-5 text-sm leading-7 text-slate-700 sm:text-base sm:leading-8">
                      {section.content}
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </article>
        </div>

        <section aria-labelledby="related-legal-links" className="mt-12 border-t-4 border-ink bg-white px-5 py-6 sm:px-7">
          <h2 id="related-legal-links" className="text-lg font-black">ทางเลือกและเอกสารที่เกี่ยวข้อง</h2>
          <div className="mt-4 flex flex-wrap gap-x-7 gap-y-3">
            {relatedLinks.map((link) => (
              <Link key={link.href} href={link.href} className="inline-flex min-h-11 items-center font-bold text-teal underline underline-offset-4">
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
