"use client";

import Link from "next/link";
import { useState } from "react";
import { GoogleLogo, ChatCircleDots, ShieldCheck, Spinner } from "@phosphor-icons/react";
import type { Provider as SupabaseProvider } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Provider = "google" | "line";

export function TouristAuthGate({ title = "กรุณาเข้าสู่ระบบ", description = "เพื่อป้องกันสแปมและรักษาคุณภาพของเรื่องราว กรุณาเข้าสู่ระบบก่อนเริ่มแบ่งปันประสบการณ์ของคุณ" }: { title?: string, description?: string }) {
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async (provider: Provider) => {
    setLoadingProvider(provider);
    setErrorMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as SupabaseProvider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}`,
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
    <div className="mx-auto max-w-[420px] w-full">
      <div className="rounded-[8px] border border-ink/10 bg-white p-7 shadow-[0_8px_24px_rgb(15,23,42,0.04)] sm:p-9">
        <div>
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-[8px] bg-teal/5 text-teal">
            <ShieldCheck size={28} weight="fill" />
          </div>

          <h2 className="text-2xl font-semibold text-center text-ink tracking-tight mb-3">
            {title}
          </h2>

          <p className="mb-8 text-center text-sm leading-7 text-ink/60">
            {description}
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

          <p className="mt-7 text-center text-xs leading-6 text-ink/50">
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
