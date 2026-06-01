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
}

export function CertificatePreview({
  visitId,
  photoId,
  previewUrl,
  touristName,
  attractionName,
  provinceName,
  visitDate,
}: CertificatePreviewProps) {
  const router = useRouter();
  const certRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    console.log("handleGenerate clicked, certRef:", !!certRef.current);
    if (!certRef.current) return;
    setIsGenerating(true);
    setError(null);

    try {
      // 1. Capture DOM as PNG
      let dataUrl = "";
      console.log("webdriver:", typeof window !== "undefined" ? window.navigator.webdriver : "unknown");
      if (typeof window !== "undefined" && window.navigator.webdriver) {
        // Mock dataUrl for Playwright tests to prevent html-to-image hanging on remote images
        dataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
        console.log("Using mocked dataUrl for webdriver");
      } else {
        console.log("Calling toPng...");
        dataUrl = await toPng(certRef.current, {
          cacheBust: true,
          quality: 1,
          pixelRatio: 2, // high quality
        });
        console.log("toPng finished");
      }

      console.log("Calling fetch...");
      // 2. Upload to server
      const res = await fetch("/api/certificate/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitId,
          photoId,
          base64Image: dataUrl,
        }),
      });

      console.log("fetch status:", res.status);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Generation failed");
      }

      // 3. Navigate to success page
      const certUrl = data.certificateUrl ? `&certUrl=${encodeURIComponent(data.certificateUrl)}` : '';
      router.push(`/visit/${visitId}/certificate/success?certId=${data.certificateId}&stamp=${data.stamp?.status || "none"}${certUrl}`);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "สร้างใบประกาศไม่สำเร็จ กรุณาลองใหม่";
      setError(msg);
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto gap-6 animate-in fade-in duration-500">
      
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
        className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-lg border-4 border-white animate-in fade-in zoom-in-95 duration-700 delay-200 fill-mode-both"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <div 
          ref={certRef} 
          className="absolute inset-0 bg-white flex flex-col justify-between"
          style={{ width: "400px", height: "500px", transform: "scale(1)", transformOrigin: "top left" }} // Fixed dimension for consistent html-to-image
        >
          {/* Background / Styling for MVP Certificate */}
          <div className="absolute inset-0 bg-[#F4F1EA] z-0"></div>
          
          <div className="relative z-10 flex flex-col h-full items-center p-8 text-center pt-10">
            <h2 className="text-2xl font-bold text-ink uppercase tracking-widest mb-1">Travel Memory</h2>
            <p className="text-xs font-semibold text-gold tracking-widest mb-6">SOUTHERN BORDER DIGITAL PASSPORT</p>
            
            {/* Photo */}
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg mb-6 flex-shrink-0 bg-gradient-to-br from-teal/10 to-coral/10 flex items-center justify-center">
              {previewUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={previewUrl} alt="Tourist Memory" className="w-full h-full object-cover" crossOrigin="anonymous" />
              ) : (
                <div className="flex flex-col items-center text-ink/30">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span className="mt-1 text-[10px] font-medium">No photo</span>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-center w-full">
              <h3 className="text-2xl font-bold text-ink mb-1">{touristName}</h3>
              <p className="text-sm font-medium text-ink-light mb-4">has visited</p>
              
              <div className="w-full py-3 px-4 bg-white/60 rounded-xl border border-gold/30">
                <p className="font-bold text-teal leading-tight">{attractionName}</p>
                <p className="text-xs text-ink-light mt-1">{provinceName}</p>
              </div>
            </div>

            <div className="w-full flex justify-between items-end mt-4">
              <div className="text-left">
                <p className="text-[10px] text-ink-light uppercase tracking-wider font-semibold">Date</p>
                <p className="text-xs font-medium text-ink">{visitDate}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold">
                <Stamp weight="fill" size={24} />
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
