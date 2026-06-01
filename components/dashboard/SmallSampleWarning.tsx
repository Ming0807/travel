import { WarningCircle } from "@phosphor-icons/react/dist/ssr";

export function SmallSampleWarning({
  count,
  threshold = 10,
  label = "responses",
}: {
  count: number;
  threshold?: number;
  label?: string;
}) {
  if (count >= threshold) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm">
      <div className="flex items-start gap-2.5">
        <WarningCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" weight="fill" />
        <div>
          <p className="font-bold text-amber-800">Small sample</p>
          <p className="mt-0.5 leading-5 text-amber-700">
            Based on {count} {label}. Patterns may change significantly as more data is collected.
            {count === 0
              ? " No data to display yet."
              : ` Interpret trends with caution.`}
          </p>
        </div>
      </div>
    </div>
  );
}
