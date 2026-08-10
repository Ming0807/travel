import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { PublicButton } from "@/components/public/PublicButton";
import { PublicMediaFrame } from "@/components/public/PublicMediaFrame";
import { siteMediaImageUrl } from "@/lib/media/storage-paths";

export function AttractionDiscoveryCta({
  title,
  subtitle,
  linkText,
  linkUrl,
  image,
}: {
  title: string;
  subtitle: string;
  linkText: string;
  linkUrl: string;
  image: string;
}) {
  const imageUrl = siteMediaImageUrl(image);

  return (
    <section className="mt-14 border-y border-black/10 py-8 sm:py-10">
      <div className={imageUrl ? "grid gap-6 md:grid-cols-[minmax(0,1fr)_360px] md:items-center" : "flex flex-col gap-5 md:flex-row md:items-center md:justify-between"}>
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="mt-2 max-w-2xl text-base leading-7 text-black/65">{subtitle}</p>
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
          />
        ) : null}
      </div>
    </section>
  );
}
