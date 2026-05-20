import type { Metadata, Viewport } from "next";
import "./globals.css";
import { APP_NAME } from "@/constants/product";
import { SiteHeader } from "@/components/layout/site-header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

export const metadata: Metadata = {
  title: {
    default: "Southern Border Travel Passport",
    template: "%s | Southern Border Travel Passport"
  },
  description:
    "A reward-first tourism data collection and intelligence platform for Southern Border travel planning.",
  metadataBase: new URL("http://localhost:3000")
};

export const viewport: Viewport = {
  themeColor: "#073F37",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader appName={APP_NAME} />
        <main className="phone-safe-bottom">{children}</main>
        <MobileBottomNav />
      </body>
    </html>
  );
}
