import Link from "next/link";

export interface PublicPaginationProps {
  page: number;
  pageCount: number;
  createHref: (page: number) => string;
  label?: string;
  previousLabel?: string;
  nextLabel?: string;
  pageLabel?: (page: number) => string;
}

const paginationLinkClasses =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--public-radius-control)] border border-black/15 px-3 text-sm font-semibold text-[var(--public-ink)] hover:border-[var(--public-teal)] hover:text-[var(--public-teal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)]";

export function PublicPagination({
  page,
  pageCount,
  createHref,
  label = "Pagination",
  previousLabel = "Previous page",
  nextLabel = "Next page",
  pageLabel = (pageNumber) => `Page ${pageNumber}`,
}: PublicPaginationProps) {
  if (pageCount <= 1) return null;

  const currentPage = Math.min(Math.max(page, 1), pageCount);

  return (
    <nav aria-label={label} className="mt-8">
      <ol className="flex flex-wrap items-center justify-center gap-2">
        <li>
          {currentPage > 1 ? (
            <Link href={createHref(currentPage - 1)} className={paginationLinkClasses} aria-label={previousLabel}>
              {previousLabel}
            </Link>
          ) : (
            <span className={`${paginationLinkClasses} cursor-not-allowed opacity-50`} aria-disabled="true" aria-label={previousLabel}>
              {previousLabel}
            </span>
          )}
        </li>
        {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => {
          const current = pageNumber === currentPage;
          return (
            <li key={pageNumber}>
              <Link
                href={createHref(pageNumber)}
                className={current ? `${paginationLinkClasses} border-[var(--public-teal)] bg-[var(--public-teal)] text-white` : paginationLinkClasses}
                aria-current={current ? "page" : undefined}
                aria-label={pageLabel(pageNumber)}
              >
                {pageNumber}
              </Link>
            </li>
          );
        })}
        <li>
          {currentPage < pageCount ? (
            <Link href={createHref(currentPage + 1)} className={paginationLinkClasses} aria-label={nextLabel}>
              {nextLabel}
            </Link>
          ) : (
            <span className={`${paginationLinkClasses} cursor-not-allowed opacity-50`} aria-disabled="true" aria-label={nextLabel}>
              {nextLabel}
            </span>
          )}
        </li>
      </ol>
    </nav>
  );
}
