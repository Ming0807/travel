"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  ArrowSquareOut,
  CaretDown,
  IdentificationCard,
  SignOut,
  SpinnerGap,
  UserCircle,
} from "@phosphor-icons/react";
import { logoutAdminAction } from "@/app/actions/admin-auth-actions";
import { MobileAdminNav } from "./MobileAdminNav";
import { useAdminAccess } from "./AdminAccessContext";

type AdminTopbarProps = {
  displayName?: string | null;
  email?: string | null;
};

const ROLE_LABELS: Record<string, string> = {
  super_admin: "ผู้ดูแลระบบสูงสุด",
  admin: "ผู้ดูแลระบบ",
  province_admin: "ผู้ดูแลระดับจังหวัด",
  attraction_manager: "ผู้จัดการสถานที่",
  viewer: "ผู้ดูข้อมูล",
};

export function AdminTopbar({ displayName, email }: AdminTopbarProps) {
  const router = useRouter();
  const access = useAdminAccess();
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentName = access.displayName || displayName || "ผู้ดูแลระบบ";
  const currentEmail = access.email || email;
  const roleLabel = access.roleNames.length
    ? access.roleNames.map((role) => ROLE_LABELS[role] ?? role).join(", ")
    : "บัญชีผู้ดูแลระบบ";

  useEffect(() => {
    if (!isOpen) return;

    menuRef.current?.querySelector<HTMLElement>("[role='menuitem']")?.focus();

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function handleLogout() {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        const result = await logoutAdminAction();
        if (!result.success) {
          setErrorMessage(result.error);
          return;
        }

        setIsOpen(false);
        router.replace("/admin/login");
        router.refresh();
      } catch {
        setErrorMessage("ไม่สามารถออกจากระบบได้ กรุณาลองอีกครั้ง");
      }
    });
  }

  function handleMenuKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;

    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>("[role='menuitem']:not([disabled])")
    );
    if (!items.length) return;

    event.preventDefault();
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    if (event.key === "Home") items[0]?.focus();
    else if (event.key === "End") items.at(-1)?.focus();
    else if (event.key === "ArrowDown") items[(currentIndex + 1 + items.length) % items.length]?.focus();
    else items[(currentIndex - 1 + items.length) % items.length]?.focus();
  }

  return (
    <header data-admin-chrome className="sticky top-0 z-30 border-b border-[var(--admin-border)] bg-white px-4 md:px-5 lg:px-6 xl:px-7">
      <div className="flex min-h-16 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="lg:hidden">
            <MobileAdminNav />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-slate-950 sm:text-[15px]">Southern Border Tourism Data &amp; Intelligence Platform</p>
            <p className="hidden text-[11px] font-semibold text-slate-500 sm:block">ระบบข้อมูลและการวิเคราะห์เพื่อการวางแผนท่องเที่ยว</p>
          </div>
        </div>

        <div ref={menuRef} className="relative shrink-0">
          <button
            ref={triggerRef}
            type="button"
            onClick={() => {
              setErrorMessage(null);
              setIsOpen((current) => !current);
            }}
            className="flex min-h-11 items-center gap-2 rounded-[4px] border border-transparent bg-white px-2 py-1 text-left transition-colors hover:border-slate-200 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E77455] sm:px-2.5"
            aria-haspopup="menu"
            aria-expanded={isOpen}
            aria-controls="admin-account-menu"
            aria-label="เปิดเมนูบัญชีผู้ดูแลระบบ"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D94717] text-white">
              <UserCircle size={30} weight="fill" aria-hidden="true" />
            </span>
            <span className="hidden min-w-0 sm:block">
              <span className="block max-w-44 truncate text-sm font-bold text-slate-800">{currentName}</span>
              <span className="block max-w-44 truncate text-xs text-slate-500">{roleLabel}</span>
            </span>
            <CaretDown
              size={16}
              weight="bold"
              className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>

          {isOpen ? (
            <div
              id="admin-account-menu"
              role="menu"
              aria-label="เมนูบัญชีผู้ดูแลระบบ"
              onKeyDown={handleMenuKeyDown}
              className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-[6px] border border-slate-300 bg-white shadow-[0_4px_8px_rgba(15,23,42,0.12)]"
            >
              <div className="border-b border-slate-100 px-4 py-4">
                <p className="truncate text-sm font-bold text-slate-900">{currentName}</p>
                {currentEmail ? <p className="mt-1 truncate text-xs text-slate-500">{currentEmail}</p> : null}
                <p className="mt-2 text-xs font-bold text-[#B94727]">{roleLabel}</p>
              </div>

              <div className="p-2">
                <Link
                  href="/admin/profile"
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                  className="flex min-h-11 items-center gap-3 rounded-[4px] px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E77455]"
                >
                  <IdentificationCard size={20} aria-hidden="true" />
                  โปรไฟล์ผู้ดูแลระบบ
                </Link>
                <Link
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                  className="flex min-h-11 items-center gap-3 rounded-[4px] px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E77455]"
                >
                  <ArrowSquareOut size={20} aria-hidden="true" />
                  ไปยังเว็บไซต์หน้าบ้าน
                </Link>
              </div>

              <div className="border-t border-slate-100 p-2">
                {errorMessage ? (
                  <p className="mb-2 rounded-[4px] bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-700" role="alert">
                    {errorMessage}
                  </p>
                ) : null}
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  disabled={isPending}
                  className="flex min-h-11 w-full items-center gap-3 rounded-[4px] px-3 py-2 text-sm font-bold text-rose-700 transition-colors hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-600 disabled:cursor-wait disabled:opacity-60"
                >
                  {isPending ? (
                    <SpinnerGap size={20} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <SignOut size={20} aria-hidden="true" />
                  )}
                  {isPending ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
