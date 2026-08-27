"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PublicCheckinEntryLink } from "@/components/checkin/PublicCheckinEntryLink";
import { usePathname } from "next/navigation";
import {
  Compass,
  List,
  X,
  CaretDown
} from "@phosphor-icons/react/dist/ssr";
import { UserNavMenu } from "@/components/account/UserNavMenu";
import { PublicGlobalSearch } from "@/components/layout/PublicGlobalSearch";
import { shouldHidePublicChrome } from "@/lib/navigation/public-route-mode";

type SiteHeaderProps = {
  appName: string;
};

const navGroups = [
  {
    type: "link",
    href: "/attractions",
    label: "สถานที่ท่องเที่ยว"
  },
  {
    type: "dropdown",
    label: "สำรวจ",
    items: [
      { href: "/restaurants", label: "ร้านอาหารแนะนำ" },
      { href: "/accommodations", label: "ที่พักแนะนำ" },
      { href: "/stories", label: "บทความและเรื่องราว" },
      { href: "/360-vista", label: "ทัวร์เสมือนจริง 360°" }
    ]
  },
  {
    type: "dropdown",
    label: "เพิ่มเติม",
    items: [
      { href: "/leaderboard", label: "กระดานผู้นำ" },
      { href: "/about", label: "เกี่ยวกับเรา" },
      { href: "/contact", label: "ติดต่อเรา" }
    ]
  }
];

