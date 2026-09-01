"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, MapPin, Sparkle, User } from "@phosphor-icons/react";
import { StoryEditorialPlaceholder } from "@/components/stories/StoryEditorialPlaceholder";
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
  const displayImage = featured
    ? story.imageUrl || story.thumbnailUrl
    : story.thumbnailUrl || story.imageUrl;
  const href = `/stories/${story.id}`;

  const content = featured ? (
    <article
      aria-label={story.title}
      className="group relative overflow-hidden rounded-2xl border border-orange-200/90 bg-[#FFFDF9] p-5 shadow-md shadow-orange-500/5 transition-all duration-300 hover:border-coral/50 hover:shadow-xl hover:shadow-orange-500/10 sm:p-7 lg:p-8"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)] lg:items-center">
        {/* Left Column: Editorial Information */}
        <div className="flex flex-col justify-center">
          {/* Label / Status Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {label ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-orange-500 to-amber-500 px-2.5 py-0.5 text-[11px] font-black text-white shadow-xs">
                <Sparkle size={12} weight="fill" aria-hidden="true" />
                <span>{label}</span>
              </span>
            ) : null}
            {story.category ? (
              <span className="rounded-md border border-orange-200 bg-orange-50/80 px-2.5 py-0.5 text-[11px] font-bold text-coral">
                {story.category}
              </span>
            ) : null}
            {story.province ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-muted">
                <MapPin size={13} weight="fill" className="text-coral" aria-hidden="true" />
                <span>{story.province}</span>
              </span>
            ) : null}
          </div>

          {/* Title */}
          <h2 className="mt-3.5 text-2xl font-black leading-tight text-ink transition-colors group-hover:text-coral sm:text-3xl lg:text-4xl text-balance">
            <Link
              href={href}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
            >
              {story.title}
            </Link>
          </h2>

          {/* Excerpt */}
          {story.excerpt ? (
            <p className="mt-3.5 text-sm leading-relaxed text-muted sm:text-base text-pretty line-clamp-3">
              {story.excerpt}
            </p>
          ) : null}

          {/* Meta Info Row */}
          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-orange-100/80 pt-4 text-xs font-semibold text-muted">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cream px-2.5 py-0.5 text-ink font-bold border border-ink/5">
              <User size={13} weight="bold" className="text-coral" aria-hidden="true" />
              <span>
                {story.authorType === "tourist" ? "เรื่องจากนักเดินทาง" : "กองบรรณาธิการ"}
              </span>
            </span>
            {story.date ? (
              <>
                <span aria-hidden="true" className="text-ink/20">•</span>
                <span>{story.date}</span>
              </>
            ) : null}
            {story.readingMinutes ? (
              <>
                <span aria-hidden="true" className="text-ink/20">•</span>
                <span className="inline-flex items-center gap-1">
                  <Clock size={13} weight="bold" aria-hidden="true" />
                  <span>อ่านประมาณ {story.readingMinutes} นาที</span>
                </span>
              </>
            ) : null}
          </div>

          {/* Read Action Button */}
          <div className="mt-6">
            <Link
              href={href}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 text-xs font-black text-white shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02] hover:shadow-orange-500/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral sm:text-sm"
            >
              <span>อ่านเรื่องราวฉบับเต็ม</span>
              <ArrowRight size={16} weight="bold" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Right Column: Hero Image / Placeholder Frame */}
        <div className="relative overflow-hidden rounded-xl bg-cream aspect-[16/10] shadow-xs">
          <Link
            href={href}
            tabIndex={-1}
            className="block h-full w-full focus-visible:outline-none"
          >
            {displayImage ? (
              <Image
                src={displayImage}
                alt={story.imageAlt || story.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 520px"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
            ) : (
              <StoryEditorialPlaceholder
                category={story.category}
                featured
              />
            )}
          </Link>
        </div>
      </div>
    </article>
  ) : (
    <article
      aria-label={story.title}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-orange-100/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-coral/40 hover:shadow-xl hover:shadow-orange-500/10"
    >
      {/* Photo Frame */}
      <div className="relative overflow-hidden bg-cream aspect-[16/10]">
        <Link
          href={href}
          className="block h-full w-full focus-visible:outline-none"
        >
          {displayImage ? (
            <Image
              src={displayImage}
              alt={story.imageAlt || story.title}
              fill
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 360px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <StoryEditorialPlaceholder
              category={story.category}
            />
          )}
        </Link>

        {/* Category Badge (Top Left) */}
        {story.category ? (
          <div className="pointer-events-none absolute left-3 top-3 z-10">
            <span className="inline-block rounded-md bg-white/95 px-2.5 py-0.5 text-[11px] font-black text-coral shadow-xs backdrop-blur-xs">
              {story.category}
            </span>
          </div>
        ) : null}

        {/* Author Type Badge (Top Right) */}
        <div className="pointer-events-none absolute right-3 top-3 z-10">
          <span className="inline-block rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs backdrop-blur-xs">
            {story.authorType === "tourist" ? "จากนักเดินทาง" : "กองบรรณาธิการ"}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Recommendation Reason (if provided) */}
        {reason ? (
          <p className="mb-2 text-xs font-bold leading-relaxed text-coral">
            เหตุผลที่แนะนำ: {reason}
          </p>
        ) : null}

        {/* Location / Meta */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-muted">
          <MapPin size={13} weight="fill" className="shrink-0 text-coral" aria-hidden="true" />
          <span>{story.province || "ยะลา"}</span>
          {story.date ? (
            <>
              <span aria-hidden="true" className="text-ink/20">•</span>
              <span>{story.date}</span>
            </>
          ) : null}
        </div>

        {/* Title */}
        <h2 className="mt-2 text-base font-black leading-snug text-ink transition-colors group-hover:text-coral">
          <Link
            href={href}
            className="line-clamp-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
          >
            {story.title}
          </Link>
        </h2>

        {/* Excerpt */}
        {story.excerpt ? (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">
            {story.excerpt}
          </p>
        ) : null}

        {/* Footer Row */}
        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between border-t border-orange-100/70 pt-3 text-xs">
            {story.readingMinutes ? (
              <span className="inline-flex items-center gap-1 font-semibold text-muted">
                <Clock size={13} weight="bold" aria-hidden="true" />
                <span>{story.readingMinutes} นาที</span>
              </span>
            ) : (
              <span />
            )}

            <Link
              href={href}
              aria-label={`อ่านเรื่องราว ${story.title}`}
              className="inline-flex items-center gap-1 font-bold text-coral hover:underline"
            >
              <span>อ่านต่อ</span>
              <ArrowRight size={13} weight="bold" aria-hidden="true" />
            </Link>
          </div>
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
