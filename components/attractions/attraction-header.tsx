import Link from "next/link";
import { CaretRight, MapPin, Star, Tag } from "@phosphor-icons/react/dist/ssr";

type AttractionHeaderProps = {
  name: string;
  province: string;
  attractionType: string;
  reviewState: "available" | "empty" | "unavailable";
  rating: number | null;
  reviewCount: number | null;
};

export function AttractionHeader({
  name,
  province,
  attractionType,
  reviewState,
  rating,
  reviewCount,
}: AttractionHeaderProps) {
  return (
    <header className="mb-6 sm:mb-8">
      <nav aria-label="เส้นทางนำทาง" className="mb-5 flex min-w-0 items-center gap-1.5 text-sm text-slate-600">
        <Link href="/" className="shrink-0 transition-colors hover:text-[var(--public-teal)]">
          หน้าแรก
        </Link>
        <CaretRight aria-hidden="true" size={13} />
        <Link href="/attractions" className="shrink-0 transition-colors hover:text-[var(--public-teal)]">
          สถานที่
        </Link>
        <CaretRight aria-hidden="true" size={13} />
        <span aria-current="page" className="truncate font-medium text-[var(--public-ink)]">{name}</span>
      </nav>

      <div className="flex flex-wrap gap-2 text-sm font-semibold">
        <span className="inline-flex min-h-8 items-center gap-1.5 border border-slate-200 bg-white px-3 py-1 text-slate-700">
          <MapPin aria-hidden="true" size={16} weight="fill" className="text-[var(--public-coral)]" />
          {province}
        </span>
        {attractionType ? (
          <span className="inline-flex min-h-8 items-center gap-1.5 border border-slate-200 bg-white px-3 py-1 text-slate-700">
            <Tag aria-hidden="true" size={16} />
            {attractionType}
          </span>
        ) : null}
      </div>

      <h1 className="mt-4 max-w-4xl text-balance text-3xl font-bold leading-tight text-[var(--public-ink)] sm:text-4xl lg:text-5xl">
        {name}
      </h1>

      <div className="mt-4 flex min-h-6 items-center gap-2 text-sm">
        {reviewState === "available" && rating !== null && reviewCount !== null ? (
          <>
            <Star aria-hidden="true" size={18} weight="fill" className="text-[var(--public-gold)]" />
            <span className="font-bold text-[var(--public-ink)]">{rating.toFixed(1)}</span>
            <span className="text-slate-600">จาก {reviewCount.toLocaleString("th-TH")} รีวิว</span>
          </>
        ) : reviewState === "empty" ? (
          <span className="text-slate-600">ยังไม่มีคะแนนรีวิว</span>
        ) : (
          <span className="text-amber-800">คะแนนรีวิวยังไม่พร้อมใช้งาน</span>
        )}
      </div>
    </header>
  );
}
