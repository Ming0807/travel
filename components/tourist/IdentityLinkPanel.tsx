"use client";

import { useState } from "react";
import { LinkBreak, EnvelopeSimple, DeviceMobile } from "@phosphor-icons/react";

type IdentityProvider = "anonymous_device" | "line" | "google" | "email";

type LinkedIdentity = {
  provider: IdentityProvider;
  isPrimary: boolean;
  linkedAt?: string;
};

type IdentityLinkPanelProps = {
  touristId: string;
  existingIdentities: LinkedIdentity[];
};

type LinkState =
  | { status: "idle" }
  | { status: "linking"; provider: IdentityProvider }
  | { status: "success"; provider: IdentityProvider }
  | { status: "error"; provider: IdentityProvider; message: string };

export function IdentityLinkPanel({
  touristId,
  existingIdentities,
}: IdentityLinkPanelProps) {
  const [linkState, setLinkState] = useState<LinkState>({ status: "idle" });
  const [email, setEmail] = useState("");

  const hasIdentity = (provider: IdentityProvider) =>
    existingIdentities.some((i) => i.provider === provider);

  const handleLinkLine = async () => {
    setLinkState({ status: "linking", provider: "line" });
    try {
      const response = await fetch("/api/line/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ touristId }),
      });
      const data = await response.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        setLinkState({
          status: "error",
          provider: "line",
          message: "Could not initiate LINE linking.",
        });
      }
    } catch {
      setLinkState({
        status: "error",
        provider: "line",
        message: "Network error. Please try again.",
      });
    }
  };

  const handleLinkEmail = async () => {
    if (!email || !email.includes("@")) {
      setLinkState({
        status: "error",
        provider: "email",
        message: "Please enter a valid email address.",
      });
      return;
    }

    setLinkState({ status: "linking", provider: "email" });
    try {
      const response = await fetch("/api/identity/link-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ touristId, email }),
      });
      const data = await response.json();
      if (data.success) {
        setLinkState({ status: "success", provider: "email" });
      } else {
        setLinkState({
          status: "error",
          provider: "email",
          message: data.error || "Failed to link email.",
        });
      }
    } catch {
      setLinkState({
        status: "error",
        provider: "email",
        message: "Network error. Please try again.",
      });
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-600">
          <LinkBreak size={20} weight="duotone" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">เชื่อมต่อพาสปอร์ต</h3>
          <p className="text-xs text-slate-500">
            ผูกบัญชีเพื่อกู้คืนพาสปอร์ตและตราประทับบนเครื่องอื่น
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Anonymous device — always linked */}
        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
          <div className="flex items-center gap-3">
            <DeviceMobile size={18} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-600">
              อุปกรณ์นี้
            </span>
          </div>
          <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-teal-700">
            Connected
          </span>
        </div>

        {/* LINE */}
        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
          <div className="flex items-center gap-3">
            <span className="text-lg">💬</span>
            <span className="text-sm font-semibold text-slate-600">LINE</span>
          </div>
          {hasIdentity("line") ? (
            <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-teal-700">
              Linked
            </span>
          ) : (
            <button
              onClick={handleLinkLine}
              disabled={linkState.status === "linking"}
              className="rounded-lg bg-[#06C755] px-4 py-1.5 text-xs font-bold text-white transition hover:bg-green-600 disabled:opacity-50"
            >
              {linkState.status === "linking" && linkState.provider === "line"
                ? "Connecting..."
                : "Connect"}
            </button>
          )}
          {linkState.status === "error" && linkState.provider === "line" && (
            <p className="mt-1 text-[11px] text-red-500">
              {linkState.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="mb-2 flex items-center gap-3">
            <EnvelopeSimple size={18} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-600">อีเมล</span>
            {hasIdentity("email") && (
              <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-teal-700">
                Linked
              </span>
            )}
          </div>
          {!hasIdentity("email") && (
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none transition focus:border-teal"
              />
              <button
                onClick={handleLinkEmail}
                disabled={linkState.status === "linking"}
                className="shrink-0 rounded-lg bg-[#0A6B62] px-4 py-1.5 text-xs font-bold text-white transition hover:bg-[#085A53] disabled:opacity-50"
              >
                {linkState.status === "linking" && linkState.provider === "email"
                  ? "Sending..."
                  : "Link"}
              </button>
            </div>
          )}
          {linkState.status === "error" && linkState.provider === "email" && (
            <p className="mt-1 text-[11px] text-red-500">
              {linkState.message}
            </p>
          )}
          {linkState.status === "success" && linkState.provider === "email" && (
            <p className="mt-1 text-[11px] text-teal-600">
              ✓ Linked successfully. Your passport can now be recovered via email.
            </p>
          )}
        </div>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-slate-400">
        การเชื่อมต่อพาสปอร์ตจะช่วยให้คุณกู้คืนตราประทับที่สะสมไว้ได้
        หากเปลี่ยนเครื่องหรือล้างคุกกี้ ข้อมูลของคุณจะถูกเก็บเป็นความลับ
      </p>
    </div>
  );
}
