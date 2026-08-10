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

type PageItem = number | "ellipsis";

function normalizePageCount(pageCount: number) {
  if (!Number.isFinite(pageCount)) return 0;
  return Math.max(0, Math.floor(pageCount));
}

function normalizePage(page: number, pageCount: number) {
  if (!Number.isFinite(page)) return 1;
  return Math.min(Math.max(1, Math.floor(page)), pageCount);
}

function getPageItems(page: number, pageCount: number): PageItem[] {
  const visiblePages = new Set<number>([1, pageCount]);
  const start = Math.max(2, page - 2);
  const end = Math.min(pageCount - 1, page + 2);

  for (let pageNumber = start; pageNumber <= end; pageNumber += 1) {
    visiblePages.add(pageNumber);
  }

  const sortedPages = [...visiblePages].sort((left, right) => left - right);
  return sortedPages.flatMap((pageNumber, index) => {
    const previousPage = sortedPages[index - 1];
    return previousPage !== undefined && pageNumber - previousPage > 1 ? ["ellipsis" as const, pageNumber] : [pageNumber];
  });
}

export function PublicPagination({
  page,
  pageCount,
  createHref,
  label = "การแบ่งหน้า",
  previousLabel = "หน้าก่อนหน้า",
  nextLabel = "หน้าถัดไป",
  pageLabel = (pageNumber) => `หน้า ${pageNumber}`,
}: PublicPaginationProps) {
  const normalizedPageCount = normalizePageCount(pageCount);
  if (normalizedPageCount <= 1) return null;

  const currentPage = normalizePage(page, normalizedPageCount);
  const pageItems = getPageItems(currentPage, normalizedPageCount);

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
        {pageItems.map((pageItem, index) => {
          if (pageItem === "ellipsis") {
            return (
              <li key={`ellipsis-${index}`}>
                <span aria-hidden="true" className="inline-flex min-h-11 min-w-11 items-center justify-center text-sm text-[var(--public-ink)]">
                  …
                </span>
              </li>
            );
          }

          const current = pageItem === currentPage;
          return (
            <li key={pageItem}>
              <Link
                href={createHref(pageItem)}
                className={current ? `${paginationLinkClasses} border-[var(--public-teal)] bg-[var(--public-teal)] text-white` : paginationLinkClasses}
                aria-current={current ? "page" : undefined}
                aria-label={pageLabel(pageItem)}
              >
                {pageItem}
              </Link>
            </li>
          );
        })}
        <li>
          {currentPage < normalizedPageCount ? (
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
