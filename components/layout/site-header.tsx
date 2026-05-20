"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Compass,
  MagnifyingGlass,
  SlidersHorizontal,
  List,
  UserCircle
} from "@phosphor-icons/react";

type SiteHeaderProps = {
  appName: string;
};

const navItems = [
  { href: "#attractions", label: "สำรวจ" },
  { href: "#passport", label: "พาสปอร์ต" },
  { href: "#how-it-works", label: "วิธีใช้" },
  { href: "#dashboard", label: "ข้อมูล" }
];

export function SiteHeader({ appName }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* ═══════════════════════════════════
          DESKTOP / TABLET HEADER
      ═══════════════════════════════════ */}
      <header className="sticky top-0 z-50 hidden border-b border-white/70 bg-cream/75 backdrop-blur-2xl lg:block">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3" aria-label={`${appName} home`}>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-card">
              <Compass weight="fill" size={24} className="text-gold" />
            </div>
            <div className="leading-tight">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-coral">
                Southern Border
              </p>
              <h1 className="text-xl font-extrabold tracking-tight text-ink">Explorer</h1>
              <p className="body-text text-xs text-muted">Yala · Pattani · Narathiwat</p>
            </div>
          </Link>

          {/* Search bar */}
          <div className="mx-10 flex flex-1 items-center justify-center">
            <label className="flex h-12 w-full max-w-2xl items-center gap-3 rounded-full border border-[#E9DDCF] bg-white px-5 shadow-sm">
              <MagnifyingGlass size={20} className="text-muted" />
              <input
                id="searchInputDesktop"
                type="text"
                className="body-text w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder="ค้นหาสถานที่ อาหาร วัฒนธรรม หรือเส้นทางท่องเที่ยว..."
              />
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-full bg-tealSoft text-teal"
                aria-label="Filter search"
              >
                <SlidersHorizontal size={16} />
              </button>
            </label>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-2" aria-label="Primary">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-teal"
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              className="ml-2 rounded-full border border-[#E9DDCF] bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm hover:border-teal hover:text-teal"
            >
              EN
            </button>
            <Link
              href="#passport"
              className="rounded-full bg-teal px-5 py-2.5 text-sm font-semibold text-white shadow-glow hover:bg-[#064E52]"
            >
              My Passport
            </Link>
          </nav>
        </div>
      </header>

      {/* ═══════════════════════════════════
          MOBILE APP HEADER
      ═══════════════════════════════════ */}
      <header className="sticky top-0 z-50 border-b border-white/70 bg-cream/80 px-4 py-3 backdrop-blur-2xl lg:hidden">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm"
            aria-label="User profile"
          >
            <UserCircle weight="fill" size={24} className="text-teal" />
          </button>

          <Link href="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white shadow-sm">
              <Compass weight="fill" size={20} className="text-gold" />
            </div>
            <div className="leading-tight">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-coral">
                Southern Border
              </p>
              <h1 className="text-sm font-extrabold">Explorer</h1>
            </div>
          </Link>

          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm"
            aria-label="Open menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <List size={24} className="text-ink" />
          </button>
        </div>

        {/* Mobile search */}
        <div className="mt-4 flex items-center gap-2">
          <label className="flex h-11 flex-1 items-center gap-2 rounded-full bg-white px-4 shadow-sm">
            <MagnifyingGlass size={18} className="text-muted" />
            <input
              id="searchInputMobile"
              type="text"
              className="body-text w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              placeholder="ค้นหาสถานที่..."
            />
          </label>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full bg-white text-teal shadow-sm"
            aria-label="Filter"
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="mt-3 rounded-3xl border border-white/80 bg-white p-3 shadow-card">
            <Link
              className="block rounded-2xl px-4 py-3 text-sm font-medium hover:bg-tealSoft"
              href="#attractions"
              onClick={() => setMobileMenuOpen(false)}
            >
              สถานที่ท่องเที่ยว
            </Link>
            <Link
              className="block rounded-2xl px-4 py-3 text-sm font-medium hover:bg-tealSoft"
              href="#passport"
              onClick={() => setMobileMenuOpen(false)}
            >
              พาสปอร์ตของฉัน
            </Link>
            <Link
              className="block rounded-2xl px-4 py-3 text-sm font-medium hover:bg-tealSoft"
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
            >
              วิธีใช้งาน
            </Link>
            <Link
              className="block rounded-2xl px-4 py-3 text-sm font-medium hover:bg-tealSoft"
              href="#dashboard"
              onClick={() => setMobileMenuOpen(false)}
            >
              ข้อมูลและแดชบอร์ด
            </Link>
            <Link
              className="block rounded-2xl px-4 py-3 text-sm font-medium hover:bg-tealSoft"
              href="#privacy"
              onClick={() => setMobileMenuOpen(false)}
            >
              ความเป็นส่วนตัว
            </Link>
          </div>
        )}
      </header>
    </>
  );
}
