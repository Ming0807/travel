"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Images, X } from "@phosphor-icons/react";
import type { PublicAttractionImage } from "@/lib/attractions/public-detail";

type AttractionGalleryProps = {
  mainImage: PublicAttractionImage | null;
  gallery: PublicAttractionImage[];
  attractionName: string;
};

type GalleryImageProps = {
  image: PublicAttractionImage;
  alt: string;
  sizes: string;
  className: string;
  priority?: boolean;
  onInvalid: (url: string) => void;
};

function GalleryImage({ image, alt, sizes, className, priority, onInvalid }: GalleryImageProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const inspectImage = useCallback((node: HTMLImageElement | null) => {
    if (!node?.complete || !node.currentSrc) return;
    if (node.naturalWidth <= 1 || node.naturalHeight <= 1) onInvalid(image.url);
  }, [image.url, onInvalid]);

  useEffect(() => {
    inspectImage(imageRef.current);
  }, [inspectImage]);

  return (
    <Image
      ref={imageRef}
      src={image.url}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={className}
      onLoad={(event) => inspectImage(event.currentTarget)}
      onError={() => onInvalid(image.url)}
    />
  );
}

export function AttractionGallery({ mainImage, gallery, attractionName }: AttractionGalleryProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState<Set<string>>(() => new Set());
  const allImages = gallery.length > 0 ? gallery : mainImage ? [mainImage] : [];
  const images = allImages.filter((image) => !failedUrls.has(image.url));
  const primaryImage = images[0] ?? null;
  const selected = images[selectedIndex] ?? primaryImage;

  const handleMediaError = useCallback((url: string) => {
    setFailedUrls((current) => {
      if (current.has(url)) return current;
      const next = new Set(current);
      next.add(url);
      return next;
    });
  }, []);

  const openImage = (index: number) => {
    setSelectedIndex(index);
    dialogRef.current?.showModal();
  };

  if (!primaryImage) {
    return (
      <div
        className="mb-10 flex aspect-[4/3] items-center justify-center border border-slate-200 bg-slate-100 px-6 text-center text-sm font-semibold text-slate-600 sm:aspect-[16/8]"
        aria-label="ยังไม่มีรูปภาพของสถานที่นี้"
      >
        ยังไม่มีรูปภาพของสถานที่นี้
      </div>
    );
  }

  const sideImages = images.slice(1, 3);

  return (
    <div className="mb-10 sm:mb-12">
      <div className="grid gap-2 lg:grid-cols-[minmax(0,2fr)_minmax(220px,1fr)]">
        <button
          type="button"
          onClick={() => openImage(0)}
          aria-label={`เปิดภาพ ${primaryImage.alt || attractionName}`}
          className="group relative aspect-[4/3] w-full overflow-hidden bg-slate-100 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)] sm:aspect-[16/9] lg:aspect-auto lg:min-h-[460px]"
        >
          <GalleryImage
            image={primaryImage}
            alt={primaryImage.alt || attractionName}
            priority
            sizes="(max-width: 1023px) calc(100vw - 2rem), 736px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            onInvalid={handleMediaError}
          />
        </button>

        <div className="hidden gap-2 lg:grid lg:grid-rows-2">
          {sideImages.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => openImage(index + 1)}
              aria-label={`เปิดภาพ ${image.alt || `${attractionName} รูปที่ ${index + 2}`}`}
              className={`group relative min-h-0 overflow-hidden bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)] ${sideImages.length === 1 ? "row-span-2" : ""}`}
            >
              <GalleryImage
                image={image}
                alt={image.alt || `${attractionName} รูปที่ ${index + 2}`}
                sizes="352px"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                onInvalid={handleMediaError}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-600">ภาพจากข้อมูลที่เผยแพร่ของสถานที่</p>
        <button
          type="button"
          onClick={() => openImage(0)}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-[var(--public-ink)] transition-colors hover:border-[var(--public-teal)] hover:text-[var(--public-teal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)]"
        >
          <Images aria-hidden="true" size={18} />
          ดูรูปทั้งหมด {images.length.toLocaleString("th-TH")} รูป
        </button>
      </div>

      <dialog
        ref={dialogRef}
        aria-label={`รูปภาพ ${attractionName}`}
        className="m-auto max-h-[92dvh] w-[min(94vw,1100px)] border-0 bg-transparent p-0 backdrop:bg-black/75"
        onClose={() => setSelectedIndex(0)}
      >
        <div className="bg-white p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-4">
            <p className="truncate text-sm font-semibold text-[var(--public-ink)]">
              {selected?.alt || attractionName}
            </p>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="ปิดรูปภาพ"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-slate-300 text-[var(--public-ink)] hover:bg-slate-100"
            >
              <X aria-hidden="true" size={20} />
            </button>
          </div>
          {selected ? (
            <div className="relative aspect-[4/3] max-h-[75dvh] w-full bg-slate-100 sm:aspect-[16/10]">
              <GalleryImage
                image={selected}
                alt={selected.alt || attractionName}
                sizes="94vw"
                className="object-contain"
                onInvalid={handleMediaError}
              />
            </div>
          ) : null}
          {images.length > 1 ? (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((image, index) => (
                <button
                  key={`${image.url}-${index}`}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  aria-label={`ดูรูปที่ ${index + 1}`}
                  aria-current={selectedIndex === index ? "true" : undefined}
                  className="relative h-16 w-24 shrink-0 border-2 bg-slate-100 aria-[current=true]:border-[var(--public-coral)]"
                >
                  <GalleryImage
                    image={image}
                    alt=""
                    sizes="96px"
                    className="object-cover"
                    onInvalid={handleMediaError}
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </dialog>
    </div>
  );
}
