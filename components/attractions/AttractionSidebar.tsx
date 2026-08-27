"use client";

import { EnvelopeSimple, QrCode } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { TripShortlistPanel, type TripShortlistItem } from "@/components/trip-shortlist/TripShortlistPanel";

export function AttractionSidebar({ shortlistItems }: { shortlistItems: TripShortlistItem[] }) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Card 1: My Trip / Shortlist Panel */}
      <TripShortlistPanel items={shortlistItems} />

      {/* Card 2: Digital Stamp / Passport Incentive Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 p-5 text-white shadow-lg">
        {/* Subtle decorative circles */}
        <div className="pointer-events-none absolute -right-6 -top-6 size-28 rounded-full bg-white/10 blur-xl" />
        <div className="pointer-events-none absolute -bottom-6 -left-6 size-28 rounded-full bg-black/10 blur-xl" />

        <div className="relative z-10">
          <div className="inline-flex size-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs">
            <QrCode size={24} weight="bold" className="text-white" />
          </div>

          <h3 className="mt-3 text-base font-black tracking-tight text-white">
            เช็กอินสะสมแต้ม
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-white/90">
            เที่ยวครบ รับตราประทับดิจิทัล และสิทธิประโยชน์มากมาย
          </p>

          <Link
            href="/c"
            className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-black text-coral shadow-sm transition-transform hover:scale-[1.02]"
          >
            <QrCode size={16} weight="bold" />
            <span>สแกน QR เพื่อเช็กอิน</span>
          </Link>
        </div>
      </div>

      {/* Card 3: Newsletter / Stay Updated Callout */}
      <div className="rounded-2xl border border-orange-100/90 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-ink">
          <div className="grid size-7 place-items-center rounded-lg bg-orange-50 text-coral">
            <EnvelopeSimple size={18} weight="fill" />
          </div>
          <h3 className="text-sm font-black text-ink">ไม่พลาดที่เที่ยวใหม่ๆ</h3>
        </div>
        <p className="mt-1.5 text-xs text-muted leading-relaxed">
          รับข่าวสารและสถานที่ท่องเที่ยวล่าสุดในจังหวัดยะลา
        </p>

        {subscribed ? (
          <div className="mt-3.5 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-center text-xs font-bold text-emerald-800">
            ✓ ขอบคุณสำหรับการติดตาม!
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="mt-3.5 flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="กรอกอีเมลของคุณ"
              className="min-w-0 flex-1 min-h-10 rounded-xl border border-ink/15 bg-cream/40 px-3 text-xs font-semibold text-ink placeholder:text-muted focus:border-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral/20"
            />
            <button
              type="submit"
              className="inline-flex min-h-10 items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-3.5 text-xs font-black text-white shadow-xs hover:opacity-95"
            >
              <span>ติดตาม</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
