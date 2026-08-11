"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const aspectClasses = {
  landscape: "aspect-[4/3]",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  wide: "aspect-[16/7]",
  detail: "aspect-[4/3] sm:aspect-[2/1] lg:aspect-[16/7]",
} as const;

export interface PublicMediaFrameProps {
  src?: string | null;
  alt: string;
  aspect: keyof typeof aspectClasses;
  sizes: string;
  priority?: boolean;
  fallbackLabel: string;
  onAvailable?: () => void;
  onUnavailable?: () => void;
}

export function PublicMediaFrame({
  src,
  alt,
  aspect,
  sizes,
  priority = false,
  fallbackLabel,
  onAvailable,
  onUnavailable,
}: PublicMediaFrameProps) {
  const frameClasses = `relative ${aspectClasses[aspect]} overflow-hidden rounded-[var(--public-radius-panel)] bg-black/5`;
  const imageRef = useRef<HTMLImageElement>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const markUnavailable = useCallback(() => {
    if (!src) return;
    setFailedSrc(src);
    onUnavailable?.();
  }, [onUnavailable, src]);
  const inspectImage = useCallback((node: HTMLImageElement | null) => {
    if (!src || !node?.complete || !node.currentSrc) return;
    if (node.naturalWidth <= 1 || node.naturalHeight <= 1) {
      markUnavailable();
      return;
    }
    onAvailable?.();
  }, [markUnavailable, onAvailable, src]);

  useEffect(() => {
    inspectImage(imageRef.current);
  }, [inspectImage]);

  if (!src || failedSrc === src) {
    return (
      <div className={`${frameClasses} grid place-items-center px-4 text-center text-sm text-black/60`} aria-label={fallbackLabel}>
        <span>{fallbackLabel}</span>
      </div>
    );
  }

  return (
    <div className={frameClasses}>
      <Image
        ref={imageRef}
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
        onLoad={(event) => inspectImage(event.currentTarget)}
        onError={markUnavailable}
      />
    </div>
  );
}
