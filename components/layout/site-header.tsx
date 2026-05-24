"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  MagnifyingGlass,
  List,
  X,
  UserCircle,
  CaretDown
} from "@phosphor-icons/react/dist/ssr";

type SiteHeaderProps = {
  appName: string;
};

const navGroups = [
  {
    type: "link",
    href: "/",
    label: "หน้าแรก"
  },
  {
    type: "link",
    href: "/attractions",
    label: "สถานที่ท่องเที่ยว"
  },
  {
    type: "link",
    href: "/stories",
    label: "เรื่องราว"
  },
  {
    type: "dropdown",
    label: "สำรวจเพิ่มเติม",
    items: [
      { href: "/restaurants", label: "ร้านอาหาร" },
      { href: "/360-vista", label: "360° Virtual Tour" },
      { href: "/leaderboard", label: "Leaderboard" }
    ]
  },
  {
    type: "dropdown",
    label: "เกี่ยวกับเรา",
    items: [
      { href: "/about", label: "เกี่ยวกับโครงการ" },
      { href: "/contact", label: "ติดต่อเรา" }
    ]
  }
];

export function SiteHeader({ appName }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const desktopHeaderClass = scrolled
    ? "bg-cream/90 backdrop-blur-md border-ink/5 shadow-sm"
    : "bg-transparent border-transparent shadow-none";

  const mobileHeaderClass = scrolled
    ? "bg-cream/90 backdrop-blur-md border-ink/5 shadow-sm"
    : "bg-transparent border-transparent shadow-none";

  return (
    <>
      {/* ═══════════════════════════════════
          DESKTOP / TABLET HEADER
      ═══════════════════════════════════ */}
      <header
        className={`sticky top-0 z-50 hidden border-b transition-all duration-300 lg:block ${desktopHeaderClass}`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group" aria-label={`${appName} home`}>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-ink group-hover:bg-coral transition-colors">
              <Compass weight="fill" size={20} className="text-white" />
            </div>
            <div className="leading-tight">
              <h1 className="text-lg font-bold tracking-tight text-ink uppercase">Southern Border</h1>
              <p className="text-[10px] font-semibold text-muted uppercase tracking-widest">Explorer</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6" aria-label="Primary">
            {navGroups.map((group) => {
              if (group.type === "link") {
                const isActive = pathname === group.href;
                return (
                  <Link
                    key={group.href}
                    href={group.href!}
                    className={`text-sm font-semibold transition-colors ${
                      isActive ? "text-coral border-b-2 border-coral pb-1" : "text-ink hover:text-coral pb-1 border-b-2 border-transparent"
                    }`}
                  >
                    {group.label}
                  </Link>
                );
              } else {
                // Dropdown
                const isActive = group.items?.some(item => pathname === item.href);
                return (
                  <div key={group.label} className="group relative">
                    <button
                      className={`flex items-center gap-1 text-sm font-semibold transition-colors ${
                        isActive ? "text-coral border-b-2 border-coral pb-1" : "text-ink hover:text-coral pb-1 border-b-2 border-transparent"
                      }`}
                    >
                      {group.label}
                      <CaretDown weight="bold" className="transition-transform group-hover:rotate-180" />
                    </button>
                    {/* Dropdown Menu */}
                    <div className="absolute left-0 top-full hidden pt-6 group-hover:block">
                      <div className="flex w-48 flex-col overflow-hidden rounded-2xl border border-ink/5 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                        {group.items?.map(item => {
                          const isItemActive = pathname === item.href;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                                isItemActive ? "bg-coral/10 text-coral" : "text-ink hover:bg-ink/5 hover:text-coral"
                              }`}
                            >
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="text-ink hover:text-coral transition-colors"
              aria-label="Search"
            >
              <MagnifyingGlass size={20} weight="bold" />
            </button>
            
            <div className="h-4 w-px bg-ink/10"></div>
            
            <Link
              href="/passport"
              className="flex items-center gap-2 text-sm font-semibold text-ink hover:text-coral transition-colors"
            >
              <UserCircle size={20} weight="fill" />
              สมุดพาสปอร์ต
            </Link>

            <Link
              href="/checkin/demo-code"
              className="ml-2 rounded-full bg-coral px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#D46549] transition-colors"
            >
              รับใบประกาศ
            </Link>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════
          MOBILE HEADER
      ═══════════════════════════════════ */}
      <header
        className={`sticky top-0 z-50 border-b px-4 py-3 transition-all duration-300 lg:hidden ${mobileHeaderClass}`}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label={`${appName} home`}>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-ink">
              <Compass weight="fill" size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-ink uppercase leading-none">Southern Border</h1>
              <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mt-0.5">Explorer</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full text-ink hover:bg-ink/5"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <nav className="absolute left-0 right-0 top-full border-b border-ink/5 bg-cream px-4 py-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
            <ul className="flex flex-col gap-2">
              {navGroups.map((group) => {
                if (group.type === "link") {
                  return (
                    <li key={group.href}>
                      <Link
                        href={group.href!}
                        className={`block rounded-xl px-4 py-3 text-sm font-bold ${
                          pathname === group.href ? "bg-coral/10 text-coral" : "text-ink hover:bg-ink/5"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {group.label}
                      </Link>
                    </li>
                  );
                } else {
                  return (
                    <li key={group.label} className="mt-2">
                      <div className="px-4 pb-2 pt-1 text-xs font-bold uppercase tracking-wider text-muted">
                        {group.label}
                      </div>
                      <ul className="flex flex-col gap-1 pl-4 border-l-2 border-ink/5 ml-4">
                        {group.items?.map(item => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className={`block rounded-xl px-4 py-2.5 text-sm font-bold ${
                                pathname === item.href ? "bg-coral/10 text-coral" : "text-ink hover:bg-ink/5"
                              }`}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                }
              })}
              
              <li>
                <div className="my-2 h-px w-full bg-ink/10"></div>
              </li>
              <li>
                <Link
                  href="/passport"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-ink hover:bg-ink/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserCircle size={20} weight="fill" />
                  สมุดพาสปอร์ต
                </Link>
              </li>
              <li>
                <Link
                  href="/checkin/demo-code"
                  className="mt-2 block rounded-xl bg-coral px-4 py-3 text-center text-sm font-bold text-white shadow-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  สแกนรับใบประกาศ
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </header>
    </>
  );
}
