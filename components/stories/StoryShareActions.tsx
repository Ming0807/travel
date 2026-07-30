"use client";

import { useState } from "react";
import { Check, ShareNetwork } from "@phosphor-icons/react";

export function StoryShareActions({
  title,
  url,
}: {
  title: string;
  url: string;
}) {
  const [copied, setCopied] = useState(false);

  const shareStory = async () => {
    if (navigator.share) {
      await navigator.share({ title, url });
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2_000);
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => void shareStory()}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 hover:bg-slate-50"
      >
        {copied ? (
          <Check size={18} weight="bold" aria-hidden="true" />
        ) : (
          <ShareNetwork size={18} weight="bold" aria-hidden="true" />
        )}
        {copied ? "คัดลอกลิงก์แล้ว" : "แชร์เรื่องนี้"}
      </button>
      <p className="sr-only" aria-live="polite">
        {copied ? "คัดลอกลิงก์เรื่องราวแล้ว" : ""}
      </p>
    </div>
  );
}
