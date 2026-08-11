"use client";

import { useState, useEffect, useId, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserCircle, SignOut, CaretDown, User as UserIcon } from "@phosphor-icons/react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function UserNavMenu({ mobile = false }: { mobile?: boolean }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [supabase] = useState(() => createSupabaseBrowserClient());
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Initial fetch
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    window.location.reload();
  };

  if (loading) {
    return <div className="h-10 w-24 animate-pulse rounded-md bg-ink/5" aria-hidden="true" />;
  }

  if (!user) {
    if (mobile) {
      return (
        <Link
          href="/auth/login"
          className="mt-2 block rounded-md bg-ink px-4 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-ink/90"
        >
          เข้าสู่ระบบ
        </Link>
      );
    }
    return (
      <Link
        href="/auth/login"
        className="ml-2 rounded-md bg-ink px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-ink/90"
      >
        เข้าสู่ระบบ
      </Link>
    );
  }

  // Logged in view
  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "ผู้ใช้งาน";
  const avatarUrl = user.user_metadata?.avatar_url;

  if (mobile) {
    return (
      <div className="mt-4 border-t border-ink/5 pt-4">
        <div className="flex items-center gap-3 px-4 mb-4">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-full border border-ink/10 object-cover"
              unoptimized
            />
          ) : (
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink/5 text-ink">
              <UserIcon weight="fill" size={20} />
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-bold text-ink">{displayName}</p>
            <p className="text-xs font-semibold text-slate-500">บัญชีที่เชื่อมต่อแล้ว</p>
          </div>
        </div>
        <ul className="flex flex-col gap-1">
          <li>
            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-md px-4 py-3 text-sm font-bold text-ink hover:bg-ink/5"
            >
              <UserCircle size={20} weight="fill" />
              โปรไฟล์ของฉัน
            </Link>
          </li>
          <li>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-left text-sm font-bold text-red-600 hover:bg-red-50"
            >
              <SignOut size={20} weight="bold" />
              ออกจากระบบ
            </button>
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div className="relative ml-2">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? "ปิดเมนูบัญชี" : "เปิดเมนูบัญชี"}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        aria-controls={menuId}
        className="flex min-h-11 shrink-0 items-center gap-2 rounded-md border border-ink/10 bg-white py-2 pl-2 pr-3 transition-colors hover:border-ink/20 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName}
            width={24}
            height={24}
            className="h-6 w-6 shrink-0 rounded-full object-cover"
            unoptimized
          />
        ) : (
          <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink/10 text-ink">
            <UserIcon weight="fill" size={14} />
          </div>
        )}
        <span className="max-w-[100px] truncate text-sm font-bold text-ink">{displayName}</span>
        <CaretDown size={12} weight="bold" className={`text-ink/50 shrink-0 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
      </button>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 sm:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <div id={menuId} role="menu" className="absolute right-0 top-full z-50 mt-2 w-56 origin-top-right rounded-md border border-ink/10 bg-white p-1.5 shadow-sm">
            <div className="px-3 py-2 border-b border-ink/5 mb-1.5">
              <p className="text-xs font-semibold text-slate-500">บัญชีผู้ใช้</p>
              <p className="truncate text-sm font-bold text-ink mt-0.5">{displayName}</p>
            </div>
            <Link
              href="/profile"
              role="menuitem"
              onClick={() => setMenuOpen(false)}
              className="flex min-h-11 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-slate-50"
            >
              <UserCircle size={18} weight="fill" className="text-ink/60" />
              โปรไฟล์ของฉัน
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              className="mt-0.5 flex min-h-11 w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
            >
              <SignOut size={18} weight="bold" className="text-red-500/80" />
              ออกจากระบบ
            </button>
          </div>
        </>
      )}
    </div>
  );
}
