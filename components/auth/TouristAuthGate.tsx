"use client";

import Link from "next/link";
import { useState } from "react";
import { GoogleLogo, ChatCircleDots, ShieldCheck, Spinner } from "@phosphor-icons/react";
import type { Provider as SupabaseProvider } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { resolveSafeAuthDestination } from "@/lib/auth/oauth";

type Provider = "google" | "line";

type TouristAuthGateProps = {
  title?: string;
  description?: string;
  nextPath?: string;
  guestHref?: string;
  initialError?: string | null;
  headingLevel?: 1 | 2;
};

export function TouristAuthGate({
  title = "เข้าสู่ระบบเมื่อต้องการเก็บพาสปอร์ตข้ามอุปกรณ์",
  description = "ใช้ Google หรือ LINE เพื่อกลับมาดูพาสปอร์ตและจัดการเรื่องราวของคุณได้ภายหลัง",
  nextPath,
  guestHref = "/attractions",
  initialError = null,
  headingLevel = 2,
}: TouristAuthGateProps) {
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError);
  const Heading = headingLevel === 1 ? "h1" : "h2";

  const handleSignIn = async (provider: Provider) => {
    setLoadingProvider(provider);
    setErrorMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const destination = resolveSafeAuthDestination(nextPath ?? window.location.pathname);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as SupabaseProvider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination)}`,
        },
      });

      if (error) {
        setErrorMessage("ยังไม่สามารถเปิดหน้าล็อกอินได้ กรุณาลองใหม่");
      }
    } catch {
      setErrorMessage("ยังไม่สามารถเปิดหน้าล็อกอินได้ กรุณาลองใหม่");
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-[var(--public-radius-panel)] border border-slate-200 bg-white p-7 sm:p-9">
        <div>
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-teal/5 text-teal">
            <ShieldCheck size={28} weight="fill" />
          </div>

          <Heading className="mb-3 text-center text-2xl font-semibold tracking-tight text-ink">
            {title}
          </Heading>

          <p className="mb-6 text-center text-base leading-7 text-slate-600">
            {description}
          </p>

          <p className="mb-7 border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            การเข้าสู่ระบบจะสร้างหรือเชื่อมโปรไฟล์นักเดินทาง หากพบบันทึกแบบผู้เยี่ยมชมบนอุปกรณ์นี้ ระบบจะให้คุณยืนยันก่อนรวมข้อมูลเสมอ
          </p>

          {errorMessage ? (
            <p role="alert" className="mb-4 border border-red-200 bg-red-50 p-3 text-center text-sm font-semibold text-red-700">
              {errorMessage}
            </p>
          ) : null}

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleSignIn("google")}
              disabled={loadingProvider !== null}
              className="group flex min-h-12 w-full items-center justify-center gap-3 rounded-[6px] border border-ink/15 bg-white px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/30 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingProvider === "google" ? (
                <Spinner size={20} className="animate-spin text-ink/50" />
              ) : (
                <GoogleLogo size={20} weight="bold" className="text-[#DB4437] transition-transform group-hover:scale-110" />
              )}
              เข้าสู่ระบบด้วย Google
            </button>

            <button
              type="button"
              onClick={() => handleSignIn("line")}
              disabled={loadingProvider !== null}
              className="group flex min-h-12 w-full items-center justify-center gap-3 rounded-[6px] bg-[#06C755] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#05B34C] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loadingProvider === "line" ? (
                <Spinner size={20} className="animate-spin" />
              ) : (
                <ChatCircleDots size={20} weight="fill" className="transition-transform group-hover:scale-110" />
              )}
              เข้าสู่ระบบด้วย LINE
            </button>
          </div>

          <Link
            href={guestHref}
            className="mt-4 flex min-h-12 w-full items-center justify-center rounded-[var(--public-radius-control)] px-5 py-3 text-sm font-semibold text-teal hover:bg-teal/5"
          >
            ใช้งานต่อโดยไม่เข้าสู่ระบบ
          </Link>

          <p className="mt-5 text-center text-xs leading-6 text-slate-600">
            ก่อนใช้งาน โปรดอ่าน{" "}
            <Link href="/terms" className="font-semibold text-teal underline underline-offset-2">
              เงื่อนไขการใช้บริการ
            </Link>{" "}
            และ{" "}
            <Link href="/privacy" className="font-semibold text-teal underline underline-offset-2">
              นโยบายความเป็นส่วนตัว
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
