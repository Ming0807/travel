import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
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

const paginationBaseClasses =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl px-3.5 text-xs font-black transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral";

const paginationInactiveClasses =
  `${paginationBaseClasses} border border-ink/15 bg-white text-ink hover:border-coral hover:text-coral hover:bg-orange-50/60`;

const paginationActiveClasses =
  `${paginationBaseClasses} border border-transparent bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs`;

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
    <nav aria-label={label} className="mt-10">
      <ol className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        <li>
          {currentPage > 1 ? (
            <Link
              href={createHref(currentPage - 1)}
              className={paginationInactiveClasses}
              aria-label={previousLabel}
            >
              <CaretLeft size={16} weight="bold" aria-hidden="true" />
              <span className="sr-only">{previousLabel}</span>
            </Link>
          ) : (
            <span
              className={`${paginationInactiveClasses} cursor-not-allowed opacity-40`}
              aria-disabled="true"
              aria-label={previousLabel}
            >
              <CaretLeft size={16} weight="bold" aria-hidden="true" />
              <span className="sr-only" aria-disabled="true">{previousLabel}</span>
            </span>
          )}
        </li>

        {pageItems.map((pageItem, index) => {
          if (pageItem === "ellipsis") {
            return (
              <li key={`ellipsis-${index}`}>
                <span
                  aria-hidden="true"
                  className="inline-flex min-h-11 min-w-8 items-center justify-center text-xs font-bold text-muted"
                >
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
                className={current ? paginationActiveClasses : paginationInactiveClasses}
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
            <Link
              href={createHref(currentPage + 1)}
              className={paginationInactiveClasses}
              aria-label={nextLabel}
            >
              <CaretRight size={16} weight="bold" aria-hidden="true" />
              <span className="sr-only">{nextLabel}</span>
            </Link>
          ) : (
            <span
              className={`${paginationInactiveClasses} cursor-not-allowed opacity-40`}
              aria-disabled="true"
              aria-label={nextLabel}
            >
              <CaretRight size={16} weight="bold" aria-hidden="true" />
              <span className="sr-only" aria-disabled="true">{nextLabel}</span>
            </span>
          )}
        </li>
      </ol>
    </nav>
  );
}
