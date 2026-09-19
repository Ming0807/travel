"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash } from "@phosphor-icons/react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { archiveAttractionAction } from "@/app/actions/admin-attraction-actions";
import { archiveRestaurantAction } from "@/app/actions/admin-restaurant-actions";
import { archiveAccommodationAction } from "@/app/actions/admin-accommodation-actions";
import { archiveRouteAction } from "@/app/actions/admin-route-actions";
import { archiveStoryAction } from "@/app/actions/admin-story-actions";

type CmsEntityType = "attraction" | "restaurant" | "accommodation" | "route" | "story";
type ArchiveResult = { success: boolean; error?: string };

type CmsArchiveButtonProps = {
  entityId: number;
  entityName: string;
  entityType: CmsEntityType;
  redirectHref?: string;
};

const entityLabels: Record<CmsEntityType, string> = {
  attraction: "สถานที่",
  restaurant: "ร้านอาหาร",
  accommodation: "ที่พัก",
  route: "เส้นทาง",
  story: "บทความ",
};

async function archiveEntity(entityType: CmsEntityType, entityId: number): Promise<ArchiveResult> {
  switch (entityType) {
    case "attraction":
      return archiveAttractionAction(entityId);
    case "restaurant":
      return archiveRestaurantAction(entityId);
    case "accommodation":
      return archiveAccommodationAction(entityId);
    case "route":
      return archiveRouteAction(entityId);
    case "story":
      return archiveStoryAction(entityId);
  }
}

export function CmsArchiveButton({
  entityId,
  entityName,
  entityType,
  redirectHref,
}: CmsArchiveButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const label = entityLabels[entityType];

  const closeDialog = () => {
    if (isPending) return;
    setIsOpen(false);
    setError(null);
  };

  const handleArchive = async () => {
    setIsPending(true);
    setError(null);
    try {
      const result = await archiveEntity(entityType, entityId);
      if (!result.success) {
        setError(result.error || `ยังลบ${label}ออกจากระบบไม่ได้ กรุณาลองอีกครั้ง`);
        return;
      }

      setIsOpen(false);
      if (redirectHref) router.push(redirectHref);
      router.refresh();
    } catch {
      setError(`ยังลบ${label}ออกจากระบบไม่ได้ กรุณาลองอีกครั้ง`);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 md:h-8 md:w-8"
        title={`ลบ ${entityName} ออกจากระบบ`}
        aria-label={`ลบ ${entityName} ออกจากระบบ`}
      >
        <Trash aria-hidden="true" size={17} weight="bold" />
      </button>

      <ConfirmDialog
        isOpen={isOpen}
        onClose={closeDialog}
        onConfirm={handleArchive}
        title={`ลบ${label}ออกจากระบบ?`}
        message={`“${entityName}” จะหายจากหน้าบ้านและตัวเลือกสำหรับเนื้อหาใหม่ทันที`}
        detail="ข้อมูลการเข้าชมและสถิติเดิมจะยังคงอยู่ คุณสามารถเปิดใช้งานรายการนี้ใหม่จากตัวกรองรายการที่เก็บถาวร"
        error={error}
        confirmLabel="ยืนยันลบออกจากระบบ"
        cancelLabel="ยกเลิก"
        tone="danger"
        isPending={isPending}
      />

    </>
  );
}
