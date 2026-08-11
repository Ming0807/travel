import type { HTMLAttributes, ReactNode } from "react";

const variantClasses = {
  listing: "max-w-7xl px-4 sm:px-6 lg:px-8",
  directory: "max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10 lg:px-8",
  detail: "max-w-6xl px-4 sm:px-6 lg:px-8",
  reading: "max-w-[70ch] px-4 py-8 sm:px-6 sm:py-10",
  legal: "max-w-3xl px-4 py-10 leading-7 sm:px-6 sm:py-14",
} as const;

export type PublicPageFrameVariant = keyof typeof variantClasses;

export interface PublicPageFrameProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "className"> {
  variant: PublicPageFrameVariant;
  children: ReactNode;
  className?: string;
}

export function PublicPageFrame({ variant, children, className, ...divProps }: PublicPageFrameProps) {
  return (
    <div {...divProps} className={`mx-auto w-full ${variantClasses[variant]} ${className ?? ""}`.trim()}>
      {children}
    </div>
  );
}
