"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import { DownloadSimple, ArrowLeft, Spinner } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { CertificateArtwork } from "@/components/certificate/CertificateArtwork";
import type { CertificateTemplateLayout } from "@/lib/certificate/certificate-template-layout";

interface CertificatePreviewProps {
  visitId: string;
  photoId: string;
  previewUrl: string;
  touristName: string;
  attractionName: string;
  provinceName: string;
  visitDate: string;
  templateId: number;
  templateName: string;
  templateBackgroundUrl: string;
  language: "th" | "en";
  layout: CertificateTemplateLayout;
}

export function CertificatePreview({
  visitId,
  photoId,
  previewUrl,
  touristName,
  attractionName,
  provinceName,
  visitDate,
  templateId,
  templateName,
  templateBackgroundUrl,
  language,
  layout,
}: CertificatePreviewProps) {
  const router = useRouter();
  const certRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!certRef.current) return;
    setIsGenerating(true);
    setError(null);

    try {
      // 1. Capture DOM as PNG
      const dataUrl = await toPng(certRef.current, {
        cacheBust: true,
        quality: 1,
        pixelRatio: 2,
      });

      // 2. Upload to server
      const res = await fetch("/api/certificate/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitId,
          photoId,
          templateId,
          language,
          base64Image: dataUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Generation failed");
      }

      // 3. Navigate to success page
      router.push(`/visit/${visitId}/certificate/success?certId=${data.certificateId}&stamp=${data.stamp?.status || "none"}`);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "สร้างใบประกาศไม่สำเร็จ กรุณาลองใหม่";
      setError(msg);
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-6 mx-auto animate-in fade-in duration-500">
      
      {/* Action Bar */}
      <div className="w-full flex justify-between items-center px-2 animate-in fade-in slide-in-from-top-2 duration-500 delay-100 fill-mode-both">
        <Link 
          href={`/visit/${visitId}/photo`} 
          className="text-ink-light flex items-center gap-1 hover:text-ink transition-colors"
        >
          <ArrowLeft weight="bold" /> เปลี่ยนรูป
        </Link>
        <span className="text-teal font-semibold text-sm tracking-wide uppercase">ขั้นตอนที่ 3/3</span>
      </div>

      {error && (
        <div className="w-full bg-red-50 text-red-600 p-3 rounded-xl text-sm animate-in fade-in duration-300">
          {error}
        </div>
      )}

      {/* Certificate DOM to Capture */}
      <div
        className={`relative w-full overflow-hidden rounded-2xl border-4 border-white shadow-lg animate-in fade-in zoom-in-95 duration-700 delay-200 fill-mode-both ${
          layout.orientation === "landscape" ? "aspect-[1.414/1] max-w-[560px]" : "aspect-[4/5] max-w-[400px]"
        }`}
      >
        <div ref={certRef} className="absolute inset-0">
          <CertificateArtwork
            layout={layout}
            templateBackgroundUrl={templateBackgroundUrl}
            previewUrl={previewUrl}
            touristName={touristName}
            attractionName={attractionName}
            provinceName={provinceName}
            visitDate={visitDate}
          />
        </div>

        {/* Loading Shimmer Overlay */}
        {isGenerating && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-teal/30 via-teal/60 to-teal/30 animate-pulse" />
              <div className="space-y-2 text-center">
                <div className="h-4 w-48 rounded-full bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 animate-pulse mx-auto" />
                <div className="h-3 w-32 rounded-full bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 animate-pulse mx-auto" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="w-full bg-white p-6 rounded-2xl border border-ink/5 mt-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
        <p className="mb-2 text-xs font-semibold text-[#0A6B62]">
          รูปแบบ: {templateName}
        </p>
        <h3 className="font-bold text-lg text-ink mb-2">ยืนยันและสร้างใบประกาศ</h3>
        <p className="text-sm text-muted mb-6">
          คุณสามารถบันทึกภาพนี้เพื่อเก็บเป็นความทรงจำ หรือแชร์ให้เพื่อนๆ ได้
        </p>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-4 rounded-full bg-[#E18868] text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transition-all hover:bg-[#D07757] hover:scale-[1.01] active:scale-[0.99] shadow-sm"
        >
          {isGenerating ? (
            <><Spinner className="animate-spin" size={20} /> กำลังสร้างใบประกาศ...</>
          ) : (
            <><DownloadSimple weight="bold" size={20} /> สร้างใบประกาศดิจิทัล</>
          )}
        </button>
      </div>
    </div>
  );
}
