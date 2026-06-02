"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChatCircleDots,
  CheckCircle,
  DeviceMobile,
  LockKey,
  Spinner,
  WarningCircle,
} from "@phosphor-icons/react";
import {
  isLineLiffConfigured,
  linkLineAccount,
  type LineLinkLanguage,
} from "@/lib/services/line-liff.client";

type LineLinkPanelProps = {
  context?: "certificate" | "passport" | "profile" | "account";
  language?: LineLinkLanguage;
  showContinueLink?: boolean;
  continueHref?: string;
  className?: string;
};

type UiState =
  | { kind: "idle" }
  | { kind: "redirecting" }
  | { kind: "success" }
  | { kind: "error"; message: string }
  | { kind: "not_configured" };

const contextCopy = {
  certificate: {
    eyebrow: "หลังรับใบประกาศ",
    title: "บันทึกพาสปอร์ตด้วย LINE",
    body: "เชื่อม LINE เพื่อกลับมาดูตราประทับและใบประกาศจากอุปกรณ์อื่นได้ในอนาคต",
  },
  passport: {
    eyebrow: "Digital Passport",
    title: "เก็บพาสปอร์ตไว้กับ LINE",
    body: "Guest passport จะอยู่บนเบราว์เซอร์นี้เท่านั้น LINE ช่วยให้กลับมาใช้งานข้ามอุปกรณ์ได้",
  },
  profile: {
    eyebrow: "Tourist Profile",
    title: "เชื่อม LINE เมื่อพร้อม",
    body: "บันทึกโปรไฟล์ท่องเที่ยวและพาสปอร์ตให้ค้นคืนได้ง่ายขึ้น โดยยังใช้งานแบบ Guest ต่อได้",
  },
  account: {
    eyebrow: "Account Linking",
    title: "เชื่อม LINE สำหรับพาสปอร์ต",
    body: "ใช้ LINE เพื่อยืนยันตัวตนกับระบบอย่างปลอดภัย และเก็บพาสปอร์ตสำหรับการใช้งานครั้งถัดไป",
  },
} satisfies Record<NonNullable<LineLinkPanelProps["context"]>, { eyebrow: string; title: string; body: string }>;

function resolveLanguage(language?: LineLinkLanguage): LineLinkLanguage {
  if (language) {
    return language;
  }

  if (typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("en")) {
    return "en";
  }

  return "th";
}

