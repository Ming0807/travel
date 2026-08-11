import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export interface PublicDirectoryBreadcrumb {
  label: string;
  href?: string;
}

export interface PublicDirectoryIntroProps {
  breadcrumbs: PublicDirectoryBreadcrumb[];
  title: string;
  description: string;
  scope?: string;
}

export function PublicDirectoryIntro({ breadcrumbs, title, description, scope }: PublicDirectoryIntroProps) {
  return (
    <header className="max-w-3xl">
      <nav aria-label="เส้นทางนำทาง">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-black/60">
          {breadcrumbs.map((breadcrumb, index) => {
            const isCurrent = index === breadcrumbs.length - 1;

            return (
              <li key={`${breadcrumb.label}-${index}`} className="flex items-center gap-1">
                {index > 0 ? <CaretRight aria-hidden="true" size={13} /> : null}
                {breadcrumb.href && !isCurrent ? (
                  <Link className="rounded-sm hover:text-[var(--public-teal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)]" href={breadcrumb.href}>
                    {breadcrumb.label}
                  </Link>
                ) : (
                  <span aria-current={isCurrent ? "page" : undefined}>{breadcrumb.label}</span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <h1 className="mt-4 text-3xl font-bold leading-tight text-[var(--public-ink)] sm:text-4xl">{title}</h1>
      <p className="mt-3 text-base leading-7 text-black/65 sm:text-lg">{description}</p>
      {scope ? (
        <p className="mt-3 inline-flex min-h-8 items-center border-l-2 border-[var(--public-coral)] pl-3 text-sm font-medium text-black/65">
          {scope}
        </p>
      ) : null}
    </header>
  );
}
