"use client";

import { useState } from "react";
import { GoogleLogo, ChatCircleDots, ShieldCheck, Spinner } from "@phosphor-icons/react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Provider = "google" | "line";

export function TouristAuthGate({ title = "กรุณาเข้าสู่ระบบ", description = "เพื่อป้องกันสแปมและรักษาคุณภาพของเรื่องราว กรุณาเข้าสู่ระบบก่อนเริ่มแบ่งปันประสบการณ์ของคุณ" }: { title?: string, description?: string }) {
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);

  const handleSignIn = async (provider: Provider) => {
    setLoadingProvider(provider);
    const supabase = createSupabaseBrowserClient();

    await supabase.auth.signInWithOAuth({
      provider: provider as any,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}`,
      },
    });
  };

  return (
    <div className="mx-auto max-w-[420px] w-full">
      <div className="rounded-2xl bg-white p-8 sm:p-10 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-ink/5 relative overflow-hidden transition-all">
        {/* Background blobs for premium feel */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-coral/5 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-teal/5 text-teal">
            <ShieldCheck size={28} weight="fill" />
          </div>

          <h2 className="text-2xl font-semibold text-center text-ink tracking-tight mb-3">
            {title}
          </h2>

          <p className="text-center text-ink/60 text-[15px] leading-relaxed mb-10">
            {description}
          </p>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleSignIn("google")}
              disabled={loadingProvider !== null}
              className="group flex min-h-[52px] w-full items-center justify-center gap-3 rounded-full bg-white border border-ink/10 px-6 py-3.5 text-[15px] font-semibold text-ink transition-all hover:bg-slate-50 hover:border-ink/20 disabled:cursor-not-allowed disabled:opacity-50"
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
              className="group flex min-h-[52px] w-full items-center justify-center gap-3 rounded-full bg-[#06C755] px-6 py-3.5 text-[15px] font-semibold text-white transition-all hover:bg-[#05B34C] hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loadingProvider === "line" ? (
                <Spinner size={20} className="animate-spin" />
              ) : (
                <ChatCircleDots size={20} weight="fill" className="transition-transform group-hover:scale-110" />
              )}
              เข้าสู่ระบบด้วย LINE
            </button>
          </div>

          <p className="mt-8 text-center text-[13px] leading-relaxed text-ink/40">
            การดำเนินการต่อถือว่ายอมรับเงื่อนไขการให้บริการ<br/>และนโยบายความเป็นส่วนตัว
          </p>
        </div>
      </div>
    </div>
  );
}
