"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, XCircle, Star, Trash, Image as ImageIcon, PencilSimple } from "@phosphor-icons/react";
import { toggleTemplateStatus, setTemplateAsDefault, deleteTemplate } from "@/app/actions/admin-certificate-templates";

function getStorageUrl(path: string) {
  if (path.startsWith("http")) return path;
  return `/api/admin/media/preview?bucket=southern-border-tourism&path=${encodeURIComponent(path)}`;
}

type CertificateTemplateListItem = {
  template_id: number;
  template_name: string;
  attraction_id: number | null;
  attraction_name: string | null;
  background_path: string | null;
  language: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  orientation: "landscape" | "portrait";
};

export function TemplateListClient({ templates }: { templates: CertificateTemplateListItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggleStatus = (templateId: number, currentStatus: boolean) => {
    startTransition(async () => {
      try {
        await toggleTemplateStatus(templateId, !currentStatus);
        router.refresh();
      } catch {
        alert("ไม่สามารถเปลี่ยนสถานะได้");
      }
    });
  };

  const handleSetDefault = (templateId: number) => {
    if (!confirm("ต้องการตั้งเป็นค่าเริ่มต้นใช่หรือไม่?")) return;
    startTransition(async () => {
      try {
        await setTemplateAsDefault(templateId);
        router.refresh();
      } catch {
        alert("ไม่สามารถตั้งค่าเริ่มต้นได้");
      }
    });
  };

  const handleDelete = (templateId: number) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบเทมเพลตนี้? การกระทำนี้ไม่สามารถย้อนกลับได้")) return;
    startTransition(async () => {
      try {
        await deleteTemplate(templateId);
        router.refresh();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "ไม่สามารถลบเทมเพลตได้");
      }
    });
  };

  if (!templates.length) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-ink/10 bg-white p-12 text-center">
        <div className="mb-4 rounded-full bg-slate-50 p-4 text-slate-400">
          <ImageIcon size={48} weight="light" />
        </div>
        <h3 className="text-lg font-bold text-ink">ยังไม่มีเทมเพลตใบประกาศ</h3>
        <p className="mt-2 text-sm text-muted max-w-sm">
          คุณสามารถเพิ่มภาพพื้นหลังและตั้งค่าตำแหน่งต่างๆ บนใบประกาศนียบัตรได้ โดยคลิกที่ปุ่มเพิ่มเทมเพลตใหม่
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {templates.map((template, index) => (
        <div 
          key={template.template_id} 
          className={`group flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-md ${
            template.is_default ? "border-[#E18868] ring-1 ring-[#E18868]" : "border-ink/5"
          }`}
        >
          {/* Image Area */}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
            {template.background_path ? (
              <Image
                src={getStorageUrl(template.background_path)}
                alt={template.template_name}
                fill
                priority={index === 0}
                sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized // Use unoptimized if Next image optimization still acts up for external URLs
              />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">
                <ImageIcon size={48} weight="light" />
              </div>
            )}
            
            {/* Overlay Badges */}
            <div className="absolute left-3 top-3 flex flex-col gap-2">
              {template.is_default && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-[#E18868] shadow-sm backdrop-blur">
                  <Star size={14} weight="fill" />
                  ค่าเริ่มต้น
                </span>
              )}
            </div>
            <div className="absolute right-3 top-3">
              <span className="inline-flex rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm backdrop-blur uppercase">
                {template.language}
              </span>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex flex-1 flex-col p-5">
            <h3 className="font-bold text-ink line-clamp-1">{template.template_name}</h3>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-[#E6F4EF] px-2.5 py-1 font-semibold text-[#0A6B62]">
                {template.attraction_id ? "เฉพาะสถานที่" : "ส่วนกลาง"}
              </span>
              <span className="text-slate-500">
                {template.orientation === "portrait" ? "แนวตั้ง" : "แนวนอน"}
              </span>
              {template.attraction_name ? (
                <span className="truncate text-slate-600">{template.attraction_name}</span>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-muted">
              สร้างเมื่อ: {new Date(template.created_at).toLocaleDateString("th-TH")}
            </p>

            {/* Actions */}
            <div className="mt-auto pt-6 flex items-center justify-between gap-2 border-t border-ink/5">
              <button
                onClick={() => handleToggleStatus(template.template_id, template.is_active)}
                disabled={isPending || template.is_default}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                  template.is_active
                    ? "bg-green-50 text-green-700 hover:bg-green-100"
                    : "bg-red-50 text-red-700 hover:bg-red-100"
                }`}
                title={template.is_default ? "เทมเพลตเริ่มต้นต้องเปิดใช้งานเสมอ" : "คลิกเพื่อสลับสถานะ"}
              >
                {template.is_active ? <CheckCircle size={16} weight="fill" /> : <XCircle size={16} weight="fill" />}
                {template.is_active ? "ใช้งานอยู่" : "ปิดใช้งาน"}
              </button>

              <div className="flex items-center gap-1">
                <Link
                  href={`/admin/certificate-templates/${template.template_id}/edit`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#0A6B62] hover:bg-[#E6F4EF]"
                  title="ออกแบบเทมเพลต"
                >
                  <PencilSimple size={18} weight="bold" />
                  <span className="sr-only">ออกแบบเทมเพลต</span>
                </Link>
                {!template.is_default && (
                  <button
                    onClick={() => handleSetDefault(template.template_id)}
                    disabled={isPending || !template.is_active}
                    className="p-2 text-yellow-700 hover:text-yellow-800 hover:bg-yellow-50 rounded-full transition-colors disabled:opacity-50"
                    title="ตั้งเป็นค่าเริ่มต้น"
                  >
                    <Star size={18} weight="bold" />
                  </button>
                )}
                {!template.is_default && (
                  <button
                    onClick={() => handleDelete(template.template_id)}
                    disabled={isPending}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                    title="ลบเทมเพลต"
                  >
                    <Trash size={18} weight="bold" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
