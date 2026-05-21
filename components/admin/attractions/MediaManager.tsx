"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { createMediaAction, updateMediaAction, deleteMediaAction } from "@/app/actions/admin-media-actions";
import type { AdminMediaRow } from "@/lib/repositories/admin-media.repository";
import { Plus, Trash, PencilSimple, X } from "@phosphor-icons/react";

interface MediaManagerProps {
  attractionId: number;
  initialMedia: AdminMediaRow[];
}

export function MediaManager({ attractionId, initialMedia }: MediaManagerProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | "new" | null>(null);

  const handleDelete = async (mediaId: number) => {
    if (!confirm("Are you sure you want to delete this media?")) return;
    const res = await deleteMediaAction(mediaId);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || "Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setEditingId("new")}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0A6B62] px-4 py-2 text-sm font-semibold text-white hover:bg-[#075049]"
        >
          <Plus size={16} weight="bold" />
          เพิ่มรูปภาพ/วิดีโอ
        </button>
      </div>

      {editingId === "new" && (
        <MediaForm
          attractionId={attractionId}
          onClose={() => setEditingId(null)}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {initialMedia.map((media) => (
          <div key={media.media_id} className="relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            {editingId === media.media_id ? (
              <MediaForm
                attractionId={attractionId}
                initialData={media}
                onClose={() => setEditingId(null)}
              />
            ) : (
              <>
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-slate-100">
                  {media.media_type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={media.storage_path} alt={media.alt_text_th || ""} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-500">
                      {media.media_type}
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {media.media_type}
                    </span>
                    {media.is_cover && (
                      <span className="ml-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Cover
                      </span>
                    )}
                    <p className="mt-1 text-sm font-medium text-slate-800">{media.alt_text_th || "No alt text"}</p>
                    <p className="text-xs text-slate-500">Order: {media.display_order ?? "-"}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => setEditingId(media.media_id)}
                      className="flex h-8 w-8 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-[#0A6B62]"
                    >
                      <PencilSimple size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(media.media_id)}
                      className="flex h-8 w-8 items-center justify-center rounded text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
        {initialMedia.length === 0 && editingId !== "new" && (
          <div className="col-span-full py-8 text-center text-slate-500 border border-dashed border-slate-300 rounded-xl">
            ไม่มีสื่อประสมในสถานที่นี้
          </div>
        )}
      </div>
    </div>
  );
}

function MediaForm({
  attractionId,
  initialData,
  onClose,
}: {
  attractionId: number;
  initialData?: AdminMediaRow;
  onClose: () => void;
}) {
  const router = useRouter();
  const isEditing = !!initialData;
  const action = isEditing ? updateMediaAction.bind(null, initialData.media_id) : createMediaAction;

  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, formAction, isPending] = useActionState<any, FormData>(action, {
    success: false,
    error: undefined,
  });

  if (state?.success) {
    onClose();
    router.refresh();
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setUploadError(null);

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("attractionId", String(attractionId));

      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body,
      });

      const result = await response.json();
      if (!result.success) {
        setUploadError(result.error || "Upload failed");
      } else {
        setUploadedPath(result.storagePath);
      }
    } catch {
      setUploadError("Network error during upload");
    } finally {
      setUploadingFile(false);
    }
  };

  return (
    <form action={formAction} className="rounded-xl border border-slate-200 bg-slate-50 p-4 relative col-span-full">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
      >
        <X size={20} />
      </button>
      
      <h4 className="mb-4 text-sm font-semibold text-slate-800">
        {isEditing ? "แก้ไขรูปภาพ/วิดีโอ" : "เพิ่มรูปภาพ/วิดีโอใหม่"}
      </h4>

      {state?.error && (
        <div className="mb-4 rounded bg-rose-50 p-3 text-xs text-rose-600">
          {state.error}
        </div>
      )}

      {uploadError && (
        <div className="mb-4 rounded bg-rose-50 p-3 text-xs text-rose-600">
          {uploadError}
        </div>
      )}

      <input type="hidden" name="attractionId" value={attractionId} />

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">ประเภท</label>
          <select
            name="mediaType"
            defaultValue={initialData?.media_type ?? "image"}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="image">รูปภาพ (Image)</option>
            <option value="panorama">พาโนรามา (Panorama)</option>
            <option value="video360">วิดีโอ 360 (Video 360)</option>
            <option value="embed">โค้ดฝัง (Embed)</option>
            <option value="external_url">ลิงก์ภายนอก (External URL)</option>
          </select>
        </div>

        {/* File Upload */}
        {!isEditing && (
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              อัปโหลดไฟล์ (JPEG, PNG, WebP, สูงสุด 10MB)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileUpload}
              disabled={uploadingFile}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#0A6B62] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white"
            />
            {uploadingFile && (
              <p className="mt-1 text-xs text-amber-600 animate-pulse">กำลังอัปโหลด...</p>
            )}
            {uploadedPath && (
              <p className="mt-1 text-xs text-green-600">✓ อัปโหลดสำเร็จ</p>
            )}
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">
            {isEditing ? "URL / Path *" : "URL / Path (หรือใช้ไฟล์ที่อัปโหลดด้านบน)"}
          </label>
          <input
            type="text"
            name="storagePath"
            defaultValue={initialData?.storage_path}
            value={uploadedPath ?? undefined}
            onChange={(e) => setUploadedPath(e.target.value || null)}
            required
            placeholder={uploadedPath ? "" : "https://example.com/image.jpg"}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Alt Text (TH)</label>
            <input
              type="text"
              name="altTextTh"
              defaultValue={initialData?.alt_text_th ?? ""}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Alt Text (EN)</label>
            <input
              type="text"
              name="altTextEn"
              defaultValue={initialData?.alt_text_en ?? ""}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Caption (TH)</label>
            <input
              type="text"
              name="captionTh"
              defaultValue={initialData?.caption_th ?? ""}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Caption (EN)</label>
            <input
              type="text"
              name="captionEn"
              defaultValue={initialData?.caption_en ?? ""}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-700">ลำดับการแสดงผล</label>
            <input
              type="number"
              name="displayOrder"
              defaultValue={initialData?.display_order ?? ""}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-1 items-end gap-4 pb-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isCover" defaultChecked={initialData?.is_cover ?? false} className="rounded" />
              ภาพหน้าปก
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isActive" defaultChecked={initialData?.is_active ?? true} className="rounded" />
              Active
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="submit"
            disabled={isPending || uploadingFile}
            className="rounded-lg bg-[#0A6B62] px-4 py-2 text-sm font-semibold text-white hover:bg-[#075049] disabled:opacity-50"
          >
            {isPending ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </div>
    </form>
  );
}
