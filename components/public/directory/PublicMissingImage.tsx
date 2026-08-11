import { ImageSquare } from "@phosphor-icons/react/dist/ssr";

export function PublicMissingImage({ label, className }: { label: string; className?: string }) {
  const accessibleLabel = `ยังไม่มีภาพของ${label}`;

  return (
    <div
      role="img"
      aria-label={accessibleLabel}
      className={`flex aspect-[4/3] w-full flex-col items-center justify-center border border-black/10 bg-[#f3f6f5] px-5 text-center text-black/55 ${className ?? ""}`.trim()}
    >
      <span className="grid size-11 place-items-center rounded-full bg-white text-[var(--public-teal)] shadow-sm" aria-hidden="true">
        <ImageSquare size={22} />
      </span>
      <span className="mt-3 text-sm font-medium">{accessibleLabel}</span>
    </div>
  );
}
