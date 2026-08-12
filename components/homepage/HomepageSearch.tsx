"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass } from "@phosphor-icons/react";

export type HomepageSearchCategory =
  | "attractions"
  | "restaurants"
  | "accommodations"
  | "stories";

const SEARCH_DESTINATIONS: Record<
  HomepageSearchCategory,
  { pathname: string; parameter: "q" | "search" }
> = {
  attractions: { pathname: "/attractions", parameter: "q" },
  restaurants: { pathname: "/restaurants", parameter: "q" },
  accommodations: { pathname: "/accommodations", parameter: "q" },
  stories: { pathname: "/stories", parameter: "search" },
};

export const PUBLIC_SEARCH_CATEGORY_OPTIONS: Array<{ value: HomepageSearchCategory; label: string }> = [
  { value: "attractions", label: "สถานที่ท่องเที่ยว" },
  { value: "restaurants", label: "ร้านอาหาร" },
  { value: "accommodations", label: "ที่พัก" },
  { value: "stories", label: "เรื่องราว" },
];

export function buildHomepageSearchHref(category: HomepageSearchCategory, query: string) {
  const destination = SEARCH_DESTINATIONS[category];
  const normalizedQuery = query.trim();
  const params = new URLSearchParams();

  if (normalizedQuery) params.set(destination.parameter, normalizedQuery);

  const search = params.toString();
  return `${destination.pathname}${search ? `?${search}` : ""}`;
}

export function HomepageSearch({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<HomepageSearchCategory>("attractions");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(buildHomepageSearchHref(category, query));
  }

  return (
    <form
      id="homepage-search"
      role="search"
      aria-label="ค้นหาเนื้อหาท่องเที่ยว"
      onSubmit={handleSubmit}
      className={`flex min-h-14 w-full items-stretch border border-ink/10 bg-white shadow-card focus-within:border-coral/50 focus-within:ring-4 focus-within:ring-coral/10 ${className}`}
    >
      <label htmlFor="homepage-search-query" className="sr-only">
        ค้นหาสถานที่ ร้านอาหาร ที่พัก หรือเรื่องราว
      </label>
      <span className="flex w-12 shrink-0 items-center justify-center text-ink/60" aria-hidden="true">
        <MagnifyingGlass size={22} weight="bold" />
      </span>
      <input
        id="homepage-search-query"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="ค้นหาสถานที่ ร้านอาหาร หรือเรื่องราว"
        className="min-w-0 flex-1 bg-transparent px-1 text-sm font-medium text-ink outline-none placeholder:text-muted sm:px-2 sm:text-base"
      />
      <label htmlFor="homepage-search-category" className="sr-only">
        ประเภทเนื้อหา
      </label>
      <select
        id="homepage-search-category"
        value={category}
        onChange={(event) => setCategory(event.target.value as HomepageSearchCategory)}
        className="hidden min-h-11 border-0 border-l border-ink/10 bg-white px-4 text-sm font-bold text-ink outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-coral sm:block"
      >
        {PUBLIC_SEARCH_CATEGORY_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        aria-label="ค้นหา"
        className="m-1.5 flex min-h-11 min-w-11 shrink-0 items-center justify-center bg-coral px-3 text-white transition-colors hover:bg-[#C95C3F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 sm:px-5"
      >
        <MagnifyingGlass size={22} weight="bold" aria-hidden="true" />
      </button>
    </form>
  );
}
