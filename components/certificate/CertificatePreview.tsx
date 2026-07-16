"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import { DownloadSimple, ArrowLeft, Spinner, Stamp } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

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
  orientation: "landscape" | "portrait";
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
  orientation,
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
          orientation === "landscape" ? "aspect-[1.414/1] max-w-[560px]" : "aspect-[4/5] max-w-[400px]"
        }`}
      >
        <div 
          ref={certRef} 
          className="absolute inset-0 bg-white flex flex-col justify-between"
        >
          {templateBackgroundUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={templateBackgroundUrl}
              alt=""
              aria-hidden="true"
              crossOrigin="anonymous"
              className="absolute inset-0 z-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 z-0 bg-[#F4F1EA]" />
          )}
          <div className="absolute inset-0 z-0 bg-white/10" />
          
          <div className={`relative z-10 flex h-full flex-col items-center text-center ${
            orientation === "landscape" ? "p-3 sm:p-5" : "p-8 pt-10"
          }`}>
            <h2 className={`${orientation === "landscape" ? "text-base sm:text-xl" : "text-2xl"} mb-1 font-bold uppercase tracking-widest text-ink`}>Travel Memory</h2>
            <p className={`${orientation === "landscape" ? "mb-2 text-[8px] sm:text-[10px]" : "mb-6 text-xs"} font-semibold tracking-widest text-gold`}>SOUTHERN BORDER DIGITAL PASSPORT</p>

            <div className={`flex w-full flex-1 items-center justify-center ${orientation === "landscape" ? "flex-row gap-3 sm:gap-6" : "flex-col"}`}>
              <div className={`${orientation === "landscape" ? "h-20 w-20 sm:h-28 sm:w-28" : "mb-6 h-48 w-48"} flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-teal/10 to-coral/10 shadow-lg`}>
                {previewUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={previewUrl} alt="Tourist Memory" className="h-full w-full object-cover" crossOrigin="anonymous" />
                ) : (
                  <div className="flex flex-col items-center text-ink/30">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span className="mt-1 text-[9px] font-medium">No photo</span>
                  </div>
                )}
              </div>

              <div className={`flex min-w-0 flex-col justify-center ${orientation === "landscape" ? "flex-1 text-left" : "w-full flex-1 text-center"}`}>
                <h3 className={`${orientation === "landscape" ? "text-base sm:text-xl" : "text-2xl"} mb-1 line-clamp-2 break-words font-bold text-ink`}>{touristName}</h3>
                <p className={`${orientation === "landscape" ? "mb-2 text-[10px] sm:text-xs" : "mb-4 text-sm"} font-medium text-ink-light`}>has visited</p>

                <div className={`${orientation === "landscape" ? "px-3 py-2" : "px-4 py-3"} w-full rounded-lg border border-gold/30 bg-white/70`}>
                  <p className={`${orientation === "landscape" ? "text-xs sm:text-sm" : "text-base"} line-clamp-2 font-bold leading-tight text-teal`}>{attractionName}</p>
                  <p className="mt-1 text-[10px] text-ink-light sm:text-xs">{provinceName}</p>
                </div>
              </div>
            </div>

            <div className={`flex w-full items-end justify-between ${orientation === "landscape" ? "mt-1" : "mt-4"}`}>
              <div className="text-left">
                <p className="text-[8px] font-semibold uppercase tracking-wider text-ink-light sm:text-[10px]">Date</p>
                <p className="text-[9px] font-medium text-ink sm:text-xs">{visitDate}</p>
              </div>
              <div className={`${orientation === "landscape" ? "h-7 w-7 sm:h-9 sm:w-9" : "h-10 w-10"} flex items-center justify-center rounded-full bg-gold/20 text-gold`}>
                <Stamp weight="fill" className={orientation === "landscape" ? "h-4 w-4 sm:h-5 sm:w-5" : "h-6 w-6"} />
              </div>
            </div>
          </div>
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
