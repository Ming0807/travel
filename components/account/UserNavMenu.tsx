"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserCircle, SignOut, CaretDown, User as UserIcon } from "@phosphor-icons/react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function UserNavMenu({ mobile = false }: { mobile?: boolean }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const supabase = createSupabaseBrowserClient();

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    window.location.reload();
  };

  if (loading) {
    return <div className="h-10 w-24 animate-pulse rounded-full bg-ink/5"></div>;
  }

  if (!user) {
    if (mobile) {
      return (
        <Link
          href="/auth/login"
          className="mt-2 block rounded-xl bg-ink px-4 py-3 text-center text-sm font-bold text-white shadow-sm hover:bg-ink/90 transition-colors"
        >
          เข้าสู่ระบบ
        </Link>
      );
    }
    return (
      <Link
        href="/auth/login"
        className="ml-2 rounded-full bg-ink px-5 py-2 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95"
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
            <p className="text-[10px] uppercase tracking-widest text-muted">บัญชีที่เชื่อมต่อแล้ว</p>
          </div>
        </div>
        <ul className="flex flex-col gap-1">
          <li>
            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-ink hover:bg-ink/5"
            >
              <UserCircle size={20} weight="fill" />
              โปรไฟล์ของฉัน
            </Link>
          </li>
          <li>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 text-left"
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
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex shrink-0 items-center gap-2 rounded-full border border-ink/10 bg-white pl-2 pr-4 py-1.5 transition-all hover:bg-slate-50 hover:border-ink/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
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
          <div className="absolute right-0 top-full z-50 mt-2 w-56 origin-top-right rounded-xl border border-ink/10 bg-white p-1.5 shadow-sm animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-2 border-b border-ink/5 mb-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">บัญชีผู้ใช้</p>
              <p className="truncate text-sm font-bold text-ink mt-0.5">{displayName}</p>
            </div>
            <Link
              href="/profile"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-ink hover:bg-slate-50 transition-colors"
            >
              <UserCircle size={18} weight="fill" className="text-ink/60" />
              โปรไฟล์ของฉัน
            </Link>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left mt-0.5"
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
