import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

const variantClasses = {
  primary: "bg-[var(--public-coral)] text-white hover:bg-[#d86548]",
  secondary: "border border-[var(--public-teal)] bg-white text-[var(--public-teal)] hover:bg-[#edf7f5]",
  quiet: "text-[var(--public-ink)] hover:bg-black/5",
  danger: "bg-[#b42318] text-white hover:bg-[#991b1b]",
} as const;

type PublicButtonBaseProps = {
  variant?: keyof typeof variantClasses;
  className?: string;
  children: ReactNode;
};

export type PublicButtonProps =
  | (PublicButtonBaseProps &
      Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
        href?: undefined;
      })
  | (PublicButtonBaseProps &
      Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "href"> & {
        href: string;
      });

function isInternalHref(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

function buttonClasses(variant: keyof typeof variantClasses, className?: string) {
  return [
    "inline-flex min-h-11 items-center justify-center rounded-[var(--public-radius-control)] px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)] disabled:cursor-not-allowed disabled:opacity-50",
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function PublicButton(props: PublicButtonProps) {
  const { variant = "primary", className, children, ...rest } = props;

  if ("href" in props && props.href) {
    const linkProps = rest as Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "href">;
    const classes = buttonClasses(variant, className);

    return isInternalHref(props.href) ? (
      <Link href={props.href} className={classes} {...linkProps}>
        {children}
      </Link>
    ) : (
      <a href={props.href} className={classes} {...linkProps}>
        {children}
      </a>
    );
  }

  const buttonProps = rest as Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;
  return (
    <button type="button" className={buttonClasses(variant, className)} {...buttonProps}>
      {children}
    </button>
  );
}
