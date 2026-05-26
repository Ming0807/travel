import Image from "next/image";
import { Star } from "@phosphor-icons/react/dist/ssr";

type CardItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  rating?: number;
  reviews?: string;
  price?: string;
};

type AttractionCardsRowProps = {
  id: string;
  title: string;
  items: CardItem[];
  viewAllText?: string;
};

export function AttractionCardsRow({ id, title, items, viewAllText }: AttractionCardsRowProps) {
  return (
    <div id={id} className="scroll-mt-24 pt-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-ink">{title}</h2>
        {viewAllText && (
          <button className="hidden rounded-full border border-ink/10 px-4 py-2 text-xs font-bold text-ink hover:bg-cream transition-colors sm:block">
            {viewAllText}
          </button>
        )}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {items.map((item) => (
          <div key={item.id} className="min-w-[240px] max-w-[240px] flex-shrink-0 group cursor-pointer">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl mb-4 bg-ink/5">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center px-4 text-center text-xs font-semibold text-muted">
                  Image not added
                </div>
              )}
            </div>
            <h3 className="text-base font-bold text-ink group-hover:text-coral transition-colors">{item.title}</h3>
            <p className="mt-1 text-sm text-muted line-clamp-2">{item.description}</p>
            
            {(item.rating || item.price) && (
              <div className="mt-3 flex flex-col gap-1">
                {item.rating && (
                  <div className="flex items-center gap-1 text-xs font-semibold text-ink">
                    <Star size={14} weight="fill" className="text-gold" />
                    {item.rating} <span className="text-muted font-normal">({item.reviews} reviews)</span>
                  </div>
                )}
                {item.price && (
                  <div className="text-xs font-semibold text-ink">
                    From ฿{item.price} / night
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {viewAllText && (
        <button className="mt-4 w-full rounded-full border border-ink/10 py-3 text-sm font-bold text-ink hover:bg-cream transition-colors sm:hidden">
          {viewAllText}
        </button>
      )}
    </div>
  );
}