export function SiteHeader({ appName }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const dropdownTriggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const dropdownPanelRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const dropdownItemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const mobileMenuTriggerRef = useRef<HTMLButtonElement>(null);

  const closeDropdown = useCallback((restoreFocus = false) => {
    const dropdown = openDropdown;
    if (restoreFocus && dropdown) {
      dropdownTriggerRefs.current[dropdown]?.focus();
    }
    setOpenDropdown(null);
  }, [openDropdown]);

  const closeMobileMenu = useCallback((restoreFocus = false) => {
    if (restoreFocus) {
      mobileMenuTriggerRef.current?.focus();
    }
    setMobileMenuOpen(false);
  }, []);

  useEffect(() => {
    if (!openDropdown) return;

    const handleOutsidePointer = (event: PointerEvent) => {
      const target = event.target as Node;
      const trigger = dropdownTriggerRefs.current[openDropdown];
      const panel = dropdownPanelRefs.current[openDropdown];
      if (!trigger?.contains(target) && !panel?.contains(target)) {
        closeDropdown();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDropdown(true);
      }
    };

    document.addEventListener("pointerdown", handleOutsidePointer);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointer);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [closeDropdown, openDropdown]);

  useEffect(() => {
    if (openDropdown) {
      dropdownItemRefs.current[openDropdown]?.focus();
    }
  }, [openDropdown]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    document.querySelector<HTMLAnchorElement>("#public-mobile-menu a")?.focus();

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMobileMenu(true);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [closeMobileMenu, mobileMenuOpen]);

  const desktopHeaderClass = "bg-white/95 backdrop-blur-md border-ink/10 shadow-[0_1px_3px_rgba(0,0,0,0.05)]";
  const mobileHeaderClass = "bg-white/95 backdrop-blur-md border-ink/10 shadow-[0_1px_3px_rgba(0,0,0,0.05)]";

  // Keep all hooks above this route guard so navigation can change safely.
  if (shouldHidePublicChrome(pathname)) {
    return null;
  }

  return (
    <>
      {/* ═══════════════════════════════════
          DESKTOP / TABLET HEADER
      ═══════════════════════════════════ */}
      <header
        className={`sticky top-0 z-50 hidden border-b transition-all duration-200 lg:block ${desktopHeaderClass}`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <div className="flex-1 flex justify-start">
            <Link href="/" className="flex items-center gap-3 group" aria-label={`${appName} home`}>
              <div className="grid h-10 w-10 place-items-center rounded-[6px] bg-coral text-white shadow-xs group-hover:bg-[#C95C3F] transition-colors">
                <Compass weight="fill" size={22} className="text-white" />
              </div>
              <div className="leading-tight">
                <p className="text-base font-black tracking-tight text-ink uppercase">ท่องเที่ยวชายแดนใต้</p>
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Digital Passport</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex items-center justify-center gap-7" aria-label="เมนูหลัก">
            {navGroups.map((group) => {
              if (group.type === "link") {
                const isActive = pathname === group.href;
                return (
                  <Link
                    key={group.href}
                    href={group.href!}
                    className={`text-sm font-bold transition-colors ${
                      isActive ? "text-coral" : "text-ink hover:text-coral"
                    }`}
                  >
                    {group.label}
                  </Link>
                );
              } else {
                // Dropdown
                const isActive = group.items?.some(item => pathname === item.href);
                return (
                  <div key={group.label} className="relative">
                    <button
                      type="button"
                      ref={(element) => { dropdownTriggerRefs.current[group.label] = element; }}
                      aria-label={`เมนู${group.label}`}
                      aria-haspopup="menu"
                      aria-expanded={openDropdown === group.label}
                      aria-controls={`public-dropdown-${group.label}`}
                      onClick={() => setOpenDropdown((current) => current === group.label ? null : group.label)}
                      onKeyDown={(event) => {
                        if (event.key === "ArrowDown") {
                          event.preventDefault();
                          setOpenDropdown(group.label);
                        }
                        if (event.key === "Escape") {
                          event.preventDefault();
                          closeDropdown(true);
                        }
                      }}
                      className={`flex items-center gap-1.5 rounded-[6px] text-sm font-bold transition-colors ${
                        isActive ? "text-coral" : "text-ink hover:text-coral"
                      }`}
                    >
                      {group.label}
                      <CaretDown weight="bold" size={14} className={openDropdown === group.label ? "rotate-180" : undefined} />
                    </button>
                    {openDropdown === group.label && <div
                      ref={(element) => { dropdownPanelRefs.current[group.label] = element; }}
                      className="absolute left-0 top-full z-10 pt-2"
                    >
                      <div id={`public-dropdown-${group.label}`} role="menu" className="flex w-48 flex-col overflow-hidden rounded-[8px] border border-ink/10 bg-white p-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
                        {group.items?.map((item, index) => {
                          const isItemActive = pathname === item.href;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              ref={(element) => { if (index === 0) dropdownItemRefs.current[group.label] = element; }}
                              role="menuitem"
                              onClick={() => closeDropdown()}
                              className={`rounded-[6px] px-3.5 py-2 text-sm font-semibold transition-colors ${
                                isItemActive ? "bg-coral/10 text-coral" : "text-ink hover:bg-cream hover:text-coral"
                              }`}
                            >
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>}
                  </div>
                );
              }
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex-1 flex items-center justify-end gap-3.5">
            <PublicGlobalSearch />
            
            <div className="h-4 w-px bg-ink/10"></div>

            <UserNavMenu />

            <PublicCheckinEntryLink
              className="inline-flex min-h-10 items-center whitespace-nowrap rounded-[6px] bg-coral px-4 text-sm font-black text-white shadow-xs transition-colors hover:bg-[#C95C3F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
            >
              สแกน QR เช็กอิน
            </PublicCheckinEntryLink>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════
          MOBILE HEADER
      ═══════════════════════════════════ */}
      <header
        className={`sticky top-0 z-50 border-b px-4 py-2.5 transition-all duration-200 lg:hidden ${mobileHeaderClass}`}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label={`${appName} home`}>
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[6px] bg-coral text-white shadow-xs">
              <Compass weight="fill" size={19} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black tracking-tight text-ink uppercase leading-none truncate">ท่องเที่ยวชายแดนใต้</p>
              <p className="text-[9px] font-bold text-muted uppercase tracking-widest mt-0.5 truncate">Digital Passport</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <PublicGlobalSearch onOpen={() => closeMobileMenu()} />
            <button
              type="button"
              ref={mobileMenuTriggerRef}
              id="public-mobile-menu-trigger"
              aria-controls="public-mobile-menu"
              className="grid h-10 w-10 place-items-center rounded-[6px] text-ink hover:bg-cream"
              onClick={() => mobileMenuOpen ? closeMobileMenu(true) : setMobileMenuOpen(true)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "ปิดเมนู" : "เปิดเมนู"}
            >
              {mobileMenuOpen ? <X size={22} /> : <List size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <nav id="public-mobile-menu" aria-labelledby="public-mobile-menu-trigger" className="absolute left-0 right-0 top-full border-b border-ink/10 bg-white px-4 py-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
            <ul className="flex flex-col gap-1.5">
              {navGroups.map((group) => {
                if (group.type === "link") {
                  return (
                    <li key={group.href}>
                      <Link
                        href={group.href!}
                        className={`block rounded-[6px] px-3.5 py-2.5 text-sm font-bold ${
                          pathname === group.href ? "bg-coral/10 text-coral" : "text-ink hover:bg-cream"
                        }`}
                        onClick={() => closeMobileMenu()}
                      >
                        {group.label}
                      </Link>
                    </li>
                  );
                } else {
                  return (
                    <li key={group.label} className="mt-1">
                      <div className="px-3.5 pb-1 pt-1.5 text-xs font-black uppercase tracking-wider text-muted">
                        {group.label}
                      </div>
                      <ul className="flex flex-col gap-1 pl-3 border-l-2 border-ink/10 ml-3.5">
                        {group.items?.map(item => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className={`block rounded-[6px] px-3 py-2 text-sm font-semibold ${
                                pathname === item.href ? "bg-coral/10 text-coral" : "text-ink hover:bg-cream"
                              }`}
                              onClick={() => closeMobileMenu()}
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
              <UserNavMenu mobile={true} />
              <li>
                <PublicCheckinEntryLink
                  className="mt-2 block rounded-[6px] bg-coral px-4 py-3 text-center text-sm font-black text-white shadow-xs"
                  onClick={() => closeMobileMenu()}
                >
                  สแกนรับใบประกาศ
                </PublicCheckinEntryLink>
              </li>
            </ul>
          </nav>
        )}
      </header>
    </>
  );
}
