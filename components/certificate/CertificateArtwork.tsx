import { Stamp } from "@phosphor-icons/react/dist/ssr";
import type { CertificateTemplateLayout } from "@/lib/certificate/certificate-template-layout";
import {
  normalizePhotoAdjustment,
  type PhotoAdjustment,
} from "@/lib/certificate/certificate-customization";

type CertificateArtworkProps = {
  layout: CertificateTemplateLayout;
  templateBackgroundUrl: string;
  previewUrl: string;
  touristName: string;
  attractionName: string;
  provinceName: string;
  visitDate: string;
  showSafeZone?: boolean;
  photoAdjustment?: PhotoAdjustment;
};

const photoShapeClasses = {
  circle: "rounded-full",
  rounded: "rounded-lg",
  square: "rounded-none",
} as const;

export function CertificateArtwork({
  layout,
  templateBackgroundUrl,
  previewUrl,
  touristName,
  attractionName,
  provinceName,
  visitDate,
  showSafeZone = false,
  photoAdjustment,
}: CertificateArtworkProps) {
  const titleSize = `clamp(14px, ${layout.titleScale * 0.04}cqw, 32px)`;
  const adjustedPhoto = normalizePhotoAdjustment(photoAdjustment);

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-white [container-type:inline-size]"
      style={{ color: layout.textColor }}
      data-orientation={layout.orientation}
    >
      {templateBackgroundUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={templateBackgroundUrl}
          alt=""
          aria-hidden="true"
          crossOrigin="anonymous"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-[#F4F1EA]" />
      )}

      <div
        className="absolute inset-0 bg-white"
        style={{ opacity: layout.overlayOpacity / 100 }}
        aria-hidden="true"
      />

      {showSafeZone ? (
        <div
          className="pointer-events-none absolute border border-dashed border-amber-600/80"
          style={{ inset: `${layout.safeMargin}%` }}
          aria-label="ขอบเขตปลอดภัย"
        />
      ) : null}

      <header
        className="absolute left-1/2 top-[6%] w-[88%] -translate-x-1/2 text-center"
        style={{ fontSize: titleSize }}
      >
        <h2 className="text-[1em] font-bold uppercase tracking-[0.08em]">Travel Memory</h2>
        <p className="mt-0.5 text-[0.42em] font-semibold tracking-[0.12em]" style={{ color: layout.accentColor }}>
          SOUTHERN BORDER DIGITAL PASSPORT
        </p>
      </header>

      <div
        data-certificate-photo-frame
        className={`absolute aspect-square -translate-x-1/2 -translate-y-1/2 border border-white bg-white p-[0.7%] shadow-[0_3px_8px_rgba(15,23,42,0.18)] ${photoShapeClasses[layout.photoShape]}`}
        style={{
          left: `${layout.photoX}%`,
          top: `${layout.photoY}%`,
          width: `${layout.photoSize}%`,
          outline: `clamp(1px, 0.3cqw, 3px) solid ${layout.accentColor}`,
          outlineOffset: "clamp(1px, 0.25cqw, 2px)",
        }}
      >
        <div className={`flex h-full w-full items-center justify-center overflow-hidden border border-white bg-[#E6F4EF] ${photoShapeClasses[layout.photoShape]}`}>
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="รูปความทรงจำของนักท่องเที่ยว"
              className="h-full w-full object-cover"
              crossOrigin="anonymous"
              style={{
                objectPosition: `${adjustedPhoto.x}% ${adjustedPhoto.y}%`,
                transform: `scale(${adjustedPhoto.zoom})`,
                transformOrigin: "center",
              }}
            />
          ) : (
            <span className="px-2 text-center text-[clamp(8px,2.2cqw,12px)] font-semibold text-[#35665E]">
              ยังไม่มีรูปภาพ
            </span>
          )}
        </div>
      </div>

      <section
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${layout.contentX}%`,
          top: `${layout.contentY}%`,
          width: `${layout.contentWidth}%`,
          textAlign: layout.textAlign,
        }}
      >
        <h3 className="line-clamp-2 break-words text-[clamp(14px,4.5cqw,28px)] font-bold leading-tight">
          {touristName}
        </h3>
        <p className="my-[2%] text-[clamp(8px,2cqw,12px)] font-medium opacity-75">ได้เดินทางมาเยือน</p>
        <div className="border border-white/80 bg-white/75 px-[5%] py-[4%] shadow-sm">
          <p className="line-clamp-2 text-[clamp(10px,2.8cqw,16px)] font-bold leading-tight" style={{ color: layout.accentColor }}>
            {attractionName}
          </p>
          {layout.showProvince && provinceName ? (
            <p className="mt-1 text-[clamp(8px,1.8cqw,11px)] opacity-75">{provinceName}</p>
          ) : null}
        </div>
      </section>

      {layout.showDate ? (
        <div
          className="absolute text-left text-[clamp(7px,1.7cqw,11px)]"
          style={{ left: `${layout.safeMargin}%`, bottom: `${layout.safeMargin}%` }}
        >
          <p className="font-semibold uppercase tracking-wide opacity-70">วันที่เดินทาง</p>
          <p className="font-medium">{visitDate}</p>
        </div>
      ) : null}

      <div
        className="absolute flex aspect-square w-[8%] items-center justify-center rounded-full bg-white/80"
        style={{ right: `${layout.safeMargin}%`, bottom: `${layout.safeMargin}%`, color: layout.accentColor }}
      >
        <Stamp weight="fill" className="h-[58%] w-[58%]" />
      </div>
    </div>
  );
}
