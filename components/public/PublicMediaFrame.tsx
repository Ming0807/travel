import Image from "next/image";

const aspectClasses = {
  landscape: "aspect-[4/3]",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  wide: "aspect-[16/7]",
} as const;

export interface PublicMediaFrameProps {
  src?: string | null;
  alt: string;
  aspect: keyof typeof aspectClasses;
  sizes: string;
  priority?: boolean;
  fallbackLabel: string;
}

export function PublicMediaFrame({ src, alt, aspect, sizes, priority = false, fallbackLabel }: PublicMediaFrameProps) {
  const frameClasses = `relative ${aspectClasses[aspect]} overflow-hidden rounded-[var(--public-radius-panel)] bg-black/5`;

  if (!src) {
    return (
      <div className={`${frameClasses} grid place-items-center px-4 text-center text-sm text-black/60`} aria-label={fallbackLabel}>
        <span>{fallbackLabel}</span>
      </div>
    );
  }

  return (
    <div className={frameClasses}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </div>
  );
}
