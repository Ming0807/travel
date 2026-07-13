"use client";

import Link from "next/link";
import { CaretRight, Certificate, ClipboardText, MapPin, Stamp, UserCircle } from "@phosphor-icons/react/dist/ssr";
import type { AdminTouristListRow } from "@/lib/repositories/admin-tourist.repository";

const providerLabels: Record<string, string> = {
  anonymous_device: "ผู้เยี่ยมชม",
  line: "LINE",
  google: "Google",
  email: "อีเมล",
};

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "ไม่ระบุ"
    : date.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
}

function IdentityBadges({ providers }: { providers: string[] }) {
  const values = providers.length > 0 ? providers : ["anonymous_device"];
  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((provider) => (
        <span
          key={provider}
          className="inline-flex rounded-md bg-[#E6F4EF] px-2 py-1 text-xs font-semibold text-[#075049]"
        >
          {providerLabels[provider] ?? "เชื่อมบัญชีแล้ว"}
        </span>
      ))}
    </div>
  );
}

export function TouristListClient({ tourists }: { tourists: AdminTouristListRow[] }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-3" scope="col">นักท่องเที่ยว</th>
                <th className="px-4 py-3" scope="col">ภูมิลำเนา</th>
                <th className="px-4 py-3" scope="col">วิธีเข้าใช้งาน</th>
                <th className="px-4 py-3 text-center" scope="col">กิจกรรม</th>
                <th className="px-4 py-3 text-right" scope="col">เริ่มใช้งาน</th>
                <th className="w-12 px-4 py-3"><span className="sr-only">ดูรายละเอียด</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tourists.map((tourist) => (
                <tr
                  key={tourist.id}
                  className="bg-white transition-colors hover:bg-slate-50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                        <UserCircle aria-hidden="true" size={22} weight="fill" />
                      </span>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/tourists/${tourist.id}`}
                          className="block max-w-[260px] truncate font-semibold text-slate-900 hover:text-[#0A6B62] hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6B62]"
                        >
                          {tourist.displayName}
                        </Link>
                        <p className="mt-0.5 font-mono text-xs text-slate-500">{tourist.reference}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <p className="font-medium">{tourist.provinceName ?? tourist.countryName ?? "ไม่ระบุ"}</p>
                    {tourist.provinceName && tourist.countryName ? (
                      <p className="mt-0.5 text-xs text-slate-500">{tourist.countryName}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3"><IdentityBadges providers={tourist.identityProviders} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-3 text-xs text-slate-600">
                      <span title="การเข้าชม">{tourist.visitCount} ครั้ง</span>
                      <span className="flex items-center gap-1" title="ใบประกาศ">
                        <Certificate aria-hidden="true" size={15} /> {tourist.certificateCount}
                      </span>
                      <span className="flex items-center gap-1" title="ตราประทับ">
                        <Stamp aria-hidden="true" size={15} /> {tourist.stampCount}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-slate-600">{formatDate(tourist.joinedAt)}</td>
                  <td className="px-2 py-2 text-right">
                    <Link
                      href={`/admin/tourists/${tourist.id}`}
                      aria-label={`ดูรายละเอียด ${tourist.displayName}`}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[#0A6B62] transition hover:bg-[#E6F4EF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6B62]"
                    >
                      <CaretRight aria-hidden="true" size={18} weight="bold" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 md:hidden">
        {tourists.map((tourist) => (
          <Link
            key={tourist.id}
            href={`/admin/tourists/${tourist.id}`}
            className="block rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6B62]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">{tourist.displayName}</p>
                <p className="mt-1 font-mono text-xs text-slate-500">{tourist.reference}</p>
              </div>
              <CaretRight aria-hidden="true" className="shrink-0 text-[#0A6B62]" size={19} weight="bold" />
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-700">
              <MapPin aria-hidden="true" className="text-slate-500" size={17} />
              <span>{tourist.provinceName ?? tourist.countryName ?? "ไม่ระบุภูมิลำเนา"}</span>
            </div>
            <div className="mt-3"><IdentityBadges providers={tourist.identityProviders} /></div>
            <div className="mt-4 grid grid-cols-4 gap-2 border-t border-slate-100 pt-3 text-center">
              <div><p className="font-semibold text-slate-900">{tourist.visitCount}</p><p className="text-xs text-slate-500">เข้าชม</p></div>
              <div><p className="font-semibold text-slate-900">{tourist.certificateCount}</p><p className="text-xs text-slate-500">ใบประกาศ</p></div>
              <div><p className="font-semibold text-slate-900">{tourist.stampCount}</p><p className="text-xs text-slate-500">ตรา</p></div>
              <div><p className="font-semibold text-slate-900">{tourist.surveyCount}</p><p className="text-xs text-slate-500">แบบสำรวจ</p></div>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
              <ClipboardText aria-hidden="true" size={14} /> เริ่มใช้งาน {formatDate(tourist.joinedAt)}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
