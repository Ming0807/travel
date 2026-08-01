"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import { DownloadSimple, ArrowLeft, Spinner } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { CertificateArtwork } from "@/components/certificate/CertificateArtwork";
import { CertificateCustomizer } from "@/components/certificate/CertificateCustomizer";
import type { CertificateTemplateLayout } from "@/lib/certificate/certificate-template-layout";
import {
  DEFAULT_PHOTO_ADJUSTMENT,
  normalizePhotoAdjustment,
  type CertificateTemplatePreviewOption,
} from "@/lib/certificate/certificate-customization";

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
  templates?: CertificateTemplatePreviewOption[];
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
  templates,
}: CertificatePreviewProps) {
  const router = useRouter();
  const certRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(templateId);
  const [photoAdjustment, setPhotoAdjustment] = useState(DEFAULT_PHOTO_ADJUSTMENT);
  const availableTemplates: CertificateTemplatePreviewOption[] = templates?.length
    ? templates
    : [{
        templateId,
        templateName,
        attractionId: null,
        backgroundUrl: templateBackgroundUrl,
        language,
        orientation: layout.orientation,
        layout,
      }];
  const selectedTemplate =
    availableTemplates.find((template) => template.templateId === selectedTemplateId) ??
    availableTemplates[0];

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
          templateId: selectedTemplate.templateId,
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
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-5">
      
      {/* Action Bar */}
      <div className="flex w-full items-center justify-between px-1">
        <Link 
          href={`/visit/${visitId}/photo`} 
          className="text-ink-light flex items-center gap-1 hover:text-ink transition-colors"
        >
          <ArrowLeft weight="bold" /> เปลี่ยนรูป
        </Link>
        <span className="text-teal font-semibold text-sm tracking-wide uppercase">ขั้นตอนที่ 3/3</span>
      </div>

      {error && (
        <div className="w-full rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {/* Certificate DOM to Capture */}
      <div
        className={`relative w-full overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm ${
          selectedTemplate.layout.orientation === "landscape" ? "aspect-[1.414/1] max-w-[560px]" : "aspect-[4/5] max-w-[400px]"
        }`}
      >
        <div ref={certRef} className="absolute inset-0">
          <CertificateArtwork
            layout={selectedTemplate.layout}
            templateBackgroundUrl={selectedTemplate.backgroundUrl}
            previewUrl={previewUrl}
            touristName={touristName}
            attractionName={attractionName}
            provinceName={provinceName}
            visitDate={visitDate}
            photoAdjustment={photoAdjustment}
          />
        </div>

        {/* Keep the preview stable while the browser captures the final artifact. */}
        {isGenerating && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-white/90 text-ink" aria-live="polite">
            <Spinner className="animate-spin text-[#E77455]" size={36} aria-hidden="true" />
            <p className="text-sm font-bold">กำลังจัดทำใบประกาศ...</p>
          </div>
        )}
      </div>

      <CertificateCustomizer
        templates={availableTemplates}
        selectedTemplateId={selectedTemplate.templateId}
        adjustment={photoAdjustment}
        disabled={isGenerating}
        onSelectTemplate={setSelectedTemplateId}
        onAdjustmentChange={(value) => setPhotoAdjustment(normalizePhotoAdjustment(value))}
      />

      <div className="w-full rounded-lg border border-ink/10 bg-white p-5 text-center">
        <p className="mb-2 text-xs font-semibold text-[#0A6B62]">
          รูปแบบ: {selectedTemplate.templateName}
        </p>
        <h3 className="font-bold text-lg text-ink mb-2">ยืนยันและสร้างใบประกาศ</h3>
        <p className="text-sm text-muted mb-6">
          คุณสามารถบันทึกภาพนี้เพื่อเก็บเป็นความทรงจำ หรือแชร์ให้เพื่อนๆ ได้
        </p>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#E77455] px-5 py-3 font-bold text-white transition-colors hover:bg-[#C8553A] disabled:cursor-not-allowed disabled:opacity-50"
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