export function LineLinkPanel({
  context = "passport",
  language,
  showContinueLink = true,
  continueHref = "/passport",
  className = "",
}: LineLinkPanelProps) {
  const consentId = useId();
  const [hasConsented, setHasConsented] = useState(false);
  const [uiState, setUiState] = useState<UiState>({ kind: "idle" });
  const isConfigured = isLineLiffConfigured();
  const copy = contextCopy[context];
  const resolvedLanguage = useMemo(() => resolveLanguage(language), [language]);
  const isBusy = uiState.kind === "redirecting";

  const handleLinkLine = async () => {
    if (!isConfigured) {
      setUiState({ kind: "not_configured" });
      return;
    }

    if (!hasConsented) {
      setUiState({
        kind: "error",
        message: "กรุณายืนยันความยินยอมก่อนเชื่อม LINE",
      });
      return;
    }

    setUiState({ kind: "redirecting" });
    const result = await linkLineAccount({
      hasConsented: true,
      language: resolvedLanguage,
    });

    if (result.status === "linked") {
      setUiState({ kind: "success" });
      return;
    }

    if (result.status === "login_redirected") {
      return;
    }

    if (result.status === "not_configured") {
      setUiState({ kind: "not_configured" });
      return;
    }

    setUiState({
      kind: "error",
      message: result.message,
    });
  };

  return (
    <section className={`rounded-xl border border-ink/5 bg-white p-6 shadow-sm ${className}`}>
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-orange-50 text-[#E18868]">
          <ChatCircleDots size={24} weight="fill" />
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#E18868]">{copy.eyebrow}</p>
          <h2 className="mt-1 text-xl font-black leading-tight text-ink">{copy.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{copy.body}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        <div className="rounded-2xl bg-background p-5 border border-ink/5">
          <div className="flex gap-3">
            <DeviceMobile className="mt-0.5 shrink-0 text-[#E18868]" size={20} weight="fill" />
            <p className="text-sm leading-6 text-ink">
              ใช้งานต่อแบบ Guest ได้เสมอ พาสปอร์ตจะถูกเก็บไว้บนเบราว์เซอร์/อุปกรณ์นี้
            </p>
          </div>
          <div className="mt-3 flex gap-3">
            <LockKey className="mt-0.5 shrink-0 text-ink/40" size={20} weight="fill" />
            <p className="text-sm leading-6 text-ink">
              การเชื่อม LINE ใช้เพื่อบันทึกพาสปอร์ตเท่านั้น ไม่ใช่ความยินยอมรับข้อความประชาสัมพันธ์
            </p>
          </div>
        </div>

        {isConfigured ? (
          <label
            htmlFor={consentId}
            className="flex cursor-pointer gap-3 rounded-2xl border border-[#E18868]/15 bg-orange-50/60 p-5 text-sm leading-6 text-ink hover:bg-orange-50 transition-colors"
          >
            <input
              id={consentId}
              type="checkbox"
              checked={hasConsented}
              onChange={(event) => {
                setHasConsented(event.target.checked);
                if (uiState.kind === "error") {
                  setUiState({ kind: "idle" });
                }
              }}
              className="mt-1 h-5 w-5 shrink-0 rounded border-[#E18868]/30 text-[#E18868] accent-[#E18868]"
            />
            <span>
              ฉันยินยอมให้เชื่อมบัญชี LINE กับพาสปอร์ตท่องเที่ยว เพื่อบันทึกตราประทับและค้นคืนพาสปอร์ตในภายหลัง
            </span>
          </label>
        ) : (
          <div className="rounded-2xl border border-ink/10 bg-background p-5 text-sm leading-6 text-muted">
            ระบบยังไม่ได้เปิดใช้ LINE LIFF ในสภาพแวดล้อมนี้ คุณยังสามารถดูพาสปอร์ตและดาวน์โหลดใบประกาศต่อแบบ Guest ได้ตามปกติ
          </div>
        )}

        {uiState.kind === "success" && (
          <div className="flex gap-3 rounded-2xl bg-[#E18868]/10 p-5 text-sm font-semibold leading-6 text-[#E18868]">
            <CheckCircle className="mt-0.5 shrink-0" size={20} weight="fill" />
            <span>เชื่อม LINE สำเร็จ พาสปอร์ตของคุณพร้อมสำหรับการใช้งานครั้งถัดไปแล้ว</span>
          </div>
        )}

        {uiState.kind === "error" && (
          <div className="flex gap-3 rounded-2xl border border-red-500/20 bg-red-50 p-5 text-sm font-semibold leading-6 text-red-500">
            <WarningCircle className="mt-0.5 shrink-0" size={20} weight="fill" />
            <span>{uiState.message}</span>
          </div>
        )}

        {uiState.kind === "not_configured" && (
          <div className="flex gap-3 rounded-2xl border border-ink/10 bg-background p-5 text-sm font-semibold leading-6 text-ink">
            <WarningCircle className="mt-0.5 shrink-0 text-ink/40" size={20} weight="fill" />
            <span>LINE ยังไม่พร้อมใช้งานในตอนนี้ คุณสามารถใช้ Guest ต่อได้โดยไม่เสียสิทธิ์ใบประกาศหรือตราประทับ</span>
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-3">
        <button
          type="button"
          onClick={handleLinkLine}
          disabled={!isConfigured || isBusy || uiState.kind === "success"}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#06C755] px-6 py-4 text-sm font-black text-white shadow-sm transition hover:bg-[#05B34C] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        >
          {isBusy ? <Spinner size={20} className="animate-spin" /> : <ChatCircleDots size={20} weight="bold" />}
          {uiState.kind === "success" ? "เชื่อม LINE แล้ว" : "เชื่อม LINE เพื่อบันทึกพาสปอร์ต"}
        </button>

        {showContinueLink && (
          <Link
            href={continueHref}
            className="flex min-h-12 items-center justify-center rounded-full bg-background border border-ink/5 px-6 py-4 text-center text-sm font-bold text-ink hover:bg-white transition-colors"
          >
            ใช้งานต่อแบบ Guest
          </Link>
        )}
      </div>

      <p className="mt-4 text-xs leading-5 text-muted">
        LINE เป็นทางเลือกเสริมเท่านั้น Certificate, stamp และ survey ยังใช้งานได้โดยไม่ต้องเชื่อมบัญชี
      </p>
    </section>
  );
}
