import { Spinner } from "@phosphor-icons/react/dist/ssr";

type LoadingStateProps = {
  title?: string;
  description?: string;
  variant?: "spinner" | "skeleton";
  rows?: number;
};

export function LoadingState({
  title = "กำลังโหลด...",
  description,
  variant = "spinner",
  rows = 3,
}: LoadingStateProps) {
  if (variant === "skeleton") {
    return (
      <div className="space-y-4 p-6" role="status" aria-label={title}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-[6px] border border-slate-200 bg-white p-5">
            <div className="mb-3 h-4 w-3/4 rounded-[2px] bg-slate-200" />
            <div className="mb-2 h-3 w-full rounded-[2px] bg-slate-100" />
            <div className="h-3 w-1/2 rounded-[2px] bg-slate-100" />
          </div>
        ))}
        <span className="sr-only">{title}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center" role="status" aria-label={title}>
      <div className="flex h-14 w-14 items-center justify-center rounded-[4px] bg-[#202020]">
        <Spinner className="animate-spin text-[#E77455]" size={26} weight="bold" />
      </div>
      <p className="mt-4 text-sm font-black text-[#202020]">{title}</p>
      {description ? <p className="mt-1 max-w-xs text-xs leading-5 text-slate-600">{description}</p> : null}
    </div>
  );
}
