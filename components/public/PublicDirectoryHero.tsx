import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";

import "./public-directory-hero.css";

type PublicDirectoryHeroProps = {
  id: string;
  breadcrumb: string;
  eyebrow: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  imageAlt?: string;
  scope?: string;
  actions?: ReactNode;
};

export function PublicDirectoryHero({
  id,
  breadcrumb,
  eyebrow,
  title,
  description,
  imageUrl,
  imageAlt = "",
  scope,
  actions,
}: PublicDirectoryHeroProps) {
  const highlight = "ในจังหวัดยะลา";
  const highlightAt = title.indexOf(highlight);

  return (
    <header className={`public-directory-hero${actions ? " public-directory-hero--with-actions" : ""}`} aria-labelledby={id}>
      {imageUrl ? (
        <div className="public-directory-hero__image">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            priority
            sizes="100vw"
            unoptimized={imageUrl.startsWith("/api/media/image")}
          />
        </div>
      ) : null}
      <div className="public-directory-hero__veil" aria-hidden="true" />
      <div className="public-directory-hero__inner">
        <nav aria-label="เส้นทางนำทาง" className="public-directory-hero__breadcrumb">
          <Link href="/">หน้าแรก</Link>
          <CaretRight size={14} weight="bold" aria-hidden="true" />
          <span aria-current="page">{breadcrumb}</span>
        </nav>
        <div className="public-directory-hero__copy">
          <p className="public-directory-hero__eyebrow">{eyebrow}</p>
          <h1 id={id}>
            {highlightAt >= 0 ? (
              <>
                {title.slice(0, highlightAt).trim()}
                <em>{title.slice(highlightAt).trim()}</em>
              </>
            ) : title}
          </h1>
          <p className="public-directory-hero__description">{description}</p>
          {scope ? <p className="public-directory-hero__scope">{scope}</p> : null}
          {actions ? <div className="public-directory-hero__actions">{actions}</div> : null}
        </div>
      </div>
    </header>
  );
}
