export function PublicResultSummary({ count, noun, className }: { count: number; noun: string; className?: string }) {
  const safeCount = Number.isFinite(count) ? Math.max(0, Math.trunc(count)) : 0;

  return (
    <p aria-live="polite" className={`text-sm font-semibold text-black/65 ${className ?? ""}`.trim()}>
      พบ {safeCount.toLocaleString("th-TH")} {noun}
    </p>
  );
}
