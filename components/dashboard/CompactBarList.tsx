type CompactBarItem = { key: string; label: string; value: number; displayValue: string; color: string };

export function CompactBarList({ items, maximum, onSelect }: {
  items: CompactBarItem[];
  maximum?: number;
  onSelect?: (key: string) => void;
}) {
  const scale = maximum ?? Math.max(0, ...items.map((item) => item.value));
  return <ul className="space-y-4 sm:hidden" aria-label="ข้อมูลกราฟสำหรับจอเล็ก">
    {items.map((item) => {
      const content = <>
        <span className="mb-2 flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <span className="min-w-0 flex-1 basis-40 break-words text-sm font-semibold leading-6 text-slate-700">{item.label}</span>
          <strong className="shrink-0 text-sm tabular-nums text-slate-950">{item.displayValue}</strong>
        </span>
        <span aria-hidden="true" className="block h-2.5 overflow-hidden rounded-sm bg-slate-100">
          <span className="block h-full rounded-sm" style={{ width: `${scale > 0 ? Math.max(0, Math.min(100, item.value / scale * 100)) : 0}%`, backgroundColor: item.color }} />
        </span>
      </>;
      return <li key={item.key}>{onSelect
        ? <button className="block min-h-11 w-full rounded-sm text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B94727]" type="button" aria-label={`เลือกดู ${item.label}`} onClick={() => onSelect(item.key)}>{content}</button>
        : <div>{content}</div>}</li>;
    })}
  </ul>;
}
