"use client";

import { useState } from "react";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "things-to-do", label: "Things to Do" },
  { id: "where-to-stay", label: "Where to Stay" },
  { id: "food", label: "Food & Drink" },
  { id: "tips", label: "Travel Tips" },
  { id: "how-to-get-there", label: "How to Get There" },
  { id: "reviews", label: "Reviews Summary" },
  { id: "articles", label: "Recommended Articles" },
];

export function AttractionTabs() {
  const [activeTab, setActiveTab] = useState("overview");

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Desktop Sticky Tabs */}
      <div className="sticky top-20 z-40 hidden border-b border-ink/10 bg-cream/90 backdrop-blur-md lg:block mb-10">
        <div className="flex items-center gap-8 px-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => scrollToSection(tab.id)}
              className={`whitespace-nowrap py-4 text-sm font-bold transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "border-coral text-coral"
                  : "border-transparent text-ink hover:text-coral"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Accordion Menu (Alternative to Tabs on small screens) */}
      <div className="lg:hidden mb-8">
        <div className="rounded-2xl bg-white border border-ink/5 shadow-sm overflow-hidden">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => scrollToSection(tab.id)}
              className="flex w-full items-center justify-between border-b border-ink/5 px-6 py-4 text-left text-sm font-bold text-ink hover:bg-cream/50 transition-colors last:border-b-0"
            >
              {tab.label}
              <CaretDown size={16} weight="bold" className="text-muted" />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
