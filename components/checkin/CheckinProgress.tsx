import { CheckCircle } from "@phosphor-icons/react/dist/ssr";

const steps = [
  "ข้อมูลสั้น ๆ",
  "รูป/ใบประกาศ",
  "รับรางวัล",
  "แบบสำรวจ (ไม่บังคับ)",
] as const;

type CheckinProgressProps = {
  currentStep: 0 | 1 | 2 | 3;
};

export function CheckinProgress({ currentStep }: CheckinProgressProps) {
  return (
    <nav aria-label="ขั้นตอนการรับใบประกาศ" className="border-y border-slate-200 py-4">
      <ol className="grid grid-cols-4 gap-1.5">
        {steps.map((label, index) => {
          const isCurrent = index === currentStep;
          const isComplete = index < currentStep;

          return (
            <li
              key={label}
              aria-current={isCurrent ? "step" : undefined}
              className="min-w-0 text-center"
            >
              <span
                className={`mx-auto flex size-7 items-center justify-center rounded-full border text-xs font-black ${
                  isCurrent
                    ? "border-coral bg-coral text-white"
                    : isComplete
                      ? "border-teal bg-teal text-white"
                      : "border-slate-300 bg-white text-slate-500"
                }`}
              >
                {isComplete ? (
                  <CheckCircle aria-hidden="true" size={16} weight="fill" />
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={`mt-2 block text-xs font-bold leading-4 ${
                  isCurrent ? "text-ink" : "text-slate-500"
                }`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
