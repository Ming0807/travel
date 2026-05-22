"use client";

import { DownloadSimple } from "@phosphor-icons/react";
import { QRCodeCanvas } from "qrcode.react";
import { useRef } from "react";

export function DownloadQrAction({ 
  code, 
  label 
}: { 
  code: string; 
  label: string; 
}) {
  const qrRef = useRef<HTMLDivElement>(null);

  // The full URL that tourists will scan
  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/c/${code}`;
  
  // Safe filename
  const filename = `qrcode-${label ? label.replace(/[^a-zA-Z0-9]/g, "-") : code}.png`;

  const handleDownload = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;

    // Create a new canvas to add padding and text
    const finalCanvas = document.createElement("canvas");
    const ctx = finalCanvas.getContext("2d");
    if (!ctx) return;

    const qrSize = canvas.width;
    const padding = 40;
    const textHeight = 60;
    
    finalCanvas.width = qrSize + (padding * 2);
    finalCanvas.height = qrSize + (padding * 2) + textHeight;

    // Fill background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

    // Draw QR code
    ctx.drawImage(canvas, padding, padding);

    // Draw Text
    ctx.fillStyle = "#000000";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`Code: ${code}`, finalCanvas.width / 2, finalCanvas.height - 30);
    if (label) {
      ctx.font = "16px sans-serif";
      ctx.fillText(label, finalCanvas.width / 2, finalCanvas.height - 10);
    }

    // Trigger download
    const dataUrl = finalCanvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      {/* Hidden QR Code canvas for generating image */}
      <div className="hidden" ref={qrRef}>
        <QRCodeCanvas 
          value={url} 
          size={500} 
          level="H"
          marginSize={2}
        />
      </div>

      <button
        onClick={handleDownload}
        title="ดาวน์โหลด QR Code"
        className="p-2 text-slate-400 hover:text-[#0A6B62] hover:bg-slate-100 rounded-md transition-colors"
      >
        <DownloadSimple size={20} weight="bold" />
      </button>
    </>
  );
}
