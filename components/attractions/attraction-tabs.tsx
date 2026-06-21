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
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: y, behavior: prefersReducedMotion ? "auto" : "smooth" });
    }
  };

  if (sections.length === 0) return null;

  return (
    <>
      {/* Desktop Sticky Tabs */}
      <div className="sticky top-20 z-40 mb-10 hidden border-b border-ink/10 bg-white/95 py-3 backdrop-blur-md lg:block">
        <nav className="flex flex-wrap items-center gap-2" aria-label="Attraction page sections">
          {sections.map((tab) => (
            <button
              key={tab.id}
              onClick={() => scrollToSection(tab.id)}
              className={`min-h-10 rounded-full border px-3 py-2 text-sm font-bold transition-colors ${
                selectedTab === tab.id
                  ? "border-coral bg-coral text-white"
                  : "border-ink/10 bg-white text-ink hover:border-coral/30 hover:bg-cream"
              }`}
            >
              {tab.shortLabel}
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile jump menu */}
      <div className="sticky top-0 z-30 mb-8 rounded-2xl border border-ink/10 bg-white/95 p-3 shadow-sm backdrop-blur-md lg:hidden">
        <label htmlFor="attraction-section-jump" className="mb-2 block text-xs font-bold text-muted">
          {mobileLabel}
        </label>
        <div className="relative">
          <select
            id="attraction-section-jump"
            value={selectedTab}
            onChange={(event) => scrollToSection(event.target.value)}
            className="min-h-12 w-full rounded-xl border border-ink/10 bg-cream px-4 py-3 text-sm font-bold text-ink outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/20"
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
