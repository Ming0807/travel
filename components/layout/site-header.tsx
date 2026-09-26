"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowSquareOut, Compass, List, X } from "@phosphor-icons/react/dist/ssr";

import { UserNavMenu } from "@/components/account/UserNavMenu";
import { PublicCheckinEntryLink } from "@/components/checkin/PublicCheckinEntryLink";
import { PublicGlobalSearch } from "@/components/layout/PublicGlobalSearch";
import { VISTA_360_EXTERNAL_URL } from "@/constants/product";
import { shouldHidePublicChrome } from "@/lib/navigation/public-route-mode";

import "./site-header.css";

type SiteHeaderProps = { appName: string };

const links = [
  { href: "/attractions", label: "สถานที่", external: false },
  { href: "/routes", label: "เส้นทาง", external: false },
  { href: "/restaurants", label: "ร้านอาหาร", external: false },
  { href: "/accommodations", label: "ที่พัก", external: false },
  { href: "/stories", label: "เรื่องราว", external: false },
  { href: VISTA_360_EXTERNAL_URL, label: "ชม 360°", external: true },
  { href: "/about", label: "เกี่ยวกับ", external: false },
] as const;

export function SiteHeader({ appName }: SiteHeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  if (shouldHidePublicChrome(pathname)) return null;

  return (
    <header className="ed-site-header">
      <div className="ed-site-header-inner">
        <Link href="/" className="ed-site-brand" aria-label={`${appName} หน้าหลัก`} onClick={() => setMenuOpen(false)}>
          <Compass aria-hidden="true" size={28} weight="duotone" />
          <span><strong>YALA</strong><small>SOUTHERN THAILAND</small></span>
        </Link>

        <nav className="ed-site-nav" aria-label="เมนูหลัก">
          {links.map((item) => item.external ? (
            <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" aria-label={`${item.label} (เว็บไซต์ภายนอก เปิดแท็บใหม่)`}>
              {item.label}<ArrowSquareOut aria-hidden="true" size={13} weight="bold" />
            </a>
          ) : (
            <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ed-site-actions">
          <PublicGlobalSearch onOpen={() => setMenuOpen(false)} />
          <div className="ed-site-account"><UserNavMenu /></div>
          <PublicCheckinEntryLink className="ed-site-checkin">สแกน QR</PublicCheckinEntryLink>
          <button
            ref={menuButtonRef}
            type="button"
            className="ed-site-menu-button"
            aria-label={menuOpen ? "ปิดเมนู" : "เปิดเมนู"}
            aria-expanded={menuOpen}
            aria-controls="ed-site-mobile-nav"
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X size={23} aria-hidden="true" /> : <List size={23} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav id="ed-site-mobile-nav" className="ed-site-mobile-nav" aria-label="เมนูมือถือ">
          {links.map((item) => item.external ? (
            <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} aria-label={`${item.label} (เว็บไซต์ภายนอก เปิดแท็บใหม่)`}>
              {item.label}<span>เว็บไซต์ภายนอก <ArrowSquareOut aria-hidden="true" size={15} /></span>
            </a>
          ) : (
            <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined} onClick={() => setMenuOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link href="/contact" onClick={() => setMenuOpen(false)}>ติดต่อเรา</Link>
          <Link href="/passport" onClick={() => setMenuOpen(false)}>Digital Passport</Link>
          <div className="ed-site-mobile-account"><UserNavMenu mobile /></div>
          <PublicCheckinEntryLink className="ed-site-mobile-checkin" onClick={() => setMenuOpen(false)}>สแกน QR เช็กอิน</PublicCheckinEntryLink>
        </nav>
      ) : null}
    </header>
  );
}
