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
  display: "swap",
  preload: false
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
  preload: false
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
  preload: false
});

export const metadata: Metadata = {
  title: {
    default: "Southern Border Explorer | Tourism Passport",
    template: "%s | Southern Border Explorer"
  },
  description:
    "สำรวจธรรมชาติ วัฒนธรรม อาหาร และเรื่องราวท้องถิ่นชายแดนใต้ พร้อมรับใบประกาศดิจิทัลและสะสมตราประทับ — A reward-first tourism data collection and intelligence platform for Southern Border travel planning.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://southernborder.app"),
  openGraph: {
    title: "Southern Border Explorer",
    description: "แพลตฟอร์มสะสมตราประทับดิจิทัลและบันทึกการเดินทางชายแดนใต้",
    url: "https://southernborder.app",
    siteName: "Southern Border Explorer",
    images: [
      {
        url: "/og-image.jpg", // We will use a standard image for OG
        width: 1200,
        height: 630,
        alt: "Southern Border Tourism Platform",
      },
    ],
    locale: "th_TH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Southern Border Explorer",
    description: "แพลตฟอร์มสะสมตราประทับดิจิทัลและบันทึกการเดินทางชายแดนใต้",
    images: ["/og-image.jpg"],
  },
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
