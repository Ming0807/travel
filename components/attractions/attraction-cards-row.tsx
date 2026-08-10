import Image from "next/image";
import Link from "next/link";
import { Star } from "@phosphor-icons/react/dist/ssr";

type CardItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  recommendationReason?: string;
  rating?: number;
  reviews?: string;
  price?: string;
};

type AttractionCardsRowProps = {
  id: string;
  title: string;
  items: CardItem[];
  viewAllText?: string;
  linkPrefix: string;
};

export function AttractionCardsRow({ id, title, items, viewAllText, linkPrefix }: AttractionCardsRowProps) {
  return (
    <section id={id} className="scroll-mt-36">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-ink">{title}</h2>
        {viewAllText && (
          <Link href={linkPrefix} className="hidden min-h-10 items-center rounded-[var(--public-radius-control)] border border-slate-300 px-4 py-2 text-sm font-semibold text-[var(--public-ink)] transition-colors hover:border-[var(--public-teal)] hover:text-[var(--public-teal)] sm:inline-flex">
            {viewAllText}
          </Link>
        )}
      </div>

      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
        {items.map((item) => (
          <Link href={`${linkPrefix}/${item.id}`} key={item.id} className="min-w-[240px] max-w-[240px] flex-shrink-0 group cursor-pointer block">
            <div className="relative mb-4 aspect-[4/3] w-full overflow-hidden rounded-[var(--public-radius-panel)] bg-slate-100">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  sizes="240px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center px-4 text-center text-xs font-semibold text-muted">
                  ยังไม่มีรูปภาพ
                </div>
              )}
            </div>
            {item.recommendationReason ? (
              <p className="mb-2 text-xs font-bold leading-5 text-[#075E54]">
                เหตุผลที่แนะนำ: {item.recommendationReason}
              </p>
            ) : null}
            <h3 className="text-base font-bold text-ink transition-colors group-hover:text-[var(--public-teal)]">{item.title}</h3>
            <p className="mt-1 text-sm text-muted line-clamp-2">{item.description}</p>
            
            {(item.rating || item.price) && (
              <div className="mt-3 flex flex-col gap-1">
                {item.rating && (
                  <div className="flex items-center gap-1 text-xs font-semibold text-ink">
                    <Star size={14} weight="fill" className="text-gold" />
                    {item.rating} <span className="text-muted font-normal">({item.reviews} รีวิว)</span>
                  </div>
                )}
                {item.price && (
                  <div className="text-xs font-semibold text-ink">
                    เริ่มต้น ฿{item.price} / คืน
                  </div>
                )}
              </div>
            )}
          </Link>
        ))}
      </div>
      
      {viewAllText && (
        <Link href={linkPrefix} className="mt-4 block min-h-11 w-full rounded-[var(--public-radius-control)] border border-slate-300 py-3 text-center text-sm font-semibold text-[var(--public-ink)] transition-colors hover:border-[var(--public-teal)] hover:text-[var(--public-teal)] sm:hidden">
          {viewAllText}
        </Link>
      )}
    </section>
  );
}
