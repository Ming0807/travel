"use client";

import { Funnel, MagnifyingGlass, X } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import {
  buildPublicStoryHref,
  type PublicStoryAuthorType,
  type PublicStoryQuery,
} from "@/lib/content/public-story-query";
import type { PublicStoryTopicOption } from "@/lib/repositories/public-content.repository";

export interface StoryDiscoveryFiltersProps {
  query: PublicStoryQuery;
  topics: PublicStoryTopicOption[];
  provinces?: Array<{ value: string; label: string }>;
}

export function StoryDiscoveryFilters({
  query,
  topics,
  provinces = [],
}: StoryDiscoveryFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const hasFilters = Boolean(
    query.search || query.province || query.topic || query.authorType,
  );

  const authorFilters: Array<{
    value: PublicStoryAuthorType | undefined;
    label: string;
  }> = [
    { value: undefined, label: "ทั้งหมด" },
    { value: "admin", label: "จากกองบรรณาธิการ" },
    { value: "tourist", label: "จากนักเดินทาง" },
  ];

  return (
    <div className="relative -mt-8 z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-orange-100/90 bg-white p-4 shadow-xl shadow-orange-500/5 sm:p-6">
        {/* Mobile Filter Toggle Button */}
        <div className="flex items-center justify-between sm:hidden">
          <p className="text-xs font-black text-ink">ค้นหาและกรองเรื่องราว</p>
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="story-filter-form"
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50/70 px-3 py-1.5 text-xs font-bold text-coral transition-colors hover:bg-orange-100"
          >
            <Funnel aria-hidden="true" size={16} weight="bold" />
            {mobileOpen ? "ซ่อนตัวกรอง" : "เปิดตัวกรอง"}
          </button>
        </div>

        {/* Main Search & Dropdown Form */}
        <form
          id="story-filter-form"
          action="/stories"
          method="GET"
          className={mobileOpen ? "mt-4 block" : "hidden sm:block"}
        >
          <div
            className={
              provinces.length > 1
                ? "grid gap-3 sm:grid-cols-[minmax(0,1.8fr)_minmax(170px,1fr)_minmax(160px,.9fr)_auto]"
                : "grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(190px,1fr)_auto]"
            }
          >
            {/* Search Input */}
            <div className="relative">
              <label htmlFor="story-search" className="sr-only">
                ค้นหาจากชื่อหรือคำโปรยเรื่องราว
              </label>
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted">
                <MagnifyingGlass size={18} weight="bold" aria-hidden="true" />
              </div>
              <input
                id="story-search"
                name="q"
                type="search"
                defaultValue={query.search ?? ""}
                placeholder="ค้นหาชื่อเรื่องหรือคำสำคัญ..."
                className="w-full min-h-12 rounded-xl border border-ink/15 bg-cream/40 pl-10 pr-4 text-sm font-semibold text-ink transition-all placeholder:text-muted focus:border-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral/20"
              />
            </div>

            {/* Topic Select */}
            <div className="relative">
              <label htmlFor="story-topic" className="sr-only">
                เลือกหัวข้อ
              </label>
              <select
                id="story-topic"
                name="topic"
                defaultValue={query.topic ?? ""}
                className="w-full min-h-12 rounded-xl border border-ink/15 bg-cream/40 px-3.5 text-sm font-semibold text-ink transition-all focus:border-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral/20"
              >
                <option value="">ทุกหัวข้อ</option>
                {topics.map((topic) => (
                  <option key={topic.key} value={topic.key}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Province Select (if multiple provinces) */}
            {provinces.length > 1 ? (
              <div className="relative">
                <label htmlFor="story-province" className="sr-only">
                  เลือกจังหวัด
                </label>
                <select
                  id="story-province"
                  name="province"
                  defaultValue={query.province ?? ""}
                  className="w-full min-h-12 rounded-xl border border-ink/15 bg-cream/40 px-3.5 text-sm font-semibold text-ink transition-all focus:border-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral/20"
                >
                  <option value="">ทุกจังหวัดที่เปิดให้บริการ</option>
                  {provinces.map((prov) => (
                    <option key={prov.value} value={prov.value}>
                      {prov.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : query.province ? (
              <input type="hidden" name="province" value={query.province} />
            ) : null}

            {/* Author Type hidden state if set */}
            {query.authorType ? (
              <input type="hidden" name="type" value={query.authorType} />
            ) : null}

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 text-sm font-black text-white shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02] hover:shadow-orange-500/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral sm:flex-initial"
              >
                <MagnifyingGlass size={18} weight="bold" aria-hidden="true" />
                <span>ค้นหา</span>
              </button>

              {hasFilters ? (
                <Link
                  href="/stories"
                  aria-label="ล้างตัวกรองทั้งหมด"
                  className="inline-flex min-h-12 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-ink/15 bg-white px-4 text-xs font-bold text-muted transition-colors hover:bg-black/5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
                >
                  <X size={15} weight="bold" aria-hidden="true" />
                  <span>ล้างตัวกรอง</span>
                </Link>
              ) : null}
            </div>
          </div>
        </form>

        {/* Tier 1: Author Source Tabs */}
        <div className="mt-4 flex items-center gap-2 border-t border-orange-100/70 pt-3.5 overflow-x-auto text-xs">
          <span className="shrink-0 font-bold text-muted mr-1">ผู้เขียน:</span>
          <div className="inline-flex rounded-xl bg-cream/70 p-1 border border-ink/5">
            {authorFilters.map((item) => {
              const active = query.authorType === item.value;
              return (
                <Link
                  key={item.label}
                  href={buildPublicStoryHref(query, { authorType: item.value })}
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "min-h-8 shrink-0 inline-flex items-center rounded-lg px-3.5 py-1 font-black bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs"
                      : "min-h-8 shrink-0 inline-flex items-center rounded-lg px-3.5 py-1 font-semibold text-ink/75 hover:text-coral transition-colors"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Tier 2: Quick Topic Filter Rail */}
        {topics.length > 0 ? (
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto text-xs pb-0.5">
            <span className="shrink-0 font-bold text-muted mr-1">หัวข้อ:</span>
            <Link
              href={buildPublicStoryHref(query, { topic: undefined })}
              className={
                !query.topic
                  ? "min-h-7 shrink-0 inline-flex items-center rounded-full px-3 py-0.5 font-bold bg-coral/15 text-coral border border-coral/30"
                  : "min-h-7 shrink-0 inline-flex items-center rounded-full px-3 py-0.5 font-semibold bg-cream text-ink/75 hover:bg-orange-50 hover:text-coral border border-ink/5"
              }
            >
              ทั้งหมด
            </Link>
            {topics.map((topic) => {
              const isActive = query.topic === topic.key;
              return (
                <Link
                  key={topic.key}
                  href={buildPublicStoryHref(query, {
                    topic: isActive ? undefined : topic.key,
                  })}
                  className={
                    isActive
                      ? "min-h-7 shrink-0 inline-flex items-center rounded-full px-3 py-0.5 font-bold bg-coral/15 text-coral border border-coral/40"
                      : "min-h-7 shrink-0 inline-flex items-center rounded-full px-3 py-0.5 font-semibold bg-cream text-ink/75 hover:bg-orange-50 hover:text-coral border border-ink/5"
                  }
                >
                  {topic.name}
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
