"use client";

import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useState } from "react";
import { PublicButton } from "@/components/public/PublicButton";
import { PublicMediaFrame } from "@/components/public/PublicMediaFrame";
import { siteMediaImageUrl } from "@/lib/media/storage-paths";

export function PublicCtaBand({
  title,
  description,
  linkText,
  linkUrl,
  image,
}: {
  title: string;
  description: string;
  linkText: string;
  linkUrl: string;
  image?: string | null;
}) {
  const resolvedImageUrl = siteMediaImageUrl(image);
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const [loadedImageUrl, setLoadedImageUrl] = useState<string | null>(null);
  const imageUrl = failedImageUrl === resolvedImageUrl ? null : resolvedImageUrl;

  useEffect(() => {
    if (!resolvedImageUrl || failedImageUrl === resolvedImageUrl || loadedImageUrl === resolvedImageUrl) return;

    const timeout = window.setTimeout(() => setFailedImageUrl(resolvedImageUrl), 4_000);
    return () => window.clearTimeout(timeout);
  }, [failedImageUrl, loadedImageUrl, resolvedImageUrl]);

  return (
    <section className="mt-14 border-y border-black/10 py-8 sm:py-10">
      <div className={imageUrl
        ? "grid gap-6 md:grid-cols-[minmax(0,1fr)_360px] md:items-center"
        : "flex flex-col gap-5 md:flex-row md:items-center md:justify-between"}
      >
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="mt-2 max-w-2xl text-base leading-7 text-black/65">{description}</p>
          <PublicButton href={linkUrl} className="mt-5 gap-2">
            {linkText} <ArrowRight size={17} weight="bold" aria-hidden="true" />
          </PublicButton>
        </div>
        {imageUrl ? (
          <PublicMediaFrame
            src={imageUrl}
            alt={title}
            aspect="landscape"
            sizes="(max-width: 767px) calc(100vw - 2rem), 360px"
            fallbackLabel=""
            onAvailable={() => setLoadedImageUrl(imageUrl)}
            onUnavailable={() => setFailedImageUrl(imageUrl)}
          />
        ) : null}
      </div>
    </section>
  );
}
