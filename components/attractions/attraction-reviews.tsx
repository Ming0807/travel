import { Star } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";

type AttractionReviewsProps = {
  rating: number;
  reviewsCount: string;
};

export function AttractionReviews({ rating, reviewsCount }: AttractionReviewsProps) {
  return (
    <div id="reviews" className="scroll-mt-24 pt-8">
      <h2 className="mb-6 text-2xl font-bold text-ink">Reviews Summary</h2>

      <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-16">
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-ink">{rating}</span>
            <span className="text-xl font-bold text-muted">/ 5</span>
          </div>
          <div className="flex text-gold">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={20} weight={star <= Math.round(rating) ? "fill" : "regular"} />
            ))}
          </div>
          <p className="text-sm font-semibold text-muted">({reviewsCount} reviews)</p>
        </div>

        <div className="flex flex-1 flex-col gap-2">
          {[
            { stars: 5, pct: 70 },
            { stars: 4, pct: 15 },
            { stars: 3, pct: 10 },
            { stars: 2, pct: 4 },
            { stars: 1, pct: 1 }
          ].map((row) => (
            <div key={row.stars} className="flex items-center gap-4 text-sm font-bold text-ink">
              <div className="w-4">{row.stars}</div>
              <Star size={12} weight="fill" className="text-ink" />
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#F0EBE1]">
                <div className="h-full rounded-full bg-coral" style={{ width: `${row.pct}%` }} />
              </div>
              <div className="w-8 text-right text-muted">{row.pct}%</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-ink/5 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 overflow-hidden rounded-full bg-ink/10">
              <Image
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80"
                alt="Reviewer"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div>
              <p className="text-sm font-bold text-ink">Sophie M.</p>
              <p className="text-xs font-semibold text-muted">May 10, 2024</p>
            </div>
          </div>
          <div className="flex text-gold">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={16} weight="fill" />
            ))}
          </div>
        </div>
        <p className="text-sm font-medium leading-relaxed text-ink">
          &ldquo;Aiyerweng is magical in the morning. The mist, the glass skywalk, and the view made the early trip worth it.&rdquo;
        </p>
      </div>

      <button className="mt-6 w-full rounded-full border border-ink/10 py-3 text-sm font-bold text-ink transition-colors hover:bg-cream sm:w-auto sm:px-8">
        Read more reviews
      </button>
    </div>
  );
}
