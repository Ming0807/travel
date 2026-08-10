"use client";

import { usePathname } from "next/navigation";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SiteHeader } from "@/components/layout/site-header";
import { shouldHidePublicChrome } from "@/lib/navigation/public-route-mode";

type PublicChromeProps = {
  appName: string;
  children: React.ReactNode;
};

export function PublicChrome({ appName, children }: PublicChromeProps) {
  const pathname = usePathname();

  if (shouldHidePublicChrome(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader key={`public-header-${pathname}`} appName={appName} />
      <main className="phone-safe-bottom lg:pb-0">{children}</main>
      <MobileBottomNav key={`public-bottom-nav-${pathname}`} />
    </>
  );
}
