import Link from "next/link";
import { CaretRight, Star, Clock } from "@phosphor-icons/react/dist/ssr";

type AttractionHeaderProps = {
  name: string;
  province: string;
  rating: number;
  reviewsCount: string;
  bestTimeToVisit: string;
};

export function AttractionHeader({
  name,
  province,
  rating,
  reviewsCount,
  bestTimeToVisit,
}: AttractionHeaderProps) {
  return (
    <div className="mb-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-[13px] font-medium text-muted">
        <Link href="/" className="hover:text-ink transition-colors">Home</Link>
        <CaretRight size={12} weight="bold" />
        <Link href="/attractions" className="hover:text-ink transition-colors">Destinations</Link>
        <CaretRight size={12} weight="bold" />
        <span className="text-ink">{province}</span>
        <CaretRight size={12} weight="bold" />
        <span className="text-ink">{name}</span>
      </nav>

      {/* Province Label */}
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-coral flex items-center gap-2">
        <MapPinIcon /> {province}
      </p>

      {/* Title */}
      <h1 className="mb-4 text-4xl font-bold tracking-tight text-ink md:text-5xl">{name}</h1>

      {/* Meta Info */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Star size={18} weight="fill" className="text-gold" />
          {rating} <span className="text-muted font-normal">({reviewsCount} reviews)</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted">
          <Clock size={18} weight="regular" />
          Best time to visit: {bestTimeToVisit}
        </div>
      </div>
    </div>
  );
}

function MapPinIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.5 6.5C13.5 11.5 8 15.5 8 15.5C8 15.5 2.5 11.5 2.5 6.5C2.5 4.88544 3.10915 3.42861 4.19525 2.37895C5.23668 1.3732 6.56847 0.833333 8 0.833333C9.43153 0.833333 10.7633 1.3732 11.8047 2.37895C12.8908 3.42861 13.5 4.88544 13.5 6.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 8.5C9.10457 8.5 10 7.60457 10 6.5C10 5.39543 9.10457 4.5 8 4.5C6.89543 4.5 6 5.39543 6 6.5C6 7.60457 6.89543 8.5 8 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
