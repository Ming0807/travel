import Link from "next/link";

type AttractionCTAProps = {
  name: string;
};

export function AttractionCTA({ name }: AttractionCTAProps) {
  return (
    <div className="relative mt-16 overflow-hidden rounded-2xl bg-ink px-6 py-16 text-center text-white shadow-xl sm:px-12 sm:py-20 lg:mt-24">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#173F37_0%,#2F6559_52%,#E18868_100%)]"></div>
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(90deg,rgba(255,255,255,.28)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.28)_1px,transparent_1px)] [background-size:44px_44px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-transparent"></div>
      </div>
      
      <div className="relative z-10 mx-auto max-w-2xl">
        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          พร้อมจะไปเที่ยว {name} หรือยัง?
        </h2>
        <p className="mb-8 text-base font-medium text-white/80 sm:text-lg">
          วางแผนการเดินทางของคุณวันนี้ และสัมผัสความงามของชายแดนใต้
        </p>
        <Link href="/routes" className="inline-flex rounded-full bg-white px-8 py-3.5 text-sm font-bold text-ink shadow-lg transition-colors hover:bg-cream">
          วางแผนการเดินทาง
        </Link>
      </div>
    </div>
  );
}
