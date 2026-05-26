"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeSlash, CheckCircle, XCircle, PencilSimple, Image } from "@phosphor-icons/react/dist/ssr";
import {
  toggleAccommodationPublishAction,
  toggleAccommodationActiveAction,
} from "@/app/actions/admin-accommodation-actions";

type Props = {
  accommodationId: number;
  isPublished: boolean;
  isActive: boolean;
};

export function AccommodationStatusActions({ accommodationId, isPublished, isActive }: Props) {
  const router = useRouter();

  const handlePublishToggle = async () => {
    const result = await toggleAccommodationPublishAction(accommodationId);
    if (result.success) router.refresh();
  };

  const handleActiveToggle = async () => {
    const result = await toggleAccommodationActiveAction(accommodationId);
    if (result.success) router.refresh();
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handlePublishToggle}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-amber-600 transition"
        title={isPublished ? "Unpublish" : "Publish"}
      >
        {isPublished ? <Eye size={16} weight="fill" /> : <EyeSlash size={16} weight="fill" />}
      </button>
      <Link
        href={`/admin/accommodations/${accommodationId}/media`}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#F3704C]"
        title="Manage Media"
      >
        <Image size={16} weight="bold" />
      </Link>
      <Link
        href={`/admin/accommodations/${accommodationId}/edit`}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
        title="Edit Accommodation"
      >
        <PencilSimple size={16} weight="bold" />
      </Link>
      <button
        onClick={handleActiveToggle}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-green-600 transition"
        title={isActive ? "Deactivate" : "Activate"}
      >
        {isActive ? <CheckCircle size={16} weight="fill" /> : <XCircle size={16} weight="fill" />}
      </button>
    </div>
  );
}
