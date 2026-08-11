import Image from "next/image";
import Link from "next/link";
import { Clock, FileText } from "@phosphor-icons/react/dist/ssr";
import {
  StoryCardEngagement,
  type StoryCardTracking,
} from "@/components/stories/StoryEngagementTracker";
import type { PublicStoryCard as PublicStoryCardData } from "@/lib/repositories/public-content.repository";

export function PublicStoryCard({
  story,
  featured = false,
  label,
  reason,
  tracking,
}: {
  story: PublicStoryCardData;
  featured?: boolean;
  label?: string;
  reason?: string;
  tracking?: StoryCardTracking;
}) {
  const content = (
    <article
      className={
        featured
          ? "grid gap-6 border-b border-black/10 pb-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)] lg:items-center"
          : "h-full border-b border-black/10 pb-8"
      }
    >
      <Link
        href={`/stories/${story.id}`}
        className={`group relative block overflow-hidden rounded-[var(--public-radius-panel)] bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-coral)] ${
          featured ? "aspect-[16/10] lg:order-2" : "aspect-[4/3]"
        }`}
      >
        {story.thumbnailUrl || story.imageUrl ? (
          <Image
            src={story.thumbnailUrl || story.imageUrl!}
            alt={story.imageAlt}
            fill
            loading={featured ? "eager" : "lazy"}
            sizes={
              featured
                ? "(max-width: 1024px) 100vw, 520px"
                : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 360px"
            }
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-black/35">
            <FileText size={36} aria-hidden="true" />
          </span>
        )}
      </Link>
      <div className={featured ? "lg:order-1" : "pt-5"}>
        {label ? (
          <p className="mb-3 text-xs font-black text-[var(--public-coral)]">
            {label}
          </p>
        ) : null}
        {reason ? (
          <p className="mb-3 text-xs font-black leading-5 text-[var(--public-teal)]">
            เหตุผลที่แนะนำ: {reason}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-bold text-black/55">
          <span>{story.category}</span>
          {story.province ? (
            <>
              <span aria-hidden="true">•</span>
              <span>{story.province}</span>
            </>
          ) : null}
        </div>
        <h2
          className={`mt-3 font-black leading-tight text-[var(--public-ink)] text-balance ${
            featured ? "text-3xl sm:text-4xl" : "text-xl"
          }`}
        >
          <Link
            href={`/stories/${story.id}`}
            className="transition-colors hover:text-[var(--public-coral)] focus-visible:outline-none focus-visible:underline"
          >
            {story.title}
          </Link>
        </h2>
        {story.excerpt ? (
          <p
            className={`mt-3 text-black/65 text-pretty ${
              featured
                ? "max-w-[62ch] text-base leading-7"
                : "line-clamp-3 text-sm leading-6"
            }`}
          >
            {story.excerpt}
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold text-black/55">
          <span>
            {story.authorType === "tourist" ? "เรื่องจากนักเดินทาง" : "กองบรรณาธิการ"}
          </span>
          <span aria-hidden="true">•</span>
          <span>{story.date}</span>
          <span className="inline-flex items-center gap-1">
            <Clock size={14} weight="bold" aria-hidden="true" />
            อ่านประมาณ {story.readingMinutes} นาที
          </span>
        </div>
      </div>
    </article>
  );

  if (!tracking) return content;

  const storyId = story.storyId;
  if (!Number.isInteger(storyId) || storyId <= 0) return content;

  return (
    <StoryCardEngagement
      storyId={storyId}
      locale={story.primaryLanguage === "en" ? "en" : "th"}
      tracking={tracking}
    >
      {content}
    </StoryCardEngagement>
  );
}
