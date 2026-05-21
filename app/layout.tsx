import type { Metadata, Viewport } from "next";
import { Kanit, Noto_Sans_Thai, Playfair_Display } from "next/font/google";
import "./globals.css";
import { APP_NAME } from "@/constants/product";
import { SiteHeader } from "@/components/layout/site-header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap"
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap"
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: "Southern Border Explorer | Tourism Passport",
    template: "%s | Southern Border Explorer"
  },
  description:
    "สำรวจธรรมชาติ วัฒนธรรม อาหาร และเรื่องราวท้องถิ่นชายแดนใต้ พร้อมรับใบประกาศดิจิทัลและสะสมตราประทับ — A reward-first tourism data collection and intelligence platform for Southern Border travel planning.",
  metadataBase: new URL("http://localhost:3000")
};

export const viewport: Viewport = {
  themeColor: "#0A6B62",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={`${kanit.variable} ${notoSansThai.variable} ${playfair.variable}`} data-scroll-behavior="smooth">
      <body className="bg-[var(--background)] text-ink antialiased">
        <SiteHeader appName={APP_NAME} />
        <main className="phone-safe-bottom lg:pb-0">{children}</main>
        <MobileBottomNav />
      </body>
    </html>
  );
}
