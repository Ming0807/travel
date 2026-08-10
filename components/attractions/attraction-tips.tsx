import { CheckCircle } from "@phosphor-icons/react/dist/ssr";

type AttractionTipsProps = {
  tips: string[];
  title?: string;
};

export function AttractionTips({ tips, title = "Travel Tips" }: AttractionTipsProps) {
  return (
    <section id="tips" className="scroll-mt-36">
      <h2 className="text-2xl font-bold text-[var(--public-ink)]">{title}</h2>
      <div className="mt-5 border-y border-slate-200 py-2">
        <ul className="divide-y divide-slate-200">
          {tips.map((tip, index) => (
            <li key={index} className="flex items-start gap-3 py-4">
              <CheckCircle aria-hidden="true" size={22} weight="fill" className="mt-0.5 shrink-0 text-[var(--public-teal)]" />
              <p className="text-sm font-medium leading-7 text-slate-700">{tip}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
