import { SquaresFour, Mountains, Mosque, TreeStructure, Compass } from "@phosphor-icons/react/dist/ssr";

export function HomepageProvinceFilter() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-6">
      <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-2">
        <button className="active-chip shrink-0 rounded-full bg-white px-5 py-3 text-sm font-bold text-ink shadow-sm">
          <SquaresFour className="mr-1 inline-block" size={16} /> ทั้งหมด
        </button>
        <button className="shrink-0 rounded-full bg-white px-5 py-3 text-sm font-bold text-ink shadow-sm">
          <Mountains className="mr-1 inline-block text-leaf" size={16} /> ยะลา
        </button>
        <button className="shrink-0 rounded-full bg-white px-5 py-3 text-sm font-bold text-ink shadow-sm">
          <Mosque className="mr-1 inline-block text-coral" size={16} /> ปัตตานี
        </button>
        <button className="shrink-0 rounded-full bg-white px-5 py-3 text-sm font-bold text-ink shadow-sm">
          <TreeStructure className="mr-1 inline-block text-blue-600" size={16} /> นราธิวาส
        </button>
        <button className="shrink-0 rounded-full bg-white/70 px-5 py-3 text-sm font-bold text-muted shadow-sm">
          <Compass className="mr-1 inline-block" size={16} /> เส้นทางแนะนำ
        </button>
      </div>
    </section>
  );
}
