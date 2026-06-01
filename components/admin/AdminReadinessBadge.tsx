import { CheckCircle, WarningCircle } from "@phosphor-icons/react/dist/ssr";

type AdminReadinessBadgeProps = {
  label: string;
  complete: boolean;
  help?: string;
  size?: "sm" | "md";
};

export function AdminReadinessBadge({ label, complete, help, size = "sm" }: AdminReadinessBadgeProps) {
  const dotSize = size === "sm" ? 14 : 18;
  const textClass = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className={`flex gap-2 ${textClass} leading-5`}>
      {complete ? (
        <CheckCircle className="mt-0.5 shrink-0 text-[#0A6B62]" size={dotSize} weight="fill" />
      ) : (
        <WarningCircle className="mt-0.5 shrink-0 text-amber-600" size={dotSize} weight="fill" />
      )}
      <span>
        <span
          className={
            complete ? "font-bold text-slate-800" : "font-bold text-amber-900"
          }
        >
          {label}
        </span>
        {help ? <span className="mt-0.5 block text-xs text-slate-500">{help}</span> : null}
      </span>
    </div>
  );
}
