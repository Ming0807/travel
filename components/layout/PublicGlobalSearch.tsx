"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import {
  buildHomepageSearchHref,
  PUBLIC_SEARCH_CATEGORY_OPTIONS,
  type HomepageSearchCategory,
} from "@/components/homepage/HomepageSearch";

type PublicGlobalSearchProps = {
  onOpen?: () => void;
};

export function PublicGlobalSearch({ onOpen }: PublicGlobalSearchProps) {
  const router = useRouter();
  const dialogId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<HomepageSearchCategory>("attractions");

  function openSearch() {
    onOpen?.();
    setIsOpen(true);
  }

  function closeSearch({ restoreFocus = true } = {}) {
    setIsOpen(false);
    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  }

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => inputRef.current?.focus());

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSearch();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  function keepFocusInsideDialog(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), [href]',
    );
    if (!focusable?.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const href = buildHomepageSearchHref(category, query);
    closeSearch({ restoreFocus: false });
    router.push(href);
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="ค้นหาทั่วเว็บไซต์"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={dialogId}
        onClick={openSearch}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-[6px] text-ink transition-colors hover:bg-ink/5 hover:text-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
      >
        <MagnifyingGlass size={20} weight="bold" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-start justify-center bg-black/45 px-4 pb-6 pt-[max(5rem,env(safe-area-inset-top))] backdrop-blur-[2px] sm:pt-28"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeSearch();
          }}
        >
          <div
            ref={dialogRef}
            id={dialogId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${dialogId}-title`}
            onKeyDown={keepFocusInsideDialog}
            className="w-full max-w-2xl border border-black/10 bg-[var(--public-canvas)] shadow-2xl"
          >
            <div className="flex items-start justify-between gap-5 border-b border-black/10 px-5 py-5 sm:px-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--public-coral-strong)]">ค้นหาทั่วเว็บไซต์</p>
                <h2 id={`${dialogId}-title`} className="mt-1 text-xl font-bold text-[var(--public-ink)] sm:text-2xl">
                  ค้นหาข้อมูลท่องเที่ยว
                </h2>
                <p className="mt-1 text-sm leading-6 text-black/60">เลือกประเภทข้อมูล แล้วค้นหาจากรายการที่เผยแพร่จริง</p>
              </div>
              <button
                type="button"
                onClick={() => closeSearch()}
                aria-label="ปิดการค้นหา"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-[6px] text-black/55 transition-colors hover:bg-black/5 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-coral-strong)]"
              >
                <X size={22} weight="bold" aria-hidden="true" />
              </button>
            </div>

            <form role="search" aria-label="ค้นหาทั่วเว็บไซต์" onSubmit={handleSubmit} className="space-y-5 px-5 py-6 sm:px-7">
              <div>
                <label htmlFor={`${dialogId}-query`} className="mb-2 block text-sm font-bold text-[var(--public-ink)]">
                  คำค้นหา
                </label>
                <div className="flex min-h-14 items-center border border-black/15 bg-white focus-within:border-[var(--public-coral-strong)] focus-within:ring-4 focus-within:ring-[var(--public-coral)]/10">
                  <MagnifyingGlass className="ml-4 shrink-0 text-black/45" size={21} weight="bold" aria-hidden="true" />
                  <input
                    ref={inputRef}
                    id={`${dialogId}-query`}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    maxLength={100}
                    placeholder="เช่น น้ำตก โรตี หรือชื่อที่พัก"
                    className="min-w-0 flex-1 bg-transparent px-3 py-3 text-base text-[var(--public-ink)] outline-none placeholder:text-black/40"
                  />
                </div>
              </div>

              <div>
                <label htmlFor={`${dialogId}-category`} className="mb-2 block text-sm font-bold text-[var(--public-ink)]">
                  ประเภทเนื้อหา
                </label>
                <select
                  id={`${dialogId}-category`}
                  value={category}
                  onChange={(event) => setCategory(event.target.value as HomepageSearchCategory)}
                  className="min-h-12 w-full border border-black/15 bg-white px-3 text-base font-semibold text-[var(--public-ink)] outline-none focus:border-[var(--public-coral-strong)] focus:ring-4 focus:ring-[var(--public-coral)]/10"
                >
                  {PUBLIC_SEARCH_CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-black/10 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => closeSearch()}
                  className="min-h-11 border border-black/15 px-5 text-sm font-bold text-[var(--public-ink)] transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-coral-strong)]"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center justify-center gap-2 bg-[var(--public-coral-strong)] px-6 text-sm font-bold text-white transition-colors hover:bg-[#C95C3F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-ink)] focus-visible:ring-offset-2"
                >
                  <MagnifyingGlass size={19} weight="bold" aria-hidden="true" />
                  ค้นหา
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
