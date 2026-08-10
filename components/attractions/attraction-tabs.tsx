"use client";

import { useEffect, useState } from "react";
import type { AttractionSectionNavItem } from "@/lib/content/attraction-sections";

type AttractionTabsProps = {
  sections: AttractionSectionNavItem[];
  mobileLabel?: string;
};

export function AttractionTabs({ sections, mobileLabel = "ไปยังส่วน" }: AttractionTabsProps) {
  const [activeTab, setActiveTab] = useState(sections[0]?.id ?? "");
  const fallbackTab = sections[0]?.id ?? "";
  const selectedTab = sections.some((section) => section.id === activeTab)
    ? activeTab
    : fallbackTab;

  useEffect(() => {
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target.id) {
          setActiveTab(visibleEntry.target.id);
        }
      },
      { rootMargin: "-120px 0px -55% 0px", threshold: [0.1, 0.3, 0.6] }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 144;
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: y, behavior: prefersReducedMotion ? "auto" : "smooth" });
    }
  };

  if (sections.length === 0) return null;

  return (
    <>
      <div className="sticky top-20 z-40 mb-10 hidden border-y border-slate-200 bg-white/95 py-3 backdrop-blur-md lg:block">
        <nav className="flex flex-wrap items-center gap-2" aria-label="ส่วนเนื้อหาของสถานที่">
          {sections.map((tab) => (
            <button
              key={tab.id}
              onClick={() => scrollToSection(tab.id)}
              className={`min-h-10 rounded-[var(--public-radius-control)] border px-3 py-2 text-sm font-semibold transition-colors ${
                selectedTab === tab.id
                  ? "border-[var(--public-teal)] bg-[var(--public-teal)] text-white"
                  : "border-slate-200 bg-white text-[var(--public-ink)] hover:border-[var(--public-teal)] hover:text-[var(--public-teal)]"
              }`}
            >
              {tab.shortLabel}
            </button>
          ))}
        </nav>
      </div>

      <div className="sticky top-[68px] z-30 mb-8 border-y border-slate-200 bg-white/95 py-3 backdrop-blur-md lg:hidden">
        <label htmlFor="attraction-section-jump" className="mb-2 block text-xs font-bold text-muted">
          {mobileLabel}
        </label>
        <div className="relative">
          <select
            id="attraction-section-jump"
            value={selectedTab}
            onChange={(event) => scrollToSection(event.target.value)}
            className="min-h-12 w-full rounded-[var(--public-radius-control)] border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[var(--public-ink)] outline-none transition focus:border-[var(--public-teal)] focus:ring-2 focus:ring-[var(--public-teal)]/20"
          >
            {sections.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}
