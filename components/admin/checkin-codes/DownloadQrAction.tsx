"use client";

import { DownloadSimple } from "@phosphor-icons/react";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useMemo, useRef, useState } from "react";

type DownloadQrActionProps = {
  code: string;
  label?: string | null;
  buttonLabel?: string;
  showLabel?: boolean;
  disabled?: boolean;
};

export function DownloadQrAction({
  code,
  label,
  buttonLabel = "Download QR",
  showLabel = false,
  disabled = false,
}: DownloadQrActionProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const safeCode = code.trim();
  const isReady = !disabled && /^[a-z0-9_-]{3,100}$/.test(safeCode);
  const url = `${origin}/c/${safeCode || "your-code"}`;
  const filename = useMemo(() => {
    const filenameLabel = safeCode || label || "checkin-code";
    const safeLabel = filenameLabel
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    return `qrcode-${safeLabel || "checkin-code"}.png`;
  }, [label, safeCode]);

  const handleDownload = () => {
    if (!isReady || !qrRef.current) return;
    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;

    const finalCanvas = document.createElement("canvas");
    const ctx = finalCanvas.getContext("2d");
    if (!ctx) return;

    const qrSize = canvas.width;
    const padding = 44;
    const textHeight = label ? 92 : 70;

    finalCanvas.width = qrSize + padding * 2;
    finalCanvas.height = qrSize + padding * 2 + textHeight;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
    ctx.drawImage(canvas, padding, padding);

    ctx.fillStyle = "#000000";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`Code: ${safeCode}`, finalCanvas.width / 2, finalCanvas.height - (label ? 58 : 30));

    if (label) {
      ctx.font = "16px sans-serif";
      ctx.fillText(label, finalCanvas.width / 2, finalCanvas.height - 32);
      ctx.font = "14px sans-serif";
      ctx.fillStyle = "#334155";
      ctx.fillText(`/c/${safeCode}`, finalCanvas.width / 2, finalCanvas.height - 10);
    }

    const dataUrl = finalCanvas.toDataURL("image/png");
    const anchor = document.createElement("a");
    anchor.href = dataUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  return (
    <>
      <div className="hidden" ref={qrRef} aria-hidden="true">
        <QRCodeCanvas value={url} size={500} level="H" marginSize={2} />
      </div>

      <button
        type="button"
        onClick={handleDownload}
        disabled={!isReady}
        title={buttonLabel}
        aria-label={`${buttonLabel} ${safeCode ? `for ${safeCode}` : ""}`.trim()}
        className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-black transition ${
          isReady
            ? "border border-[#0A6B62]/30 bg-white text-[#073F37] hover:bg-[#E6F4EF]"
            : "cursor-not-allowed border border-slate-200 bg-slate-50 text-slate-400"
        }`}
      >
        <DownloadSimple size={18} weight="bold" />
        {showLabel ? <span>{buttonLabel}</span> : null}
      </button>
    </>
  );
}
