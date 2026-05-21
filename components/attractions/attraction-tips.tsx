import { CheckCircle } from "@phosphor-icons/react/dist/ssr";

type AttractionTipsProps = {
  tips: string[];
};

export function AttractionTips({ tips }: AttractionTipsProps) {
  return (
    <div id="tips" className="scroll-mt-24 pt-8">
      <h2 className="mb-6 text-2xl font-bold text-ink">Travel Tips</h2>
      <div className="rounded-3xl bg-[#F0EBE1] p-8">
        <ul className="flex flex-col gap-4">
          {tips.map((tip, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle size={24} weight="fill" className="text-coral shrink-0 mt-0.5" />
              <p className="text-sm font-semibold text-ink leading-relaxed">{tip}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
