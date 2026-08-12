import { MapPin } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";

type AccommodationDirectoryHeroProps = {
  title: string;
  description: string;
  scope: string;
  imageUrl?: string | null;
  imageAlt?: string;
  imageContext?: string;
};

export function AccommodationDirectoryHero({
  title,
  description,
  scope,
  imageUrl,
  imageAlt = "บรรยากาศที่พักในจังหวัดยะลา",
  imageContext,
}: AccommodationDirectoryHeroProps) {
  return (
    <header className="relative min-h-[21rem] overflow-hidden bg-[#20231f] text-white sm:min-h-[25rem]">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(max-width: 1279px) 100vw, 1280px"
          priority
          className="object-cover"
        />
      ) : null}
      <div aria-hidden="true" className="absolute inset-0 bg-black/55" />

      {imageUrl && imageContext ? (
        <p className="absolute right-4 top-4 z-10 border border-white/30 bg-black/55 px-3 py-2 text-xs font-semibold text-white sm:right-6 sm:top-6">
          {imageContext}
        </p>
      ) : null}

      <div className="relative flex min-h-[21rem] max-w-2xl flex-col justify-end p-6 sm:min-h-[25rem] sm:p-10 lg:p-12">
        <nav aria-label="เส้นทางนำทาง" className="text-sm font-semibold text-white/80">
          <Link href="/" className="hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
            หน้าแรก
          </Link>
          <span aria-hidden="true" className="mx-2">/</span>
          <span aria-current="page">ที่พัก</span>
        </nav>
        <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-xl text-base font-medium leading-8 text-white/90 sm:text-lg">{description}</p>
        <p className="mt-5 inline-flex w-fit items-center gap-2 border-l-2 border-[var(--public-coral)] pl-3 text-sm font-semibold text-white/85">
          <MapPin aria-hidden="true" size={17} weight="fill" />
          {scope}
        </p>
      </div>
    </header>
  );
}
