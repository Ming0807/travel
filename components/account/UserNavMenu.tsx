"use client";

import { useState, useEffect, useId, useRef, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserCircle, SignOut, CaretDown, User as UserIcon, BookOpen, Article } from "@phosphor-icons/react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function UserNavMenu({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supabase] = useState(() => createSupabaseBrowserClient());
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    let authChanged = false;
    supabase.auth.getUser().then(({ data }) => {
      if (active && !authChanged) setUser(data.user);
    }).catch(() => {
      if (active && !authChanged) setUser(null);
    }).finally(() => {
      if (active) setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      authChanged = true;
      if (!active) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [supabase]);

  useEffect(() => {
    if (!menuOpen) return;
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    const onOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") { setMenuOpen(false); triggerRef.current?.focus(); }
    };
    document.addEventListener("pointerdown", onOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("pointerdown", onOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [menuOpen]);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    setError(null);
    try {
      const result = await supabase.auth.signOut();
      if (result.error) throw result.error;
      setMenuOpen(false);
      window.location.reload();
    } catch {
      setError("ยังออกจากระบบไม่ได้ กรุณาลองอีกครั้ง");
    } finally { setSigningOut(false); }
  }

  function handleMenuKeys(event: KeyboardEvent<HTMLDivElement>) {
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    if (!items.length || !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const index = items.indexOf(document.activeElement as HTMLElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
    items[next]?.focus();
  }

  function followLink() { setMenuOpen(false); onNavigate?.(); }

  if (loading) return <div className="ed-account-loading animate-pulse" aria-hidden="true" />;
  if (!user) return <Link href="/auth/login" onClick={onNavigate} className={`ed-account-login${mobile ? " ed-account-login-mobile" : ""}`}>เข้าสู่ระบบ</Link>;

  const name = user.user_metadata?.display_name || user.user_metadata?.full_name || user.user_metadata?.name;
  const displayName = typeof name === "string" && name.trim() ? name.trim() : user.email?.split("@")[0] || "ผู้ใช้งาน";
  const avatarUrl = typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null;
  const avatar = <span className="ed-account-avatar">{avatarUrl
    ? <Image src={avatarUrl} alt="" width={32} height={32} unoptimized />
    : <UserIcon size={18} weight="fill" aria-hidden="true" />}</span>;
  const links = [
    { href: "/profile", label: "โปรไฟล์ของฉัน", icon: UserCircle },
    { href: "/passport", label: "พาสปอร์ตของฉัน", icon: BookOpen },
    { href: "/stories/share", label: "แบ่งปันเรื่องราว", icon: Article },
  ];
  const accountLinks = links.map(({ href, label, icon: Icon }) => (
    <Link key={href} href={href} role={mobile ? undefined : "menuitem"} onClick={followLink} className="ed-account-link">
      <Icon size={19} aria-hidden="true" />{label}
    </Link>
  ));
  const signOut = <button type="button" role={mobile ? undefined : "menuitem"} disabled={signingOut} onClick={handleSignOut} className="ed-account-link ed-account-signout"><SignOut size={19} aria-hidden="true" />{signingOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}</button>;

  if (mobile) return <div className="ed-account-mobile">
    <div className="ed-account-identity">{avatar}<div><p title={displayName}>{displayName}</p><small>บัญชีนักเดินทาง</small></div></div>
    {accountLinks}{signOut}{error ? <p role="alert" className="ed-account-error">{error}</p> : null}
  </div>;

  return <div ref={rootRef} className="ed-account" onBlur={(event) => {
    if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false);
  }}>
    <button ref={triggerRef} type="button" onClick={() => setMenuOpen(!menuOpen)} onKeyDown={(event) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setMenuOpen(true); }
    }} aria-label={`${menuOpen ? "ปิด" : "เปิด"}เมนูบัญชี ${displayName}`} aria-expanded={menuOpen} aria-haspopup="menu" aria-controls={menuId} className="ed-account-trigger">
      {avatar}<span className="ed-account-name" title={displayName}>{displayName}</span><CaretDown size={13} weight="bold" aria-hidden="true" className="ed-account-caret" />
    </button>
    {menuOpen ? <div ref={menuRef} id={menuId} role="menu" aria-label="บัญชีนักเดินทาง" className="ed-account-dropdown" onKeyDown={handleMenuKeys}>
      <div className="ed-account-identity"><div><small>บัญชีนักเดินทาง</small><p title={displayName}>{displayName}</p></div></div>
      {accountLinks}{signOut}{error ? <p role="alert" className="ed-account-error">{error}</p> : null}
    </div> : null}
  </div>;
}
