import Image from "next/image";
import Link from "next/link";
import { Star } from "@phosphor-icons/react/dist/ssr";

type CardItem = {
  id: string;
  href?: string;
  title: string;
  description: string;
  imageUrl: string | null;
  imageAlt?: string;
  recommendationReason?: string;
  recommendationSource?: "curated" | "automatic";
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

export function AttractionCardsRow({
  id,
  title,
  items,
  viewAllText,
  linkPrefix,
}: AttractionCardsRowProps) {
  const headingId = `${id}-heading`;

  return (
    <section id={id} className="scroll-mt-36">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 id={headingId} className="text-2xl font-bold text-ink">
          {title}
        </h2>
        {viewAllText ? (
          <Link
            href={linkPrefix}
            className="hidden min-h-10 shrink-0 items-center rounded-[var(--public-radius-control)] border border-slate-300 px-4 py-2 text-sm font-semibold text-[var(--public-ink)] transition-colors hover:border-[var(--public-teal)] hover:text-[var(--public-teal)] sm:inline-flex"
          >
            {viewAllText}
          </Link>
        ) : null}
      </div>

      <ul
        aria-labelledby={headingId}
        className="-mx-4 grid auto-cols-[minmax(16rem,82vw)] grid-flow-col gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:auto-cols-[minmax(17rem,46vw)] sm:px-0 lg:grid-flow-row lg:grid-cols-4 lg:overflow-visible"
      >
        {items.map((item) => (
          <li key={item.id} className="min-w-0">
            <Link
              href={item.href ?? `${linkPrefix}/${item.id}`}
              className="group block h-full min-w-0"
            >
              <div className="relative mb-4 aspect-[4/3] w-full overflow-hidden rounded-[var(--public-radius-panel)] bg-slate-100">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.imageAlt || item.title}
                    fill
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    sizes="(max-width: 639px) 82vw, (max-width: 1023px) 46vw, 25vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-4 text-center text-xs font-semibold text-muted">
                    ยังไม่มีรูปภาพ
                  </div>
                )}
              </div>

              {item.recommendationSource === "automatic" && item.recommendationReason ? (
                <p className="mb-2 text-xs font-bold leading-5 text-[#075E54]">
                  {item.recommendationReason}
                </p>
              ) : null}

              <h3 className="text-base font-bold text-ink transition-colors group-hover:text-[var(--public-teal)]">
                {item.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{item.description}</p>

              {item.rating !== undefined || item.price ? (
                <div className="mt-3 flex flex-col gap-1">
                  {item.rating !== undefined ? (
                    <div className="flex items-center gap-1 text-xs font-semibold text-ink">
                      <Star size={14} weight="fill" className="text-gold" />
                      {item.rating}{" "}
                      <span className="font-normal text-muted">({item.reviews} รีวิว)</span>
                    </div>
                  ) : null}
                  {item.price ? (
                    <div className="text-xs font-semibold text-ink">
                      เริ่มต้น ฿{item.price} / คืน
                    </div>
                  ) : null}
                </div>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>

      {viewAllText ? (
        <Link
          href={linkPrefix}
          className="mt-4 block min-h-11 w-full rounded-[var(--public-radius-control)] border border-slate-300 py-3 text-center text-sm font-semibold text-[var(--public-ink)] transition-colors hover:border-[var(--public-teal)] hover:text-[var(--public-teal)] sm:hidden"
        >
          {viewAllText}
        </Link>
      ) : null}
    </section>
  );
}
